import type { PageExtraction } from "@/lib/pageParser";
import type { PageSpeedSummary } from "@/lib/pagespeed";

// Shape written to Audit.rawCrawlJson by /api/audit/[id]/process and read
// back (via a type assertion — Prisma's JSON column has no static type of
// its own) by /api/audit/[id]/analyze. Keeping this in one place keeps the
// writer and reader in sync.
export type RawCrawlData = {
  fetchedAt: string;
  finalUrl: string;
  httpStatus: number;
  page: PageExtraction;
  pageSpeed: {
    mobile: PageSpeedSummary | null;
    mobileError: string | null;
    desktop: PageSpeedSummary | null;
    desktopError: string | null;
  };
};
