import { allArticles, allVideos } from "content-collections";
import { pillars, type PillarId } from "./site";

export type Article = (typeof allArticles)[number];
export type Video = (typeof allVideos)[number];
export type ContentType = "explainer" | "tool" | "video" | "thread";

export const articles = allArticles;
export const videos = allVideos;

export function getArticle(pillar: string, slug: string) {
  return articles.find((a) => a.pillar === pillar && a.slug === slug);
}

export function getArticlesByPillar(pillar: PillarId) {
  return articles.filter((a) => a.pillar === pillar);
}

export function getVideo(slug: string) {
  return videos.find((v) => v.slug === slug);
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
  ...videos.map((v) => ({
    type: "video" as const,
    title: v.title,
    href: v.url,
    snippet: v.description,
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
