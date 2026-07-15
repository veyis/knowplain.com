import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/schema";
import { pageMeta, site } from "@/lib/site";
import { currency } from "@/lib/checkup";
import {
  ACA_2026,
  ACA_APPLICABLE_PERCENTAGE_2026,
  AGE_CURVE_FACTOR,
  CHARITABLE_2026,
  CONTRIBUTION_2026,
  FACT_SOURCES,
  FPL_2025,
  MEDICARE_2026,
  RMD,
  SENIOR_DEDUCTION,
  SOCIAL_SECURITY_2026,
  SWR,
  TAX_2026,
  acaSubsidyCliffMagi,
  benchmarkPremiumForAge,
  rmdDivisor,
  type FactSource,
} from "@/lib/facts-2026";

export const metadata = pageMeta(
  "/sources",
  "The 2026 numbers, and where they come from",
  "Every retirement figure Know Plain uses in 2026 — contribution limits, tax brackets, Social Security, Medicare, and the ACA cliff — with the primary source and the date we last checked it.",
);

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

// The shared currency() rounds to whole dollars, which is fine for a portfolio and wrong
// for a premium: it would print the $202.90 Part B premium as "$203". On a page whose
// whole job is matching the primary source exactly, show the cents.
const exact = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

type Row = [label: string, value: string, note?: string];

function Group({ id, heading, source, rows }: { id: string; heading: string; source: FactSource; rows: Row[] }) {
  return (
    <section id={id} className="mb-8 scroll-mt-24 overflow-hidden rounded-xl border border-border bg-card">
      <header className="border-b border-border p-5">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h2 className="text-base font-semibold tracking-tight">{heading}</h2>
          {source.volatile && (
            <span className="rounded-full border border-amber-300/60 bg-amber-50 px-2 py-0.5 text-[0.7rem] font-semibold text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
              Can change by legislation
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          <a href={source.url} rel="noopener noreferrer" target="_blank" className="underline">
            {source.title}
          </a>{" "}
          — {source.publisher}. Last checked {source.verified}.
        </p>
        {source.note && <p className="mt-2 text-xs text-muted-foreground">{source.note}</p>}
      </header>
      <dl>
        {rows.map(([label, value, note]) => (
          <div
            key={label}
            className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-border px-5 py-3 last:border-0"
          >
            <div className="min-w-0">
              <dt className="text-sm font-medium">{label}</dt>
              {note && <p className="text-xs text-muted-foreground">{note}</p>}
            </div>
            <dd className="shrink-0 text-sm font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default function SourcesPage() {
  return (
    <AppShell active="sources">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: site.url },
            { name: "Sources", url: `${site.url}/sources` },
          ]),
        ]}
      />

      <header className="mb-8 max-w-[760px]">
        <h1 className="mb-3 text-[clamp(1.8rem,4vw,2.5rem)] font-semibold tracking-tight">
          The 2026 numbers, and where they come from
        </h1>
        <p className="text-muted-foreground">
          Every figure on this site is read from one file and cited once. This is that file, in
          public. If a number here is wrong, the calculators are wrong too — so it is worth being
          able to check.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Some figures are marked <strong>can change by legislation</strong>. Those do not follow the
          annual indexing calendar and can move at any time, so we re-check them before every
          update rather than once a year. Spotted something out of date?{" "}
          <Link href="/corrections">Tell us</Link>.
        </p>
      </header>

      <Group
        id="contribution-limits"
        heading="Contribution limits"
        source={FACT_SOURCES.contributions}
        rows={[
          ["401(k) / 403(b) / 457 / TSP elective deferral", currency(CONTRIBUTION_2026.electiveDeferral)],
          ["Catch-up, age 50+", `+ ${currency(CONTRIBUTION_2026.catchUp50)}`],
          [
            "Super catch-up, ages 60-63",
            `+ ${currency(CONTRIBUTION_2026.superCatchUp60to63)}`,
            "Ages 60 to 63 only. At 64 it drops back to the standard catch-up.",
          ],
          ["IRA", currency(CONTRIBUTION_2026.iraLimit)],
          [
            "IRA catch-up, age 50+",
            `+ ${currency(CONTRIBUTION_2026.iraCatchUp50)}`,
            "Indexed for the first time in 2026 — it was $1,000 for years.",
          ],
          [
            "Mandatory Roth catch-up threshold",
            currency(CONTRIBUTION_2026.mandatoryRothCatchUpWageThreshold),
            "If your prior-year Social Security wages from the plan sponsor exceeded this, your catch-up MUST be Roth. Commonly misquoted as $145,000.",
          ],
          [
            "Total employee + employer limit",
            currency(CONTRIBUTION_2026.total415c),
            "The ceiling on everything going into the account.",
          ],
          ["Qualified charitable distribution limit", currency(CONTRIBUTION_2026.qcdLimit)],
        ]}
      />

      <Group
        id="federal-income-tax"
        heading="Federal income tax"
        source={FACT_SOURCES.tax}
        rows={[
          ["Standard deduction — single", currency(TAX_2026.standardDeduction.single)],
          ["Standard deduction — married filing jointly", currency(TAX_2026.standardDeduction.mfj)],
          ["Standard deduction — head of household", currency(TAX_2026.standardDeduction.hoh)],
          [
            "Extra deduction if 65+ or blind",
            `${currency(TAX_2026.additionalDeductionAge65.unmarried)} unmarried / ${currency(TAX_2026.additionalDeductionAge65.married)} married`,
          ],
          [
            "0% capital gains bracket ceiling",
            `${currency(TAX_2026.ltcgZeroBracket.single)} single / ${currency(TAX_2026.ltcgZeroBracket.mfj)} joint`,
            "Long-term gains below this are taxed at zero.",
          ],
          [
            "Charitable deduction without itemising",
            `${currency(CHARITABLE_2026.nonItemizerCashDeduction.single)} / ${currency(CHARITABLE_2026.nonItemizerCashDeduction.mfj)}`,
            `New for 2026, cash gifts only. Itemisers now face a ${pct(CHARITABLE_2026.itemizerAgiFloor)}-of-income floor before charitable gifts count at all.`,
          ],
        ]}
      />

      <Group
        id="senior-deduction"
        heading="The senior deduction"
        source={FACT_SOURCES.seniorDeduction}
        rows={[
          ["Amount, per person aged 65+", currency(SENIOR_DEDUCTION.perPerson65Plus)],
          [
            "Starts phasing out above",
            `${currency(SENIOR_DEDUCTION.phaseOutStart.single)} single / ${currency(SENIOR_DEDUCTION.phaseOutStart.mfj)} joint`,
            `Reduced by ${pct(SENIOR_DEDUCTION.phaseOutRate)} of income above the threshold — per person, not per household.`,
          ],
          [
            "Gone entirely at",
            `${currency(SENIOR_DEDUCTION.fullyPhasedOut.single)} single / ${currency(SENIOR_DEDUCTION.fullyPhasedOut.mfj)} joint`,
          ],
          [
            "Years it applies",
            `${SENIOR_DEDUCTION.firstYear}–${SENIOR_DEDUCTION.lastYear}`,
            "It expires. Plans that assume it lasts forever are wrong.",
          ],
        ]}
      />

      <Group
        id="social-security"
        heading="Social Security"
        source={FACT_SOURCES.socialSecurity}
        rows={[
          ["Cost-of-living adjustment", `+${pct(SOCIAL_SECURITY_2026.cola)}`],
          ["Full retirement age (born 1960 or later)", String(SOCIAL_SECURITY_2026.fullRetirementAgeBornAfter1959)],
          [
            "Claiming at 62",
            "70% of your full benefit",
            "A permanent reduction, not a temporary one.",
          ],
          ["Claiming at 70", "124% of your full benefit", "Delayed credits of 8% a year past full retirement age."],
          ["Maximum taxable earnings", currency(SOCIAL_SECURITY_2026.maxTaxableEarnings)],
          [
            "Earnings test, under full retirement age",
            currency(SOCIAL_SECURITY_2026.earningsTestUnderFra),
            "$1 withheld for every $2 above this — and recalculated upward later, so it is not lost.",
          ],
          ["Maximum benefit at full retirement age", `${currency(SOCIAL_SECURITY_2026.maxBenefitAtFraMonthly)}/mo`],
          [
            "Benefits become taxable above",
            `${currency(SOCIAL_SECURITY_2026.benefitTaxThresholdSingle)} single / ${currency(SOCIAL_SECURITY_2026.benefitTaxThresholdJoint)} joint`,
            "These have never been indexed to inflation — unchanged since the 1980s and 90s, and the 2025 tax law did not touch them.",
          ],
        ]}
      />

      <Group
        id="medicare"
        heading="Medicare"
        source={FACT_SOURCES.medicare}
        rows={[
          ["Eligibility age", String(MEDICARE_2026.eligibilityAge)],
          ["Part B standard premium", `${exact(MEDICARE_2026.partBStandardPremiumMonthly)}/mo`],
          ["Part B deductible", currency(MEDICARE_2026.partBDeductible)],
          ["Part A hospital deductible", `${currency(MEDICARE_2026.partAInpatientDeductible)} per benefit period`],
          [
            "Part D out-of-pocket cap",
            currency(MEDICARE_2026.partDOutOfPocketCap),
            "Up from $2,000 in 2025.",
          ],
          ["Part D maximum deductible", currency(MEDICARE_2026.partDMaxDeductible)],
          [
            "IRMAA surcharge starts above",
            `${currency(MEDICARE_2026.irmaaFirstTierSingle)} single / ${currency(MEDICARE_2026.irmaaFirstTierJoint)} joint`,
            `Based on your income from ${MEDICARE_2026.irmaaLookbackYears} years earlier — so a Roth conversion at 63 lands on your premium at 65.`,
          ],
        ]}
      />

      <Group
        id="aca-cliff"
        heading="Health coverage before 65"
        source={FACT_SOURCES.aca}
        rows={[
          [
            "The subsidy cliff",
            `${ACA_2026.subsidyCliffFplPercent}% of the poverty level`,
            "One dollar over and the premium tax credit is zero — not reduced, gone.",
          ],
          [
            "That cliff, in dollars — one person",
            currency(acaSubsidyCliffMagi(1)),
            `Four times the poverty level of ${currency(FPL_2025.onePerson)}.`,
          ],
          ["That cliff, in dollars — two people", currency(acaSubsidyCliffMagi(2))],
          [
            "Enhanced credits",
            "Expired 2025-12-31",
            "Not extended. This is what brought the cliff back for 2026.",
          ],
        ]}
      />

      <Group
        id="aca-premium-credits"
        heading="What you pay BELOW the cliff"
        source={FACT_SOURCES.acaApplicablePercentage}
        rows={[
          ...ACA_APPLICABLE_PERCENTAGE_2026.map(
            (band): Row => [
              `${band.band} of the poverty level`,
              band.initial === band.final
                ? `${(band.final * 100).toFixed(2)}% of income`
                : `${(band.initial * 100).toFixed(2)}% – ${(band.final * 100).toFixed(2)}% of income`,
            ],
          ),
          [
            "Above 400%",
            "The whole premium",
            "There is no percentage here, because there is no credit. That step is the cliff.",
          ],
        ]}
      />

      <Group
        id="aca-credit-repayment"
        heading="Paying the credit back"
        source={FACT_SOURCES.aptcRepayment}
        rows={[
          [
            "Cap on repaying excess advance credit",
            "None",
            "Repealed for tax years after 2025. There used to be a graduated cap; there is now no limit at any income.",
          ],
          [
            "What that means in practice",
            "Estimate high, not low",
            "An unplanned bonus, capital-gains distribution or Roth conversion in December can claw back the entire year's advance credit. You may also decline the advance credit and claim it at filing instead.",
          ],
        ]}
      />

      <Group
        id="aca-age-rating"
        heading="Why age changes the premium"
        source={FACT_SOURCES.ageCurve}
        rows={[
          ["Age 21 (and under)", `${AGE_CURVE_FACTOR[21].toFixed(3)}×`, "The baseline rate."],
          ["Age 50", `${AGE_CURVE_FACTOR[50].toFixed(3)}×`, `About ${currency(benchmarkPremiumForAge(50))} a year for the benchmark plan.`],
          ["Age 60", `${AGE_CURVE_FACTOR[60].toFixed(3)}×`, `About ${currency(benchmarkPremiumForAge(60))} — the age our published benchmark is quoted for.`],
          [
            "Age 64",
            `${AGE_CURVE_FACTOR[64].toFixed(3)}×`,
            `About ${currency(benchmarkPremiumForAge(64))}. The law caps the ratio at exactly 3:1, and 64 is where it bites.`,
          ],
        ]}
      />

      <Group
        id="rmd-start-age"
        heading="Required minimum distributions"
        source={FACT_SOURCES.rmd}
        rows={[
          [
            "RMDs start at (born 1951–1959)",
            String(RMD.ageBorn1951to1959),
          ],
          [
            "RMDs start at (born 1960 or later)",
            String(RMD.ageBorn1960OrLater),
            "Two ages, not one. Most calculators assume 73 for everyone, which is wrong for anyone born in 1960 or later — and two years of runway is what a conversion plan is built in.",
          ],
        ]}
      />

      <Group
        id="rmd-calculation"
        heading="How the RMD is calculated"
        source={FACT_SOURCES.uniformLifetime}
        rows={[
          [
            "Divisor at 73",
            rmdDivisor(73).toFixed(1),
            `Balance ÷ ${rmdDivisor(73).toFixed(1)} — about ${(100 / rmdDivisor(73)).toFixed(1)}% of the account.`,
          ],
          ["Divisor at 75", rmdDivisor(75).toFixed(1), `About ${(100 / rmdDivisor(75)).toFixed(1)}%.`],
          ["Divisor at 85", rmdDivisor(85).toFixed(1), `About ${(100 / rmdDivisor(85)).toFixed(1)}%.`],
          [
            "Divisor at 95",
            rmdDivisor(95).toFixed(1),
            `About ${(100 / rmdDivisor(95)).toFixed(1)}%. The divisor shrinks every year, so the forced withdrawal grows as a share of the account — which is what lifts your Medicare premium and taxes more of your Social Security.`,
          ],
        ]}
      />

      <Group
        id="withdrawal-rates"
        heading="Safe withdrawal rates"
        source={FACT_SOURCES.swr}
        rows={[
          [
            "Morningstar (forward-looking)",
            pct(SWR.morningstar2026),
            "What survives 90% of simulated futures over 30 years, given today's valuations.",
          ],
          [
            "Bengen (historical worst case)",
            pct(SWR.bengenRevised),
            "The highest rate that would have survived the worst 30-year start in US history, with a more aggressive portfolio.",
          ],
          ["The classic '4% rule'", pct(SWR.classic4Rule), "Famous, and the least useful of the three on its own."],
        ]}
      />

      <p className="max-w-[760px] text-sm leading-relaxed text-muted-foreground">
        These are the figures, not advice about what to do with them. Tax and benefit rules have
        exceptions this page does not cover, and your own situation may not match the assumptions
        behind any of them. For a decision that actually matters, check with a qualified
        professional.
      </p>
    </AppShell>
  );
}
