"use client";

import { useEffect, useRef, useState } from "react";
import { ACTIVE_AUDIT_STATUSES, AUDIT_STATUS_COPY, type AuditStatusValue } from "@/lib/audit";

const POLL_INTERVAL_MS = 4000;

export type AuditStatusPayload = {
  id: string;
  url: string;
  status: AuditStatusValue;
  failureReason: string | null;
};

export function AuditStatusPoller({ initialAudit }: { initialAudit: AuditStatusPayload }) {
  const [auditData, setAuditData] = useState(initialAudit);
  const initialStatusRef = useRef(initialAudit.status);

  // Kick off processing once, only if the page loaded with the audit still
  // queued. The API route is idempotent (it claims pending -> crawling
  // atomically), so this is safe even if it somehow fired twice.
  useEffect(() => {
    if (initialStatusRef.current !== "pending") return;
    fetch(`/api/audit/${initialAudit.id}/process`, { method: "POST" }).catch(() => {
      // If this fails, the audit just stays "pending" until the next visit.
    });
  }, [initialAudit.id]);

  useEffect(() => {
    if (!ACTIVE_AUDIT_STATUSES.includes(auditData.status)) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/audit/${auditData.id}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setAuditData(data);
      } catch {
        // Transient network error — the next tick will try again.
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [auditData.id, auditData.status]);

  const copy = AUDIT_STATUS_COPY[auditData.status];
  const isActive = ACTIVE_AUDIT_STATUSES.includes(auditData.status);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
      <p className="eyebrow text-navy/40">Auditing</p>
      <p className="mt-1 truncate font-mono text-sm text-navy/70">{auditData.url}</p>

      <div className="mt-6 flex items-center gap-3">
        {isActive && (
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-blue opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-brand-blue" />
          </span>
        )}
        {auditData.status === "done" && <span className="h-3 w-3 rounded-full bg-brand-green" />}
        {auditData.status === "failed" && <span className="h-3 w-3 rounded-full bg-red-500" />}
        <p className="font-display text-lg font-semibold text-navy">{copy.label}</p>
      </div>

      <p className="mt-3 text-navy/60">{copy.description}</p>

      {auditData.status === "failed" && auditData.failureReason && (
        <p className="mt-2 text-sm text-red-600">{auditData.failureReason}</p>
      )}
    </div>
  );
}
