import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ssBenefitFactor,
  ssBreakEvenAge,
  catchUpContribution2026,
  maxEmployeeDeferral2026,
  rmdStartAge,
  portfolioTarget,
  futureValue,
  federalPovertyLevel,
  fplPercent,
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

  const under = acaSubsidyStatus(60_000, 1); // ~383% FPL
  assert.equal(under.overCliff, false);
  assert.equal(under.belowFloor, false);
  assert.equal(under.headroomToCliff, 2_600); // $2,600 of MAGI room left

  const over = acaSubsidyStatus(70_000, 1); // ~447% FPL ⇒ $0 credit
  assert.equal(over.overCliff, true);
  assert.equal(over.headroomToCliff, -7_400);

  const low = acaSubsidyStatus(10_000, 1); // ~64% FPL
  assert.equal(low.belowFloor, true);
});
