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

/**
 * Where every number below actually comes from.
 *
 * The citation lives WITH the constant, not in a comment, so the public /sources page
 * renders straight from this file. If a figure changes, the number and its source and
 * its verified date all move together — there is no second copy to forget.
 *
 * `volatile: true` marks a figure that can change by act of Congress rather than by the
 * annual indexing calendar. Those need re-checking before every publish, not once a year.
 */
export type FactSource = {
  title: string;
  publisher: string;
  url: string;
  /** Last time a human confirmed this against the primary source. */
  verified: string;
  volatile?: boolean;
  note?: string;
};

export const FACT_SOURCES = {
  contributions: {
    title: "Notice 2025-67 — 2026 retirement plan cost-of-living adjustments",
    publisher: "Internal Revenue Service",
    url: "https://www.irs.gov/pub/irs-drop/n-25-67.pdf",
    verified: "2026-07-11",
    note: "Also the source for the $150,000 mandatory-Roth catch-up wage threshold — widely misquoted as the $145,000 statutory base.",
  },
  tax: {
    title: "Rev. Proc. 2025-32 — 2026 inflation adjustments",
    publisher: "Internal Revenue Service",
    url: "https://www.irs.gov/pub/irs-drop/rp-25-32.pdf",
    verified: "2026-07-11",
  },
  seniorDeduction: {
    title: "One Big Beautiful Bill Act — deductions for seniors",
    publisher: "Internal Revenue Service",
    url: "https://www.irs.gov/newsroom/one-big-beautiful-bill-act-tax-deductions-for-working-americans-and-seniors",
    verified: "2026-07-11",
    volatile: true,
    note: "Expires after 2028. This is NOT 'no tax on Social Security' — the benefit-taxation thresholds are untouched.",
  },
  socialSecurity: {
    title: "2026 Social Security Changes (COLA fact sheet)",
    publisher: "Social Security Administration",
    url: "https://www.ssa.gov/news/en/cola/factsheets/2026.html",
    verified: "2026-07-11",
  },
  medicare: {
    title: "2026 Medicare Parts A & B Premiums and Deductibles",
    publisher: "Centers for Medicare & Medicaid Services",
    url: "https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles",
    verified: "2026-07-11",
  },
  aca: {
    title: "How will the loss of enhanced premium tax credits affect older adults?",
    publisher: "KFF",
    url: "https://www.kff.org/affordable-care-act/how-will-the-loss-of-enhanced-premium-tax-credits-affect-older-adults/",
    verified: "2026-07-11",
    volatile: true,
    note: "The enhanced credits expired 2025-12-31 and the 400%-of-FPL cliff returned. An extension was live in Congress and could change this overnight, possibly retroactively.",
  },
  fpl: {
    title: "HHS Poverty Guidelines",
    publisher: "U.S. Department of Health and Human Services",
    url: "https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines",
    verified: "2026-07-11",
    note: "2026 coverage is measured against the 2025 guidelines.",
  },
  rmd: {
    title: "Retirement plan and IRA required minimum distributions FAQs",
    publisher: "Internal Revenue Service",
    url: "https://www.irs.gov/retirement-plans/retirement-plan-and-ira-required-minimum-distributions-faqs",
    verified: "2026-07-11",
  },
  swr: {
    title: "What's a Safe Retirement Withdrawal Rate in 2026?",
    publisher: "Morningstar, State of Retirement Income (2025 edition)",
    url: "https://www.morningstar.com/retirement/whats-safe-retirement-withdrawal-rate-2026",
    verified: "2026-07-11",
    note: "3.9% is forward-looking (30 years, 90% success, 30-50% equity). Bengen's 4.7% is a historical worst case with a more aggressive portfolio. They answer different questions and must never be averaged.",
  },
} as const satisfies Record<string, FactSource>;

// ── IRS 2026 contribution limits ────────────────────────────────────────────
// Source: IRS Notice 2025-67 — https://www.irs.gov/pub/irs-drop/n-25-67.pdf
export const CONTRIBUTION_2026 = {
  electiveDeferral: 24_500, // 401(k)/403(b)/457/TSP employee deferral
  catchUp50: 8_000, // standard catch-up, age 50+
  superCatchUp60to63: 11_250, // SECURE 2.0 "super catch-up", ages 60–63
  simpleIraDeferral: 17_000,
  simpleIraHigherDeferral: 18_100, // certain SIMPLE plans under SECURE 2.0
  simpleIraCatchUp50: 4_000,
  simpleIraSuperCatchUp60to63: 5_250,
  iraLimit: 7_500,
  iraCatchUp50: 1_100,
  // SECURE 2.0: catch-ups must be Roth if prior-year FICA wages from the plan
  // sponsor exceed this (indexed). Effective Jan 1, 2026.
  // NOTE: $145,000 is the statutory base and is STILL widely misquoted for 2026.
  // Notice 2025-67 raised it to $150,000. Final regs: T.D. 10033 (2025-09-16).
  mandatoryRothCatchUpWageThreshold: 150_000,
  total415c: 72_000, // employee + employer ceiling (mega-backdoor headroom)
  qcdLimit: 111_000, // qualified charitable distribution, age 70½+
  rothIraPhaseOutSingle: [153_000, 168_000],
  rothIraPhaseOutJoint: [242_000, 252_000],
} as const;

// ── Federal income tax 2026 ──────────────────────────────────────────────────
// Source: IRS Rev. Proc. 2025-32 — https://www.irs.gov/pub/irs-drop/rp-25-32.pdf
export const TAX_2026 = {
  standardDeduction: { single: 16_100, mfj: 32_200, hoh: 24_150 },
  // Extra standard deduction per qualifying condition (age 65+ and/or blind).
  additionalDeductionAge65: { married: 1_650, unmarried: 2_050 },
  // Long-term capital gains 0% bracket ceiling, by taxable income.
  ltcgZeroBracket: { single: 49_450, mfj: 98_900, hoh: 66_200 },
  // Ordinary brackets: [rate, top of bracket]. TCJA rates made permanent by OBBBA.
  bracketsSingle: [
    [0.1, 12_400],
    [0.12, 50_400],
    [0.22, 105_700],
    [0.24, 201_775],
    [0.32, 256_225],
    [0.35, 640_600],
    [0.37, Infinity],
  ],
  bracketsMfj: [
    [0.1, 24_800],
    [0.12, 100_800],
    [0.22, 211_400],
    [0.24, 403_550],
    [0.32, 512_450],
    [0.35, 768_700],
    [0.37, Infinity],
  ],
} as const;

// ── Charitable deductions 2026 ───────────────────────────────────────────────
// Source: OBBBA / IRS retirement-tax planning summary. The cash-only non-itemizer
// deduction returns in 2026; itemizers also face a 0.5%-of-AGI floor.
export const CHARITABLE_2026 = {
  nonItemizerCashDeduction: { single: 1_000, mfj: 2_000 },
  itemizerAgiFloor: 0.005,
} as const;

// ── Saver's Match 2027 ───────────────────────────────────────────────────────
// SECURE 2.0 replaces the Saver's Credit after 2026. The match is paid into the
// retirement account rather than reducing tax on the return.
export const SAVERS_MATCH_2027 = {
  matchRate: 0.5,
  maxMatchedContribution: 2_000,
  maxMatch: 1_000,
  phaseOutMfj: [41_000, 71_000],
} as const;

// ── OBBBA "senior bonus deduction" ── VOLATILE (expires after 2028) ──────────
// One Big Beautiful Bill Act (July 2025). $6,000 per person aged 65+, available to
// itemizers AND non-itemizers, on top of the standard deduction. It is NOT
// "no tax on Social Security" — the $25k/$32k benefit-taxation thresholds are untouched.
// Source: https://www.irs.gov/newsroom/one-big-beautiful-bill-act-tax-deductions-for-working-americans-and-seniors
export const SENIOR_DEDUCTION = {
  perPerson65Plus: 6_000,
  phaseOutStart: { single: 75_000, mfj: 150_000 },
  phaseOutRate: 0.06, // reduced by 6% of MAGI above the threshold
  fullyPhasedOut: { single: 175_000, mfj: 250_000 },
  firstYear: 2025,
  lastYear: 2028, // ⚠️ sunsets — re-verify before the 2029 tax year
} as const;

/**
 * The OBBBA senior deduction actually available to a household, after phase-out.
 *
 * `people65Plus` is how many filers are 65 or older (0, 1, or 2 — an MFJ couple with
 * both over 65 gets $12,000 before phase-out).
 *
 * The phase-out is computed PER PERSON, not once on the combined amount (IRS Schedule
 * 1-A). That is why a couple's deduction disappears at $250,000 rather than $350,000:
 * 6% of the $100,000 excess wipes out each spouse's $6,000 individually. Reducing the
 * $12,000 as a lump would overstate the deduction for couples in the phase-out band.
 */
export function seniorDeduction2026(
  magi: number,
  filing: "single" | "mfj",
  people65Plus: number,
): number {
  const people = Math.max(0, Math.min(2, Math.floor(people65Plus)));
  if (people === 0) return 0;

  // A single filer can only ever count themselves; only MFJ can claim two.
  const count = filing === "single" ? 1 : people;
  const start = SENIOR_DEDUCTION.phaseOutStart[filing];
  const excess = Math.max(0, magi - start);
  const reduction = excess * SENIOR_DEDUCTION.phaseOutRate;
  const perPerson = Math.max(0, SENIOR_DEDUCTION.perPerson65Plus - reduction);
  return Math.round(perPerson * count);
}

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
  maxBenefitAtFraMonthly: 4_152,
  averageRetiredWorkerMonthly: 2_071,
  socialSecurityFairnessAct: {
    signed: "2025-01-05",
    retroactiveTo: "2024-01-01",
    wepRepealed: true,
    gpoRepealed: true,
  },
  // Benefit-taxation thresholds (combined income). NOT indexed — unchanged since
  // 1984/1993, and OBBBA did NOT change them. The senior deduction is the substitute,
  // so "no tax on Social Security" is false. Say so.
  benefitTaxThresholdSingle: 25_000,
  benefitTaxThresholdJoint: 32_000,
  // The second tier, where up to 85% of the benefit becomes taxable. Also unindexed and
  // also untouched by OBBBA. Here so prose can cite it rather than hand-type it.
  benefitTax85ThresholdSingle: 34_000,
  benefitTax85ThresholdJoint: 44_000,
} as const;

// ── Medicare 2026 ────────────────────────────────────────────────────────────
// Source: CMS 2026 Part B fact sheet — https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles
export const MEDICARE_2026 = {
  eligibilityAge: 65,
  partBStandardPremiumMonthly: 202.9,
  partBDeductible: 283,
  partAInpatientDeductible: 1_736, // per benefit period
  partDOutOfPocketCap: 2_100, // was $2,000 in 2025
  partDMaxDeductible: 615,
  irmaaFirstTierSingle: 109_000, // MAGI from 2 years prior (2026 → 2024 return)
  irmaaFirstTierJoint: 218_000,
  irmaaLookbackYears: 2, // the planning point: a Roth conversion at 63 hits your premium at 65
  // First IRMAA tier: Part B rises to this, and Part D adds a surcharge, PER PERSON.
  irmaaTier1PartBMonthly: 284.1,
  irmaaTier1PartDSurchargeMonthly: 14.5,
} as const;

/**
 * Extra annual Medicare cost, per person, for crossing the FIRST IRMAA tier.
 *
 * ponytail: models tier 1 only. There are four higher tiers (up to $689.90/mo Part B),
 * so this is a FLOOR for high incomes, not the whole story — the UI says so. Add the
 * full bracket table when a user actually needs tier 2+.
 */
export function irmaaTier1AnnualSurcharge(): number {
  const partB = MEDICARE_2026.irmaaTier1PartBMonthly - MEDICARE_2026.partBStandardPremiumMonthly;
  return Math.round((partB + MEDICARE_2026.irmaaTier1PartDSurchargeMonthly) * 12);
}

/** Does this MAGI cross the first IRMAA tier? (Compared 2 years later — see irmaaLookbackYears.) */
export function crossesIrmaaTier1(magi: number, filing: "single" | "mfj"): boolean {
  const threshold =
    filing === "mfj" ? MEDICARE_2026.irmaaFirstTierJoint : MEDICARE_2026.irmaaFirstTierSingle;
  return magi > threshold;
}

// ── RMDs (SECURE 2.0) ────────────────────────────────────────────────────────
// Source: IRS RMD FAQs — https://www.irs.gov/retirement-plans/retirement-plan-and-ira-required-minimum-distributions-faqs
export const RMD = { ageBorn1951to1959: 73, ageBorn1960OrLater: 75 } as const;
export const INHERITED_IRA_RMD = {
  finalRegsEffective: "2025-01-01",
  emptyByYear: 10,
  annualRmdYears: [1, 9],
  appliesWhenOwnerDiedOnOrAfterRequiredBeginningDate: true,
  missedRmdPenalty: 0.25,
  timelyCorrectedPenalty: 0.1,
} as const;

/** RMD start age by birth year (73 for 1951–1959, 75 for 1960+). */
export function rmdStartAge(birthYear: number): number {
  return birthYear >= 1960 ? RMD.ageBorn1960OrLater : RMD.ageBorn1951to1959;
}

/**
 * Non-eligible designated beneficiaries generally must empty an inherited account
 * by year 10. If the owner died on or after their required beginning date, the final
 * regs also require annual RMDs in years 1-9. Eligible designated beneficiaries
 * have different stretch/spousal rules, so this helper returns false for them.
 */
export function inheritedIraAnnualRmdRequired(
  ownerDiedOnOrAfterRequiredBeginningDate: boolean,
  eligibleDesignatedBeneficiary = false,
): boolean {
  return ownerDiedOnOrAfterRequiredBeginningDate && !eligibleDesignatedBeneficiary;
}

/**
 * Return assumptions for "are you on track" projections — REAL, i.e. after inflation.
 *
 * Real, not nominal, and this is not a preference. The SWR anchors below are defined in
 * real terms, and the portfolio target is computed from the user's spending TODAY. So the
 * savings projection must also be in today's dollars, or the two sides of the comparison
 * are denominated in different currencies.
 *
 * That is exactly what used to happen: the checkup grew savings at a nominal-looking 3-6%
 * and compared the result against a today's-dollars target. On its own default inputs it
 * reported 101% coverage where the honest figure was ~67% — it told people they were on
 * track when they were a third short.
 *
 * Holding the annual contribution flat in today's dollars implies the saver raises it with
 * inflation every year. The UI must say so: someone who never increases their contribution
 * will land below this range.
 *
 * Band: ~2% real is a bond-heavy glidepath; ~5% real is a historically strong balanced
 * portfolio. Forward-looking house estimates for 60/40 cluster in between.
 */
export const REAL_RETURN = { conservative: 0.02, optimistic: 0.05 } as const;

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
  lastVerified: "2026-07-11",
  monitoringOwner: "Editorial lead",
  // National-average 2026 unsubsidized premiums for a 60-year-old. These are not
  // quotes; local benchmark plans vary materially by county and state.
  averageAge60AnnualPremium: {
    lowestCostBronze: 11_625,
    benchmarkSilver: 15_914,
    lowestCostGold: 15_672,
  },
  restoredEnhancedCreditReference: {
    age: 60,
    annualIncome: 65_000,
    benchmarkIncomeCap: 0.085,
    annualIncreaseAfterExpiration: 10_389,
  },
} as const;

// ── ACA applicable percentage table 2026 ── VOLATILE ─────────────────────────
// WHAT ACTUALLY REVERTED when the enhanced credits expired. The cap did NOT vanish.
// A household between 100% and 400% of FPL still has its benchmark-silver premium
// capped at this share of income. The cap got NARROWER (nothing at all above 400%)
// and HARSHER (9.96% at the top, where ARPA/IRA capped everyone at 8.5%).
//
// Saying "the cap is gone" tells a 62-year-old at 250% FPL they get no help at all.
// They do — their benchmark premium is capped at 8.44-9.96% of income.
// Source: IRS Rev. Proc. 2025-25 §3.01 — https://www.irs.gov/pub/irs-drop/rp-25-25.pdf
export const ACA_APPLICABLE_PERCENTAGE_2026 = [
  { band: "Under 133%", lower: 0, upper: 133, initial: 0.021, final: 0.021 },
  { band: "133% to 150%", lower: 133, upper: 150, initial: 0.0314, final: 0.0419 },
  { band: "150% to 200%", lower: 150, upper: 200, initial: 0.0419, final: 0.066 },
  { band: "200% to 250%", lower: 200, upper: 250, initial: 0.066, final: 0.0844 },
  { band: "250% to 300%", lower: 250, upper: 300, initial: 0.0844, final: 0.0996 },
  { band: "300% to 400%", lower: 300, upper: 400, initial: 0.0996, final: 0.0996 },
] as const;

/**
 * The share of income a household is expected to pay for the benchmark silver plan, at a
 * given percent of FPL. Rises linearly inside each band (Rev. Proc. 2025-25 §3.01).
 *
 * Above 400% FPL there IS no applicable percentage — the credit is zero, not capped — so
 * this returns null there rather than a number that would imply help exists.
 */
export function acaApplicablePercentage(fplPct: number): number | null {
  if (fplPct > ACA_2026.subsidyCliffFplPercent) return null; // over the cliff: no credit at all
  const band =
    ACA_APPLICABLE_PERCENTAGE_2026.find((b) => fplPct >= b.lower && fplPct <= b.upper) ??
    ACA_APPLICABLE_PERCENTAGE_2026[0];
  if (band.initial === band.final) return band.final;
  const span = band.upper - band.lower;
  const progress = span > 0 ? (fplPct - band.lower) / span : 0;
  return band.initial + (band.final - band.initial) * progress;
}

/**
 * What the benchmark silver plan actually costs a household under CURRENT (2026) law.
 *
 * This is the number the old code got wrong. It used the EXPIRED enhanced 8.5% cap for
 * everyone below the cliff, which (a) underpriced the 300-400% band, who really pay 9.96%,
 * and (b) made `restoredEnhancedBenchmarkSavings` subtract a value from itself — so the
 * bridge tool reported $0 of harm from the subsidy expiration for EVERY household under
 * 400% FPL. That is the same "no help, no harm below the line" error we just removed from
 * the prose, sitting in the calculator that the prose links to.
 */
export function acaCurrentLawBenchmarkCost(magi: number, householdSize: number): number {
  const pct = fplPercent(magi, householdSize);
  const applicable = acaApplicablePercentage(pct);
  // Over the cliff: no credit, you pay the whole premium.
  if (applicable === null) return ACA_2026.averageAge60AnnualPremium.benchmarkSilver;
  return Math.round(
    Math.min(ACA_2026.averageAge60AnnualPremium.benchmarkSilver, Math.max(0, magi * applicable)),
  );
}

/** The top applicable percentage (the flat 300-400% band). This rate prices the cliff edge. */
export const ACA_TOP_APPLICABLE_PERCENTAGE =
  ACA_APPLICABLE_PERCENTAGE_2026[ACA_APPLICABLE_PERCENTAGE_2026.length - 1].final;

/**
 * OBBBA §71305 REPEALED §36B(f)(2)(B) — the cap on repaying excess advance premium
 * tax credit — for tax years beginning after 2025. There is now NO repayment cap at
 * ANY income level, not merely above 400% FPL.
 *
 * This is the part almost every secondary source still gets wrong: they publish the
 * old $350/$900/$1,500 repayment-cap table as if it still applies to 2026. It does not.
 * Underestimate your income and you repay every dollar of APTC you received.
 *
 * Sources: IRS Rev. Proc. 2025-32 §3.04 ("Section 71305 of the OBBBA removes
 * § 36B(f)(2)(B) ... effective for taxable years beginning after December 31, 2025");
 * IRS Fact Sheet FS-2025-10 Q31, updated 2025-12-23 ("There is no repayment cap for
 * tax years after 2025.") — https://www.irs.gov/pub/taxpros/fs-2025-10.pdf
 */
export const ACA_APTC_REPAYMENT_CAP_REPEALED = true;

/** Medicaid expansion threshold: statutory 133% FPL plus the 5-point income disregard. */
export const MEDICAID_EXPANSION_FPL_PERCENT = 138;

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
export function ssBenefitFactor(fraInput: number, claimAge: number): number {
  // Clamp the FRA too, not just the claim age. Statutory FRA has only ever run from 65
  // (born 1937 or earlier) to 67 (born 1960 or later) — anything outside that is a bad
  // input, and an empty number field gives Number("") === 0. Unclamped, fra=0 produced a
  // 596% benefit factor and a break-even age of Infinity in the break-even tool.
  const fra = Math.max(65, Math.min(67, fraInput));
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

// ─────────────────────────────────────────────────────────────────────────────
// Retirement spending: why healthcare quietly eats the budget
// ─────────────────────────────────────────────────────────────────────────────

export type SpendingYear = {
  year: number;
  essentials: number;
  healthcare: number;
  discretionary: number;
  total: number;
  /** Healthcare as a share of that year's total. */
  healthcareShare: number;
};

export type SpendingProjection = {
  years: SpendingYear[];
  first: SpendingYear;
  last: SpendingYear;
  /** Percentage-POINT rise in healthcare's share of the budget. */
  healthcareShareIncrease: number;
  /** What the budget would be if healthcare inflated at the general rate instead. */
  totalIfHealthcareTracked: number;
  /** The cost of healthcare outrunning everything else, in the final year. */
  healthcarePremiumCost: number;
};

/**
 * Project a retirement budget when healthcare inflates faster than everything else.
 *
 * This is the whole point of the tool, and it is pure arithmetic — no forecast, no
 * unverified constant. Two categories compounding at different rates diverge, and over
 * a 25-year retirement healthcare can go from a modest line item to the thing that
 * dominates the budget. Not because the retiree consumes more of it, but because its
 * price runs hotter. A single blended inflation rate hides that completely, which is
 * why most "inflation calculators" are useless here.
 */
export function projectRetirementSpending(opts: {
  essentials: number;
  healthcare: number;
  discretionary: number;
  years: number;
  generalInflation: number;
  healthcareInflation: number;
}): SpendingProjection {
  const n = Math.max(1, Math.floor(opts.years));
  const years: SpendingYear[] = [];

  for (let i = 0; i < n; i += 1) {
    const g = Math.pow(1 + opts.generalInflation, i);
    const h = Math.pow(1 + opts.healthcareInflation, i);
    const essentials = opts.essentials * g;
    const healthcare = opts.healthcare * h;
    const discretionary = opts.discretionary * g;
    const total = essentials + healthcare + discretionary;
    years.push({
      year: i + 1,
      essentials: Math.round(essentials),
      healthcare: Math.round(healthcare),
      discretionary: Math.round(discretionary),
      total: Math.round(total),
      healthcareShare: total > 0 ? healthcare / total : 0,
    });
  }

  const first = years[0];
  const last = years[years.length - 1];

  // The counterfactual: same budget, but healthcare behaves like everything else.
  const g = Math.pow(1 + opts.generalInflation, n - 1);
  const totalIfHealthcareTracked = Math.round(
    (opts.essentials + opts.healthcare + opts.discretionary) * g,
  );

  return {
    years,
    first,
    last,
    healthcareShareIncrease: last.healthcareShare - first.healthcareShare,
    totalIfHealthcareTracked,
    healthcarePremiumCost: Math.max(0, last.total - totalIfHealthcareTracked),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Debt payoff vs investing
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Months to clear a balance at a given APR and fixed monthly payment.
 *
 * Returns Infinity when the payment does not even cover the monthly interest — the
 * balance grows forever. Most payoff calculators divide balance by payment and quietly
 * produce a number here, which is the single most misleading answer they can give
 * someone drowning in a 24% card.
 */
export function monthsToPayoff(balance: number, apr: number, monthlyPayment: number): number {
  if (balance <= 0) return 0;
  if (monthlyPayment <= 0) return Infinity;

  const monthlyRate = apr / 12;
  if (monthlyRate <= 0) return Math.ceil(balance / monthlyPayment);
  if (monthlyPayment <= balance * monthlyRate) return Infinity; // never pays off

  // Standard amortisation: n = -ln(1 - r·B/P) / ln(1 + r)
  const n = -Math.log(1 - (monthlyRate * balance) / monthlyPayment) / Math.log(1 + monthlyRate);
  return Math.ceil(n);
}

/** Total interest paid clearing `balance` at `apr` with a fixed monthly payment. */
export function totalInterestPaid(balance: number, apr: number, monthlyPayment: number): number {
  const months = monthsToPayoff(balance, apr, monthlyPayment);
  if (!Number.isFinite(months)) return Infinity;
  return Math.max(0, Math.round(monthlyPayment * months - balance));
}

export type DebtVsInvestVerdict = "match" | "debt" | "invest" | "close";

export type DebtVsInvestResult = {
  verdict: DebtVsInvestVerdict;
  /** Free employer money being left on the table each year. */
  matchLeftOnTable: number;
  /** Paying the debt earns this, guaranteed. */
  guaranteedReturn: number;
  /** Investing might earn this. Might. */
  expectedReturn: number;
  monthsToPayoff: number;
  interestIfMinimum: number;
  interestIfExtra: number;
  interestSaved: number;
};

/**
 * ponytail: the risk premium that has to exist before "invest instead" is sensible.
 *
 * Paying debt returns the APR with certainty. Investing returns a guess with variance,
 * and a retiree who is wrong has no time to recover. So a dead heat should favour the
 * debt — we require the expected return to beat the APR by this margin before saying
 * "invest". A judgment call, stated out loud rather than buried.
 */
export const INVEST_RISK_PREMIUM = 0.02;

/**
 * Debt payoff vs investing, in the only order that is actually defensible:
 *   1. Capture the full employer match. It is an instant, guaranteed 50-100% return —
 *      nothing else in personal finance competes, and it beats paying down even a
 *      credit card.
 *   2. Kill high-interest debt. Its return is guaranteed; the market's is not.
 *   3. Then invest the rest.
 *
 * Deliberately returns no "you will be $X richer" figure: that number requires
 * predicting the market, and false precision is the thing this site exists to avoid.
 */
export function debtVsInvesting(opts: {
  debtBalance: number;
  debtApr: number;
  monthlyPayment: number;
  extraMonthly: number;
  expectedReturn: number;
  /** Annual salary — used only to size the employer match. */
  salary: number;
  /** e.g. 0.5 = employer matches 50% of what you put in. */
  employerMatchRate: number;
  /** Percent of salary the employer will match up to, e.g. 0.06. */
  employerMatchLimit: number;
  /** Percent of salary you currently contribute. */
  currentContributionRate: number;
}): DebtVsInvestResult {
  const matchedPortion = Math.min(opts.currentContributionRate, opts.employerMatchLimit);
  const fullMatch = opts.salary * opts.employerMatchLimit * opts.employerMatchRate;
  const earnedMatch = opts.salary * matchedPortion * opts.employerMatchRate;
  const matchLeftOnTable = Math.max(0, Math.round(fullMatch - earnedMatch));

  const interestIfMinimum = totalInterestPaid(opts.debtBalance, opts.debtApr, opts.monthlyPayment);
  const interestIfExtra = totalInterestPaid(
    opts.debtBalance,
    opts.debtApr,
    opts.monthlyPayment + opts.extraMonthly,
  );
  const interestSaved =
    Number.isFinite(interestIfMinimum) && Number.isFinite(interestIfExtra)
      ? Math.max(0, interestIfMinimum - interestIfExtra)
      : Infinity;

  let verdict: DebtVsInvestVerdict;
  if (matchLeftOnTable > 0) {
    verdict = "match";
  } else if (opts.debtApr >= opts.expectedReturn) {
    verdict = "debt";
  } else if (opts.expectedReturn - opts.debtApr > INVEST_RISK_PREMIUM) {
    verdict = "invest";
  } else {
    verdict = "close";
  }

  return {
    verdict,
    matchLeftOnTable,
    guaranteedReturn: opts.debtApr,
    expectedReturn: opts.expectedReturn,
    monthsToPayoff: monthsToPayoff(
      opts.debtBalance,
      opts.debtApr,
      opts.monthlyPayment + opts.extraMonthly,
    ),
    interestIfMinimum,
    interestIfExtra,
    interestSaved,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Roth conversions: the tax bill, and the two costs nobody prices in
// ─────────────────────────────────────────────────────────────────────────────

/** Federal income tax on a given TAXABLE income (after deductions), 2026 brackets. */
export function federalIncomeTax(taxableIncome: number, filing: "single" | "mfj"): number {
  const brackets = filing === "mfj" ? TAX_2026.bracketsMfj : TAX_2026.bracketsSingle;
  let tax = 0;
  let floor = 0;
  for (const [rate, ceiling] of brackets) {
    if (taxableIncome <= floor) break;
    tax += (Math.min(taxableIncome, ceiling) - floor) * rate;
    floor = ceiling;
  }
  return Math.max(0, Math.round(tax));
}

/** Taxable income after the standard deduction and (if 65+) the OBBBA senior deduction. */
export function taxableIncome2026(
  grossIncome: number,
  filing: "single" | "mfj",
  people65Plus: number,
): number {
  const standard =
    filing === "mfj" ? TAX_2026.standardDeduction.mfj : TAX_2026.standardDeduction.single;
  const senior = seniorDeduction2026(grossIncome, filing, people65Plus);
  return Math.max(0, grossIncome - standard - senior);
}

export type ConversionCost = {
  /** Federal income tax caused by the conversion itself. */
  federalTax: number;
  /** Tax as a share of the amount converted — the number that actually matters. */
  effectiveRate: number;
  magiAfter: number;

  // ── WHERE YOU LAND (level) ────────────────────────────────────────────────
  // These say where the household actually ENDS UP. The UI must state these, never the
  // transition flags below: someone already over the cliff who is told "this keeps you
  // under the cliff" has been told a flat lie, and it hides the one insight that matters
  // to them — once the credit is already gone, converting MORE is comparatively cheap.
  /** Pre-65 only: MAGI is over 400% FPL after converting, from whatever starting point. */
  overAcaCliffAfter: boolean;
  /** 63+ only: MAGI is over IRMAA tier 1 after converting. */
  overIrmaaTier1After: boolean;

  // ── WHAT THIS CONVERSION CAUSED (transition) ─────────────────────────────
  // True only when the conversion is what pushed them over — i.e. when the cost is
  // avoidable by converting less. Use these to price the marginal cost, not to describe
  // the user's situation.
  /** The conversion is what pushed MAGI over the cliff and killed the whole credit. */
  pushesOverAcaCliff: boolean;
  /** The conversion is what crossed IRMAA tier 1. */
  crossesIrmaa: boolean;

  /** How much MAGI room was left before the cliff (negative if already over). */
  acaHeadroomBefore: number;
  /**
   * IRMAA caused by THIS conversion, PER PERSON on Medicare. Zero when they were already
   * over tier 1 (converting more adds no tier-1 cost — though it may reach a tier we do
   * not model). Per-person because we do not know the spouse's age: an MFJ filer whose
   * spouse is under 65 pays this once, not twice.
   */
  irmaaAnnualCostPerPerson: number;
};

/**
 * What a Roth conversion really costs in 2026.
 *
 * Most calculators stop at the income tax. For someone aged 60-64 that is the smaller
 * number: the conversion also raises ACA MAGI, and one dollar over 400% of the poverty
 * line now forfeits the ENTIRE premium tax credit (the enhanced credits expired
 * 2025-12-31). From 63, it separately raises Medicare IRMAA two years later.
 *
 * We report the ACA cliff as a binary — the credit is all-or-nothing — and link to the
 * bridge tool for the dollar value, rather than restating a premium estimate here.
 */
export function rothConversionCost(opts: {
  grossIncome: number;
  conversionAmount: number;
  filing: "single" | "mfj";
  age: number;
  people65Plus: number;
  householdSize: number;
}): ConversionCost {
  const { grossIncome, conversionAmount, filing, age, people65Plus, householdSize } = opts;

  const before = taxableIncome2026(grossIncome, filing, people65Plus);
  const after = taxableIncome2026(grossIncome + conversionAmount, filing, people65Plus);
  const federalTax = federalIncomeTax(after, filing) - federalIncomeTax(before, filing);

  const magiAfter = grossIncome + conversionAmount;
  const acaBefore = acaSubsidyStatus(grossIncome, householdSize);
  const acaAfter = acaSubsidyStatus(magiAfter, householdSize);

  // The cliff only bites while you are bridging to Medicare.
  const preMedicare = age < MEDICARE_2026.eligibilityAge;
  const overAcaCliffAfter = preMedicare && acaAfter.overCliff;
  const pushesOverAcaCliff = overAcaCliffAfter && !acaBefore.overCliff;

  // IRMAA uses income from two years prior, so it starts mattering at 63.
  const irmaaRelevant = age >= MEDICARE_2026.eligibilityAge - MEDICARE_2026.irmaaLookbackYears;
  const overIrmaaTier1After = irmaaRelevant && crossesIrmaaTier1(magiAfter, filing);
  const crossesIrmaa = overIrmaaTier1After && !crossesIrmaaTier1(grossIncome, filing);

  return {
    federalTax,
    effectiveRate: conversionAmount > 0 ? federalTax / conversionAmount : 0,
    magiAfter,
    overAcaCliffAfter,
    overIrmaaTier1After,
    pushesOverAcaCliff,
    crossesIrmaa,
    acaHeadroomBefore: acaBefore.headroomToCliff,
    irmaaAnnualCostPerPerson: crossesIrmaa ? irmaaTier1AnnualSurcharge() : 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Sequence-of-returns risk
// ─────────────────────────────────────────────────────────────────────────────

export type WithdrawalPath = {
  /** End-of-year balance for each year. */
  balances: number[];
  endingBalance: number;
  /** 1-indexed year the money ran out, or null if it survived. */
  depletedInYear: number | null;
};

/**
 * Walk a portfolio through retirement: take the (inflation-adjusted) withdrawal at the
 * START of each year, then apply that year's return to what is left.
 *
 * Taking the withdrawal first is the conservative and realistic ordering — you spend
 * from the balance before the market acts on it — and it is what makes a bad early year
 * permanent: those dollars are gone and cannot participate in the recovery.
 */
export function withdrawalPath(
  startingBalance: number,
  firstYearWithdrawal: number,
  annualReturns: number[],
  inflation: number,
): WithdrawalPath {
  let balance = Math.max(0, startingBalance);
  const balances: number[] = [];
  let depletedInYear: number | null = null;

  annualReturns.forEach((r, i) => {
    if (depletedInYear !== null) {
      balances.push(0);
      return;
    }
    const withdrawal = firstYearWithdrawal * Math.pow(1 + inflation, i);
    balance -= withdrawal;
    if (balance <= 0) {
      depletedInYear = i + 1;
      balance = 0;
    } else {
      balance *= 1 + r;
    }
    balances.push(Math.round(balance));
  });

  return { balances, endingBalance: Math.round(balance), depletedInYear };
}

export type SequenceRiskComparison = {
  /** Arithmetic mean return — IDENTICAL for both orders. That is the whole point. */
  averageReturn: number;
  badFirst: WithdrawalPath;
  goodFirst: WithdrawalPath;
  /** How much the unlucky retiree ends up behind the lucky one, on identical returns. */
  shortfall: number;
};

/**
 * The same returns, in two different orders.
 *
 * Both retirees earn an identical set of annual returns and therefore an identical
 * average — one simply meets the bad years first. Compounding is commutative, so with
 * NO withdrawals both end at exactly the same place. Add withdrawals and they diverge,
 * because selling into a downturn converts a paper loss into a permanent one and shrinks
 * the base that has to recover. This is sequence-of-returns risk, and it is why the first
 * decade of retirement matters more than the twenty years after it.
 */
export function sequenceRiskComparison(opts: {
  balance: number;
  /** First-year withdrawal as a fraction of the starting balance, e.g. 0.04. */
  withdrawalRate: number;
  badReturn: number;
  goodReturn: number;
  inflation: number;
  years?: number;
  badYears?: number;
}): SequenceRiskComparison {
  const years = opts.years ?? 30;
  const badYears = Math.min(opts.badYears ?? 10, years);

  // One multiset of returns, two orderings. Never generate them separately — if the two
  // sequences differed, the comparison would prove nothing.
  const badFirstReturns = [
    ...Array(badYears).fill(opts.badReturn),
    ...Array(years - badYears).fill(opts.goodReturn),
  ];
  const goodFirstReturns = [...badFirstReturns].reverse();

  const firstYearWithdrawal = opts.balance * opts.withdrawalRate;
  const badFirst = withdrawalPath(opts.balance, firstYearWithdrawal, badFirstReturns, opts.inflation);
  const goodFirst = withdrawalPath(opts.balance, firstYearWithdrawal, goodFirstReturns, opts.inflation);

  return {
    averageReturn: badFirstReturns.reduce((a, b) => a + b, 0) / years,
    badFirst,
    goodFirst,
    shortfall: goodFirst.endingBalance - badFirst.endingBalance,
  };
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

export type CatchUpTier = "none" | "standard" | "super";

export type CatchUpPlan2026 = {
  /** Age 50+ — the only people who get a catch-up at all. */
  eligible: boolean;
  tier: CatchUpTier;
  /** Catch-up dollars available on top of the base deferral. */
  catchUp: number;
  baseDeferral: number;
  /** Base + catch-up. Employer contributions sit on top of this, up to the 415(c) limit. */
  maxDeferral: number;
  /** Headroom left this year given what they already defer (never negative). */
  remainingRoom: number;
  /** True when they are already at or above the limit. */
  atLimit: boolean;
  /**
   * SECURE 2.0 §414(v)(7): if prior-year (2025) Social Security wages FROM THE PLAN
   * SPONSOR exceeded $150,000, the catch-up portion MUST be Roth for 2026. Pre-tax is
   * not an option. Only bites if they are catch-up eligible in the first place.
   */
  catchUpMustBeRoth: boolean;
  iraLimit: number;
  iraCatchUp: number;
  iraTotal: number;
  /** Every tax-advantaged employee dollar available: 401(k) deferral + catch-up + IRA. */
  totalTaxAdvantaged: number;
};

/**
 * What an older saver can still put away in 2026, and whether the law forces the
 * catch-up to be Roth.
 *
 * `priorYearFicaWages` = 2025 Social Security wages from the employer sponsoring the
 * plan. Someone with no FICA wages from that employer (e.g. a self-employed partner)
 * is not subject to the Roth mandate, so pass 0.
 *
 * Sources: IRS Notice 2025-67 (limits; $145,000 → $150,000 threshold) and the catch-up
 * final regulations, T.D. 10033 (2025-09-16).
 */
export function catchUpPlan2026(
  age: number,
  priorYearFicaWages: number,
  currentAnnualDeferral: number,
): CatchUpPlan2026 {
  const catchUp = catchUpContribution2026(age);
  const eligible = catchUp > 0;
  const tier: CatchUpTier = !eligible
    ? "none"
    : catchUp === CONTRIBUTION_2026.superCatchUp60to63
      ? "super"
      : "standard";

  const baseDeferral = CONTRIBUTION_2026.electiveDeferral;
  const maxDeferral = baseDeferral + catchUp;
  const deferred = Math.max(0, currentAnnualDeferral);

  const iraCatchUp = age >= 50 ? CONTRIBUTION_2026.iraCatchUp50 : 0;
  const iraTotal = CONTRIBUTION_2026.iraLimit + iraCatchUp;

  return {
    eligible,
    tier,
    catchUp,
    baseDeferral,
    maxDeferral,
    remainingRoom: Math.max(0, maxDeferral - deferred),
    atLimit: deferred >= maxDeferral,
    catchUpMustBeRoth:
      eligible && priorYearFicaWages > CONTRIBUTION_2026.mandatoryRothCatchUpWageThreshold,
    iraLimit: CONTRIBUTION_2026.iraLimit,
    iraCatchUp,
    iraTotal,
    totalTaxAdvantaged: maxDeferral + iraTotal,
  };
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

/**
 * A single 60-year-old sitting at EXACTLY 400% of FPL — the last subsidised dollar.
 * Their benchmark-silver premium is capped at the top applicable percentage of income,
 * so this is what they actually pay.
 */
export function acaBenchmarkCostAtCliffSingle(): number {
  return Math.round(acaSubsidyCliffMagi(1) * ACA_TOP_APPLICABLE_PERCENTAGE);
}

/**
 * The premium tax credit that ONE MORE DOLLAR of MAGI destroys, for that same
 * 60-year-old: the full benchmark premium minus the capped share they were paying.
 *
 * This is the cliff in dollars. It is the number that makes the marginal tax rate on
 * that dollar absurd, and it is the whole reason the 60-64 bracket has to manage MAGI.
 * Uses the national-average age-60 benchmark, so it is an order-of-magnitude figure,
 * not a quote — local benchmark premiums vary materially by county.
 */
export function acaCreditLostAtCliffSingle(): number {
  return Math.max(
    0,
    Math.round(ACA_2026.averageAge60AnnualPremium.benchmarkSilver - acaBenchmarkCostAtCliffSingle()),
  );
}

/** Reference cost for the lost enhanced subsidy in KFF's 60-year-old, $65k scenario. */
export function acaLostEnhancedCreditReference(): number {
  const { annualIncome, benchmarkIncomeCap } = ACA_2026.restoredEnhancedCreditReference;
  return Math.round(ACA_2026.averageAge60AnnualPremium.benchmarkSilver - annualIncome * benchmarkIncomeCap);
}

/**
 * Simplified restored-subsidy benchmark cap for the user's MAGI. Under the expired
 * enhanced credits, households above 400% FPL did not hit a cliff and paid no more
 * than 8.5% of income for the benchmark silver plan. This is a scenario comparison,
 * not a local premium quote.
 */
export function acaRestoredEnhancedBenchmarkCost(magi: number): number {
  return Math.min(
    ACA_2026.averageAge60AnnualPremium.benchmarkSilver,
    Math.max(0, magi * ACA_2026.restoredEnhancedCreditReference.benchmarkIncomeCap),
  );
}

/**
 * The EXPIRED (ARPA/IRA) enhanced applicable-percentage schedule, for the counterfactual.
 *
 * The 8.5% figure everyone quotes was only ever the cap at the TOP of this schedule — the
 * rate paid above 400% FPL, where the enhanced credits removed the cliff entirely. Below
 * that it slid from 0%. Pricing the whole enhanced scenario at a flat 8.5% (which is what
 * `acaRestoredEnhancedBenchmarkCost` does, and is correct only above the cliff) makes the
 * expired subsidy look MORE expensive than current law for lower incomes — so the lost
 * credit floored at $0 for exactly the households that lost the most, in percentage terms.
 */
export const ACA_ENHANCED_APPLICABLE_PERCENTAGE = [
  { lower: 0, upper: 150, initial: 0, final: 0 },
  { lower: 150, upper: 200, initial: 0, final: 0.02 },
  { lower: 200, upper: 250, initial: 0.02, final: 0.04 },
  { lower: 250, upper: 300, initial: 0.04, final: 0.06 },
  { lower: 300, upper: 400, initial: 0.06, final: 0.085 },
] as const;

/** Share of income owed for the benchmark plan under the EXPIRED enhanced schedule. */
export function acaEnhancedApplicablePercentage(fplPct: number): number {
  // Above 400% the enhanced credits had no cliff — you simply paid the 8.5% cap.
  if (fplPct > ACA_2026.subsidyCliffFplPercent) {
    return ACA_2026.restoredEnhancedCreditReference.benchmarkIncomeCap;
  }
  const band = ACA_ENHANCED_APPLICABLE_PERCENTAGE.find(
    (b) => fplPct >= b.lower && fplPct <= b.upper,
  );
  if (!band) return 0;
  if (band.initial === band.final) return band.final;
  const progress = (fplPct - band.lower) / (band.upper - band.lower);
  return band.initial + (band.final - band.initial) * progress;
}

/** What the benchmark plan WOULD cost if the enhanced credits were restored. */
export function acaEnhancedBenchmarkCost(magi: number, householdSize: number): number {
  const pct = acaEnhancedApplicablePercentage(fplPercent(magi, householdSize));
  return Math.round(
    Math.min(ACA_2026.averageAge60AnnualPremium.benchmarkSilver, Math.max(0, magi * pct)),
  );
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
  currentLawBenchmarkCost: number;
  restoredEnhancedBenchmarkCost: number;
  restoredEnhancedBenchmarkSavings: number;
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
  // Both sides of this comparison now use the schedule that ACTUALLY applied to each.
  // Current law = the reverted table (2.10%–9.96%). Enhanced = the expired ARPA sliding
  // scale (0%–8.5%), NOT a flat 8.5% — pricing the enhanced scenario at its top-of-schedule
  // cap made it look dearer than current law for lower incomes, so the lost credit floored
  // at $0 for the households the expiration hit hardest.
  const currentLawBenchmarkCost = acaCurrentLawBenchmarkCost(magi, householdSize);
  const restoredEnhancedBenchmarkCost = acaEnhancedBenchmarkCost(magi, householdSize);
  return {
    fplPercent: pct,
    cliffMagi,
    overCliff: pct > ACA_2026.subsidyCliffFplPercent,
    belowFloor: pct < 100,
    headroomToCliff: cliffMagi - magi,
    currentLawBenchmarkCost,
    restoredEnhancedBenchmarkCost,
    restoredEnhancedBenchmarkSavings: Math.max(0, currentLawBenchmarkCost - restoredEnhancedBenchmarkCost),
  };
}
