import { test } from "node:test";
import assert from "node:assert/strict";
import { compareCheckupScenarios, runRetirementCheckup } from "../src/lib/checkup.ts";
import { SWR, portfolioTarget } from "../src/lib/facts-2026.ts";

/** A 52-year-old with a $52k gap: 78,000 spending + 6,000 debt − 32,000 Social Security. */
const baseline = {
  age: 52,
  targetRetirementAge: 67,
  retirementSavings: 325_000,
  annualContribution: 24_000,
  annualSpending: 78_000,
  socialSecurityAnnual: 32_000,
  pensionAnnual: 0,
  debtPaymentsAnnual: 6_000,
  retireBefore65: false,
  partTimePossible: true,
  spendingFlexibility: "medium",
};

test("annual gap is spending + debt − guaranteed income", () => {
  assert.equal(runRetirementCheckup(baseline).annualGap, 52_000);
  // Guaranteed income covering everything leaves no gap (never negative).
  assert.equal(runRetirementCheckup({ ...baseline, socialSecurityAnnual: 200_000 }).annualGap, 0);
});

test("target portfolio range comes from the cited SWR anchors, never a hardcoded band", () => {
  const { annualGap, targetPortfolioLow, targetPortfolioHigh } = runRetirementCheckup(baseline);

  // Low target assumes Bengen's 4.7% (a higher rate needs a smaller pot);
  // high target assumes Morningstar's 3.9%. If someone reintroduces a made-up
  // 3.5%–4.5% band, these fail.
  assert.equal(targetPortfolioLow, Math.round(portfolioTarget(annualGap, SWR.bengenRevised)));
  assert.equal(targetPortfolioHigh, Math.round(portfolioTarget(annualGap, SWR.morningstar2026)));
  assert.ok(targetPortfolioLow < targetPortfolioHigh, "a higher withdrawal rate must need a smaller portfolio");

  // Sanity: $52k gap at 4.7% ≈ $1.11M; at 3.9% ≈ $1.33M.
  assert.equal(targetPortfolioLow, 1_106_383);
  assert.equal(targetPortfolioHigh, 1_333_333);
});

test("retiring before 65 raises the healthcare-gap score (ACA bridge exposure)", () => {
  const before = runRetirementCheckup({ ...baseline, retireBefore65: true }).scores.healthcareGap;
  const after = runRetirementCheckup({ ...baseline, retireBefore65: false }).scores.healthcareGap;
  assert.ok(before > after, "pre-Medicare retirement must score as more healthcare exposure");
  const derived = runRetirementCheckup({
    ...baseline,
    targetRetirementAge: 62,
    retireBefore65: false,
  }).scores.healthcareGap;
  assert.equal(derived, before, "a visible target age below 65 must not be contradicted by a stale flag");
});

test("the checkup recommends one next action based on the dominant constraint", () => {
  const underfunded = runRetirementCheckup({ ...baseline, retirementSavings: 10_000 });
  assert.equal(underfunded.recommendedStep.href, "/tools/am-i-on-track");
  assert.equal(underfunded.nextSteps.length, 1);

  const preMedicare = runRetirementCheckup({
    ...baseline,
    retirementSavings: 2_000_000,
    targetRetirementAge: 62,
    retireBefore65: true,
  });
  assert.equal(preMedicare.recommendedStep.href, "/tools/aca-bridge");
  assert.equal(preMedicare.supportingArticle.href, "/topics/retirement/health-care-before-medicare");
});

test("output never crosses the investment-advice line", () => {
  // Keeping the checkup free of securities/allocation advice is what keeps the site
  // outside the Investment Advisers Act. Guard it so nobody adds it casually.
  const result = runRetirementCheckup(baseline);
  const text = [
    result.summary,
    ...result.topRisks,
    ...result.nextSteps.flatMap((s) => [s.label, s.reason]),
    result.supportingArticle.label,
    result.supportingArticle.reason,
  ]
    .join(" ")
    .toLowerCase();

  for (const banned of ["allocation", "stocks", "bonds", "etf", "fund", "portfolio mix", "60/40", "invest in"]) {
    assert.ok(!text.includes(banned), `checkup output must not contain "${banned}"`);
  }
});

test("snapshot comparison reports current-minus-saved scenario deltas", () => {
  const current = {
    ...baseline,
    targetRetirementAge: 68,
    retirementSavings: 350_000,
    annualContribution: 30_000,
    annualSpending: 75_000,
    socialSecurityAnnual: 35_000,
  };
  const comparison = compareCheckupScenarios(current, baseline);

  assert.equal(comparison.targetRetirementAge, 1);
  assert.equal(comparison.retirementSavings, 25_000);
  assert.equal(comparison.annualContribution, 6_000);
  assert.equal(comparison.annualSpending, -3_000);
  assert.equal(comparison.incomeFloor, 3_000);
  assert.ok(Number.isFinite(comparison.projectedMidpoint));
  assert.ok(Number.isFinite(comparison.targetMidpoint));
});

test("rough estimates are carried into the result as disclosure metadata", () => {
  const result = runRetirementCheckup({
    ...baseline,
    estimatedFields: ["annualSpending", "socialSecurityAnnual"],
  });

  assert.deepEqual(result.estimatedFields, ["annualSpending", "socialSecurityAnnual"]);
  assert.equal(result.annualGap, 52_000, "marking provenance must not silently change the entered value");
});
