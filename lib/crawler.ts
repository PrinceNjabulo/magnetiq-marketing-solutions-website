import { assertPublicHostname } from "@/lib/ssrf";
import { CrawlError } from "@/lib/errors";

export { CrawlError } from "@/lib/errors";

const FETCH_TIMEOUT_MS = 15_000;
const MAX_REDIRECTS = 5;
const MAX_BODY_BYTES = 5 * 1024 * 1024; // 5MB
const USER_AGENT = "MagnetiQAuditBot/1.0 (+https://magnetiq.marketing/audit)";

export type CrawlFetchResult = {
  html: string;
  finalUrl: string;
  httpStatus: number;
};

async function fetchOnce(url: string, signal: AbortSignal): Promise<Response> {
  const parsed = new URL(url);
  // Re-checked on every hop so a redirect can't be used to reach a private
  // address even if the original URL was public.
  await assertPublicHostname(parsed.hostname);

  return fetch(url, {
    signal,
    redirect: "manual",
    headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml" },
  });
}

async function readBodyWithLimit(response: Response, maxBytes: number): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return response.text();

  const chunks: Uint8Array[] = [];
  let received = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      received += value.byteLength;
      if (received > maxBytes) {
        await reader.cancel();
        throw new CrawlError("This page is too large for us to analyze.");
      }
      chunks.push(value);
    }
  }

  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))).toString("utf-8");
}

export async function fetchHtml(startUrl: string): Promise<CrawlFetchResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    let currentUrl = startUrl;
    let response: Response | null = null;

    for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects++) {
      response = await fetchOnce(currentUrl, controller.signal);

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location) {
          throw new CrawlError(`The site redirected without a destination (HTTP ${response.status}).`);
        }
        currentUrl = new URL(location, currentUrl).toString();
        response = null;
        continue;
      }

      break;
    }

    if (!response) {
      throw new CrawlError("This site redirected too many times.");
    }

    if (!response.ok) {
      throw new CrawlError(`The site returned an error (HTTP ${response.status}).`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
      throw new CrawlError("This URL didn't return a web page we can analyze.");
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
      throw new CrawlError("This page is too large for us to analyze.");
    }

    const html = await readBodyWithLimit(response, MAX_BODY_BYTES);

    return { html, finalUrl: currentUrl, httpStatus: response.status };
  } catch (err) {
    if (err instanceof CrawlError) throw err;
    if (controller.signal.aborted) throw new CrawlError("The request timed out.");
    throw new CrawlError("We couldn't reach this website.");
  } finally {
    clearTimeout(timeout);
  }
}
