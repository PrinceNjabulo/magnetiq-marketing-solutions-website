import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fetchHtml, CrawlError } from "@/lib/crawler";
import { extractPageData } from "@/lib/pageParser";
import { fetchPageSpeed } from "@/lib/pagespeed";
import type { RawCrawlData } from "@/lib/rawCrawlData";

// Single-page crawl + PageSpeed calls can take a while; give this route
// room to run on platforms that support a longer function duration.
export const maxDuration = 60;

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  // Atomic claim: only the caller that flips pending -> crawling proceeds,
  // so a duplicate trigger (e.g. two open tabs polling) is a no-op.
  const claim = await db.audit.updateMany({
    where: { id: params.id, status: "pending" },
    data: { status: "crawling" },
  });

  if (claim.count === 0) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const audit = await db.audit.findUnique({ where: { id: params.id } });
  if (!audit) {
    return NextResponse.json({ error: "Audit not found." }, { status: 404 });
  }

  try {
    const { html, finalUrl, httpStatus } = await fetchHtml(audit.url);
    const page = extractPageData(html, finalUrl);

    const [mobile, desktop] = await Promise.allSettled([
      fetchPageSpeed(audit.url, "mobile"),
      fetchPageSpeed(audit.url, "desktop"),
    ]);

    const rawCrawlJson: RawCrawlData = {
      fetchedAt: new Date().toISOString(),
      finalUrl,
      httpStatus,
      page,
      pageSpeed: {
        mobile: mobile.status === "fulfilled" ? mobile.value : null,
        mobileError: mobile.status === "rejected" ? String(mobile.reason) : null,
        desktop: desktop.status === "fulfilled" ? desktop.value : null,
        desktopError: desktop.status === "rejected" ? String(desktop.reason) : null,
      },
    };

    await db.audit.update({
      where: { id: audit.id },
      data: { status: "analyzing", rawCrawlJson },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const failureReason = err instanceof CrawlError ? err.message : "We couldn't analyze this website.";

    await db.audit.update({
      where: { id: audit.id },
      data: { status: "failed", failureReason },
    });

    return NextResponse.json({ ok: false });
  }
}
