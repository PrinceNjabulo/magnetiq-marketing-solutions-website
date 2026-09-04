import type { RawCrawlData } from "@/lib/rawCrawlData";
import type { PageSpeedSummary } from "@/lib/pagespeed";

export type FindingCategory = "seo" | "performance" | "mobile_ux" | "content" | "technical" | "conversion";
export type FindingSeverity = "critical" | "warning" | "info" | "good";

export type Finding = {
  category: FindingCategory;
  severity: FindingSeverity;
  title: string;
  description: string;
  evidence: string;
  recommendation: string | null;
};

export type AnalysisResult = {
  generatedAt: string;
  findings: Finding[];
  summary: {
    counts: Record<FindingSeverity, number>;
    byCategory: Record<FindingCategory, Record<FindingSeverity, number>>;
  };
};

const SEVERITIES: FindingSeverity[] = ["critical", "warning", "info", "good"];
const CATEGORIES: FindingCategory[] = ["seo", "performance", "mobile_ux", "content", "technical", "conversion"];

function scoreSeverity(score: number): FindingSeverity {
  if (score >= 90) return "good";
  if (score >= 50) return "warning";
  return "critical";
}

function primaryPageSpeed(pageSpeed: RawCrawlData["pageSpeed"]): PageSpeedSummary | null {
  return pageSpeed.mobile ?? pageSpeed.desktop ?? null;
}

function finding(f: Finding): Finding {
  return f;
}

function addSeoFindings(raw: RawCrawlData, findings: Finding[]) {
  const { title, metaDescription, headings, structuredDataBlocks } = raw.page;

  if (!title) {
    findings.push(
      finding({
        category: "seo",
        severity: "critical",
        title: "Missing page title",
        description: "This page has no <title> tag, which search engines rely on heavily for ranking and for the headline shown in search results.",
        evidence: "No <title> element found.",
        recommendation: "Add a descriptive, unique title (roughly 30-60 characters) that includes what the business does and its location.",
      })
    );
  } else if (title.length < 30) {
    findings.push(
      finding({
        category: "seo",
        severity: "warning",
        title: "Page title is short",
        description: "A short title may not give search engines or visitors enough context about the page.",
        evidence: `Title is ${title.length} characters: "${title}"`,
        recommendation: "Expand the title to roughly 30-60 characters, including the core service and location.",
      })
    );
  } else if (title.length > 60) {
    findings.push(
      finding({
        category: "seo",
        severity: "warning",
        title: "Page title may be truncated in search results",
        description: "Search engines typically display only the first ~60 characters of a title.",
        evidence: `Title is ${title.length} characters: "${title}"`,
        recommendation: "Shorten the title to roughly 30-60 characters, keeping the most important words first.",
      })
    );
  } else {
    findings.push(
      finding({
        category: "seo",
        severity: "good",
        title: "Page title is well-sized",
        description: "The title is within the recommended length for search results.",
        evidence: `Title is ${title.length} characters: "${title}"`,
        recommendation: null,
      })
    );
  }

  if (!metaDescription) {
    findings.push(
      finding({
        category: "seo",
        severity: "warning",
        title: "Missing meta description",
        description: "Without a meta description, search engines choose their own snippet from the page text, which is often less compelling.",
        evidence: "No meta description tag found.",
        recommendation: "Add a meta description (roughly 120-160 characters) that summarizes the page and encourages a click.",
      })
    );
  } else if (metaDescription.length < 70 || metaDescription.length > 160) {
    findings.push(
      finding({
        category: "seo",
        severity: "info",
        title: "Meta description length isn't ideal",
        description: "Very short or very long meta descriptions are more likely to be rewritten or truncated by search engines.",
        evidence: `Meta description is ${metaDescription.length} characters.`,
        recommendation: "Aim for roughly 120-160 characters.",
      })
    );
  } else {
    findings.push(
      finding({
        category: "seo",
        severity: "good",
        title: "Meta description is well-sized",
        description: "The meta description is within the recommended length.",
        evidence: `Meta description is ${metaDescription.length} characters.`,
        recommendation: null,
      })
    );
  }

  if (headings.h1 === 0) {
    findings.push(
      finding({
        category: "seo",
        severity: "critical",
        title: "Missing H1 heading",
        description: "The page has no H1 — the main heading search engines use to understand what the page is about.",
        evidence: "H1 count: 0.",
        recommendation: "Add a single, clear H1 that states the main topic of the page.",
      })
    );
  } else if (headings.h1 > 1) {
    findings.push(
      finding({
        category: "seo",
        severity: "warning",
        title: "Multiple H1 headings",
        description: "Having more than one H1 can dilute the page's main topic signal for search engines.",
        evidence: `H1 count: ${headings.h1}.`,
        recommendation: "Use a single H1 for the main heading, and H2s/H3s for subheadings.",
      })
    );
  } else {
    findings.push(
      finding({
        category: "seo",
        severity: "good",
        title: "Exactly one H1 heading",
        description: "The page has a single, clear main heading.",
        evidence: "H1 count: 1.",
        recommendation: null,
      })
    );
  }

  if (structuredDataBlocks === 0) {
    findings.push(
      finding({
        category: "seo",
        severity: "info",
        title: "No structured data found",
        description: "Structured data (schema.org markup) helps search engines show richer results, like star ratings or business hours.",
        evidence: "No application/ld+json blocks found.",
        recommendation: "Add LocalBusiness structured data with your name, address, phone number, and hours.",
      })
    );
  } else {
    findings.push(
      finding({
        category: "seo",
        severity: "good",
        title: "Structured data present",
        description: "The page includes structured data, which can help search engines display richer results.",
        evidence: `${structuredDataBlocks} structured data block(s) found.`,
        recommendation: null,
      })
    );
  }

  const seoScore = primaryPageSpeed(raw.pageSpeed)?.seoScore;
  if (typeof seoScore === "number") {
    findings.push(
      finding({
        category: "seo",
        severity: scoreSeverity(seoScore),
        title: "PageSpeed SEO score",
        description: "Google's automated SEO best-practices score for this page.",
        evidence: `SEO score: ${seoScore}/100.`,
        recommendation: seoScore < 90 ? "Review Google PageSpeed Insights for this URL for the specific SEO checks that failed." : null,
      })
    );
  }
}

function addPerformanceFindings(raw: RawCrawlData, findings: Finding[]) {
  const primary = primaryPageSpeed(raw.pageSpeed);

  if (!primary) {
    findings.push(
      finding({
        category: "performance",
        severity: "info",
        title: "Performance data unavailable",
        description: "We couldn't retrieve Google PageSpeed Insights data for this page, so performance and Core Web Vitals aren't included in this report.",
        evidence: `mobile: ${raw.pageSpeed.mobileError ?? "unknown error"}; desktop: ${raw.pageSpeed.desktopError ?? "unknown error"}`,
        recommendation: null,
      })
    );
    return;
  }

  if (typeof primary.performanceScore === "number") {
    findings.push(
      finding({
        category: "performance",
        severity: scoreSeverity(primary.performanceScore),
        title: "Overall performance score",
        description: `Google's Lighthouse performance score for this page (${primary.strategy}).`,
        evidence: `Performance score: ${primary.performanceScore}/100.`,
        recommendation: primary.performanceScore < 90 ? "A slow site loses visitors before they see your content — this is worth prioritizing." : null,
      })
    );
  }

  const { largestContentfulPaintMs, cumulativeLayoutShift, totalBlockingTimeMs } = primary.metrics;

  if (typeof largestContentfulPaintMs === "number") {
    const seconds = (largestContentfulPaintMs / 1000).toFixed(1);
    const severity = largestContentfulPaintMs <= 2500 ? "good" : largestContentfulPaintMs <= 4000 ? "warning" : "critical";
    findings.push(
      finding({
        category: "performance",
        severity,
        title: "Largest Contentful Paint (LCP)",
        description: "How long it takes for the main content of the page to become visible.",
        evidence: `LCP: ${seconds}s.`,
        recommendation: severity !== "good" ? "Optimize the largest image or text block above the fold, and compress/lazy-load other images." : null,
      })
    );
  }

  if (typeof cumulativeLayoutShift === "number") {
    const severity = cumulativeLayoutShift <= 0.1 ? "good" : cumulativeLayoutShift <= 0.25 ? "warning" : "critical";
    findings.push(
      finding({
        category: "performance",
        severity,
        title: "Cumulative Layout Shift (CLS)",
        description: "How much visible content unexpectedly shifts around while the page loads.",
        evidence: `CLS: ${cumulativeLayoutShift}.`,
        recommendation: severity !== "good" ? "Reserve space for images/ads/embeds so content doesn't jump as the page loads." : null,
      })
    );
  }

  if (typeof totalBlockingTimeMs === "number") {
    const severity = totalBlockingTimeMs <= 200 ? "good" : totalBlockingTimeMs <= 600 ? "warning" : "critical";
    findings.push(
      finding({
        category: "performance",
        severity,
        title: "Total Blocking Time (TBT)",
        description: "How long the page is too busy running scripts to respond to visitor input.",
        evidence: `TBT: ${Math.round(totalBlockingTimeMs)}ms.`,
        recommendation: severity !== "good" ? "Reduce or defer JavaScript that isn't needed for the initial page render." : null,
      })
    );
  }
}

function addMobileUxFindings(raw: RawCrawlData, findings: Finding[]) {
  if (raw.page.hasViewportMeta) {
    findings.push(
      finding({
        category: "mobile_ux",
        severity: "good",
        title: "Mobile viewport configured",
        description: "The page tells mobile browsers how to scale content correctly.",
        evidence: "<meta name=\"viewport\"> found.",
        recommendation: null,
      })
    );
  } else {
    findings.push(
      finding({
        category: "mobile_ux",
        severity: "critical",
        title: "No mobile viewport tag",
        description: "Without a viewport meta tag, mobile browsers usually render a zoomed-out desktop layout, which is hard to use on a phone.",
        evidence: "No <meta name=\"viewport\"> tag found.",
        recommendation: "Add <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"> to the page <head>.",
      })
    );
  }

  const { mobile, desktop } = raw.pageSpeed;
  if (mobile?.performanceScore != null && desktop?.performanceScore != null) {
    const gap = desktop.performanceScore - mobile.performanceScore;
    if (gap >= 20) {
      findings.push(
        finding({
          category: "mobile_ux",
          severity: "warning",
          title: "Mobile is notably slower than desktop",
          description: "Most visitors to a local business site are on mobile, so a large mobile/desktop performance gap costs real visitors.",
          evidence: `Mobile performance: ${mobile.performanceScore}/100 vs. desktop: ${desktop.performanceScore}/100.`,
          recommendation: "Focus performance work on the mobile experience specifically (image sizes, render-blocking scripts).",
        })
      );
    } else {
      findings.push(
        finding({
          category: "mobile_ux",
          severity: "good",
          title: "Mobile performance is close to desktop",
          description: "The site performs similarly on mobile and desktop.",
          evidence: `Mobile performance: ${mobile.performanceScore}/100 vs. desktop: ${desktop.performanceScore}/100.`,
          recommendation: null,
        })
      );
    }
  }
}

function addContentFindings(raw: RawCrawlData, findings: Finding[]) {
  const { wordCount, headings, language } = raw.page;

  if (wordCount < 150) {
    findings.push(
      finding({
        category: "content",
        severity: "critical",
        title: "Very little text content",
        description: "Search engines and visitors both need enough content to understand what the page offers.",
        evidence: `Approximate word count: ${wordCount}.`,
        recommendation: "Add more substantive copy describing services, service areas, and what makes the business worth choosing.",
      })
    );
  } else if (wordCount < 300) {
    findings.push(
      finding({
        category: "content",
        severity: "warning",
        title: "Content is thin",
        description: "The page has some text, but likely not enough to rank well for competitive local searches.",
        evidence: `Approximate word count: ${wordCount}.`,
        recommendation: "Expand key sections with more detail about services and what customers can expect.",
      })
    );
  } else {
    findings.push(
      finding({
        category: "content",
        severity: "good",
        title: "Reasonable amount of content",
        description: "The page has a substantial amount of text for search engines and visitors to work with.",
        evidence: `Approximate word count: ${wordCount}.`,
        recommendation: null,
      })
    );

    if (headings.h2 === 0) {
      findings.push(
        finding({
          category: "content",
          severity: "warning",
          title: "No subheadings found",
          description: "Long pages without subheadings are harder to scan, which can increase how quickly visitors leave.",
          evidence: `Word count: ${wordCount}, H2 count: 0.`,
          recommendation: "Break the content into sections with clear H2 subheadings.",
        })
      );
    }
  }

  if (!language) {
    findings.push(
      finding({
        category: "content",
        severity: "info",
        title: "No page language declared",
        description: "The <html> tag doesn't declare a language, which is a minor accessibility and SEO signal.",
        evidence: "No lang attribute on <html>.",
        recommendation: "Add lang=\"en\" (or the appropriate language code) to the <html> tag.",
      })
    );
  }
}

function addTechnicalFindings(raw: RawCrawlData, findings: Finding[]) {
  const { images } = raw.page;

  if (images.total > 0) {
    if (images.missingAlt === images.total) {
      findings.push(
        finding({
          category: "technical",
          severity: "critical",
          title: "No images have alt text",
          description: "Alt text helps search engines and screen-reader users understand images.",
          evidence: `${images.missingAlt} of ${images.total} images are missing alt text.`,
          recommendation: "Add descriptive alt text to every meaningful image.",
        })
      );
    } else if (images.missingAlt > 0) {
      findings.push(
        finding({
          category: "technical",
          severity: "warning",
          title: "Some images are missing alt text",
          description: "Alt text helps search engines and screen-reader users understand images.",
          evidence: `${images.missingAlt} of ${images.total} images are missing alt text.`,
          recommendation: "Add descriptive alt text to the remaining images.",
        })
      );
    } else {
      findings.push(
        finding({
          category: "technical",
          severity: "good",
          title: "All images have alt text",
          description: "Every image on the page has alt text set.",
          evidence: `0 of ${images.total} images are missing alt text.`,
          recommendation: null,
        })
      );
    }
  }

  const primary = primaryPageSpeed(raw.pageSpeed);
  if (typeof primary?.accessibilityScore === "number") {
    findings.push(
      finding({
        category: "technical",
        severity: scoreSeverity(primary.accessibilityScore),
        title: "PageSpeed accessibility score",
        description: "Google's automated accessibility score for this page.",
        evidence: `Accessibility score: ${primary.accessibilityScore}/100.`,
        recommendation: primary.accessibilityScore < 90 ? "Review Google PageSpeed Insights for this URL for the specific accessibility checks that failed." : null,
      })
    );
  }

  if (typeof primary?.bestPracticesScore === "number") {
    findings.push(
      finding({
        category: "technical",
        severity: scoreSeverity(primary.bestPracticesScore),
        title: "PageSpeed best-practices score",
        description: "Google's automated best-practices score for this page (security, modern APIs, console errors, etc.).",
        evidence: `Best-practices score: ${primary.bestPracticesScore}/100.`,
        recommendation: primary.bestPracticesScore < 90 ? "Review Google PageSpeed Insights for this URL for the specific checks that failed." : null,
      })
    );
  }
}

function addConversionFindings(raw: RawCrawlData, findings: Finding[]) {
  const { forms, telLinks, mailtoLinks } = raw.page;

  if (forms === 0 && telLinks === 0 && mailtoLinks === 0) {
    findings.push(
      finding({
        category: "conversion",
        severity: "critical",
        title: "No obvious way to contact the business",
        description: "We couldn't find a contact form, phone link, or email link on the page — visitors have no clear next step.",
        evidence: "Forms: 0, tel: links: 0, mailto: links: 0.",
        recommendation: "Add at least one clear conversion path: a contact form, a click-to-call phone number, or an email link.",
      })
    );
    return;
  }

  if (forms > 0) {
    findings.push(
      finding({
        category: "conversion",
        severity: "good",
        title: "Contact form found",
        description: "The page has at least one form visitors can use to get in touch.",
        evidence: `${forms} form(s) found.`,
        recommendation: null,
      })
    );
  }

  if (telLinks > 0) {
    findings.push(
      finding({
        category: "conversion",
        severity: "good",
        title: "Click-to-call phone link found",
        description: "Mobile visitors can tap to call directly — one of the highest-converting actions for local businesses.",
        evidence: `${telLinks} tel: link(s) found.`,
        recommendation: null,
      })
    );
  } else {
    findings.push(
      finding({
        category: "conversion",
        severity: "info",
        title: "No click-to-call link found",
        description: "A tappable phone number is one of the easiest conversions to capture from mobile visitors.",
        evidence: "0 tel: links found.",
        recommendation: "Add a click-to-call phone link (e.g. <a href=\"tel:+1...\">) somewhere prominent, like the header.",
      })
    );
  }
}

function emptySeverityCounts(): Record<FindingSeverity, number> {
  return { critical: 0, warning: 0, info: 0, good: 0 };
}

function summarize(findings: Finding[]): AnalysisResult["summary"] {
  const counts = emptySeverityCounts();
  const byCategory = Object.fromEntries(CATEGORIES.map((c) => [c, emptySeverityCounts()])) as Record<
    FindingCategory,
    Record<FindingSeverity, number>
  >;

  for (const f of findings) {
    counts[f.severity]++;
    byCategory[f.category][f.severity]++;
  }

  return { counts, byCategory };
}

export function analyzePage(raw: RawCrawlData): AnalysisResult {
  const findings: Finding[] = [];

  addSeoFindings(raw, findings);
  addPerformanceFindings(raw, findings);
  addMobileUxFindings(raw, findings);
  addContentFindings(raw, findings);
  addTechnicalFindings(raw, findings);
  addConversionFindings(raw, findings);

  return {
    generatedAt: new Date().toISOString(),
    findings,
    summary: summarize(findings),
  };
}

export { SEVERITIES, CATEGORIES };
