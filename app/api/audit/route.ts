import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizeAuditUrl, isValidEmail } from "@/lib/audit";

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const DUPLICATE_WINDOW_MS = 5 * 60 * 1000;

// Per-instance only: resets on cold start and isn't shared across
// serverless instances. Good enough to slow down a single abusive
// client for MVP; swap for a shared store (e.g. Upstash Redis) in
// Phase 8 if it turns out not to be.
const submissionsByIp = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (submissionsByIp.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  timestamps.push(now);
  submissionsByIp.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX;
}

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many audit requests. Please try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { websiteUrl, email, companyName, nickname } = (body ?? {}) as Record<string, unknown>;

  // Honeypot: a hidden field real visitors never see or fill in.
  if (typeof nickname === "string" && nickname.trim().length > 0) {
    return NextResponse.json({ error: "Submission rejected." }, { status: 400 });
  }

  if (typeof email !== "string" || !isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const normalizedUrl = typeof websiteUrl === "string" ? normalizeAuditUrl(websiteUrl) : null;
  if (!normalizedUrl) {
    return NextResponse.json({ error: "Please enter a valid website URL." }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const trimmedCompanyName =
    typeof companyName === "string" && companyName.trim().length > 0
      ? companyName.trim().slice(0, 200)
      : null;

  const recentDuplicate = await db.audit.findFirst({
    where: {
      url: normalizedUrl,
      lead: { email: normalizedEmail },
      createdAt: { gt: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
    },
    orderBy: { createdAt: "desc" },
  });

  if (recentDuplicate) {
    return NextResponse.json({ auditId: recentDuplicate.id });
  }

  const lead = await db.lead.create({
    data: {
      email: normalizedEmail,
      companyName: trimmedCompanyName,
      websiteUrl: normalizedUrl,
      audits: { create: { url: normalizedUrl } },
    },
    include: { audits: true },
  });

  return NextResponse.json({ auditId: lead.audits[0].id }, { status: 201 });
}
