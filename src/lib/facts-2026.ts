/**
 * Canonical 2026 retirement facts + pure finance math.
 *
 * SINGLE SOURCE OF TRUTH. Every article, calculator, and the checkup should read
 * numbers from here so a figure is cited once and updated once per tax year.
 * Each constant carries its primary source. Pure functions below are unit-tested
 * in test/finance.test.mjs.
 *
 * ⚠️ Items marked VOLATILE change with legislation — re-verify before relying.
 */

export type Source = { label: string; url: string };

// ── IRS 2026 contribution limits ────────────────────────────────────────────
// Source: IRS Notice 2025-67 — https://www.irs.gov/pub/irs-drop/n-25-67.pdf
export const CONTRIBUTION_2026 = {
  electiveDeferral: 24_500, // 401(k)/403(b)/457/TSP employee deferral
  catchUp50: 8_000, // standard catch-up, age 50+
  superCatchUp60to63: 11_250, // SECURE 2.0 "super catch-up", ages 60–63
  iraLimit: 7_500,
  iraCatchUp50: 1_100,
  // SECURE 2.0: catch-ups must be Roth if prior-year FICA wages from the plan
  // sponsor exceed this (indexed). Effective Jan 1, 2026.
  mandatoryRothCatchUpWageThreshold: 150_000,
} as const;

// ── Social Security 2026 ─────────────────────────────────────────────────────
// Source: SSA 2026 COLA fact sheet — https://www.ssa.gov/news/en/cola/factsheets/2026.html
export const SOCIAL_SECURITY_2026 = {
  cola: 0.028, // +2.8% for 2026
  maxTaxableEarnings: 184_500,
  fullRetirementAgeBornAfter1959: 67,
  earliestClaimAge: 62,
  maxDelayAge: 70,
  earningsTestUnderFra: 24_480, // $1 withheld per $2 over
  earningsTestFraYear: 65_160, // $1 withheld per $3 over
} as const;

// ── Medicare 2026 ────────────────────────────────────────────────────────────
// Source: CMS 2026 Part B fact sheet — https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles
export const MEDICARE_2026 = {
  eligibilityAge: 65,
  partBStandardPremiumMonthly: 202.9,
  partBDeductible: 283,
  irmaaFirstTierSingle: 109_000, // MAGI from 2 years prior (2026 → 2024 return)
  irmaaFirstTierJoint: 218_000,
} as const;

// ── RMDs (SECURE 2.0) ────────────────────────────────────────────────────────
// Source: IRS RMD FAQs — https://www.irs.gov/retirement-plans/retirement-plan-and-ira-required-minimum-distributions-faqs
export const RMD = { ageBorn1951to1959: 73, ageBorn1960OrLater: 75 } as const;

/** RMD start age by birth year (73 for 1951–1959, 75 for 1960+). */
export function rmdStartAge(birthYear: number): number {
  return birthYear >= 1960 ? RMD.ageBorn1960OrLater : RMD.ageBorn1951to1959;
}

// ── Safe withdrawal rate benchmarks ──────────────────────────────────────────
// Morningstar "State of Retirement Income" 2026 (fixed real spending, 30yr, 90% success);
// Bengen SAFEMAX; classic 4% rule. https://www.morningstar.com/retirement/whats-safe-retirement-withdrawal-rate-2026
export const SWR = { morningstar2026: 0.039, bengenRevised: 0.047, classic4Rule: 0.04 } as const;

// ── ACA early-retiree bridge ── VOLATILE ─────────────────────────────────────
// The ARPA/IRA enhanced premium tax credits expired Dec 31, 2025 and the 400%-FPL
// "subsidy cliff" returned for plan-year 2026. An extension was pending in Congress.
// Source: KFF — https://www.kff.org/affordable-care-act/what-we-know-so-far-about-2026-aca-marketplace-enrollment-premiums-and-deductibles/
export const ACA_2026 = {
  subsidyCliffFplPercent: 400, // above this, $0 premium tax credit under current law
  enhancedSubsidiesExpired: true, // ⚠️ re-verify — legislation active
} as const;

// Federal Poverty Level. 2026 marketplace subsidies are computed against the
// PRIOR year's guidelines, so 2026 coverage uses the 2025 HHS FPL (48 contiguous
// states + DC; Alaska and Hawaii are higher).
// Source: HHS 2025 Poverty Guidelines — https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines
export const FPL_2025 = { onePerson: 15_650, perAdditionalPerson: 5_500 } as const;

// ─────────────────────────────────────────────────────────────────────────────
// Pure finance math (unit-tested)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fraction of the Primary Insurance Amount (PIA, the benefit at FRA) received
 * when claiming Social Security at `claimAge`, given the person's `fra`.
 *
 * SSA rules (https://www.ssa.gov/benefits/retirement/planner/agereduction.html,
 * https://www.ssa.gov/benefits/retirement/planner/delayret.html):
 *  - Early: −5/9 of 1% per month for the first 36 months early, then −5/12 of 1%
 *    per additional month. (FRA 67, claim 62 ⇒ 0.70; FRA 66, claim 62 ⇒ 0.75)
 *  - Delayed: +2/3 of 1% per month (8%/yr) past FRA, up to age 70.
 *    (FRA 67, claim 70 ⇒ 1.24; FRA 66, claim 70 ⇒ 1.32)
 */
export function ssBenefitFactor(fra: number, claimAge: number): number {
  const age = Math.max(SOCIAL_SECURITY_2026.earliestClaimAge, Math.min(SOCIAL_SECURITY_2026.maxDelayAge, claimAge));
  if (age === fra) return 1;
  if (age > fra) {
    const monthsDelayed = (age - fra) * 12;
    return 1 + monthsDelayed * (2 / 3 / 100); // +8%/yr
  }
  const monthsEarly = (fra - age) * 12;
  const first36 = Math.min(monthsEarly, 36) * (5 / 9 / 100);
  const beyond36 = Math.max(0, monthsEarly - 36) * (5 / 12 / 100);
  return 1 - first36 - beyond36;
}

/**
 * Break-even AGE between claiming at `earlyAge` vs `lateAge` (lateAge > earlyAge),
 * given monthly PIA and FRA. Ignores COLA, taxes, survivor benefits, and investment
 * return (adding COLA/survivor tilts toward delaying; adding returns tilts toward early).
 * Returns the age at which cumulative dollars from the later claim overtake the earlier.
 */
export function ssBreakEvenAge(pia: number, fra: number, earlyAge: number, lateAge: number): number {
  const early = pia * ssBenefitFactor(fra, earlyAge);
  const late = pia * ssBenefitFactor(fra, lateAge);
  const monthlyGap = late - early;
  if (monthlyGap <= 0) return Infinity; // later claim never larger — no break-even
  const headStartDollars = early * (lateAge - earlyAge) * 12; // collected before late claim starts
  const monthsAfterLate = headStartDollars / monthlyGap;
  return lateAge + monthsAfterLate / 12;
}

/** Total elective-deferral catch-up available at a given age for 2026 (super catch-up 60–63). */
export function catchUpContribution2026(age: number): number {
  if (age >= 60 && age <= 63) return CONTRIBUTION_2026.superCatchUp60to63;
  if (age >= 50) return CONTRIBUTION_2026.catchUp50;
  return 0;
}

/** Max employee 401(k) contribution at a given age for 2026 (deferral + age-based catch-up). */
export function maxEmployeeDeferral2026(age: number): number {
  return CONTRIBUTION_2026.electiveDeferral + catchUpContribution2026(age);
}

/**
 * Future value of a balance plus a fixed annual contribution made at year end
 * (ordinary annuity), compounded annually at `annualReturn`.
 */
export function futureValue(balance: number, annualContribution: number, years: number, annualReturn: number): number {
  let value = balance;
  for (let i = 0; i < Math.max(0, Math.floor(years)); i += 1) {
    value = value * (1 + annualReturn) + annualContribution;
  }
  return Math.max(0, value);
}

/** Portfolio needed to fund an annual income gap at a given safe withdrawal rate. */
export function portfolioTarget(annualGap: number, swr: number): number {
  return swr > 0 ? annualGap / swr : Infinity;
}

/** Annual Federal Poverty Level for a household (2025 HHS guidelines, 48 states + DC). */
export function federalPovertyLevel(householdSize: number): number {
  const n = Math.max(1, Math.floor(householdSize));
  return FPL_2025.onePerson + (n - 1) * FPL_2025.perAdditionalPerson;
}

/** Household MAGI expressed as a percent of the Federal Poverty Level. */
export function fplPercent(magi: number, householdSize: number): number {
  return (magi / federalPovertyLevel(householdSize)) * 100;
}

/** The MAGI at the 400%-of-FPL "subsidy cliff" — back for 2026 under current law. */
export function acaSubsidyCliffMagi(householdSize: number): number {
  return federalPovertyLevel(householdSize) * (ACA_2026.subsidyCliffFplPercent / 100);
}

export type AcaSubsidyStatus = {
  fplPercent: number;
  cliffMagi: number;
  /** MAGI > 400% FPL ⇒ $0 premium tax credit under 2026 law. */
  overCliff: boolean;
  /** MAGI < 100% FPL ⇒ generally not marketplace-subsidy-eligible (Medicaid territory). */
  belowFloor: boolean;
  /** Positive = dollars of MAGI room before losing subsidy eligibility at the cliff. */
  headroomToCliff: number;
};

/**
 * ACA premium-tax-credit eligibility signal for an early retiree bridging to
 * Medicare. Because the enhanced subsidies expired at the end of 2025, being $1
 * over 400% FPL now means $0 credit — so the actionable number is the MAGI
 * headroom to the cliff. ⚠️ Legislation is active; re-verify current statute.
 */
export function acaSubsidyStatus(magi: number, householdSize: number): AcaSubsidyStatus {
  const cliffMagi = acaSubsidyCliffMagi(householdSize);
  const pct = fplPercent(magi, householdSize);
  return {
    fplPercent: pct,
    cliffMagi,
    overCliff: pct > ACA_2026.subsidyCliffFplPercent,
    belowFloor: pct < 100,
    headroomToCliff: cliffMagi - magi,
  };
}
