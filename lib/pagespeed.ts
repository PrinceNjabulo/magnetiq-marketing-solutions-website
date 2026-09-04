const PAGESPEED_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const PAGESPEED_TIMEOUT_MS = 30_000;
const CATEGORIES = ["performance", "seo", "accessibility", "best-practices"];

export type PageSpeedStrategy = "mobile" | "desktop";

export type PageSpeedSummary = {
  strategy: PageSpeedStrategy;
  performanceScore: number | null;
  seoScore: number | null;
  accessibilityScore: number | null;
  bestPracticesScore: number | null;
  metrics: {
    largestContentfulPaintMs: number | null;
    cumulativeLayoutShift: number | null;
    totalBlockingTimeMs: number | null;
    firstContentfulPaintMs: number | null;
    speedIndexMs: number | null;
  };
};

function scoreOf(category: unknown): number | null {
  if (!category || typeof category !== "object") return null;
  const score = (category as { score?: unknown }).score;
  return typeof score === "number" ? Math.round(score * 100) : null;
}

function numericAuditValue(audits: Record<string, unknown>, id: string): number | null {
  const audit = audits[id];
  if (!audit || typeof audit !== "object") return null;
  const value = (audit as { numericValue?: unknown }).numericValue;
  return typeof value === "number" ? value : null;
}

export async function fetchPageSpeed(url: string, strategy: PageSpeedStrategy): Promise<PageSpeedSummary> {
  const params = new URLSearchParams({ url, strategy });
  for (const category of CATEGORIES) params.append("category", category);
  if (process.env.PAGESPEED_API_KEY) params.set("key", process.env.PAGESPEED_API_KEY);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PAGESPEED_TIMEOUT_MS);

  try {
    const res = await fetch(`${PAGESPEED_ENDPOINT}?${params.toString()}`, { signal: controller.signal });

    if (!res.ok) {
      throw new Error(`PageSpeed Insights returned HTTP ${res.status}`);
    }

    const data = await res.json();
    const categories = (data?.lighthouseResult?.categories ?? {}) as Record<string, unknown>;
    const audits = (data?.lighthouseResult?.audits ?? {}) as Record<string, unknown>;
    const cls = numericAuditValue(audits, "cumulative-layout-shift");

    return {
      strategy,
      performanceScore: scoreOf(categories.performance),
      seoScore: scoreOf(categories.seo),
      accessibilityScore: scoreOf(categories.accessibility),
      bestPracticesScore: scoreOf(categories["best-practices"]),
      metrics: {
        largestContentfulPaintMs: numericAuditValue(audits, "largest-contentful-paint"),
        cumulativeLayoutShift: cls === null ? null : Math.round(cls * 1000) / 1000,
        totalBlockingTimeMs: numericAuditValue(audits, "total-blocking-time"),
        firstContentfulPaintMs: numericAuditValue(audits, "first-contentful-paint"),
        speedIndexMs: numericAuditValue(audits, "speed-index"),
      },
    };
  } finally {
    clearTimeout(timeout);
  }
}
