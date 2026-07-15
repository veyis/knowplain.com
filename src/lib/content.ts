import { allArticles } from "content-collections";
import { resolveFacts } from "./facts-display";
import { decisions } from "./decisions";
import { glossary } from "./glossary";
import { pillars, type PillarId } from "./site";
import { toolPages } from "./tools";
import { fallbackVideos } from "./videos";
import { rankSearchDocs } from "./search";
import type { SearchDoc, SearchResult } from "./search";

export type { ContentType, SearchDoc, SearchResult } from "./search";

export type Article = (typeof allArticles)[number];

/**
 * Resolve `{{fact.id}}` tokens in every frontmatter string, once, at the collection boundary.
 *
 * `<Fact>` only works in the MDX body. Frontmatter is YAML, so every 2026 number in
 * `description`, `plainAnswer`, the FAQs, the source notes and the link labels was hand-typed
 * — and those are the strings that become the meta description, the answer snippet, and the
 * Article schema. It was the one surface with no protection against drifting from
 * facts-2026.ts, which is the exact failure this whole system exists to prevent.
 *
 * Doing it HERE rather than in each page means the hubs, search index, OG images and sitemap
 * cannot forget to. An unknown id throws at build.
 */
export const articles = allArticles.map((a) => ({
  ...a,
  title: resolveFacts(a.title),
  description: resolveFacts(a.description),
  plainAnswer: resolveFacts(a.plainAnswer),
  ...(a.volatileNote ? { volatileNote: resolveFacts(a.volatileNote) } : {}),
  ...(a.correction ? { correction: { ...a.correction, summary: resolveFacts(a.correction.summary) } } : {}),
  faqs: a.faqs?.map((f) => ({ q: resolveFacts(f.q), a: resolveFacts(f.a) })),
  sources: a.sources?.map((s) => ({
    ...s,
    title: resolveFacts(s.title),
    ...(s.note ? { note: resolveFacts(s.note) } : {}),
  })),
  related: a.related?.map((r) => ({ ...r, label: resolveFacts(r.label) })),
  relatedTools: a.relatedTools?.map((r) => ({ ...r, label: resolveFacts(r.label) })),
  relatedDecisions: a.relatedDecisions?.map((r) => ({ ...r, label: resolveFacts(r.label) })),
}));

export function getArticle(pillar: string, slug: string) {
  return articles.find((a) => a.pillar === pillar && a.slug === slug);
}

export function getArticlesByPillar(pillar: PillarId) {
  return articles.filter((a) => a.pillar === pillar);
}

export function isPillarId(value: string): value is PillarId {
  return value in pillars;
}

const articleAliases: Record<string, string[]> = {
  "is-1-million-enough": ["is one million enough to retire", "can i retire with 1 million"],
  "how-much-is-enough": ["how much do i need to retire", "am i on track for retirement"],
  "retirement-isnt-a-date": ["when can i retire", "can i stop working", "retirement plan"],
  "starting-retirement-savings-at-45": [
    "i am behind on retirement",
    "starting retirement late",
    "no retirement savings at 45",
  ],
  "health-care-before-medicare": [
    "health insurance before medicare",
    "how do i retire before 65",
    "aca before medicare",
  ],
  "social-security-timing": [
    "when should i claim social security",
    "social security at 62 or 70",
  ],
  "roth-conversion-ladder": ["should i convert my ira to roth", "roth conversion before 65"],
  "roth-vs-traditional": ["roth or traditional", "pay tax now or later"],
  "sequence-of-returns": ["what if the market crashes after i retire", "bad returns early retirement"],
  "4-percent-rule-2026": ["how much can i withdraw", "safe withdrawal rate"],
  "aca-subsidy-cliff": ["aca subsidy cliff", "income limit for aca subsidy"],
  "catch-up-contributions-2026": ["how much can i contribute after 50", "401k catch up limit"],
};

function searchableText(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`*_>#|~-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const searchIndex: SearchDoc[] = [
  {
    type: "explainer",
    title: "What changed for retirement planning in 2026",
    href: "/changes/2026",
    snippet: "A sourced annual changelog for contribution, tax, Social Security, Medicare, and ACA rules.",
    aliases: ["new retirement rules 2026", "2026 retirement changes", "what changed this year"],
    keywords: ["annual changelog law limits cola medicare aca"],
  },
  {
    type: "explainer",
    title: "Retirement action paths for starting at 45, 50, or 55",
    href: "/late-starters",
    snippet: "Age-specific sequences for closing a retirement gap without false precision.",
    aliases: ["starting retirement at 50", "starting retirement at 55", "late retirement saver"],
    keywords: ["catch up behind late starter action plan"],
  },
  ...articles.map((a) => ({
    type: "explainer" as const,
    title: a.title,
    href: a.url,
    snippet: a.description,
    pillar: a.pillar as PillarId,
    aliases: [
      ...(articleAliases[a.slug] || []),
      ...(a.faqs?.map((faq) => faq.q) || []),
    ],
    keywords: [a.pillar.replace("-", " "), a.plainAnswer],
    body: searchableText(
      `${a.content} ${(a.faqs || []).map((faq) => `${faq.q} ${faq.a}`).join(" ")}`,
    ),
  })),
  ...Object.entries(toolPages).map(([slug, tool]) => ({
    type: "tool" as const,
    title: tool.title,
    href: `/tools/${slug}`,
    snippet: tool.description,
    aliases:
      slug === "am-i-on-track"
        ? ["can i afford to retire", "am i ready to retire", "how much do i need"]
        : slug === "retirement-age-tradeoff"
          ? ["when can i retire", "retire now or work longer"]
          : slug === "aca-bridge"
            ? ["health insurance before medicare", "retire before 65"]
            : slug === "social-security-break-even"
              ? ["claim social security at 62 or 70", "when should i take social security"]
              : [],
    keywords: [slug.replaceAll("-", " "), "calculator"],
    body: tool.sources.map((source) => `${source.title} ${source.publisher}`).join(" "),
  })),
  ...Object.entries(decisions).map(([slug, decision]) => ({
    type: "decision" as const,
    title: decision.title,
    href: `/decisions/${slug}`,
    snippet: decision.description,
    aliases: [decision.plainAnswer],
    keywords: [slug.replaceAll("-", " "), "compare tradeoff decision"],
    body: searchableText(JSON.stringify(decision)),
  })),
  ...glossary.map((term) => ({
    type: "glossary" as const,
    title: term.term,
    href: `/glossary#${term.id}`,
    snippet: term.definition,
    aliases: term.see ? [term.see.label] : [],
    keywords: [term.id.replaceAll("-", " "), "definition meaning"],
    body: term.definition,
  })),
  ...fallbackVideos.map((video) => ({
    type: "video" as const,
    title: video.title,
    href: `/watch/${video.id}`,
    snippet: video.description,
    aliases: video.chapters?.map((chapter) => chapter.title) || [],
    keywords: ["video transcript"],
    body: `${video.transcript || ""} ${video.chapters?.map((chapter) => `${chapter.title} ${chapter.summary}`).join(" ") || ""}`,
  })),
  {
    type: "tool",
    title: "Retirement Roadmap Pack",
    href: "/tools",
    snippet: "Spreadsheet, checklist, and calculators for organizing your next retirement steps.",
    aliases: ["retirement checklist", "retirement spreadsheet", "retirement plan template"],
    keywords: ["download print pack"],
  },
];

/** Deterministic, inspectable relevance ranking for the local content corpus. */
export function searchDocs(q: string): SearchResult[] {
  return rankSearchDocs(searchIndex, q);
}
