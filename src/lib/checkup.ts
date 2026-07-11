export type CheckupInput = {
  age: number;
  targetRetirementAge: number;
  retirementSavings: number;
  annualContribution: number;
  annualSpending: number;
  socialSecurityAnnual: number;
  pensionAnnual: number;
  debtPaymentsAnnual: number;
  retireBefore65: boolean;
  partTimePossible: boolean;
  spendingFlexibility: "low" | "medium" | "high";
};

export type PlainScores = {
  confidence: number;
  flexibility: number;
  sequenceRisk: number;
  healthcareGap: number;
  taxComplexity: number;
};

export type CheckupResult = {
  annualGap: number;
  yearsToRetirement: number;
  projectedSavingsLow: number;
  projectedSavingsHigh: number;
  targetPortfolioLow: number;
  targetPortfolioHigh: number;
  scores: PlainScores;
  summary: string;
  topRisks: string[];
  nextSteps: { label: string; href: string; reason: string }[];
};

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

export function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function futureValue(balance: number, contribution: number, years: number, returnRate: number) {
  let value = balance;
  for (let i = 0; i < years; i += 1) {
    value = value * (1 + returnRate) + contribution;
  }
  return Math.max(0, Math.round(value));
}

export function runRetirementCheckup(input: CheckupInput): CheckupResult {
  const yearsToRetirement = Math.max(0, input.targetRetirementAge - input.age);
  const guaranteedIncome = Math.max(0, input.socialSecurityAnnual + input.pensionAnnual);
  const annualGap = Math.max(0, input.annualSpending + input.debtPaymentsAnnual - guaranteedIncome);
  const projectedSavingsLow = futureValue(input.retirementSavings, input.annualContribution, yearsToRetirement, 0.03);
  const projectedSavingsHigh = futureValue(input.retirementSavings, input.annualContribution, yearsToRetirement, 0.06);
  const targetPortfolioLow = Math.round(annualGap / 0.045);
  const targetPortfolioHigh = Math.round(annualGap / 0.035);

  const midpointTarget = (targetPortfolioLow + targetPortfolioHigh) / 2 || 1;
  const midpointProjection = (projectedSavingsLow + projectedSavingsHigh) / 2;
  const coverage = midpointProjection / midpointTarget;
  const savingsRateSignal = input.annualContribution / Math.max(1, input.annualSpending);

  const confidence = clamp(coverage * 70 + savingsRateSignal * 80 - (input.debtPaymentsAnnual > 0 ? 8 : 0));
  const flexibility = clamp(
    (input.partTimePossible ? 30 : 0) +
      (input.spendingFlexibility === "high" ? 45 : input.spendingFlexibility === "medium" ? 28 : 10) +
      (yearsToRetirement > 8 ? 15 : yearsToRetirement > 3 ? 8 : 0),
  );
  const sequenceRisk = clamp(
    85 -
      guaranteedIncome / Math.max(1, input.annualSpending) * 35 -
      (input.spendingFlexibility === "high" ? 25 : input.spendingFlexibility === "medium" ? 12 : 0) -
      (input.partTimePossible ? 12 : 0),
  );
  const healthcareGap = clamp(input.retireBefore65 ? 72 - (input.partTimePossible ? 10 : 0) : 18);
  const taxComplexity = clamp(
    25 +
      (input.retirementSavings > 750000 ? 25 : input.retirementSavings > 300000 ? 12 : 0) +
      (input.socialSecurityAnnual > 0 ? 10 : 0) +
      (input.pensionAnnual > 0 ? 8 : 0),
  );

  const topRisks = [
    coverage < 0.8 ? "The projected savings range may not cover the spending gap." : "",
    sequenceRisk > 60 ? "Early retirement withdrawals may be sensitive to a bad first decade." : "",
    healthcareGap > 50 ? "Retiring before Medicare creates a health coverage bridge to plan." : "",
    input.debtPaymentsAnnual > 0 ? "Debt payments raise the annual income gap your portfolio must cover." : "",
  ].filter(Boolean);

  const nextSteps = [
    {
      label: "Estimate if you are on track",
      href: "/tools/am-i-on-track",
      reason: "Compare your projected savings range with a planning portfolio target.",
    },
    {
      label: "Compare retirement ages",
      href: "/tools/retirement-age-tradeoff",
      reason: "See how working longer changes saving years, withdrawal years, and healthcare risk.",
    },
    {
      label: "Stress-test withdrawals",
      href: "/tools/sequence-risk",
      reason: "Averages can hide the risk of poor returns early in retirement.",
    },
  ];

  const summary =
    coverage >= 1.1
      ? "Your rough checkup looks comparatively strong, but the assumptions still need stress-testing."
      : coverage >= 0.75
        ? "Your rough checkup is close enough to refine. The next move is to test timing, spending, and flexibility."
        : "Your rough checkup shows a meaningful gap. That is a planning signal, not a verdict.";

  return {
    annualGap,
    yearsToRetirement,
    projectedSavingsLow,
    projectedSavingsHigh,
    targetPortfolioLow,
    targetPortfolioHigh,
    scores: {
      confidence: Math.round(confidence),
      flexibility: Math.round(flexibility),
      sequenceRisk: Math.round(sequenceRisk),
      healthcareGap: Math.round(healthcareGap),
      taxComplexity: Math.round(taxComplexity),
    },
    summary,
    topRisks,
    nextSteps,
  };
}

