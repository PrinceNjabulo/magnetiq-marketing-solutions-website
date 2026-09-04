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

### Phase 2 — Website crawler (single page) ✅ done
- [x] `POST /api/audit/[id]/process` (`app/api/audit/[id]/process/route.ts`) — claims the job atomically (`updateMany` on `status: "pending"` guards against double-processing, verified under a real concurrent-request race: one call processed, the other correctly no-op'd), fetches the page, extracts data, calls PageSpeed, stores `rawCrawlJson`, and sets status to `analyzing` (or `failed` with a reason).
- [x] `lib/crawler.ts` — network fetch with a 15s timeout, manual redirect following (capped at 5 hops, **re-validating SSRF safety on every hop**), content-type check (rejects non-HTML), and a streamed 5MB body-size cap.
- [x] `lib/ssrf.ts` — resolves the hostname via DNS and rejects private/loopback/link-local/multicast addresses (covers the common case: a public domain whose DNS record points at an internal address, e.g. the cloud metadata IP). This was added beyond the original plan text because Phase 2 is the point where the app first fetches a user-submitted URL server-side — the SSRF exposure becomes live here, not in Phase 8, so the essential guard couldn't wait. Full DNS-rebinding-proof pinning (validating the IP actually connected to, not just the one resolved beforehand) is still deferred to Phase 8.
- [x] `lib/pageParser.ts` — cheerio-based extraction: title, meta description, viewport meta, language, heading counts + h1 text, image alt coverage, internal/external link counts, word count, structured data (`ld+json`) blocks, forms, `tel:`/`mailto:` links.
- [x] `lib/pagespeed.ts` — PageSpeed Insights v5 (mobile + desktop, in parallel), pulling performance/SEO/accessibility/best-practices scores and Core Web Vitals (LCP, CLS, TBT, FCP, Speed Index). Failures here are **non-fatal** — caught individually via `Promise.allSettled`, so a PageSpeed quota/timeout doesn't fail the whole audit (verified live: PageSpeedran out of quota with no API key configured, and the audit still reached `analyzing` with the crawl data intact and `pageSpeed.mobileError`/`desktopError` recorded).
- [x] `components/AuditStatusPoller.tsx` triggers `.../process` once on mount if the audit is still `pending`, so processing starts automatically when the lead lands on the status page — no queue/cron needed for a single-page crawl.
- [x] Verified end to end against real, live external sites (this sandbox's egress is allowlisted and blocks arbitrary domains, but `pypi.org`/`registry.npmjs.org` are reachable): a real crawl of pypi.org produced correct extracted data (title, meta description, headings, images, 55 links split internal/external, forms, word count) and handled the PageSpeed 429 gracefully; a non-HTML target (`registry.npmjs.org`, JSON) correctly failed the audit with `"This URL didn't return a web page we can analyze."`, shown on the status page. Pure logic (SSRF IP-range checks, HTML extraction) additionally unit-tested in isolation.
- [x] `tsc --noEmit`, `next lint`, `next build` all pass. No `prisma/schema.prisma` changes.
- **Exit criteria met**: given a real URL, `rawCrawlJson` is populated and inspectable (confirmed by reading it back from the database after a live crawl).

**Known gap carried to Phase 8**: the in-memory per-IP rate limiter from Phase 1 doesn't yet cover `POST /api/audit/[id]/process` — the create endpoint is limited, but a client could hit `/process` on many different audit ids to burn PageSpeed quota. Low risk today (each call still requires a valid, already-created audit id, and it's a no-op once claimed), but worth closing when abuse-hardening work happens.

### Phase 3 — Automated analysis ✅ done
- [x] `lib/analysis.ts` — pure, deterministic `analyzePage(raw: RawCrawlData): AnalysisResult` covering all six categories (`seo`, `performance`, `mobile_ux`, `content`, `technical`, `conversion`). Every finding has `category`, `severity` (`critical`/`warning`/`info`/`good` — "good" findings are included too, not just problems, so the eventual report can highlight what's already working), `title`, `description`, `evidence` (the concrete data point behind the finding, e.g. `"Title is 31 characters: \"...\""`), and `recommendation` (null for "good"/informational findings). A `summary` with severity counts (overall and per-category) rides alongside `findings`.
- [x] Checks implemented: title/meta-description length, H1 count, structured data (SEO); PageSpeed performance score + LCP/CLS/TBT (Performance); viewport tag + mobile-vs-desktop performance gap (Mobile/UX); word count + subheading structure + language attribute (Content); image alt-text coverage + accessibility/best-practices scores (Technical); presence of a form/phone/email conversion path (Conversion). PageSpeed-derived checks degrade gracefully to a single "data unavailable" info finding when both mobile and desktop calls failed, instead of silently omitting that whole category.
- [x] `POST /api/audit/[id]/analyze` (`app/api/audit/[id]/analyze/route.ts`) — same atomic-claim pattern as Phase 2 (`analyzing -> generating`), reads `rawCrawlJson`, runs `analyzePage`, stores `analysisJson`.
- [x] `lib/rawCrawlData.ts` — shared `RawCrawlData` type so the Phase 2 writer and Phase 3 reader of `rawCrawlJson` can't silently drift apart.
- [x] `AuditStatusPoller` generalized from "fire once on the initial status" to "fire the trigger for whatever status is currently observed, once per status, on mount or via polling" (`STAGE_ENDPOINTS` map: `pending -> process`, `analyzing -> analyze`) — this was a necessary fix, not just a Phase 3 addition: the old one-shot-on-mount logic would never have triggered analysis for a lead who loaded the status page while the crawl was still running. The map is also what Phase 4 will extend with `generating -> generate`.
- [x] Verified thoroughly: (1) fixture-based tests of `analyzePage` against a well-built site (zero critical/warning findings), a badly broken site (missing title/H1/viewport/conversion path/alt text, all correctly flagged critical), and a no-PageSpeed-data case (graceful single info finding, no crash) — all category coverage and JSON-round-trip assertions passed; (2) full live pipeline against pypi.org (crawl -> analyze) with the resulting `analysisJson` inspected directly from the database — every finding matched the page's actual real markup (e.g. correctly caught "15 of 16 images missing alt text"); (3) a real Playwright browser session that filled out the `/audit` form, followed the redirect, and watched the status label progress `Queued -> Running checks -> Writing your report` purely from client-side polling/auto-triggering, with no manual API calls from the test at all.
- [x] `tsc --noEmit`, `next lint`, `next build` all pass. No `prisma/schema.prisma` changes.
- **Exit criteria met**: `analysisJson` contains a consistent, typed list of findings, confirmed against a well-built fixture, a deliberately broken fixture, and a real live page (pypi.org).

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
