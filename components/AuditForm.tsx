"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { audit } from "@/lib/content";

const inputClass =
  "mt-2 w-full rounded-xl border border-navy/15 bg-white px-5 py-3.5 text-navy placeholder:text-navy/30 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20";

export function AuditForm() {
  const router = useRouter();
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [nickname, setNickname] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ websiteUrl, email, companyName, nickname }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      router.push(`/audit/${data.auditId}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="sr-only">
        <label htmlFor="nickname">Leave this field empty</label>
        <input
          id="nickname"
          name="nickname"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
        />
      </div>

      <div>
        <label htmlFor="websiteUrl" className="eyebrow text-navy/50">
          Website URL
        </label>
        <input
          id="websiteUrl"
          name="websiteUrl"
          type="text"
          required
          placeholder="yourbusiness.com"
          value={websiteUrl}
          onChange={(event) => setWebsiteUrl(event.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="email" className="eyebrow text-navy/50">
          Work email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@business.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="companyName" className="eyebrow text-navy/50">
          Company name <span className="normal-case text-navy/30">(optional)</span>
        </label>
        <input
          id="companyName"
          name="companyName"
          type="text"
          placeholder="Your Business Name"
          value={companyName}
          onChange={(event) => setCompanyName(event.target.value)}
          className={inputClass}
        />
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <motion.button
        type="submit"
        disabled={submitting}
        whileHover={{ scale: submitting ? 1 : 1.02 }}
        whileTap={{ scale: submitting ? 1 : 0.97 }}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-green px-6 py-4 font-semibold text-navy shadow-glow-green transition-shadow hover:shadow-[0_0_60px_-6px_rgba(34,197,94,0.65)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {submitting ? "Running audit…" : audit.cta}
      </motion.button>

      <p className="text-xs text-navy/40">{audit.formNote}</p>
    </form>
  );
}
