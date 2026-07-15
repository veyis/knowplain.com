// Explicit .ts extension so `node --test` can import this module directly (see test/checkup.test.mjs).
import { REAL_RETURN, SWR, futureValue, portfolioTarget } from "./facts-2026.ts";

export const CHECKUP_ESTIMATED_FIELDS = [
  "retirementSavings",
  "annualContribution",
  "annualSpending",
  "socialSecurityAnnual",
  "pensionAnnual",
  "debtPaymentsAnnual",
] as const;

export type CheckupEstimatedField = (typeof CHECKUP_ESTIMATED_FIELDS)[number];

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
  /** Values the user has explicitly identified as rough placeholders, not known facts. */
  estimatedFields?: CheckupEstimatedField[];
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
  recommendedStep: { label: string; href: string; reason: string };
  supportingArticle: { label: string; href: string; reason: string };
  nextSteps: { label: string; href: string; reason: string }[];
  estimatedFields: CheckupEstimatedField[];
};

export const CHECKUP_SUMMARIES = {
  strong: "Your rough checkup looks comparatively strong, but the assumptions still need stress-testing.",
  refine: "Your rough checkup is close enough to refine. The next move is to test timing, spending, and flexibility.",
  gap: "Your rough checkup shows a meaningful gap. That is a planning signal, not a verdict.",
} as const;

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

/**
 * Format dollars. Non-finite values render as "—", never as "$0".
 *
 * This used to coerce to 0, which turned the debt tool's most important answer into its
 * most dangerous one: a payment too small to cover the interest gives `Infinity` months
 * and `Infinity` interest — correctly — and the reader was shown "Interest if you add
 * nothing: $0". An unpayable debt looked free. If a figure has no finite dollar value,
 * say so and let the caller explain why.
 */
export function currency(value: number) {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function runRetirementCheckup(input: CheckupInput): CheckupResult {
  const estimatedFields = CHECKUP_ESTIMATED_FIELDS.filter((field) =>
    input.estimatedFields?.includes(field),
  );
  const yearsToRetirement = Math.max(0, input.targetRetirementAge - input.age);
  // Retirement age is the authoritative input. Keep the explicit flag as an OR for stored
  // legacy drafts and people already navigating a pre-65 bridge, but never let a stale flag
  // contradict a visible target age below Medicare eligibility.
  const retiresBefore65 = input.targetRetirementAge < 65 || input.retireBefore65;
  const guaranteedIncome = Math.max(0, input.socialSecurityAnnual + input.pensionAnnual);
  const annualGap = Math.max(0, input.annualSpending + input.debtPaymentsAnnual - guaranteedIncome);
  // Both sides of this comparison are in TODAY'S dollars. `annualGap` comes from the
  // user's current spending, so the target below is a today's-dollars target — which means
  // the projection has to grow at a REAL rate, not a nominal one. See REAL_RETURN.
  const projectedSavingsLow = Math.round(
    futureValue(
      input.retirementSavings,
      input.annualContribution,
      yearsToRetirement,
      REAL_RETURN.conservative,
    ),
  );
  const projectedSavingsHigh = Math.round(
    futureValue(
      input.retirementSavings,
      input.annualContribution,
      yearsToRetirement,
      REAL_RETURN.optimistic,
    ),
  );
  // Target range is bracketed by the two credible, cited withdrawal-rate anchors —
  // never an invented band. A higher rate needs a smaller portfolio, so Bengen's
  // 4.7% (historical worst case) sets the LOW target and Morningstar's 3.9%
  // (forward-looking, 90% success over 30 years) sets the HIGH one. The two answer
  // different questions and must never be averaged — see SWR in facts-2026.ts.
  const targetPortfolioLow = Math.round(portfolioTarget(annualGap, SWR.bengenRevised));
  const targetPortfolioHigh = Math.round(portfolioTarget(annualGap, SWR.morningstar2026));

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
  const healthcareGap = clamp(retiresBefore65 ? 72 - (input.partTimePossible ? 10 : 0) : 18);
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

  // Pick one action from the user's actual constraint. A generic list asks the reader to
  // diagnose their own result—the checkup's job is to do that triage plainly.
  const recommendation =
    coverage < 0.75
      ? {
          recommendedStep: {
            label: "Test the gap against your timeline",
            href: "/tools/am-i-on-track",
            reason: "Your projected midpoint is below the planning target, so first test the levers that can close that gap.",
          },
          supportingArticle: {
            label: "How much is enough to retire?",
            href: "/topics/retirement/how-much-is-enough",
            reason: "See what the target range includes, what it leaves out, and why it is not a single magic number.",
          },
        }
      : healthcareGap > 50
        ? {
            recommendedStep: {
              label: "Plan the bridge to Medicare",
              href: "/tools/aca-bridge",
              reason: "Your timing creates a pre-65 coverage gap, where income choices can materially change ACA costs.",
            },
            supportingArticle: {
              label: "Health care before Medicare",
              href: "/topics/retirement/health-care-before-medicare",
              reason: "Understand ACA MAGI, the subsidy cliff, COBRA, and the coverage choices to verify.",
            },
          }
        : sequenceRisk > 60
          ? {
              recommendedStep: {
                label: "Stress-test the first retirement decade",
                href: "/tools/sequence-risk",
                reason: "Your plan depends heavily on portfolio withdrawals, so the order of early returns deserves the next test.",
              },
              supportingArticle: {
                label: "Sequence-of-returns risk",
                href: "/topics/retirement/sequence-of-returns",
                reason: "See why the same average return can produce two very different retirement outcomes.",
              },
            }
          : {
              recommendedStep: {
                label: "Compare retirement ages",
                href: "/tools/retirement-age-tradeoff",
                reason: "Your rough range is close enough to refine, so compare what a few more or fewer working years change.",
              },
              supportingArticle: {
                label: "Retirement is not a date",
                href: "/topics/retirement/retirement-isnt-a-date",
                reason: "Frame the date as an output of spending, income, flexibility, and coverage.",
              },
            };

  const nextSteps = [recommendation.recommendedStep];

  const summary =
    coverage >= 1.1
      ? CHECKUP_SUMMARIES.strong
      : coverage >= 0.75
        ? CHECKUP_SUMMARIES.refine
        : CHECKUP_SUMMARIES.gap;

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
    ...recommendation,
    nextSteps,
    estimatedFields,
  };
}

export type CheckupComparison = {
  targetRetirementAge: number;
  retirementSavings: number;
  annualContribution: number;
  annualSpending: number;
  incomeFloor: number;
  projectedMidpoint: number;
  targetMidpoint: number;
};

/**
 * Compare two sets of planning assumptions and their modeled outputs.
 *
 * Every value is current minus saved. These are scenario deltas—not portfolio
 * performance—because the checkup does not ingest transactions or measured returns.
 */
export function compareCheckupScenarios(
  current: CheckupInput,
  saved: CheckupInput,
): CheckupComparison {
  const currentResult = runRetirementCheckup(current);
  const savedResult = runRetirementCheckup(saved);
  const midpoint = (low: number, high: number) => (low + high) / 2;

  return {
    targetRetirementAge: current.targetRetirementAge - saved.targetRetirementAge,
    retirementSavings: current.retirementSavings - saved.retirementSavings,
    annualContribution: current.annualContribution - saved.annualContribution,
    annualSpending: current.annualSpending - saved.annualSpending,
    incomeFloor:
      current.socialSecurityAnnual +
      current.pensionAnnual -
      (saved.socialSecurityAnnual + saved.pensionAnnual),
    projectedMidpoint:
      midpoint(currentResult.projectedSavingsLow, currentResult.projectedSavingsHigh) -
      midpoint(savedResult.projectedSavingsLow, savedResult.projectedSavingsHigh),
    targetMidpoint:
      midpoint(currentResult.targetPortfolioLow, currentResult.targetPortfolioHigh) -
      midpoint(savedResult.targetPortfolioLow, savedResult.targetPortfolioHigh),
  };
}
