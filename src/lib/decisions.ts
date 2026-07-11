export const decisions = {
  "retire-now-or-wait": {
    title: "Retire now or wait?",
    description: "Compare timing, savings years, withdrawal years, health coverage, and flexibility.",
    plainAnswer:
      "Retirement timing is an output of spending, guaranteed income, healthcare coverage, and flexibility. Waiting can help, but only if the extra time improves the plan more than it costs your life.",
    toolHref: "/tools/retirement-age-tradeoff",
    toolLabel: "Compare retirement ages",
    sources: [
      {
        title: "Health coverage for retirees",
        publisher: "HealthCare.gov",
        url: "https://www.healthcare.gov/retirees/",
      },
      {
        title: "Starting Your Retirement Benefits Early",
        publisher: "Social Security Administration",
        url: "https://www.ssa.gov/benefits/retirement/planner/agereduction.html",
      },
    ],
  },
  "claim-social-security-now-or-later": {
    title: "Claim Social Security now or later?",
    description: "Understand early claiming, full retirement age, delayed benefits, and break-even caveats.",
    plainAnswer:
      "Claiming early gives income sooner and permanently lowers the monthly benefit. Delaying can raise the monthly check, but health, cash flow, survivor needs, and taxes matter.",
    toolHref: "/tools/social-security-break-even",
    toolLabel: "Compare claiming ages",
    sources: [
      {
        title: "Starting Your Retirement Benefits Early",
        publisher: "Social Security Administration",
        url: "https://www.ssa.gov/benefits/retirement/planner/agereduction.html",
      },
      {
        title: "Social Security Retirement Estimator",
        publisher: "Social Security Administration",
        url: "https://www.ssa.gov/benefits/retirement/estimator.html",
      },
    ],
  },
  "roth-vs-traditional": {
    title: "Roth or Traditional?",
    description: "Frame tax-now versus tax-later retirement contributions.",
    plainAnswer:
      "Traditional saves tax now; Roth saves tax later. A split can be useful when today's and future tax rates are uncertain.",
    toolHref: "/tools/roth-vs-traditional",
    toolLabel: "Check what a conversion really costs",
    sources: [
      {
        title: "401(k) limit increases to $24,500 for 2026, IRA limit increases to $7,500",
        publisher: "Internal Revenue Service",
        url: "https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500",
      },
    ],
  },
  "pay-debt-or-invest": {
    title: "Pay debt or invest?",
    description: "Compare debt payoff, employer match, emergency reserves, and retirement saving.",
    plainAnswer:
      "High-interest debt and a missed employer match are usually urgent. Lower-rate debt is a tradeoff between guaranteed payoff return, liquidity, and long-term investing.",
    toolHref: "/tools/debt-vs-investing",
    toolLabel: "Compare debt payoff with investing",
    sources: [
      {
        title: "Survey of Consumer Finances",
        publisher: "Federal Reserve",
        url: "https://www.federalreserve.gov/econres/scfindex.htm",
      },
    ],
  },
} as const;

export type DecisionSlug = keyof typeof decisions;

export function isDecisionSlug(slug: string): slug is DecisionSlug {
  return slug in decisions;
}

