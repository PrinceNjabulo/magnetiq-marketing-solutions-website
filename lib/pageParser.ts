import * as cheerio from "cheerio";

export type PageExtraction = {
  title: string | null;
  metaDescription: string | null;
  hasViewportMeta: boolean;
  language: string | null;
  headings: { h1: number; h2: number; h3: number; h4: number; h5: number; h6: number };
  h1Texts: string[];
  images: { total: number; missingAlt: number };
  links: { internal: number; external: number; total: number };
  wordCount: number;
  structuredDataBlocks: number;
  forms: number;
  telLinks: number;
  mailtoLinks: number;
};

export function extractPageData(html: string, pageUrl: string): PageExtraction {
  const $ = cheerio.load(html);
  const baseHostname = new URL(pageUrl).hostname;

  const title = $("title").first().text().trim() || null;
  const metaDescription = $('meta[name="description"]').attr("content")?.trim() || null;
  const hasViewportMeta = $('meta[name="viewport"]').length > 0;
  const language = $("html").attr("lang")?.trim() || null;

  const headings = {
    h1: $("h1").length,
    h2: $("h2").length,
    h3: $("h3").length,
    h4: $("h4").length,
    h5: $("h5").length,
    h6: $("h6").length,
  };
  const h1Texts = $("h1")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean)
    .slice(0, 5);

  const images = $("img");
  const missingAlt = images.filter((_, el) => !$(el).attr("alt")?.trim()).length;

  let internalLinks = 0;
  let externalLinks = 0;
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    try {
      const resolved = new URL(href, pageUrl);
      if (resolved.hostname === baseHostname) internalLinks++;
      else externalLinks++;
    } catch {
      // Unparsable href (e.g. "javascript:void(0)") — not a real link, skip it.
    }
  });

  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const wordCount = bodyText ? bodyText.split(" ").length : 0;

  return {
    title,
    metaDescription,
    hasViewportMeta,
    language,
    headings,
    h1Texts,
    images: { total: images.length, missingAlt },
    links: { internal: internalLinks, external: externalLinks, total: internalLinks + externalLinks },
    wordCount,
    structuredDataBlocks: $('script[type="application/ld+json"]').length,
    forms: $("form").length,
    telLinks: $('a[href^="tel:"]').length,
    mailtoLinks: $('a[href^="mailto:"]').length,
  };
}
