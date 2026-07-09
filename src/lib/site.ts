export const site = {
  name: "Know Plain",
  tagline: "Big ideas, known plain.",
  description:
    "Clear explainers on retirement, money psychology, science, and decision tools — without jargon.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://knowplain.com",
  youtube: "https://www.youtube.com/@explainstudio9",
  youtubeBrand: "Know Plain",
  empowerUrl: process.env.NEXT_PUBLIC_EMPOWER_URL || "https://empower.sjv.io/7XDD2Q",
  boldinUrl: "https://www.boldin.com/retirement/planner/",
  ynabUrl: "https://www.ynab.com",
  amazonTag: process.env.NEXT_PUBLIC_AMAZON_TAG || "explainstudio-20",
  legacyRoadmapUrl: "https://knowplain.com/retirement-roadmap/",
} as const;

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
