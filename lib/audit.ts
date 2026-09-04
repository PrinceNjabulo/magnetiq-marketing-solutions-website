const PRIVATE_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

export function normalizeAuditUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const candidate = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (PRIVATE_HOSTS.has(url.hostname.toLowerCase())) return null;
  if (!url.hostname.includes(".")) return null;

  return url.toString();
}

export function isValidEmail(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.trim());
}

export type AuditStatusValue =
  | "pending"
  | "crawling"
  | "analyzing"
  | "generating"
  | "done"
  | "failed";

export const ACTIVE_AUDIT_STATUSES: AuditStatusValue[] = [
  "pending",
  "crawling",
  "analyzing",
  "generating",
];

export const AUDIT_STATUS_COPY: Record<AuditStatusValue, { label: string; description: string }> = {
  pending: {
    label: "Queued",
    description: "Your audit is in the queue — we'll start shortly.",
  },
  crawling: {
    label: "Crawling your site",
    description: "Fetching your page so we can analyze it.",
  },
  analyzing: {
    label: "Running checks",
    description: "SEO, performance, mobile/UX, content, and conversion checks in progress.",
  },
  generating: {
    label: "Writing your report",
    description: "Turning the findings into a plain-English report.",
  },
  done: {
    label: "Report ready",
    description: "Check your inbox — we've emailed your full report.",
  },
  failed: {
    label: "Something went wrong",
    description: "We couldn't finish analyzing this site.",
  },
};
