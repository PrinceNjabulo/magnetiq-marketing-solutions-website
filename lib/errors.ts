// A message on this error is safe to show directly to the lead on the
// audit status page (no internal details, stack traces, or raw error text).
export class CrawlError extends Error {}
