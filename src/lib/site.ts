import type { Metadata } from "next";

export const site = {
  name: "Know Plain",
  tagline: "Big ideas, known plain.",
  // "science" was in here and the site has never covered it — it was leaking into the
  // homepage meta description, which is the one that has to sell an unknown brand.
  description:
    "Clear, sourced explainers on retirement, money psychology, and decision tools — without jargon.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://knowplain.com",
  youtube: "https://www.youtube.com/@explainstudio9",
  youtubeBrand: "Know Plain",
  empowerUrl: process.env.NEXT_PUBLIC_EMPOWER_URL || "https://empower.sjv.io/7XDD2Q",
  boldinUrl: "https://www.boldin.com/retirement/planner/",
  ynabUrl: "https://www.ynab.com",
  amazonTag: process.env.NEXT_PUBLIC_AMAZON_TAG || "explainstudio-20",
  legacyRoadmapUrl: "/retirement-roadmap",
} as const;

/**
 * Per-page metadata: self-canonical, self-referential OpenGraph, and a matching Twitter card.
 *
 * The `twitter` block is not optional decoration. Next merges metadata per-key, and the root
 * layout declares an explicit `twitter` with a hardcoded title/description — so ANY route
 * that does not override it ships `twitter:title = "Know Plain"`. Every article shared on X
 * rendered as an untitled brand card. Same failure mode for `openGraph`: the root sets
 * `url: site.url`, so a route that omits it tells every scraper, preview card and LLM
 * crawler that the page lives at the homepage.
 *
 * Route EVERY page through this. `image` defaults to the site card; pass a per-page one
 * (articles have their own generated OG image) when there is a better option.
 */
export function pageMeta(
  path: string,
  title: string,
  description: string,
  image?: string,
): Metadata {
  const url = `${site.url}${path}`;
  const card = image ?? `${site.url}/opengraph-image`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: site.name,
      title,
      description,
      url,
      images: [card],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [card],
    },
  };
}

export type PillarId = "retirement" | "money-psychology" | "decision-tools";

export const pillars: Record<
  PillarId,
  { title: string; lede: string; path: string }
> = {
  retirement: {
    title: "Retirement",
    lede: "Enough, withdrawal, Social Security, sequence risk — known plain.",
    path: "/topics/retirement",
  },
  "money-psychology": {
    title: "Money psychology",
    lede: "Biases, habits, anxiety — why plans fail in practice.",
    path: "/topics/money-psychology",
  },
  "decision-tools": {
    title: "Decision tools",
    lede: "Calculators and frameworks you can use today.",
    path: "/topics/decision-tools",
  },
};
