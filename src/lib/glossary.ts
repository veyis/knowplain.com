export type GlossaryTerm = {
  /** Anchor id + slug. */
  id: string;
  term: string;
  definition: string;
  /** Deep link into the cluster article that covers this term. */
  see?: { href: string; label: string };
};

/**
 * Single-page glossary (a DefinedTermSet). Each term links into a pillar
 * article so the glossary acts as a topic hub, not a set of thin stubs.
 */
export const glossary: GlossaryTerm[] = [
  {
    id: "sequence-of-returns-risk",
    term: "Sequence-of-returns risk",
    definition:
      "The danger that the order of investment returns — not just the average — hurts you when you're withdrawing. A bad decade early in retirement does far more damage than the same decade later, because you're selling shares at low prices to fund spending.",
    see: { href: "/topics/retirement/sequence-of-returns", label: "Sequence of returns risk" },
  },
  {
    id: "safe-withdrawal-rate",
    term: "Safe withdrawal rate (SWR)",
    definition:
      "The percentage of a portfolio you can withdraw each year (adjusted for inflation) with a high chance the money lasts a full retirement. It's a planning heuristic, not a guarantee — 4% is the classic starting figure.",
    see: { href: "/topics/retirement/4-percent-rule-2026", label: "The 4% rule in 2026" },
  },
  {
    id: "the-4-percent-rule",
    term: "The 4% rule",
    definition:
      "A planning rule from William Bengen (1994) and the Trinity study: withdrawing about 4% of a starting portfolio, adjusted for inflation, survived most historical 30-year periods. A useful first pass, sensitive to fees, horizon, and returns.",
    see: { href: "/topics/retirement/4-percent-rule-2026", label: "The 4% rule in 2026" },
  },
  {
    id: "present-bias",
    term: "Present bias",
    definition:
      "The tendency to weigh a reward now far more heavily than a bigger reward later — a form of hyperbolic discounting. It's why 'I'll save more next month' rarely compounds, and why automating savings beats willpower.",
    see: { href: "/topics/money-psychology/present-bias", label: "Present bias & under-saving" },
  },
  {
    id: "loss-aversion",
    term: "Loss aversion",
    definition:
      "The finding (Kahneman & Tversky) that losses feel about twice as painful as equivalent gains feel good. In bear markets it drives panic-selling — turning a temporary paper loss into a permanent one.",
    see: { href: "/topics/money-psychology/loss-aversion", label: "Loss aversion in bear markets" },
  },
  {
    id: "glide-path",
    term: "Glide path",
    definition:
      "A pre-set plan for shifting a portfolio's stock/bond mix over time — typically holding more bonds near retirement to cushion the fragile early years, then easing back. Target-date funds follow a glide path automatically.",
    see: { href: "/topics/retirement/sequence-of-returns", label: "Sequence of returns risk" },
  },
  {
    id: "roth-conversion",
    term: "Roth conversion (Roth ladder)",
    definition:
      "Moving money from a tax-deferred account (traditional IRA/401k) into a Roth and paying tax now, so future growth and withdrawals are tax-free. Doing it in steps over several low-income years is a 'Roth ladder.'",
    see: { href: "/topics/retirement/roth-vs-traditional", label: "Roth vs Traditional" },
  },
  {
    id: "required-minimum-distribution",
    term: "Required minimum distribution (RMD)",
    definition:
      "The amount the IRS requires you to withdraw from tax-deferred accounts each year starting at age 73 (under SECURE 2.0). Miss it and you face a penalty, so RMDs shape the order you draw down accounts.",
    see: { href: "/topics/decision-tools/withdrawal-plan", label: "A plain withdrawal plan" },
  },
  {
    id: "cost-of-living-adjustment",
    term: "Cost-of-living adjustment (COLA)",
    definition:
      "An annual increase that keeps income in step with inflation. Social Security applies a COLA each year, which is a big reason its guaranteed income is so valuable over a long retirement.",
    see: { href: "/topics/retirement/inflation-and-retirement", label: "Inflation and retirement" },
  },
  {
    id: "full-retirement-age",
    term: "Full retirement age (FRA)",
    definition:
      "The age at which you receive your baseline Social Security benefit — 67 for anyone born in 1960 or later. Claim before it and your benefit is permanently reduced; wait past it and it grows.",
    see: { href: "/topics/retirement/social-security-timing", label: "Social Security timing" },
  },
  {
    id: "delayed-retirement-credits",
    term: "Delayed retirement credits",
    definition:
      "The roughly 8%-per-year increase in your Social Security benefit for each year you delay claiming between full retirement age and 70 — a guaranteed, inflation-adjusted return that's hard to beat elsewhere.",
    see: { href: "/topics/retirement/social-security-timing", label: "Social Security timing" },
  },
  {
    id: "compounding",
    term: "Compounding",
    definition:
      "Earning returns on your past returns, not just your original contributions. It's why starting early matters so much — and why a late start leans harder on savings rate than on market growth.",
    see: { href: "/topics/retirement/starting-retirement-savings-at-45", label: "Starting savings at 45" },
  },
  {
    id: "diversification",
    term: "Diversification",
    definition:
      "Spreading money across many investments so no single one can sink the plan. It doesn't eliminate risk, but it smooths the ride and is a core defense against bad luck in any one asset.",
    see: { href: "/topics/money-psychology/loss-aversion", label: "Loss aversion in bear markets" },
  },
  {
    id: "rebalancing",
    term: "Rebalancing",
    definition:
      "Periodically resetting your portfolio back to its target mix — selling what's grown and buying what's lagged. Done on a schedule, it forces you to buy low and sell high without relying on emotion.",
    see: { href: "/topics/money-psychology/loss-aversion", label: "Loss aversion in bear markets" },
  },
  {
    id: "target-date-fund",
    term: "Target-date fund",
    definition:
      "A single fund that holds a diversified mix and automatically follows a glide path toward a chosen retirement year. It's the plainest 'default' for people who freeze on investment choices.",
    see: { href: "/topics/money-psychology/decision-freeze", label: "Why we freeze on money decisions" },
  },
];
