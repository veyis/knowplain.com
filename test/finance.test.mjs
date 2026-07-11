import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ssBenefitFactor,
  ssBreakEvenAge,
  catchUpContribution2026,
  catchUpPlan2026,
  seniorDeduction2026,
  maxEmployeeDeferral2026,
  rmdStartAge,
  portfolioTarget,
  futureValue,
  federalPovertyLevel,
  fplPercent,
  acaLostEnhancedCreditReference,
  acaRestoredEnhancedBenchmarkCost,
  acaSubsidyCliffMagi,
  acaSubsidyStatus,
} from "../src/lib/facts-2026.ts";

const near = (a, b, eps = 0.01) =>
  assert.ok(Math.abs(a - b) < eps, `expected ${a} ≈ ${b} (±${eps})`);

test("Social Security benefit factor matches SSA rules", () => {
  // FRA 67: claim at 62 = 70% of PIA, 70 = 124%, FRA = 100%
  near(ssBenefitFactor(67, 62), 0.7);
  assert.equal(ssBenefitFactor(67, 67), 1);
  near(ssBenefitFactor(67, 70), 1.24);
  // FRA 66: claim at 62 = 75%, 70 = 132% (the case the old tool got wrong)
  near(ssBenefitFactor(66, 62), 0.75);
  near(ssBenefitFactor(66, 70), 1.32);
  // clamped to [62, 70]
  assert.equal(ssBenefitFactor(67, 61), ssBenefitFactor(67, 62));
  assert.equal(ssBenefitFactor(67, 72), ssBenefitFactor(67, 70));
});

test("Social Security break-even ages match published rules of thumb", () => {
  near(ssBreakEvenAge(2500, 67, 62, 67), 78.67, 0.1); // ~late 70s
  near(ssBreakEvenAge(2500, 67, 67, 70), 82.5, 0.1); // ~early 80s
  assert.equal(ssBreakEvenAge(2500, 67, 70, 70), Infinity); // no difference
});

test("2026 catch-up contributions (SECURE 2.0 super catch-up 60–63)", () => {
  assert.equal(catchUpContribution2026(45), 0);
  assert.equal(catchUpContribution2026(50), 8_000);
  assert.equal(catchUpContribution2026(59), 8_000);
  assert.equal(catchUpContribution2026(60), 11_250); // super catch-up begins
  assert.equal(catchUpContribution2026(63), 11_250);
  assert.equal(catchUpContribution2026(64), 8_000); // super catch-up ends at 64
});

test("2026 max employee 401(k) deferral by age", () => {
  assert.equal(maxEmployeeDeferral2026(40), 24_500);
  assert.equal(maxEmployeeDeferral2026(50), 32_500);
  assert.equal(maxEmployeeDeferral2026(61), 35_750);
});

test("RMD start age (SECURE 2.0)", () => {
  assert.equal(rmdStartAge(1955), 73);
  assert.equal(rmdStartAge(1959), 73);
  assert.equal(rmdStartAge(1960), 75);
});

test("portfolio target from the 4% rule", () => {
  assert.equal(portfolioTarget(40_000, 0.04), 1_000_000);
  assert.equal(portfolioTarget(40_000, 0), Infinity);
});

test("future value (year-end contributions, annual compounding)", () => {
  assert.equal(futureValue(0, 1_000, 10, 0), 10_000);
  near(futureValue(100, 0, 1, 0.06), 106);
  assert.equal(futureValue(1_000, 0, 0, 0.06), 1_000); // no years
});

test("ACA Federal Poverty Level (2025 guidelines, 48 states)", () => {
  assert.equal(federalPovertyLevel(1), 15_650);
  assert.equal(federalPovertyLevel(2), 21_150);
  assert.equal(federalPovertyLevel(4), 32_150);
  near(fplPercent(31_300, 1), 200); // exactly 2× FPL
});

test("ACA 2026 subsidy cliff (400% FPL) — enhanced subsidies expired", () => {
  assert.equal(acaSubsidyCliffMagi(1), 62_600); // 4 × 15,650
  assert.equal(acaSubsidyCliffMagi(2), 84_600); // 4 × 21,150
  assert.equal(acaLostEnhancedCreditReference(), 10_389); // $15,914 benchmark − 8.5% × $65,000

  const under = acaSubsidyStatus(60_000, 1); // ~383% FPL
  assert.equal(under.overCliff, false);
  assert.equal(under.belowFloor, false);
  assert.equal(under.headroomToCliff, 2_600); // $2,600 of MAGI room left
  assert.equal(under.restoredEnhancedBenchmarkSavings, 0);

  const over = acaSubsidyStatus(70_000, 1); // ~447% FPL ⇒ $0 credit
  assert.equal(over.overCliff, true);
  assert.equal(over.headroomToCliff, -7_400);
  assert.equal(over.currentLawBenchmarkCost, 15_914);
  assert.equal(over.restoredEnhancedBenchmarkCost, 5_950); // 8.5% of $70k
  assert.equal(over.restoredEnhancedBenchmarkSavings, 9_964);

  const low = acaSubsidyStatus(10_000, 1); // ~64% FPL
  assert.equal(low.belowFloor, true);

  assert.equal(acaRestoredEnhancedBenchmarkCost(65_000), 5_525);
});

test("catch-up planner: age tiers, including the age-64 drop back to standard", () => {
  assert.equal(catchUpPlan2026(45, 0, 0).tier, "none");
  assert.equal(catchUpPlan2026(45, 0, 0).catchUp, 0);
  assert.equal(catchUpPlan2026(45, 0, 0).eligible, false);

  assert.equal(catchUpPlan2026(52, 0, 0).tier, "standard");
  assert.equal(catchUpPlan2026(52, 0, 0).catchUp, 8_000);
  assert.equal(catchUpPlan2026(52, 0, 0).maxDeferral, 32_500); // 24,500 + 8,000

  // SECURE 2.0 super catch-up applies to ages 60-63 ONLY.
  assert.equal(catchUpPlan2026(60, 0, 0).tier, "super");
  assert.equal(catchUpPlan2026(63, 0, 0).catchUp, 11_250);
  assert.equal(catchUpPlan2026(63, 0, 0).maxDeferral, 35_750); // 24,500 + 11,250

  // At 64 it drops BACK to the standard catch-up. Easy to get wrong; easy to lose money on.
  assert.equal(catchUpPlan2026(64, 0, 0).tier, "standard");
  assert.equal(catchUpPlan2026(64, 0, 0).catchUp, 8_000);
});

test("catch-up planner: the SECURE 2.0 mandatory-Roth rule bites above $150,000", () => {
  // Threshold is PRIOR-YEAR (2025) FICA wages from the plan sponsor, and it is
  // $150,000 for 2026 — not the widely-quoted $145,000 statutory base.
  assert.equal(catchUpPlan2026(55, 150_000, 0).catchUpMustBeRoth, false); // at the line, not over
  assert.equal(catchUpPlan2026(55, 150_001, 0).catchUpMustBeRoth, true);
  assert.equal(catchUpPlan2026(62, 300_000, 0).catchUpMustBeRoth, true);

  // Under 50 there is no catch-up at all, so the mandate cannot apply.
  assert.equal(catchUpPlan2026(40, 500_000, 0).catchUpMustBeRoth, false);

  // No FICA wages from the plan sponsor (e.g. self-employed partner) ⇒ not subject.
  assert.equal(catchUpPlan2026(62, 0, 0).catchUpMustBeRoth, false);
});

test("catch-up planner: remaining room and IRA totals", () => {
  const plan = catchUpPlan2026(61, 90_000, 20_000);
  assert.equal(plan.remainingRoom, 15_750); // 35,750 − 20,000
  assert.equal(plan.atLimit, false);

  const maxed = catchUpPlan2026(61, 90_000, 35_750);
  assert.equal(maxed.remainingRoom, 0);
  assert.equal(maxed.atLimit, true);

  // Over-contributing must not produce negative headroom.
  assert.equal(catchUpPlan2026(61, 0, 99_000).remainingRoom, 0);

  // IRA: $7,500 + $1,100 catch-up at 50+ (the catch-up is indexed for the first time in 2026).
  assert.equal(plan.iraCatchUp, 1_100);
  assert.equal(plan.iraTotal, 8_600);
  assert.equal(catchUpPlan2026(45, 0, 0).iraTotal, 7_500);
  assert.equal(plan.totalTaxAdvantaged, 44_350); // 35,750 + 8,600
});

test("OBBBA senior deduction: phase-out at 6% of MAGI over the threshold", () => {
  // Under the threshold: full $6,000 each. MFJ with both 65+ gets $12,000.
  assert.equal(seniorDeduction2026(60_000, "single", 1), 6_000);
  assert.equal(seniorDeduction2026(120_000, "mfj", 2), 12_000);
  assert.equal(seniorDeduction2026(120_000, "mfj", 1), 6_000); // only one spouse is 65+

  // Not 65 yet ⇒ nothing.
  assert.equal(seniorDeduction2026(50_000, "single", 0), 0);

  // Phase-out: 6% of MAGI above $75k (single) / $150k (MFJ), applied PER PERSON.
  assert.equal(seniorDeduction2026(100_000, "single", 1), 4_500); // 6,000 − 6% × 25,000
  // MFJ at $200k: 6% × 50,000 = 3,000 off EACH spouse's 6,000 ⇒ 3,000 × 2 = 6,000.
  // Reducing the combined 12,000 by a single 3,000 (giving 9,000) overstates it.
  assert.equal(seniorDeduction2026(200_000, "mfj", 2), 6_000);

  // Fully phased out, and never negative. The per-person rule is why a couple hits
  // zero at $250k, not $350k.
  assert.equal(seniorDeduction2026(175_000, "single", 1), 0); // 6,000 − 6% × 100,000 = 0
  assert.equal(seniorDeduction2026(400_000, "single", 1), 0);
  assert.equal(seniorDeduction2026(250_000, "mfj", 2), 0); // each 6,000 − 6% × 100,000 = 0
});
