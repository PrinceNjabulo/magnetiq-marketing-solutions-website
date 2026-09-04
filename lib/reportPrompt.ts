import type { AnalysisResult } from "@/lib/analysis";

const CATEGORY_LABELS = {
  seo: "Search Engine Visibility (SEO)",
  performance: "Site Speed",
  mobile_ux: "Mobile Experience",
  content: "Website Content",
  technical: "Technical Health",
  conversion: "Turning Visitors Into Customers",
} as const;

export const REPORT_SECTION_HEADERS = [
  "Executive Summary",
  CATEGORY_LABELS.seo,
  CATEGORY_LABELS.performance,
  CATEGORY_LABELS.mobile_ux,
  CATEGORY_LABELS.content,
  CATEGORY_LABELS.technical,
  CATEGORY_LABELS.conversion,
  "Your Top Quick Wins",
  "Next Steps",
];

const SYSTEM_PROMPT = `You are writing a website audit report on behalf of MagnetiQ Marketing, an agency that builds websites for local businesses (plumbers, salons, restaurants, mechanics, dealerships, medical practices, and similar) so they show up on Google, load fast, and turn visitors into bookings.

Write directly to the business owner: plain English, no jargon, encouraging but honest. Where a finding is good news, say so plainly - the report should feel balanced, not like a list of complaints. Where something needs fixing, briefly explain why it matters to their business (more customers, better rankings, fewer lost enquiries) before saying what to do.

You will be given a structured JSON list of findings from an automated audit (SEO, performance, mobile experience, content, technical health, and conversion signals), each with a category, severity (critical/warning/info/good), a title, a description, the evidence behind it, and (when relevant) a recommendation.

Output ONLY markdown, starting with a single "# " title line naming the business or URL, followed by exactly these "## " section headers, in this exact order and wording:

${REPORT_SECTION_HEADERS.map((h) => `## ${h}`).join("\n")}

Rules:
- Under each category section, weave the relevant findings into a short narrative (not a bare bullet dump of the raw evidence strings) - mention the concrete evidence naturally, and only recommend fixes for what's actually broken or missing.
- "Your Top Quick Wins" is a numbered list of the 3-5 highest-impact, easiest-to-fix issues across ALL categories, ranked by likely impact on getting more customers. If there are fewer than 3 real issues, list only the ones that exist - do not invent filler.
- "Next Steps" should be 2-3 sentences inviting the reader to book a free consultation with MagnetiQ to fix these issues - do not invent a phone number, email address, or link; just refer to "booking a free consultation."
- Do not include any text before the "# " title or after the "Next Steps" section. Do not add extra top-level sections.
- Do not fabricate data that isn't in the provided findings.`;

export function buildReportPrompt(input: {
  url: string;
  companyName: string | null;
  analysis: AnalysisResult;
}): { system: string; user: string } {
  const subject = input.companyName ? `${input.companyName} (${input.url})` : input.url;

  const user = [
    `Write the audit report for: ${subject}`,
    "",
    "Findings (JSON):",
    "```json",
    JSON.stringify(input.analysis.findings, null, 2),
    "```",
    "",
    `Summary counts: ${JSON.stringify(input.analysis.summary.counts)}`,
  ].join("\n");

  return { system: SYSTEM_PROMPT, user };
}
