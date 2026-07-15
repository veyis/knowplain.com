export const toolPages = {
  "income-bridge-60-64": {
    title: "Age 60–64 Income Bridge Planner",
    description: "Separate spendable cash from ACA MAGI while coordinating withdrawals, Roth conversions, Marketplace coverage, and the Medicare lookback.",
    kind: "income-bridge",
    sources: [
      {
        title: "Retiring before age 65? See your health insurance options",
        publisher: "HealthCare.gov",
        url: "https://www.healthcare.gov/retirees/",
      },
      {
        title: "Modified Adjusted Gross Income (MAGI)",
        publisher: "HealthCare.gov",
        url: "https://www.healthcare.gov/income-and-household-information/income/",
      },
      {
        title: "2026 Medicare Parts A & B Premiums and Deductibles",
        publisher: "Centers for Medicare & Medicaid Services",
        url: "https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles",
      },
    ],
  },
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
      {
        title: "What you could get from Survivor benefits",
        publisher: "Social Security Administration",
        url: "https://www.ssa.gov/survivor/amount",
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
    title: "Retirement Spending Planner",
    description:
      "Healthcare does not inflate like groceries. See what that does to your budget over a long retirement — and how much of your spending cushion it eats.",
    kind: "inflation",
    sources: [
      {
        title: "Medicare costs",
        publisher: "Medicare.gov",
        url: "https://www.medicare.gov/basics/costs/medicare-costs",
      },
      {
        title: "2025 Retiree Health Care Cost Estimate ($172,500 for a single 65-year-old)",
        publisher: "Fidelity Investments",
        url: "https://www.fidelity.com/viewpoints/personal-finance/plan-for-rising-health-care-costs",
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
  "rmd-planner": {
    title: "RMD Calculator: When the IRS Starts Choosing Your Income",
    description:
      "Your required minimum distributions start at 73 or 75 depending on your birth year — most calculators assume 73. See what yours will be, and how it grows.",
    kind: "rmd",
    sources: [
      {
        title: "Publication 590-B, Appendix B — Uniform Lifetime Table (Table III)",
        publisher: "Internal Revenue Service",
        url: "https://www.irs.gov/pub/irs-pdf/p590b.pdf",
      },
      {
        title: "Retirement plan and IRA required minimum distributions FAQs",
        publisher: "Internal Revenue Service",
        url: "https://www.irs.gov/retirement-plans/retirement-plan-and-ira-required-minimum-distributions-faqs",
      },
      {
        title: "2026 Medicare Parts A & B Premiums and Deductibles (IRMAA tiers)",
        publisher: "Centers for Medicare & Medicaid Services",
        url: "https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles",
      },
    ],
  },
} as const;

export type ToolSlug = keyof typeof toolPages;

export type HighRiskToolDisclosure = {
  uncertainty: string;
  omissions: readonly string[];
  verifyLabel: string;
  verifyHref: string;
};

/**
 * Route-level safety disclosures for calculators whose result can change with law,
 * household-specific tax facts, plan terms, or agency records. Keeping these outside
 * individual components makes their presence complete and mechanically reviewable.
 */
export const highRiskToolDisclosures = {
  "income-bridge-60-64": {
    uncertainty: "ACA law, Marketplace premiums, and the Medicare income lookback can change; this is a coordination illustration, not a tax return or coverage quote.",
    omissions: [
      "Federal and state income tax, including capital-gain brackets and Social Security taxation",
      "State Medicaid rules, county-specific Marketplace premiums, and household eligibility details",
      "Whether the withdrawal plan is sustainable across future years",
    ],
    verifyLabel: "Verify Marketplace income and household rules",
    verifyHref: "https://www.healthcare.gov/income-and-household-information/income/",
  },
  "aca-bridge": {
    uncertainty: "The 2026 subsidy rules are legally volatile, and the premium shown is a national benchmark rather than a quote for your county.",
    omissions: [
      "County, insurer, tobacco-use, and state-specific premium differences",
      "Medicaid eligibility and the different poverty guidelines for Alaska and Hawaii",
      "Tax effects and long-term account effects of changing MAGI",
    ],
    verifyLabel: "Get a current Marketplace estimate",
    verifyHref: "https://www.healthcare.gov/see-plans/",
  },
  "roth-vs-traditional": {
    uncertainty: "This models current federal rules and only the first Medicare surcharge tier; an individual conversion can affect several tax years and benefits.",
    omissions: [
      "State income tax, investment surtax, capital-gain stacking, and Social Security taxation",
      "Higher IRMAA tiers, appeals after life-changing events, and a spouse’s exact Medicare enrollment",
      "Future tax rates, account growth, heirs, and the opportunity cost of paying tax now",
    ],
    verifyLabel: "Review Roth conversion rules with the IRS",
    verifyHref: "https://www.irs.gov/retirement-plans/roth-comparison-chart",
  },
  "social-security-break-even": {
    uncertainty: "The comparison uses benefit estimates and simplified claiming rules; your official earnings record controls the real benefit.",
    omissions: [
      "Income tax, Medicare premiums, cost-of-living adjustments, and investment returns",
      "Early survivor claiming, spousal top-ups, disability, family maximums, and earnings tests",
      "Health, longevity, household cash needs, and the insurance value of delaying",
    ],
    verifyLabel: "Check your official Social Security estimate",
    verifyHref: "https://www.ssa.gov/myaccount/",
  },
  "catch-up-contributions": {
    uncertainty: "Eligibility depends on age, plan terms, employer wages, and rules that are indexed or newly effective for 2026.",
    omissions: [
      "Whether your employer plan permits every contribution type shown",
      "Payroll timing, employer contributions, nondiscrimination limits, and multiple-plan coordination",
      "Individual IRA deduction and Roth IRA income eligibility",
    ],
    verifyLabel: "Confirm the 2026 limits with the IRS",
    verifyHref: "https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500",
  },
  "rmd-planner": {
    uncertainty: "Projected balances and distributions depend on returns and beneficiary facts; this is not an official RMD calculation.",
    omissions: [
      "The Joint Life table when a sole-beneficiary spouse is more than 10 years younger",
      "Inherited-account rules, employer-plan exceptions, QCDs, and midyear balance changes",
      "Full federal and state tax effects, Social Security taxation, and higher IRMAA tiers",
    ],
    verifyLabel: "Verify your RMD method with IRS Publication 590-B",
    verifyHref: "https://www.irs.gov/pub/irs-pdf/p590b.pdf",
  },
} as const satisfies Partial<Record<ToolSlug, HighRiskToolDisclosure>>;

export function isToolSlug(slug: string): slug is ToolSlug {
  return slug in toolPages;
}

type ToolRecommendation = {
  slug: ToolSlug;
  reason: string;
};

/**
 * One deliberate next calculation for each tool. Keeping this as data makes the
 * recommendation complete, reviewable, and immune to popularity or paid placement.
 */
export const toolRecommendations: Record<ToolSlug, ToolRecommendation> = {
  "income-bridge-60-64": {
    slug: "roth-vs-traditional",
    reason: "Test whether the conversion in your bridge also crosses an ACA or Medicare threshold.",
  },
  "am-i-on-track": {
    slug: "sequence-risk",
    reason: "A midpoint projection cannot show what a bad first retirement decade does to withdrawals.",
  },
  "retirement-age-tradeoff": {
    slug: "aca-bridge",
    reason: "If any candidate retirement age is before 65, price the health-coverage bridge next.",
  },
  "aca-bridge": {
    slug: "income-bridge-60-64",
    reason: "Separate the cash you need to spend from the income that counts toward ACA MAGI.",
  },
  "roth-vs-traditional": {
    slug: "rmd-planner",
    reason: "See when required distributions begin before deciding how valuable an earlier conversion may be.",
  },
  "debt-vs-investing": {
    slug: "catch-up-contributions",
    reason: "Check the tax-advantaged contribution room that remains after your debt priority is funded.",
  },
  "social-security-break-even": {
    slug: "retirement-age-tradeoff",
    reason: "Separate the Social Security claiming date from the date you stop working.",
  },
  "sequence-risk": {
    slug: "inflation-spending",
    reason: "Stress-test the spending path that those withdrawals are meant to support.",
  },
  "inflation-spending": {
    slug: "am-i-on-track",
    reason: "Put the resulting spending estimate back into the broader retirement target.",
  },
  "catch-up-contributions": {
    slug: "am-i-on-track",
    reason: "See how the contribution amount changes your projected range rather than viewing the limit alone.",
  },
  "rmd-planner": {
    slug: "roth-vs-traditional",
    reason: "Test the current tax and healthcare cost of reducing a future pretax balance through conversion.",
  },
};

export function nextToolFor(slug: ToolSlug) {
  const recommendation = toolRecommendations[slug];
  return {
    ...recommendation,
    title: toolPages[recommendation.slug].title,
    href: `/tools/${recommendation.slug}` as const,
  };
}

export type ToolEvidenceLink = {
  label: string;
  href: `/sources#${string}` | `/methodology#${string}`;
};

/** Exact public records supporting the major figures or modeling convention in each result. */
export const toolEvidence: Record<ToolSlug, readonly ToolEvidenceLink[]> = {
  "income-bridge-60-64": [
    { label: "2026 ACA cliff", href: "/sources#aca-cliff" },
    { label: "2026 Medicare and IRMAA thresholds", href: "/sources#medicare" },
    { label: "Modeled exclusions", href: "/methodology#excluded-factors" },
  ],
  "am-i-on-track": [
    { label: "Withdrawal-rate endpoints", href: "/sources#withdrawal-rates" },
    { label: "Today’s-dollar units", href: "/methodology#units-and-time-value" },
    { label: "Projection timing", href: "/methodology#projection-timing" },
  ],
  "retirement-age-tradeoff": [
    { label: "Projection timing", href: "/methodology#projection-timing" },
    { label: "Pre-65 coverage threshold", href: "/sources#aca-cliff" },
  ],
  "aca-bridge": [
    { label: "2026 subsidy cliff", href: "/sources#aca-cliff" },
    { label: "Premium-credit calculation", href: "/sources#aca-premium-credits" },
    { label: "Federal age-rating curve", href: "/sources#aca-age-rating" },
  ],
  "roth-vs-traditional": [
    { label: "2026 federal tax figures", href: "/sources#federal-income-tax" },
    { label: "2026 ACA cliff", href: "/sources#aca-cliff" },
    { label: "2026 Medicare and IRMAA thresholds", href: "/sources#medicare" },
  ],
  "debt-vs-investing": [
    { label: "2026 contribution limits", href: "/sources#contribution-limits" },
    { label: "Sensitivity and uncertainty", href: "/methodology#sensitivity-and-uncertainty" },
  ],
  "social-security-break-even": [
    { label: "2026 Social Security figures", href: "/sources#social-security" },
    { label: "Individual factors excluded", href: "/methodology#excluded-factors" },
  ],
  "sequence-risk": [
    { label: "Withdrawal-rate evidence", href: "/sources#withdrawal-rates" },
    { label: "Withdrawal-before-return convention", href: "/methodology#projection-timing" },
  ],
  "inflation-spending": [
    { label: "2026 Medicare costs", href: "/sources#medicare" },
    { label: "Dollar units and timing", href: "/methodology#units-and-time-value" },
  ],
  "catch-up-contributions": [
    { label: "2026 contribution and catch-up limits", href: "/sources#contribution-limits" },
  ],
  "rmd-planner": [
    { label: "RMD starting ages", href: "/sources#rmd-start-age" },
    { label: "Uniform Lifetime Table calculation", href: "/sources#rmd-calculation" },
    { label: "IRMAA thresholds", href: "/sources#medicare" },
  ],
};
