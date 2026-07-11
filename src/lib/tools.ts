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
  "roth-vs-traditional": {
    title: "Roth Conversion Cost Checker",
    description:
      "Before 65, the tax bill is often the smaller cost. See whether a conversion pushes you over the ACA subsidy cliff or into a Medicare surcharge.",
    kind: "roth-conversion",
    sources: [
      {
        title: "Roth Comparison Chart",
        publisher: "Internal Revenue Service",
        url: "https://www.irs.gov/retirement-plans/roth-comparison-chart",
      },
      {
        title: "Rev. Proc. 2025-32 (2026 brackets and standard deduction)",
        publisher: "Internal Revenue Service",
        url: "https://www.irs.gov/pub/irs-drop/rp-25-32.pdf",
      },
      {
        title: "2026 Medicare Parts A & B Premiums and Deductibles (IRMAA)",
        publisher: "Centers for Medicare & Medicaid Services",
        url: "https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles",
      },
      {
        title: "How will the loss of enhanced premium tax credits affect older adults?",
        publisher: "KFF",
        url: "https://www.kff.org/affordable-care-act/how-will-the-loss-of-enhanced-premium-tax-credits-affect-older-adults/",
      },
    ],
  },
  "debt-vs-investing": {
    title: "Debt Payoff vs Investing",
    description:
      "One of these returns is guaranteed and the other is a forecast. See which of your dollars should go where — and what beats both.",
    kind: "debt-vs-investing",
    sources: [
      {
        title: "2026 Retirement Confidence Survey",
        publisher: "EBRI / Greenwald Research",
        url: "https://www.ebri.org/retirement/retirement-confidence-survey",
      },
      {
        title: "401(k) limit increases to $24,500 for 2026, IRA limit increases to $7,500",
        publisher: "Internal Revenue Service",
        url: "https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500",
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
    description:
      "Two retirees, identical returns, identical average — one just meets the bad decade first. Watch what that alone does.",
    kind: "sequence",
    sources: [
      {
        title: "Retirement Savings: Choosing a Withdrawal Rate That Is Sustainable",
        publisher: "AAII Journal",
        url: "https://www.aaii.com/journal/article/retirement-savings-choosing-a-withdrawal-rate-that-is-sustainable",
      },
      {
        title: "The Dynamic Implications of Sequence Risk on a Distribution Portfolio",
        publisher: "Frank & Blanchett, Journal of Financial Planning (June 2010)",
        url: "https://www.financialplanningassociation.org/sites/default/files/2021-10/JUN10%20JFP%20Frank%20and%20Blanchett%20PDF.pdf",
      },
      {
        title: "What's a Safe Retirement Withdrawal Rate in 2026?",
        publisher: "Morningstar, State of Retirement Income (2025 edition)",
        url: "https://www.morningstar.com/retirement/whats-safe-retirement-withdrawal-rate-2026",
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
    description:
      "See how much extra you can save at 50+, whether you qualify for the 60-63 super catch-up, and whether the law now forces your catch-up to be Roth.",
    kind: "catchup",
    sources: [
      {
        title: "401(k) limit increases to $24,500 for 2026, IRA limit increases to $7,500",
        publisher: "Internal Revenue Service",
        url: "https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500",
      },
      {
        title: "Notice 2025-67: 2026 cost-of-living adjustments (Roth catch-up wage threshold)",
        publisher: "Internal Revenue Service",
        url: "https://www.irs.gov/pub/irs-drop/n-25-67.pdf",
      },
      {
        title: "Final regulations: catch-up contributions (T.D. 10033)",
        publisher: "Federal Register",
        url: "https://www.federalregister.gov/documents/2025/09/16/2025-17865/catch-up-contributions",
      },
    ],
  },
} as const;

export type ToolSlug = keyof typeof toolPages;

export function isToolSlug(slug: string): slug is ToolSlug {
  return slug in toolPages;
}

