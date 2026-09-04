import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { generateReport, ReportGenerationError } from "@/lib/reportGeneration";
import type { AnalysisResult } from "@/lib/analysis";

export const maxDuration = 60;

function failureReasonFor(err: unknown): string {
  if (err instanceof ReportGenerationError) {
    return "We generated a report but it didn't come out right - please try again.";
  }
  if (err instanceof Anthropic.RateLimitError) {
    return "We're generating a lot of reports right now - please try again shortly.";
  }
  if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
    return "We couldn't generate your report due to a configuration issue on our end.";
  }
  if (err instanceof Anthropic.APIError) {
    return "We couldn't generate your report right now - please try again.";
  }
  return "We couldn't generate your report right now - please try again.";
}

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  // Atomic claim via a dedicated timestamp rather than a status transition:
  // there's no AuditStatus value between "generating" and "done" to flip
  // into, and flipping straight to "done" before the (paid) Claude call
  // succeeds would misrepresent a failed attempt as complete.
  const claim = await db.audit.updateMany({
    where: { id: params.id, status: "generating", reportStartedAt: null },
    data: { reportStartedAt: new Date() },
  });

  if (claim.count === 0) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const audit = await db.audit.findUnique({ where: { id: params.id }, include: { lead: true } });
  if (!audit) {
    return NextResponse.json({ error: "Audit not found." }, { status: 404 });
  }

  if (!audit.analysisJson) {
    await db.audit.update({
      where: { id: audit.id },
      data: { status: "failed", failureReason: "We lost the analysis data for this audit before we could write your report." },
    });
    return NextResponse.json({ ok: false });
  }

  try {
    const analysis = audit.analysisJson as unknown as AnalysisResult;
    const { markdown, html } = await generateReport({
      url: audit.url,
      companyName: audit.lead.companyName,
      analysis,
    });

    await db.audit.update({
      where: { id: audit.id },
      data: {
        status: "done",
        reportMarkdown: markdown,
        reportHtml: html,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    await db.audit.update({
      where: { id: audit.id },
      data: { status: "failed", failureReason: failureReasonFor(err) },
    });

    return NextResponse.json({ ok: false });
  }
}
