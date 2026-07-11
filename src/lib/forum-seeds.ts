export const seededQuestions = {
  "45-with-40k-saved": {
    title: "I am 45 with $40k saved. What should I do first?",
    pillar: "retirement",
    summary:
      "Start with the full employer match, high-interest debt, a simple savings-rate increase, and a realistic retirement-age range. The goal is momentum and a measurable monthly change.",
    answer:
      "The first move is not to solve every retirement variable. Capture the full employer match if available, avoid high-interest debt dragging the plan backward, increase tax-advantaged contributions in steps, and compare retiring at 65, 67, and 70. A late start is a gap, not a verdict.",
    related: ["/late-starters", "/tools/catch-up-contributions", "/tools/retirement-age-tradeoff"],
  },
  "claim-social-security-before-it-runs-out": {
    title: "Should I claim Social Security early because I worry it will run out?",
    pillar: "retirement",
    summary:
      "Do not make a permanent claiming decision from panic alone. Compare benefit reductions, cash-flow needs, health, spouse/survivor issues, and updated SSA source material.",
    answer:
      "SSA rules allow retirement benefits to start at 62, but claiming before full retirement age permanently reduces the monthly benefit. Fear about the system should be separated from the household math: cash flow, health, work status, spouse needs, and survivor benefits.",
    related: ["/tools/social-security-break-even", "/decisions/claim-social-security-now-or-later"],
  },
  "retire-before-medicare": {
    title: "Can I retire before Medicare if I need ACA coverage?",
    pillar: "retirement",
    summary:
      "Maybe, but the healthcare bridge must be modeled before the retirement date is treated as realistic.",
    answer:
      "Retiring before 65 usually means planning a bridge through Marketplace coverage, COBRA, spouse coverage, or another option. HealthCare.gov notes that retirees can use the Marketplace before Medicare eligibility. The cost can change the retirement gap materially.",
    related: ["/topics/retirement/health-care-before-medicare", "/tools/retirement-age-tradeoff"],
  },
  "is-one-million-enough-paid-off-house": {
    title: "Is $1 million enough if my house is paid off?",
    pillar: "retirement",
    summary:
      "A paid-off house helps, but the useful question is still annual spending gap versus guaranteed income and portfolio withdrawals.",
    answer:
      "$1 million can be enough for some households and not enough for others. A paid-off house may reduce spending, but taxes, insurance, healthcare, maintenance, Social Security timing, and flexibility still matter.",
    related: ["/topics/retirement/is-1-million-enough", "/tools/am-i-on-track"],
  },
  "pay-off-mortgage-before-retiring": {
    title: "Should I pay off my mortgage before retiring?",
    pillar: "decision-tools",
    summary:
      "Compare interest rate, liquidity, taxes, emotional safety, and the effect on annual retirement spending.",
    answer:
      "Paying off a mortgage can lower retirement spending and anxiety, but it can also reduce liquidity. The decision is stronger when the rate is high, cash reserves remain adequate, and the payoff meaningfully improves the spending gap.",
    related: ["/decisions/pay-debt-or-invest", "/checkup"],
  },
  "cash-before-retirement": {
    title: "How much cash should I keep before retiring?",
    pillar: "retirement",
    summary:
      "Cash is a buffer against bad timing, not a return engine. Size it around spending, income certainty, and withdrawal flexibility.",
    answer:
      "A practical cash buffer helps avoid selling investments after a market drop. The right amount depends on guaranteed income, spending flexibility, upcoming expenses, and comfort with market volatility.",
    related: ["/topics/retirement/sequence-of-returns", "/tools/sequence-risk"],
  },
  "roth-or-traditional-peak-earnings": {
    title: "Roth or traditional if I am in my peak earning years?",
    pillar: "retirement",
    summary:
      "Peak earning years often favor traditional contributions, but future tax uncertainty and account mix can make a split useful.",
    answer:
      "Traditional contributions save taxes now; Roth contributions trade today's tax for future tax-free qualified withdrawals. If future tax rates are uncertain, a mix can create flexibility.",
    related: ["/decisions/roth-vs-traditional", "/topics/retirement/roth-vs-traditional"],
  },
  "couples-retirement-alignment": {
    title: "How do couples align when one wants to retire early?",
    pillar: "money-psychology",
    summary:
      "Separate the emotional goal from the funding math, then compare shared tradeoffs.",
    answer:
      "Start with one shared snapshot: spending, guaranteed income, healthcare, savings, and timing. Then discuss what each partner values: freedom, safety, work identity, location, and family obligations.",
    related: ["/topics/money-psychology/couples-and-money", "/checkup"],
  },
  "market-drops-after-retiring": {
    title: "What if the market drops right after I retire?",
    pillar: "retirement",
    summary:
      "That is sequence risk. The plan needs a bad-first-decade test before withdrawals feel settled.",
    answer:
      "A market drop early in retirement is more dangerous because withdrawals can lock in losses. Flexible spending, cash reserves, part-time income, and a lower first-year withdrawal can reduce pressure.",
    related: ["/topics/retirement/sequence-of-returns", "/tools/sequence-risk"],
  },
  "part-time-work-late-plan": {
    title: "Can part-time work save a late retirement plan?",
    pillar: "retirement",
    summary:
      "Part-time work can help twice: it adds income and reduces early withdrawals when sequence risk is high.",
    answer:
      "Part-time work is one of the strongest flexibility levers because it can delay full withdrawals, preserve savings, and ease the emotional cliff from working to not working.",
    related: ["/topics/retirement/part-time-retirement", "/tools/retirement-age-tradeoff"],
  },
} as const;

export type SeededQuestionSlug = keyof typeof seededQuestions;

export function isSeededQuestionSlug(slug: string): slug is SeededQuestionSlug {
  return slug in seededQuestions;
}

