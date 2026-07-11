import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CHARITABLE_2026,
  CONTRIBUTION_2026,
  INHERITED_IRA_RMD,
  SAVERS_MATCH_2027,
  SOCIAL_SECURITY_2026,
  ssBenefitFactor,
  ssBreakEvenAge,
  catchUpContribution2026,
  catchUpPlan2026,
  inheritedIraAnnualRmdRequired,
  seniorDeduction2026,
  sequenceRiskComparison,
  federalIncomeTax,
  taxableIncome2026,
  rothConversionCost,
  debtVsInvesting,
  projectRetirementSpending,
  monthsToPayoff,
  totalInterestPaid,
  irmaaTier1AnnualSurcharge,
  withdrawalPath,
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
  SWR,
  REAL_RETURN,
} from "../src/lib/facts-2026.ts";
import { currency } from "../src/lib/checkup.ts";

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

test("2026 retirement contribution constants include SIMPLE, 415(c), QCD, and Roth IRA phaseouts", () => {
  assert.equal(CONTRIBUTION_2026.simpleIraDeferral, 17_000);
  assert.equal(CONTRIBUTION_2026.simpleIraHigherDeferral, 18_100);
  assert.equal(CONTRIBUTION_2026.simpleIraCatchUp50, 4_000);
  assert.equal(CONTRIBUTION_2026.simpleIraSuperCatchUp60to63, 5_250);
  assert.equal(CONTRIBUTION_2026.total415c, 72_000);
  assert.equal(CONTRIBUTION_2026.qcdLimit, 111_000);
  assert.deepEqual(CONTRIBUTION_2026.rothIraPhaseOutSingle, [153_000, 168_000]);
  assert.deepEqual(CONTRIBUTION_2026.rothIraPhaseOutJoint, [242_000, 252_000]);
});

test("2026 max employee 401(k) deferral by age", () => {
  assert.equal(maxEmployeeDeferral2026(40), 24_500);
  assert.equal(maxEmployeeDeferral2026(50), 32_500);
  assert.equal(maxEmployeeDeferral2026(61), 35_750);
});

test("2026 charitable deduction and 2027 Saver's Match constants", () => {
  assert.equal(CHARITABLE_2026.nonItemizerCashDeduction.single, 1_000);
  assert.equal(CHARITABLE_2026.nonItemizerCashDeduction.mfj, 2_000);
  assert.equal(CHARITABLE_2026.itemizerAgiFloor, 0.005);
  assert.equal(SAVERS_MATCH_2027.matchRate, 0.5);
  assert.equal(SAVERS_MATCH_2027.maxMatchedContribution, 2_000);
  assert.equal(SAVERS_MATCH_2027.maxMatch, 1_000);
  assert.deepEqual(SAVERS_MATCH_2027.phaseOutMfj, [41_000, 71_000]);
});

test("2026 Social Security constants include average benefit and WEP/GPO repeal flags", () => {
  assert.equal(SOCIAL_SECURITY_2026.averageRetiredWorkerMonthly, 2_071);
  assert.equal(SOCIAL_SECURITY_2026.maxBenefitAtFraMonthly, 4_152);
  assert.equal(SOCIAL_SECURITY_2026.socialSecurityFairnessAct.wepRepealed, true);
  assert.equal(SOCIAL_SECURITY_2026.socialSecurityFairnessAct.gpoRepealed, true);
});

test("RMD start age (SECURE 2.0)", () => {
  assert.equal(rmdStartAge(1955), 73);
  assert.equal(rmdStartAge(1959), 73);
  assert.equal(rmdStartAge(1960), 75);
});

test("inherited IRA annual RMD enforcement after final regs", () => {
  assert.equal(INHERITED_IRA_RMD.emptyByYear, 10);
  assert.deepEqual(INHERITED_IRA_RMD.annualRmdYears, [1, 9]);
  assert.equal(INHERITED_IRA_RMD.missedRmdPenalty, 0.25);
  assert.equal(INHERITED_IRA_RMD.timelyCorrectedPenalty, 0.1);
  assert.equal(inheritedIraAnnualRmdRequired(true), true);
  assert.equal(inheritedIraAnnualRmdRequired(false), false);
  assert.equal(inheritedIraAnnualRmdRequired(true, true), false);
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

test("withdrawal path: withdrawal comes out before the market acts", () => {
  // 100k, withdraw 10k, then +10% on the remaining 90k ⇒ 99k.
  const p = withdrawalPath(100_000, 10_000, [0.1], 0);
  assert.equal(p.endingBalance, 99_000);
  assert.equal(p.depletedInYear, null);

  // Running out is detected, reported 1-indexed, and never goes negative.
  const broke = withdrawalPath(10_000, 6_000, [0, 0, 0], 0);
  assert.equal(broke.depletedInYear, 2);
  assert.equal(broke.endingBalance, 0);
  assert.deepEqual(broke.balances, [4_000, 0, 0]);
});

test("sequence risk: order is irrelevant WITHOUT withdrawals, decisive WITH them", () => {
  const opts = {
    balance: 1_000_000,
    badReturn: -0.03,
    goodReturn: 0.08,
    inflation: 0.03,
    years: 30,
    badYears: 10,
  };

  // The two retirees earn the SAME returns, so the same average. If this ever differs,
  // the comparison is rigged and proves nothing.
  const withdrawing = sequenceRiskComparison({ ...opts, withdrawalRate: 0.04 });
  assert.ok(Math.abs(withdrawing.averageReturn - (10 * -0.03 + 20 * 0.08) / 30) < 1e-12);

  // Compounding is commutative: with NOTHING withdrawn, order cannot matter.
  const untouched = sequenceRiskComparison({ ...opts, withdrawalRate: 0 });
  assert.equal(untouched.badFirst.endingBalance, untouched.goodFirst.endingBalance);
  assert.equal(untouched.shortfall, 0);

  // Start withdrawing and the identical returns produce very different outcomes.
  // Meeting the bad decade first is what does the damage.
  assert.ok(
    withdrawing.badFirst.endingBalance < withdrawing.goodFirst.endingBalance,
    "the unlucky retiree must end up behind on identical returns",
  );
  assert.ok(withdrawing.shortfall > 0);
});

test("2026 federal income tax follows the bracket table", () => {
  assert.equal(federalIncomeTax(0, "single"), 0);
  // Single, entirely in the 10% bracket.
  assert.equal(federalIncomeTax(10_000, "single"), 1_000);
  // Single, top of the 10% bracket exactly: 12,400 × 10%.
  assert.equal(federalIncomeTax(12_400, "single"), 1_240);
  // Single, into the 12%: 1,240 + (50,400 − 12,400) × 12% = 1,240 + 4,560.
  assert.equal(federalIncomeTax(50_400, "single"), 5_800);
  // MFJ brackets are (here) exactly double the single ones at the low end.
  assert.equal(federalIncomeTax(24_800, "mfj"), 2_480);
});

test("taxable income nets out the standard and OBBBA senior deductions", () => {
  // Under 65: just the standard deduction.
  assert.equal(taxableIncome2026(60_000, "single", 0), 60_000 - 16_100);
  // 65+: the $6,000 senior deduction stacks on top.
  assert.equal(taxableIncome2026(60_000, "single", 1), 60_000 - 16_100 - 6_000);
  // Deductions cannot drive taxable income negative.
  assert.equal(taxableIncome2026(5_000, "single", 1), 0);
});

test("Roth conversion: the tax bill is not the whole cost before 65", () => {
  // A 61-year-old, single, $55k income, converting $15k. Comfortably under the
  // cliff before ($62,600); $70k after. The tax looks modest — the cliff does not.
  const c = rothConversionCost({
    grossIncome: 55_000,
    conversionAmount: 15_000,
    filing: "single",
    age: 61,
    people65Plus: 0,
    householdSize: 1,
  });
  assert.ok(c.federalTax > 0);
  assert.ok(c.effectiveRate > 0.1 && c.effectiveRate < 0.3, "should land in the 12-22% range");
  assert.equal(c.acaHeadroomBefore, 7_600); // 62,600 − 55,000
  assert.equal(c.pushesOverAcaCliff, true, "converting 15k blows through 7.6k of headroom");
  assert.equal(c.crossesIrmaa, false); // nowhere near $109k

  // Convert only within the headroom and the cliff is not triggered.
  const safe = rothConversionCost({
    grossIncome: 55_000,
    conversionAmount: 7_000,
    filing: "single",
    age: 61,
    people65Plus: 0,
    householdSize: 1,
  });
  assert.equal(safe.pushesOverAcaCliff, false);

  // At 66 you are on Medicare: the ACA cliff is irrelevant, whatever the income.
  const onMedicare = rothConversionCost({
    grossIncome: 55_000,
    conversionAmount: 15_000,
    filing: "single",
    age: 66,
    people65Plus: 1,
    householdSize: 1,
  });
  assert.equal(onMedicare.pushesOverAcaCliff, false);
});

test("Roth conversion: IRMAA bites from 63 (two-year lookback), not at 65", () => {
  const base = {
    grossIncome: 100_000,
    conversionAmount: 20_000, // → $120k MAGI, over the $109k single tier
    filing: "single",
    people65Plus: 0,
    householdSize: 1,
  };

  // At 61 the conversion is too early to land on a Medicare premium.
  assert.equal(rothConversionCost({ ...base, age: 61 }).crossesIrmaa, false);

  // At 63 it shows up on the Part B premium at 65.
  const at63 = rothConversionCost({ ...base, age: 63 });
  assert.equal(at63.crossesIrmaa, true);
  assert.equal(at63.irmaaAnnualCostPerPerson, irmaaTier1AnnualSurcharge());
  // (284.10 − 202.90 Part B) + 14.50 Part D = 95.70/mo ⇒ $1,148/yr.
  assert.equal(irmaaTier1AnnualSurcharge(), 1_148);

  // Reported PER PERSON on Medicare. It used to be doubled for any MFJ filer, which
  // overstated the cost by 2x whenever the spouse was under 65 and not yet enrolled.
  const couple = rothConversionCost({
    grossIncome: 210_000,
    conversionAmount: 20_000, // → $230k, over the $218k joint tier
    filing: "mfj",
    age: 64,
    people65Plus: 0,
    householdSize: 2,
  });
  assert.equal(couple.crossesIrmaa, true);
  assert.equal(couple.irmaaAnnualCostPerPerson, irmaaTier1AnnualSurcharge());
});

test("Roth conversion: someone ALREADY over the cliff is not told they are under it", () => {
  // The regression that shipped: both flags were transition checks (!before && after), so
  // a user already over the cliff got `pushesOverAcaCliff: false` — indistinguishable from
  // someone safely under — and the UI rendered "this conversion keeps you under the ACA
  // cliff". They were $17k over it.
  const alreadyOver = rothConversionCost({
    grossIncome: 80_000, // 400% FPL for a household of 1 is $62,600
    conversionAmount: 10_000,
    filing: "single",
    age: 61,
    people65Plus: 0,
    householdSize: 1,
  });
  assert.equal(alreadyOver.overAcaCliffAfter, true, "must report where they LAND");
  assert.equal(alreadyOver.pushesOverAcaCliff, false, "this conversion is not what did it");

  // Same shape for IRMAA: $150k single is already past the $109k tier-1 threshold.
  const alreadyOverIrmaa = rothConversionCost({
    grossIncome: 150_000,
    conversionAmount: 50_000, // → $200k, deep into tier 3
    filing: "single",
    age: 63,
    people65Plus: 0,
    householdSize: 1,
  });
  assert.equal(alreadyOverIrmaa.overIrmaaTier1After, true);
  assert.equal(alreadyOverIrmaa.crossesIrmaa, false);
  // No tier-1 cost is *caused* by the conversion — they were already paying it.
  assert.equal(alreadyOverIrmaa.irmaaAnnualCostPerPerson, 0);

  // And the genuinely-clear case still reads clear.
  const clear = rothConversionCost({
    grossIncome: 40_000,
    conversionAmount: 10_000, // → $50k, under the $62,600 cliff
    filing: "single",
    age: 61,
    people65Plus: 0,
    householdSize: 1,
  });
  assert.equal(clear.overAcaCliffAfter, false);
  assert.equal(clear.overIrmaaTier1After, false);
});

test("Social Security: a garbage FRA cannot produce a garbage benefit", () => {
  // The break-even tool's FRA field was an unbounded <input type="number">. Clearing it
  // gives Number("") === 0, and an unclamped fra=0 returned a factor of 5.96 — a 596%
  // benefit — plus a break-even age of Infinity rendered as the string "Infinity".
  assert.equal(ssBenefitFactor(0, 62), ssBenefitFactor(65, 62), "fra=0 clamps to the 65 floor");
  assert.equal(ssBenefitFactor(99, 70), ssBenefitFactor(67, 70), "fra=99 clamps to the 67 ceiling");
  assert.ok(ssBenefitFactor(0, 62) < 1, "claiming early can never exceed the full benefit");

  // The real table still holds after clamping.
  assert.ok(Math.abs(ssBenefitFactor(67, 62) - 0.7) < 1e-9);
  assert.ok(Math.abs(ssBenefitFactor(67, 70) - 1.24) < 1e-9);
});

test("debt: a payment that never clears the balance reports Infinity, not zero", () => {
  // $10k at 24% accrues $200/mo in interest. A $150 payment never touches the principal.
  // `monthsToPayoff` got this right; `currency()` then coerced Infinity to "$0" and the
  // reader was shown "Interest if you add nothing: $0" on an unpayable debt.
  const r = debtVsInvesting({
    debtBalance: 10_000,
    debtApr: 0.24,
    monthlyPayment: 150,
    extraMonthly: 200,
    expectedReturn: 0.07,
    salary: 80_000,
    employerMatchRate: 0,
    employerMatchLimit: 0,
    currentContributionRate: 0,
  });
  assert.equal(r.interestIfMinimum, Infinity, "minimum alone never clears it");
  assert.ok(Number.isFinite(r.interestIfExtra), "with the extra, it does clear");
  assert.ok(Number.isFinite(r.monthsToPayoff));
  assert.equal(currency(r.interestIfMinimum), "—", "must never render as $0");

  // With no employer match on offer, the verdict must not be "take the free money".
  assert.equal(r.matchLeftOnTable, 0);
  assert.equal(r.verdict, "debt", "24% guaranteed beats 7% hoped for");
});

test("sequence risk: when BOTH orders run dry, the tool must not say order is irrelevant", () => {
  // Both deplete ⇒ both end at $0 ⇒ shortfall === 0, which the UI read as "no difference".
  // The difference is real and it is measured in YEARS of solvency, not ending balance.
  const r = sequenceRiskComparison({
    balance: 1_000_000,
    withdrawalRate: 0.1,
    badReturn: -0.03,
    goodReturn: 0.08,
    inflation: 0.03,
  });
  assert.equal(r.badFirst.endingBalance, 0);
  assert.equal(r.goodFirst.endingBalance, 0);
  assert.equal(r.shortfall, 0, "identical (zero) endings — this is why the old headline lied");
  assert.ok(r.badFirst.depletedInYear !== null && r.goodFirst.depletedInYear !== null);
  assert.ok(
    r.goodFirst.depletedInYear > r.badFirst.depletedInYear,
    "the lucky order still buys real years of solvency",
  );

  // The zero-withdrawal case is the ONLY one where order genuinely does not matter.
  const noWithdrawals = sequenceRiskComparison({
    balance: 1_000_000,
    withdrawalRate: 0,
    badReturn: -0.03,
    goodReturn: 0.08,
    inflation: 0.03,
  });
  assert.equal(noWithdrawals.shortfall, 0);
  assert.equal(noWithdrawals.badFirst.endingBalance, noWithdrawals.goodFirst.endingBalance);
});

test("checkup: projection and target are denominated in the SAME dollars", () => {
  // The unit bug. The target comes from TODAY'S spending, so it is a today's-dollars
  // target; the projection therefore has to grow at a REAL rate. Growing it nominally and
  // comparing against a real target overstated readiness by ~1.5x on the default inputs.
  //
  // The invariant: with zero real growth and zero contributions, a portfolio that exactly
  // equals the target today must still exactly equal it at retirement. Any inflation
  // leaking into one side and not the other breaks this.
  const annualGap = 46_000;
  const target = portfolioTarget(annualGap, SWR.morningstar2026);
  assert.equal(futureValue(target, 0, 17, 0), target, "no real growth ⇒ no real change");

  // And the shipped assumptions must be real, not nominal — a 6% *real* return would be an
  // aggressive top of range, which is exactly why the band was lowered.
  assert.ok(REAL_RETURN.conservative < REAL_RETURN.optimistic);
  assert.ok(REAL_RETURN.optimistic <= 0.05, "a real return above 5% is not a planning assumption");
});

test("payoff maths: a payment below the interest NEVER clears the balance", () => {
  // 0% APR is plain division.
  assert.equal(monthsToPayoff(10_000, 0, 500), 20);
  assert.equal(totalInterestPaid(10_000, 0, 500), 0);

  // Interest makes it take longer than balance/payment.
  assert.ok(monthsToPayoff(10_000, 0.24, 500) > 20);

  // The case that matters: $10k at 24% accrues $200/mo. Paying $150 never clears it.
  // Dividing balance by payment would cheerfully report 67 months.
  assert.equal(monthsToPayoff(10_000, 0.24, 150), Infinity);
  assert.equal(totalInterestPaid(10_000, 0.24, 150), Infinity);
  assert.equal(monthsToPayoff(10_000, 0.24, 0), Infinity);

  assert.equal(monthsToPayoff(0, 0.24, 100), 0); // nothing owed
});

test("debt vs investing: the employer match outranks everything", () => {
  const base = {
    debtBalance: 12_000,
    debtApr: 0.22,
    monthlyPayment: 300,
    extraMonthly: 200,
    expectedReturn: 0.07,
    salary: 80_000,
    employerMatchRate: 0.5, // 50 cents on the dollar
    employerMatchLimit: 0.06, // up to 6% of salary
    currentContributionRate: 0.02, // only contributing 2% — leaving money behind
  };

  const under = debtVsInvesting(base);
  // Full match = 80,000 × 6% × 50% = 2,400. Earned = 80,000 × 2% × 50% = 800.
  assert.equal(under.matchLeftOnTable, 1_600);
  // Even against a 22% credit card, the match wins — it is an instant 50% return.
  assert.equal(under.verdict, "match");

  // Once the match is fully captured, the 22% card is the priority.
  const matched = debtVsInvesting({ ...base, currentContributionRate: 0.06 });
  assert.equal(matched.matchLeftOnTable, 0);
  assert.equal(matched.verdict, "debt");

  // Contributing beyond the limit does not create extra match.
  assert.equal(debtVsInvesting({ ...base, currentContributionRate: 0.15 }).matchLeftOnTable, 0);
});

test("debt vs investing: a guaranteed return needs beating by a margin, not a nose", () => {
  const base = {
    debtBalance: 200_000,
    monthlyPayment: 1_200,
    extraMonthly: 300,
    expectedReturn: 0.07,
    salary: 80_000,
    employerMatchRate: 0.5,
    employerMatchLimit: 0.06,
    currentContributionRate: 0.06, // match already captured
  };

  // A 3% mortgage against a 7% expected return: invest.
  assert.equal(debtVsInvesting({ ...base, debtApr: 0.03 }).verdict, "invest");

  // A 22% card beats any plausible market return: pay the debt.
  assert.equal(debtVsInvesting({ ...base, debtApr: 0.22 }).verdict, "debt");

  // 6.5% vs 7% — investing wins by half a point, which is NOT worth taking risk for
  // when the alternative return is guaranteed. Too close to call, not "invest".
  assert.equal(debtVsInvesting({ ...base, debtApr: 0.065 }).verdict, "close");

  // A dead heat favours the debt, because only one of the two returns is certain.
  assert.equal(debtVsInvesting({ ...base, debtApr: 0.07 }).verdict, "debt");
});

test("debt vs investing: extra payments save real interest", () => {
  const r = debtVsInvesting({
    debtBalance: 12_000,
    debtApr: 0.22,
    monthlyPayment: 300,
    extraMonthly: 200,
    expectedReturn: 0.07,
    salary: 80_000,
    employerMatchRate: 0.5,
    employerMatchLimit: 0.06,
    currentContributionRate: 0.06,
  });
  assert.ok(r.interestIfExtra < r.interestIfMinimum);
  assert.ok(r.interestSaved > 0);
  assert.equal(r.interestSaved, r.interestIfMinimum - r.interestIfExtra);
  assert.ok(Number.isFinite(r.monthsToPayoff));
});

test("spending projection: healthcare only eats the budget when it inflates faster", () => {
  const base = {
    essentials: 40_000,
    healthcare: 8_000,
    discretionary: 12_000, // 60k total, healthcare = 13.3%
    years: 25,
  };

  // No inflation anywhere: the mix cannot move.
  const flat = projectRetirementSpending({
    ...base,
    generalInflation: 0,
    healthcareInflation: 0,
  });
  assert.equal(flat.first.total, 60_000);
  assert.equal(flat.last.total, 60_000);
  assert.equal(flat.healthcareShareIncrease, 0);
  assert.equal(flat.healthcarePremiumCost, 0);

  // Everything inflates at the SAME rate: the budget grows, but the mix is unchanged.
  // This is the control that proves the tool is measuring divergence, not just growth.
  const even = projectRetirementSpending({
    ...base,
    generalInflation: 0.03,
    healthcareInflation: 0.03,
  });
  assert.ok(even.last.total > even.first.total);
  assert.ok(Math.abs(even.healthcareShareIncrease) < 1e-9, "same rate ⇒ same share");
  assert.equal(even.healthcarePremiumCost, 0);
  assert.equal(even.last.total, even.totalIfHealthcareTracked);

  // Healthcare running hotter: its share rises, and the extra cost is real money.
  const hot = projectRetirementSpending({
    ...base,
    generalInflation: 0.03,
    healthcareInflation: 0.05,
  });
  assert.ok(hot.healthcareShareIncrease > 0.05, "share should climb by 5+ points over 25 years");
  assert.ok(hot.last.healthcareShare > hot.first.healthcareShare);
  assert.ok(hot.healthcarePremiumCost > 0);
  assert.ok(hot.last.total > hot.totalIfHealthcareTracked);
  assert.equal(hot.years.length, 25);
  assert.equal(hot.first.year, 1);
});
