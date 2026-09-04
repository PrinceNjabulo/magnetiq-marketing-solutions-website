# MagnetiQ AI Growth Engine — Phased Plan

## What we're building

A self-serve funnel bolted onto the marketing site:

```
Landing page → business enters URL → crawler fetches the page →
automated analysis (SEO / performance / mobile-UX / content / technical / conversion) →
Claude turns raw findings into a professional report →
report delivered by email + shown on a dashboard →
lead + report saved to our own DB →
automated follow-up sequence → sales call
```

## Decisions locked in for MVP

- **Crawl scope**: single page (the URL submitted), not a site-wide crawl. Keeps the pipeline synchronous-ish and cheap; multi-page crawling is a later phase once we've validated demand.
- **CRM**: none yet. Leads and audit results land in our own database first. A real CRM (HubSpot or otherwise) gets wired in once we're sending real traffic and know the lead volume/shape.
- **Backend home**: stays in this Next.js repo. A single page crawl + analysis + Claude call fits comfortably inside a Next.js Route Handler with a reasonable timeout — no separate service needed for MVP. We only split crawling/analysis into a standalone worker if we later move to multi-page crawls or hit serverless timeout/concurrency limits.

## Recommended stack additions

| Concern | Choice | Why |
|---|---|---|
| Database | Postgres via Supabase + Prisma (project `wnxkwxgvjwpchaztnhol`, eu-west-1) | Already connected as a workspace connector; free tier fits MVP volume, pooled connection works well with serverless functions |
| Crawling/fetching | `fetch` + `cheerio` for HTML parsing | No headless browser needed for a single-page static analysis pass; keeps cold starts fast |
| Performance signals | Google PageSpeed Insights API (Lighthouse under the hood) | Avoids running headless Chrome ourselves; free, well-documented API |
| AI report generation | Claude API (Messages API, prompt caching for the system prompt) | Already the house model; use `claude-sonnet-5` |
| Email delivery | Resend or Postmark | Simple transactional email API, good deliverability, easy React-email templates |
| Background execution | Next.js Route Handlers to start; move to a queue (e.g. Vercel Queues / Inngest / QStash) only if analysis time exceeds serverless limits | Avoids standing up infra before we know we need it |
| Dashboard auth | Magic-link or simple email+token access to a per-lead report page | No need for full account system in MVP — the report link itself can be the access mechanism |

## Data model (MVP)

```
leads
  id, email, company_name, website_url, source, created_at

audits
  id, lead_id (fk), url, status (pending|crawling|analyzing|generating|done|failed),
  raw_crawl_json, analysis_json, report_markdown, report_html,
  created_at, completed_at

follow_ups
  id, lead_id (fk), audit_id (fk), type (email_sent|reminder|...), scheduled_at, sent_at
```

## Phases

### Phase 0 — Foundations ✅ done
- [x] Add Prisma (`prisma`, `@prisma/client`) with the `leads` / `audits` / `follow_ups` schema above (`prisma/schema.prisma`).
- [x] Prisma client singleton at `lib/db.ts` for use in Route Handlers (Next.js hot-reload-safe pattern).
- [x] `.env.example` documenting `DATABASE_URL`, `DIRECT_URL`, `ANTHROPIC_API_KEY`, `PAGESPEED_API_KEY`, `RESEND_API_KEY`.
- [x] `postinstall` runs `prisma generate` automatically; added `db:generate` / `db:migrate` / `db:studio` npm scripts.
- [x] Verified: `prisma validate`, `tsc --noEmit`, `next lint`, and `next build` all pass with the new deps in place.
- [x] Postgres provisioned: Supabase project `wnxkwxgvjwpchaztnhol` (`PrinceNjabulo's Project`, eu-west-1). The `init` migration (`prisma/migrations/20260904185800_init/`) was applied directly via the Supabase MCP connector, creating `Lead`/`Audit`/`FollowUp` with the enums, indexes, and cascading foreign keys from the schema.
- [x] Smoke-tested end to end: inserted a `Lead` → `Audit` → `FollowUp` chain, verified the joins and enum columns, then deleted the `Lead` and confirmed the cascade removed the child rows.
- [x] RLS is enabled by default on all three tables (Supabase project default) with no policies — fine for now since the app talks to Postgres directly via `DATABASE_URL`/Prisma (bypasses PostgREST/RLS), not through the Supabase client SDK. Revisit if a later phase adds client-side Supabase SDK access to these tables.
- **Local setup**: copy `.env.example` to `.env`, fill in `DATABASE_URL` (pooled, port 6543) and `DIRECT_URL` (direct, port 5432) from the Supabase dashboard (Project Settings → Database → Connection string, project ref `wnxkwxgvjwpchaztnhol`) — the password isn't retrievable via the API/MCP connector, so it has to come from the dashboard. `npm run db:studio` then points at the live tables.
- **Exit criteria met**: `Lead` / `Audit` / `FollowUp` tables exist on the connected Supabase project and round-trip data correctly.

### Phase 1 — Audit landing page + lead capture ✅ done
- [x] `/audit` — landing page with the URL + work email + optional company name form (`app/audit/page.tsx`, `components/AuditForm.tsx`), styled to match the existing site (navy hero band + floating white card, `Header`/`Footer` reused).
- [x] `POST /api/audit` (`app/api/audit/route.ts`) — validates email + URL (auto-prepends `https://`, rejects localhost/private hosts), honeypot field (`nickname`, hidden via the accessible `sr-only` pattern) silently rejects bots, in-memory per-IP rate limit (5 requests / 15 min — documented as an MVP-only mechanism since it resets per cold start and isn't shared across instances; revisit with a shared store in Phase 8 if needed), and a 5-minute duplicate-submission throttle (same email+URL reuses the existing audit instead of creating a new row).
- [x] Creates a `Lead` + `Audit` (status `pending`) via a single nested Prisma write, returns the new `auditId`.
- [x] `/audit/[id]` — status page (`app/audit/[id]/page.tsx`) that server-renders the current status, then polls `GET /api/audit/[id]` (`app/api/audit/[id]/route.ts`) every 4s via `components/AuditStatusPoller.tsx` while the audit is still in progress; 404s for an unknown id.
- [x] Added a "Free Website Audit" link to `Header` so the funnel is actually reachable from the live site nav.
- [x] Verified end to end against a local ephemeral Postgres (`npx prisma dev`, migration deployed with `prisma migrate deploy`) with the app's own dev server: invalid email/URL rejected, honeypot rejected, valid submission creates rows and returns an id, duplicate submission within 5 minutes reuses the same id instead of creating a second row, rate limiter returns 429 on the 6th request within the window, status page and API both 404 on an unknown id, and the status page renders and polls correctly.
- [x] `tsc --noEmit`, `next lint`, and `next build` all pass; no changes to `prisma/schema.prisma` in this phase (Phase 0's tables are used as-is).
- **Exit criteria met**: submitting a URL creates `Lead`/`Audit` rows and shows a waiting state that updates as status changes.

### Phase 2 — Website crawler (single page)
- Route Handler / server action that fetches the submitted URL, parses HTML with cheerio.
- Extract: title/meta tags, heading structure, image alt coverage, internal/external link counts, viewport meta, structured data presence, word count, forms/CTAs present.
- Call PageSpeed Insights API (mobile + desktop) for performance/Core Web Vitals + a subset of Lighthouse SEO/best-practices/accessibility audits.
- Store raw results in `audits.raw_crawl_json`, set status `analyzing`.
- Handle failure modes: unreachable URL, non-HTML response, timeout — mark audit `failed` with a reason, surface a friendly error to the lead.
- **Exit criteria**: given a real URL, raw crawl JSON is populated and inspectable.

### Phase 3 — Automated analysis
- Deterministic scoring/flagging layer (no AI yet) that turns raw crawl data into structured findings across the six categories: SEO, Performance, Mobile/UX, Content, Technical issues, Conversion opportunities.
- Each finding: category, severity, description, evidence (the actual data point), suggested fix.
- Store as `audits.analysis_json`; this is also useful as a fallback/preview if the AI step fails.
- **Exit criteria**: analysis_json contains a consistent, typed list of findings for a handful of test sites (own site, a competitor, a deliberately broken page).

### Phase 4 — Claude AI report generation
- Prompt design: system prompt establishes MagnetiQ's voice + report structure; user turn passes the structured `analysis_json` (not raw HTML) to keep tokens low and output consistent.
- Output: structured markdown (executive summary, category breakdowns, prioritized quick wins, call-to-action toward booking a call) — validate structure before storing.
- Store as `audits.report_markdown`, render to `report_html`, set status `done`.
- **Exit criteria**: end-to-end run from URL submission to a readable report for 3+ real test sites.

### Phase 5 — Report delivery
- Email: on completion, send the lead a branded email with a summary + link to the full dashboard report (via Resend/Postmark + React Email template).
- Dashboard: a per-audit report page (`/audit/[id]`) rendering `report_html` with the site's branding, plus a persistent CTA to book a call.
- **Exit criteria**: submitting a real URL results in an email in the inbox and a working report page link.

### Phase 6 — Lead storage & automated follow-up (own DB, no external CRM yet)
- `follow_ups` table drives a simple sequence (e.g. day 0 report email, day 2 reminder if report unopened, day 5 "book a call" nudge).
- A scheduled job (cron route, e.g. Vercel Cron hitting an internal endpoint) processes due follow-ups.
- Admin-only internal view (simple, auth-gated) listing leads/audits/status so the team can see the funnel without a CRM.
- **Exit criteria**: a seeded lead progresses through the follow-up sequence in a staging run.

### Phase 7 — CRM integration (future, deferred)
- Once real traffic validates the funnel: sync `leads`/`audits`/`follow_ups` into a chosen CRM (HubSpot most likely) via its API, replacing or augmenting the internal admin view.
- Not part of MVP scope — revisit after Phase 6 is live.

### Phase 8 — Hardening
- Rate limiting + abuse prevention on the public audit endpoint (avoid it being used as an open URL-fetch/SSRF proxy — validate/allow-list schemes, block internal/private IP ranges before fetching).
- Observability: log crawl/analysis/AI failures with enough context to debug; basic alerting on failure rate.
- Cost controls: cap PageSpeed + Claude calls per IP/email per day.
- **Exit criteria**: load-test-style pass confirms the endpoint can't be trivially abused, and failures are visible.

## Suggested milestone grouping

- **Milestone A (MVP demo)**: Phases 0–4 — URL in, structured AI report out, viewable manually (e.g. via API response or a rough page).
- **Milestone B (usable funnel)**: + Phase 5 — real email delivery and a polished dashboard report page. This is the first version worth sending real traffic to.
- **Milestone C (self-sustaining funnel)**: + Phases 6 & 8 — automated follow-up and abuse hardening, ready for sustained public traffic.
- **Milestone D**: Phase 7, once volume justifies a real CRM.

## Open questions to revisit before/at Phase 6–7

- Expected audit volume/month (decides whether Vercel Cron + Route Handlers stay sufficient or we need a real queue).
- Which CRM, once chosen (HubSpot is the default recommendation for a marketing-agency lead flow given its API maturity).
- Whether the dashboard needs real user accounts eventually, or link-based access remains fine long-term.
