import Anthropic from "@anthropic-ai/sdk";
import { marked } from "marked";
import { buildReportPrompt, REPORT_SECTION_HEADERS } from "@/lib/reportPrompt";
import type { AnalysisResult } from "@/lib/analysis";

const MODEL = "claude-opus-5";
const MAX_TOKENS = 8000;

export class ReportGenerationError extends Error {}

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic();
  return client;
}

export function validateReportMarkdown(markdown: string): void {
  const trimmed = markdown.trim();

  if (trimmed.length < 200) {
    throw new ReportGenerationError("Generated report was too short.");
  }
  if (!/^#\s+.+/.test(trimmed)) {
    throw new ReportGenerationError("Generated report is missing a title.");
  }
  for (const header of REPORT_SECTION_HEADERS) {
    if (!trimmed.includes(`## ${header}`)) {
      throw new ReportGenerationError(`Generated report is missing the "${header}" section.`);
    }
  }
}

export async function generateReport(input: {
  url: string;
  companyName: string | null;
  analysis: AnalysisResult;
}): Promise<{ markdown: string; html: string }> {
  const { system, user } = buildReportPrompt(input);

  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    output_config: { effort: "medium" },
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: user }],
  });

  const markdown = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  validateReportMarkdown(markdown);

  const html = await marked.parse(markdown);

  return { markdown, html };
}
