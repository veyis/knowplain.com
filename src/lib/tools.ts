export const toolPages = {
  "am-i-on-track": {
    title: "Am I On Track?",
    description: "Compare your projected savings range with a plain retirement portfolio target.",
    kind: "on-track",
    sources: [
      {
        title: "Survey of Consumer Finances",
        publisher: "Federal Reserve",
        url: "https://www.federalreserve.gov/econres/scfindex.htm",
      },
    ],
  },
  "retirement-age-tradeoff": {
    title: "Retirement Age Tradeoff",
    description: "Compare retiring at different ages and see how timing changes the plan.",
    kind: "age-tradeoff",
    sources: [
      {
        title: "Health coverage for retirees",
        publisher: "HealthCare.gov",
        url: "https://www.healthcare.gov/retirees/",
      },
    ],
  },
  "aca-bridge": {
    title: "ACA Bridge Before Medicare",
    description: "See where your income lands against the 2026 ACA subsidy cliff before age 65.",
    kind: "aca-bridge",
    sources: [
      {
        title: "What we know so far about 2026 ACA Marketplace enrollment and premiums",
        publisher: "KFF",
        url: "https://www.kff.org/affordable-care-act/what-we-know-so-far-about-2026-aca-marketplace-enrollment-premiums-and-deductibles/",
      },
      {
        title: "HHS Poverty Guidelines",
        publisher: "U.S. Department of Health and Human Services",
        url: "https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines",
      },
    ],
  },
  "social-security-break-even": {
    title: "Social Security Break-Even",
    description: "Compare claiming at 62, full retirement age, and 70 with clear caveats.",
    kind: "social-security",
    sources: [
      {
        title: "Starting Your Retirement Benefits Early",
        publisher: "Social Security Administration",
        url: "https://www.ssa.gov/benefits/retirement/planner/agereduction.html",
      },
    ],
  },
  "sequence-risk": {
    title: "Sequence-Risk Stress Test",
    description: "See why early retirement returns can matter more than the long-run average.",
    kind: "sequence",
    sources: [
      {
        title: "Retirement Savings: Choosing a Withdrawal Rate That Is Sustainable",
        publisher: "AAII Journal",
        url: "https://www.aaii.com/journal/article/retirement-savings-choosing-a-withdrawal-rate-that-is-sustainable",
      },
    ],
  },
  "inflation-spending": {
    title: "Inflation-Adjusted Spending Planner",
    description: "Translate today's spending into future retirement dollars.",
    kind: "inflation",
    sources: [
      {
        title: "Costs",
        publisher: "Medicare.gov",
        url: "https://www.medicare.gov/basics/costs/medicare-costs",
      },
    ],
  },
  "catch-up-contributions": {
    title: "Catch-Up Contribution Planner",
    description: "Estimate the extra room available to older retirement savers.",
    kind: "catchup",
    sources: [
      {
        title: "401(k) limit increases to $24,500 for 2026, IRA limit increases to $7,500",
        publisher: "Internal Revenue Service",
        url: "https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500",
      },
    ],
  },
} as const;

export type ToolSlug = keyof typeof toolPages;

export function isToolSlug(slug: string): slug is ToolSlug {
  return slug in toolPages;
}

