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
  CONTRIBUTION_2026,
  FPL_2025,
  MEDICARE_2026,
  RMD,
  SENIOR_DEDUCTION,
  SOCIAL_SECURITY_2026,
  SWR,
  TAX_2026,
  acaSubsidyCliffMagi,
  irmaaTier1AnnualSurcharge,
} from "./facts-2026";

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const usdCents = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
/** Trims a trailing ".0" so 4.0% reads "4%" but 3.9% keeps its digit. */
const pct = (rate: number) => `${(rate * 100).toFixed(1).replace(/\.0$/, "")}%`;
/** Portfolio multiple implied by a withdrawal rate: 3.9% → "25.6×". */
const multiple = (rate: number) => `${(1 / rate).toFixed(1)}×`;

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
  "fpl.onePerson": usd(FPL_2025.onePerson),
  "fpl.perAdditional": usd(FPL_2025.perAdditionalPerson),
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
