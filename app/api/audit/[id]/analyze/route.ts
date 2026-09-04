import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { analyzePage } from "@/lib/analysis";
import type { RawCrawlData } from "@/lib/rawCrawlData";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  // Atomic claim: only the caller that flips analyzing -> generating
  // proceeds, so a duplicate trigger is a no-op.
  const claim = await db.audit.updateMany({
    where: { id: params.id, status: "analyzing" },
    data: { status: "generating" },
  });

  if (claim.count === 0) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const audit = await db.audit.findUnique({ where: { id: params.id } });
  if (!audit) {
    return NextResponse.json({ error: "Audit not found." }, { status: 404 });
  }

  if (!audit.rawCrawlJson) {
    await db.audit.update({
      where: { id: audit.id },
      data: { status: "failed", failureReason: "We lost the crawl data for this audit before we could analyze it." },
    });
    return NextResponse.json({ ok: false });
  }

  const raw = audit.rawCrawlJson as unknown as RawCrawlData;
  const analysisJson = analyzePage(raw);

  await db.audit.update({
    where: { id: audit.id },
    data: { analysisJson },
  });

  return NextResponse.json({ ok: true });
}
