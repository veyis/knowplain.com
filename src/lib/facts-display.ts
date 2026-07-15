/**
 * Display strings for every 2026 fact an article is allowed to quote.
 *
 * WHY THIS EXISTS: article prose used to hand-type its numbers, and they drifted from
 * `facts-2026.ts` — the 4% rule page told readers Morningstar said "3.3–4%" while the
 * fact file said 3.9%, and nothing caught it. A number a reader can act on must have
 * exactly one definition. Prose now writes `<Fact id="swr.morningstar" />` and the value
 * comes from the same constant the calculators use.
 *
 * Adding a number to an article means adding it HERE, sourced, not typing it into MDX.
 */
import {
  ACA_2026,
  ACA_APPLICABLE_PERCENTAGE_2026,
  ACA_TOP_APPLICABLE_PERCENTAGE,
  CHARITABLE_2026,
  CONTRIBUTION_2026,
  FPL_2025,
  MEDICAID_EXPANSION_FPL_PERCENT,
  MEDICARE_2026,
  RMD,
  SAVERS_MATCH_2027,
  SENIOR_DEDUCTION,
  SOCIAL_SECURITY_2026,
  SWR,
  TAX_2026,
  acaBenchmarkCostAtCliffSingle,
  acaCreditLostAtCliffSingle,
  acaSubsidyCliffMagi,
  federalPovertyLevel,
  irmaaTier1AnnualSurcharge,
  // Explicit .ts so `node --test` and build-time scripts can import this directly,
  // matching checkup.ts. Next resolves either form.
} from "./facts-2026.ts";

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const usdCents = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
/** Trims a trailing ".0" so 4.0% reads "4%" but 3.9% keeps its digit. */
const pct = (rate: number) => `${(rate * 100).toFixed(1).replace(/\.0$/, "")}%`;
/** Portfolio multiple implied by a withdrawal rate: 3.9% → "25.6×". */
const multiple = (rate: number) => `${(1 / rate).toFixed(1)}×`;

/**
 * The IRS publishes the applicable percentages to two decimals (2.10%, 9.96%). Keep them
 * that way — this table is quoted against Rev. Proc. 2025-25 and "2.1%" would not match.
 */
const pct2 = (rate: number) => `${(rate * 100).toFixed(2)}%`;
/** A band of the applicable percentage table: a single rate, or the range it slides across. */
const bandPct = (i: number) => {
  const { initial, final } = ACA_APPLICABLE_PERCENTAGE_2026[i];
  return initial === final ? pct2(final) : `${pct2(initial)}–${pct2(final)}`;
};
/** N% of the federal poverty level for a household of `size`, as a dollar string. */
const fplAt = (percent: number, size: number) =>
  usd((federalPovertyLevel(size) * percent) / 100);

export const FACTS = {
  // ── Safe withdrawal rates ────────────────────────────────────────────────
  "swr.morningstar": pct(SWR.morningstar2026),
  "swr.bengen": pct(SWR.bengenRevised),
  "swr.classic": pct(SWR.classic4Rule),
  "swr.morningstar.multiple": multiple(SWR.morningstar2026),
  "swr.bengen.multiple": multiple(SWR.bengenRevised),
  "swr.classic.multiple": multiple(SWR.classic4Rule),
  // What $1M actually supports in year one, at each canonical rate.
  "swr.morningstar.on1m": usd(1_000_000 * SWR.morningstar2026),
  "swr.bengen.on1m": usd(1_000_000 * SWR.bengenRevised),

  // ── Contribution limits (IRS Notice 2025-67) ─────────────────────────────
  "401k.deferral": usd(CONTRIBUTION_2026.electiveDeferral),
  "401k.catchUp50": usd(CONTRIBUTION_2026.catchUp50),
  "401k.superCatchUp": usd(CONTRIBUTION_2026.superCatchUp60to63),
  "401k.maxAt50": usd(CONTRIBUTION_2026.electiveDeferral + CONTRIBUTION_2026.catchUp50),
  "401k.maxAt60": usd(CONTRIBUTION_2026.electiveDeferral + CONTRIBUTION_2026.superCatchUp60to63),
  "401k.total415c": usd(CONTRIBUTION_2026.total415c),
  "401k.mandatoryRothWageThreshold": usd(CONTRIBUTION_2026.mandatoryRothCatchUpWageThreshold),
  "ira.limit": usd(CONTRIBUTION_2026.iraLimit),
  "ira.catchUp50": usd(CONTRIBUTION_2026.iraCatchUp50),
  "ira.maxAt50": usd(CONTRIBUTION_2026.iraLimit + CONTRIBUTION_2026.iraCatchUp50),
  "ira.qcdLimit": usd(CONTRIBUTION_2026.qcdLimit),
  "roth.phaseOutSingle": `${usd(CONTRIBUTION_2026.rothIraPhaseOutSingle[0])}–${usd(CONTRIBUTION_2026.rothIraPhaseOutSingle[1])}`,
  "roth.phaseOutJoint": `${usd(CONTRIBUTION_2026.rothIraPhaseOutJoint[0])}–${usd(CONTRIBUTION_2026.rothIraPhaseOutJoint[1])}`,

  // ── Tax (IRS Rev. Proc. 2025-32) ─────────────────────────────────────────
  "tax.standardDeductionSingle": usd(TAX_2026.standardDeduction.single),
  "tax.standardDeductionMfj": usd(TAX_2026.standardDeduction.mfj),
  "tax.seniorDeduction": usd(SENIOR_DEDUCTION.perPerson65Plus),
  "tax.seniorDeductionCouple": usd(SENIOR_DEDUCTION.perPerson65Plus * 2),
  "tax.seniorDeductionLastYear": String(SENIOR_DEDUCTION.lastYear),
  "charitable.nonItemizerSingle": usd(CHARITABLE_2026.nonItemizerCashDeduction.single),
  "charitable.nonItemizerMfj": usd(CHARITABLE_2026.nonItemizerCashDeduction.mfj),

  // ── Social Security (SSA 2026) ───────────────────────────────────────────
  "ss.cola": pct(SOCIAL_SECURITY_2026.cola),
  "ss.fra": String(SOCIAL_SECURITY_2026.fullRetirementAgeBornAfter1959),
  "ss.earliestClaim": String(SOCIAL_SECURITY_2026.earliestClaimAge),
  "ss.maxDelayAge": String(SOCIAL_SECURITY_2026.maxDelayAge),
  "ss.earningsTestUnderFra": usd(SOCIAL_SECURITY_2026.earningsTestUnderFra),
  "ss.earningsTestFraYear": usd(SOCIAL_SECURITY_2026.earningsTestFraYear),
  "ss.maxBenefitAtFra": usd(SOCIAL_SECURITY_2026.maxBenefitAtFraMonthly),
  "ss.averageBenefit": usd(SOCIAL_SECURITY_2026.averageRetiredWorkerMonthly),
  "ss.maxTaxableEarnings": usd(SOCIAL_SECURITY_2026.maxTaxableEarnings),
  "ss.taxThresholdSingle": usd(SOCIAL_SECURITY_2026.benefitTaxThresholdSingle),
  "ss.taxThresholdJoint": usd(SOCIAL_SECURITY_2026.benefitTaxThresholdJoint),
  // The 85% tier. Unindexed like the pair above, and equally untouched by OBBBA.
  "ss.taxThreshold85Single": usd(SOCIAL_SECURITY_2026.benefitTax85ThresholdSingle),
  "ss.taxThreshold85Joint": usd(SOCIAL_SECURITY_2026.benefitTax85ThresholdJoint),

  // ── Bracket ceilings (indexed — worked examples must not hand-type these) ──
  "tax.bracket12TopSingle": usd(TAX_2026.bracketsSingle[1][1]),
  "tax.bracket12TopMfj": usd(TAX_2026.bracketsMfj[1][1]),

  // The 0% long-term capital gains band: taxable income below this pays nothing on
  // realised long-term gains. It is NOT the same ceiling as the 12% ordinary bracket —
  // close, but a different number, and conflating the two is a common prose error.
  "tax.ltcgZeroBracketSingle": usd(TAX_2026.ltcgZeroBracket.single),
  "tax.ltcgZeroBracketMfj": usd(TAX_2026.ltcgZeroBracket.mfj),

  // ── Saver's Match (SECURE 2.0, from tax year 2027) ───────────────────────
  "saversMatch.rate": pct(SAVERS_MATCH_2027.matchRate),
  "saversMatch.maxContribution": usd(SAVERS_MATCH_2027.maxMatchedContribution),
  "saversMatch.maxMatch": usd(SAVERS_MATCH_2027.maxMatch),

  // ── Medicare (CMS 2026) ──────────────────────────────────────────────────
  "medicare.eligibilityAge": String(MEDICARE_2026.eligibilityAge),
  "medicare.partBPremium": usdCents(MEDICARE_2026.partBStandardPremiumMonthly),
  "medicare.partBDeductible": usd(MEDICARE_2026.partBDeductible),
  "medicare.partDCap": usd(MEDICARE_2026.partDOutOfPocketCap),
  "medicare.irmaaTier1Single": usd(MEDICARE_2026.irmaaFirstTierSingle),
  "medicare.irmaaTier1Joint": usd(MEDICARE_2026.irmaaFirstTierJoint),
  "medicare.irmaaTier1Cost": usd(irmaaTier1AnnualSurcharge()),
  "medicare.irmaaLookback": String(MEDICARE_2026.irmaaLookbackYears),

  // ── RMDs (SECURE 2.0) ────────────────────────────────────────────────────
  "rmd.ageBorn1951to1959": String(RMD.ageBorn1951to1959),
  "rmd.ageBorn1960OrLater": String(RMD.ageBorn1960OrLater),

  // ── ACA (post-enhanced-subsidy, 2026) ────────────────────────────────────
  "aca.cliffPercent": `${ACA_2026.subsidyCliffFplPercent}%`,
  "aca.cliffSingle": usd(acaSubsidyCliffMagi(1)),
  "aca.cliffCouple": usd(acaSubsidyCliffMagi(2)),
  "aca.cliffFamily4": usd(acaSubsidyCliffMagi(4)),
  "aca.benchmarkSilver": usd(ACA_2026.averageAge60AnnualPremium.benchmarkSilver),
  "aca.lowestBronze": usd(ACA_2026.averageAge60AnnualPremium.lowestCostBronze),
  "aca.lostCreditAt65k": usd(ACA_2026.restoredEnhancedCreditReference.annualIncreaseAfterExpiration),

  // The applicable percentage table (IRS Rev. Proc. 2025-25) — the cap that did NOT
  // disappear when the enhanced credits expired. It got narrower and harsher.
  "aca.applicablePctMin": pct2(ACA_APPLICABLE_PERCENTAGE_2026[0].final),
  "aca.applicablePctMax": pct2(ACA_TOP_APPLICABLE_PERCENTAGE),
  "aca.applicablePct.under133": bandPct(0),
  "aca.applicablePct.133to150": bandPct(1),
  "aca.applicablePct.150to200": bandPct(2),
  "aca.applicablePct.200to250": bandPct(3),
  "aca.applicablePct.250to300": bandPct(4),
  "aca.applicablePct.300to400": bandPct(5),

  // The cliff, in dollars, for a single 60-year-old at exactly 400% FPL.
  "aca.cliffEdgeBenchmarkCost": usd(acaBenchmarkCostAtCliffSingle()),
  "aca.cliffEdgeCreditLost": usd(acaCreditLostAtCliffSingle()),

  // FPL by household size. Plan-year 2026 is measured against the 2025 guidelines.
  "fpl.onePerson": usd(FPL_2025.onePerson),
  "fpl.perAdditional": usd(FPL_2025.perAdditionalPerson),
  "fpl.twoPerson": usd(federalPovertyLevel(2)),
  "fpl.fourPerson": usd(federalPovertyLevel(4)),
  // Each extra household member raises the cliff by 400% of the per-person FPL step.
  "aca.cliffPerAdditionalPerson": usd(
    (FPL_2025.perAdditionalPerson * ACA_2026.subsidyCliffFplPercent) / 100,
  ),
  "fpl.medicaidPercent": `${MEDICAID_EXPANSION_FPL_PERCENT}%`,
  "fpl.medicaid138Single": fplAt(MEDICAID_EXPANSION_FPL_PERCENT, 1),
  "fpl.medicaid138Couple": fplAt(MEDICAID_EXPANSION_FPL_PERCENT, 2),
  "fpl.medicaid138Family4": fplAt(MEDICAID_EXPANSION_FPL_PERCENT, 4),
} as const;

export type FactId = keyof typeof FACTS;

/**
 * Look up a fact for MDX. Throws on an unknown id rather than rendering an empty span —
 * a silently-missing number in a money article is the failure mode this whole file exists
 * to prevent, so it should break the build, not the reader's plan.
 */
export function fact(id: string): string {
  const value = FACTS[id as FactId];
  if (value === undefined) {
    throw new Error(
      `Unknown <Fact id="${id}" />. Add it to src/lib/facts-display.ts, sourced from facts-2026.ts — do not hand-type the number into MDX.`,
    );
  }
  return value;
}

/**
 * Resolve `{{fact.id}}` tokens inside a plain string.
 *
 * Frontmatter is YAML, so `<Fact>` cannot render there — which left `plainAnswer`,
 * `description`, and every FAQ answer hand-typing their 2026 figures. That is the ONE
 * surface with no drift protection, and it is the highest-visibility text on the page:
 * `plainAnswer` is the featured-snippet play and `description` becomes the meta tag.
 *
 * Same guarantee as `<Fact>` — an unknown id throws instead of silently rendering nothing.
 */
export function resolveFacts(text: string): string {
  return text.replace(/\{\{([A-Za-z0-9.]+)\}\}/g, (_, id: string) => fact(id));
}
