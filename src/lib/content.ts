import { allArticles } from "content-collections";
import { resolveFacts } from "./facts-display";
import { pillars, type PillarId } from "./site";

export type Article = (typeof allArticles)[number];
export type ContentType = "explainer" | "tool" | "video" | "thread";

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

export type SearchDoc = {
  type: ContentType;
  title: string;
  href: string;
  snippet: string;
  pillar?: PillarId;
};

export const searchIndex: SearchDoc[] = [
  ...articles.map((a) => ({
    type: "explainer" as const,
    title: a.title,
    href: a.url,
    snippet: a.description,
    pillar: a.pillar as PillarId,
  })),
  {
    type: "tool",
    title: "Retirement Roadmap Pack",
    href: "/tools",
    snippet: "Spreadsheet + checklist + calculator. Know if you’re roughly on track.",
  },
  {
    type: "tool",
    title: "Withdrawal Simulator",
    href: "/tools/withdrawal-simulator",
    snippet: "Stress-test your withdrawal rate against expected growth and inflation over a 30-year retirement period.",
  },
  {
    type: "thread",
    title: "Starting late at 45 — what’s realistic?",
    href: "/forum",
    snippet: "Community Q&A preview (Phase 2).",
  },
];

export function searchDocs(q: string): SearchDoc[] {
  const query = q.trim().toLowerCase();
  if (!query) return searchIndex;
  return searchIndex.filter((d) =>
    `${d.title} ${d.snippet} ${d.pillar || ""}`.toLowerCase().includes(query),
  );
}
