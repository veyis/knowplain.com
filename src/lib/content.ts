import { pillars, type PillarId } from "./site";

export type ContentType = "explainer" | "tool" | "video" | "thread";

export type Article = {
  slug: string;
  pillar: PillarId;
  title: string;
  description: string;
  plainAnswer: string;
  updated: string;
  body: string[];
  related?: { href: string; label: string }[];
};

export type SearchDoc = {
  type: ContentType;
  title: string;
  href: string;
  snippet: string;
  pillar?: PillarId;
};

export const articles: Article[] = [
  {
    slug: "retirement-isnt-a-date",
    pillar: "retirement",
    title: "Retirement isn’t a date — it’s math",
    description:
      "A plain model for “enough,” withdrawal rates, and why the calendar date is the wrong target.",
    plainAnswer:
      "Treat retirement as a funding problem. The date is an output, not an input.",
    updated: "2026-07-08",
    body: [
      "Most people pick a birthday and call it a plan. The better question is whether the math works — savings rate, withdrawal rate, and what happens if markets are ugly in the first decade of retirement.",
      "When you reverse the problem — start from spending, then back into the portfolio you need — the “right age” becomes clearer, and so does the gap you still need to close.",
      "Educational only. Not financial advice. Run your own numbers with the Roadmap pack, then talk to a qualified professional for decisions that affect your life.",
    ],
    related: [
      { href: "/tools", label: "Related tool → Retirement Roadmap Pack" },
      { href: "/watch", label: "Related video → Complete Playbook" },
      { href: "/topics/retirement", label: "Back to hub → Retirement" },
    ],
  },
  {
    slug: "how-much-is-enough",
    pillar: "retirement",
    title: "How much is enough to retire?",
    description:
      "“Enough” is a spending-rate problem, not a magic net-worth number.",
    plainAnswer:
      "Estimate annual spending, multiply by a withdrawal factor, then stress-test.",
    updated: "2026-07-08",
    body: [
      "A round number like “$1 million” feels concrete, but it ignores your spending, taxes, Social Security, and sequence risk.",
      "A plainer approach: write down annual spending in today’s dollars, choose a planning withdrawal rate, and see what portfolio that implies. Then shock the plan (lower returns, higher inflation, longer life).",
    ],
    related: [
      { href: "/topics/retirement/retirement-isnt-a-date", label: "Retirement isn’t a date" },
      { href: "/tools", label: "Roadmap pack" },
    ],
  },
  {
    slug: "4-percent-rule-2026",
    pillar: "retirement",
    title: "The 4% rule in 2026",
    description: "The classic safe withdrawal rate is a starting point — not a guarantee.",
    plainAnswer:
      "Use 4% as a planning heuristic, then adjust for fees, taxes, and sequence risk.",
    updated: "2026-07-08",
    body: [
      "The 4% rule came from historical US market research on portfolio longevity. It is useful as a first pass, not as a promise.",
      "In 2026, valuations, fees, and your personal flexibility (part-time work, spending cuts) matter as much as the headline percentage.",
    ],
    related: [
      { href: "/topics/retirement/sequence-of-returns", label: "Sequence of returns" },
      { href: "/topics/retirement/how-much-is-enough", label: "How much is enough?" },
    ],
  },
  {
    slug: "sequence-of-returns",
    pillar: "retirement",
    title: "Sequence of returns risk, known plain",
    description: "Why a crash at 65 hits harder than the same crash at 35.",
    plainAnswer: "Early retirement returns matter more than average returns.",
    updated: "2026-07-08",
    body: [
      "Two retirees can earn the same average return and end with very different outcomes if bad years arrive early while they are withdrawing.",
      "That is sequence risk. Cash buffers, flexible spending, and diversified income sources are the plain mitigations — not predicting the next crash.",
    ],
  },
  {
    slug: "present-bias",
    pillar: "money-psychology",
    title: "Present bias & under-saving",
    description: "Future-you is abstract. Present-you wants comfort now.",
    plainAnswer: "Automate savings so willpower isn’t the plan.",
    updated: "2026-07-08",
    body: [
      "Present bias is why “I’ll invest more next month” rarely compounds. The fix is structural: auto-transfer on payday, raise 401(k) deferrals with raises, and remove friction from the good default.",
    ],
  },
  {
    slug: "decision-freeze",
    pillar: "money-psychology",
    title: "Why we freeze on money decisions",
    description: "Too many options + fear of regret = paralysis.",
    plainAnswer: "Shrink the decision: pick a default portfolio and a savings rate.",
    updated: "2026-07-08",
    body: [
      "Paralysis is often a design problem. Give yourself a default (target-date or three-fund portfolio), a savings rate, and a review date — then stop optimizing weekly.",
    ],
  },
  {
    slug: "couples-and-money",
    pillar: "money-psychology",
    title: "Couples and money conversations",
    description: "Money fights are usually about values and safety, not spreadsheets.",
    plainAnswer: "Schedule a short, recurring money meeting with one agenda item.",
    updated: "2026-07-08",
    body: [
      "Start with shared goals and fears before products. A 20-minute monthly meeting with one topic beats a once-a-year blowup.",
    ],
  },
  {
    slug: "retirement-age-framework",
    pillar: "decision-tools",
    title: "How to choose a retirement age",
    description: "Age is a lever among savings rate, spending, and Social Security timing.",
    plainAnswer: "Run three ages (early / target / late) and compare the funding gap.",
    updated: "2026-07-08",
    body: [
      "Instead of picking a birthday, model three ages and see which levers close the gap fastest: spend less, save more, work longer, or delay Social Security.",
    ],
    related: [{ href: "/tools", label: "Open Roadmap pack" }],
  },
];

export function getArticle(pillar: string, slug: string) {
  return articles.find((a) => a.pillar === pillar && a.slug === slug);
}

export function getArticlesByPillar(pillar: PillarId) {
  return articles.filter((a) => a.pillar === pillar);
}

export function isPillarId(value: string): value is PillarId {
  return value in pillars;
}

export const searchIndex: SearchDoc[] = [
  ...articles.map((a) => ({
    type: "explainer" as const,
    title: a.title,
    href: `/topics/${a.pillar}/${a.slug}`,
    snippet: a.description,
    pillar: a.pillar,
  })),
  {
    type: "tool",
    title: "Retirement Roadmap Pack",
    href: "/tools",
    snippet: "Spreadsheet + checklist + calculator. Know if you’re roughly on track.",
  },
  {
    type: "video",
    title: "The Complete Retirement Playbook",
    href: "/watch",
    snippet: "18-minute explainer with chapters and transcript SEO.",
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
