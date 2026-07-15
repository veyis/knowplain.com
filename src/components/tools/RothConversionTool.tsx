"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Check, Info } from "lucide-react";
import { trackProductEvent } from "@/lib/analytics";
import { currency } from "@/lib/checkup";
import { MEDICARE_2026, acaSubsidyCliffMagi, rmdStartAge, rothConversionCost } from "@/lib/facts-2026";
import { ToolField } from "./ToolField";

export function RothConversionTool() {
  const [filing, setFiling] = useState<"single" | "mfj">("single");
  const [age, setAge] = useState(61);
  const [householdSize, setHouseholdSize] = useState(1);
  const [grossIncome, setGrossIncome] = useState(55_000);
  const [conversion, setConversion] = useState(15_000);
  const tracked = useRef(false);

  const track = () => {
    if (tracked.current) return;
    tracked.current = true;
    trackProductEvent("Tool Used", { tool: "roth-vs-traditional" });
  };

  const people65Plus = age >= 65 ? (filing === "mfj" ? 2 : 1) : 0;

  const cost = useMemo(
    () =>
      rothConversionCost({
        grossIncome,
        conversionAmount: conversion,
        filing,
        age,
        people65Plus,
        householdSize,
      }),
    [grossIncome, conversion, filing, age, people65Plus, householdSize],
  );

  const cliffMagi = acaSubsidyCliffMagi(householdSize);
  const preMedicare = age < MEDICARE_2026.eligibilityAge;
  const estimatedBirthYear = 2026 - age;
  const rmdAge = rmdStartAge(estimatedBirthYear);
  const calendarEndAge = Math.min(99, Math.max(age, 75, age + 10));
  const calendarRows = Array.from({ length: calendarEndAge - age + 1 }, (_, index) => {
    const rowAge = age + index;
    return {
      year: 2026 + index,
      age: rowAge,
      coverage: rowAge < 65 ? "Marketplace / employer / other pre-Medicare coverage" : "Medicare",
      conversionEffect: rowAge < 65
        ? "Conversion counts in ACA MAGI if using Marketplace coverage"
        : rowAge >= 63
          ? `Income can affect Medicare premiums at ${rowAge + MEDICARE_2026.irmaaLookbackYears}`
          : "No ACA credit; Medicare rules apply",
      socialSecurity: rowAge < 62 ? "Before earliest retirement-benefit claim age" : rowAge < 70 ? "Social Security claiming window" : "Delayed retirement credits no longer increase after 70",
      rmd: rowAge < rmdAge ? `Before RMD age ${rmdAge}` : rowAge === rmdAge ? "First RMD year under current law" : "RMD years",
    };
  });
  // Gate the all-clear on where they LAND, not on what this conversion changed. Someone
  // already over the cliff used to see "this keeps you under the cliff" — false, and it
  // buried the one thing they needed to hear (see the already-over panel below).
  const allClear = !cost.overAcaCliffAfter && !cost.overIrmaaTier1After;

  const field =
    "min-h-11 min-w-0 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-hidden focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40";

  return (
    <div className="grid gap-5">
      <div className="grid min-w-0 gap-5 rounded-xl border border-border bg-card p-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        <fieldset className="calculator-inputs grid min-w-0 content-start gap-4">
          <legend className="sr-only">Roth conversion inputs</legend>
          <label className="grid gap-1.5 text-sm font-medium">
            Filing status
            <select
              value={filing}
              onChange={(e) => {
                track();
                setFiling(e.target.value as "single" | "mfj");
              }}
              className={field}
            >
              <option value="single">Single</option>
              <option value="mfj">Married, filing jointly</option>
            </select>
          </label>
          <ToolField label="Your age" value={age} min={18} max={99} onChange={(value) => { track(); setAge(value); }} />
          <ToolField label="Household size" value={householdSize} min={1} max={20} onChange={(value) => { track(); setHouseholdSize(value); }} />
          <ToolField label="Income before converting" value={grossIncome} min={0} max={5_000_000} onChange={(value) => { track(); setGrossIncome(value); }} />
          <ToolField label="Amount to convert to Roth" value={conversion} min={0} max={5_000_000} step={1000} onChange={(value) => { track(); setConversion(value); }} />
        </fieldset>

        <div className="grid content-start gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Converting {currency(conversion)} at an effective rate of{" "}
              {(cost.effectiveRate * 100).toFixed(1)}%
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              {/* Only claim the tax is the smaller cost when it actually is. Losing the
                  whole ACA credit runs to five figures; an IRMAA tier does not, so that
                  case gets an honest "plus" rather than an overclaim. */}
              {cost.pushesOverAcaCliff
                ? "The tax bill is the smaller half of this."
                : cost.crossesIrmaa
                  ? `${currency(cost.federalTax)} in tax now — plus a Medicare surcharge later.`
                  : `Federal tax on the conversion: ${currency(cost.federalTax)}.`}
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-secondary p-3">
              <p className="text-xs text-muted-foreground">Federal income tax now</p>
              <strong>{currency(cost.federalTax)}</strong>
            </div>
            <div className="rounded-lg bg-secondary p-3">
              <p className="text-xs text-muted-foreground">Income after converting</p>
              <strong>{currency(cost.magiAfter)}</strong>
            </div>
          </div>

          {cost.pushesOverAcaCliff && (
            <div className="flex gap-3 rounded-lg border border-red-300/60 bg-red-50 p-4 text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <div className="text-sm">
                <strong className="block">
                  This conversion pushes you over the ACA subsidy cliff.
                </strong>{" "}
                You had {currency(cost.acaHeadroomBefore)} of income room before the cliff at{" "}
                {currency(cliffMagi)}. Converting {currency(conversion)} takes you past it — and one
                dollar over means you lose your <em>entire</em> premium tax credit for the year, not
                a slice of it. For a 60-year-old that is frequently worth more than five figures.{" "}
                <Link href="/tools/aca-bridge" className="underline">
                  See what it costs
                </Link>
                . Converting {currency(Math.max(0, cost.acaHeadroomBefore))} or less would stay under
                it.
              </div>
            </div>
          )}

          {/* Already over before converting. The credit is gone either way, so the marginal
              cost of converting is LOWER, not higher — the opposite of what the old
              transition-only logic implied by falling through to the all-clear. */}
          {cost.overAcaCliffAfter && !cost.pushesOverAcaCliff && (
            <div className="flex gap-3 rounded-lg border border-slate-300/60 bg-slate-50 p-4 text-slate-900 dark:border-slate-700/50 dark:bg-slate-900/40 dark:text-slate-200">
              <Info className="mt-0.5 size-4 shrink-0" />
              <div className="text-sm">
                <strong className="block">
                  You are already over the ACA cliff — before converting anything.
                </strong>{" "}
                At {currency(grossIncome)} you are past the {currency(cliffMagi)} cliff for a
                household of {householdSize}, so your premium tax credit is already $0. Converting
                does not cost you a subsidy you no longer have. Counter-intuitively, this makes the
                conversion <em>cheaper</em> at the margin than it would be for someone sitting just
                under the line — the tax bill is the whole cost. If you can get back under the cliff
                by other means, that is worth far more than the conversion decision itself.
              </div>
            </div>
          )}

          {cost.crossesIrmaa && (
            <div className="flex gap-3 rounded-lg border border-amber-300/60 bg-amber-50 p-4 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <div className="text-sm">
                <strong className="block">
                  This raises your Medicare premium at age {age + MEDICARE_2026.irmaaLookbackYears}.
                </strong>{" "}
                Medicare looks back two years at your income, so a conversion at {age} lands on your
                premium at {age + MEDICARE_2026.irmaaLookbackYears}. Crossing the first IRMAA tier
                costs about {currency(cost.irmaaAnnualCostPerPerson)} for that year,{" "}
                <em>per person on Medicare</em> — double it if your spouse is enrolled too. Higher
                incomes hit higher tiers, which cost considerably more.
              </div>
            </div>
          )}

          {cost.overIrmaaTier1After && !cost.crossesIrmaa && (
            <div className="flex gap-3 rounded-lg border border-amber-300/60 bg-amber-50 p-4 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <div className="text-sm">
                <strong className="block">
                  Your income is already above the first IRMAA tier.
                </strong>{" "}
                At {currency(cost.magiAfter)} you are over the{" "}
                {currency(
                  filing === "mfj"
                    ? MEDICARE_2026.irmaaFirstTierJoint
                    : MEDICARE_2026.irmaaFirstTierSingle,
                )}{" "}
                threshold, so a Medicare surcharge already applies at age{" "}
                {age + MEDICARE_2026.irmaaLookbackYears}. This tool models the first tier only —
                converting further can reach higher tiers, which cost considerably more than the
                figure above.
              </div>
            </div>
          )}

          {allClear && conversion > 0 && (
            <div className="flex gap-3 rounded-lg border border-emerald-300/60 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
              <Check className="mt-0.5 size-4 shrink-0" />
              <div className="text-sm">
                <strong className="block">No cliff, no surcharge — just the tax.</strong>{" "}
                {preMedicare
                  ? `This conversion keeps you under the ${currency(cliffMagi)} ACA cliff and below the first IRMAA tier.`
                  : "You are past the ACA bridge years, and this stays below the first IRMAA tier."}{" "}
                Whether it is worth doing still turns on the original question: is your tax rate
                higher today, or in retirement?
              </div>
            </div>
          )}
        </div>
      </div>

      <section aria-labelledby="roth-conversion-calendar-heading" className="rounded-xl border border-border bg-card p-5">
        <h2 id="roth-conversion-calendar-heading" className="text-lg font-semibold tracking-tight">Roth conversion calendar: what each year touches</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">This is a coordination map, not a schedule telling you to convert. It uses age {age} in 2026 to estimate birth year {estimatedBirthYear}; confirm exact birthday-based rules before acting.</p>
        <div className="mt-4 overflow-x-auto" role="region" aria-label="Roth conversion planning calendar" tabIndex={0}>
          <table className="min-w-[880px] w-full text-left text-sm">
            <caption className="sr-only">Annual Roth conversion considerations for ACA coverage, Medicare, Social Security, and required minimum distributions</caption>
            <thead><tr className="border-b border-border"><th className="p-2">Year / age</th><th className="p-2">Coverage</th><th className="p-2">Income interaction</th><th className="p-2">Social Security</th><th className="p-2">RMD context</th></tr></thead>
            <tbody>{calendarRows.map((row) => (
              <tr key={row.year} className={`border-b border-border last:border-0 ${row.age === 63 || row.age === 65 || row.age === rmdAge ? "bg-secondary/70" : ""}`}>
                <td className="p-2 font-semibold tabular-nums">{row.year}<span className="block text-xs font-normal text-muted-foreground">Age {row.age}</span></td>
                <td className="p-2">{row.coverage}</td>
                <td className="p-2">{row.conversionEffect}</td>
                <td className="p-2">{row.socialSecurity}</td>
                <td className="p-2">{row.rmd}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Highlighted transition rows include age 63 (the tax year generally used for age-65 IRMAA), age 65 (Medicare eligibility), and the estimated RMD start age. Actual Marketplace enrollment, employer coverage, filing status, Social Security timing, and workplace-plan exceptions can change the relevance of a row.</p>
      </section>

      <div className="grid gap-2 rounded-xl border border-border bg-card p-5 text-sm leading-relaxed text-muted-foreground">
        <p>
          <strong className="text-foreground">The decision in one line.</strong> Convert to Roth if
          your tax rate is <em>lower</em> today than it will be in retirement; stay traditional if it
          is higher. Nobody knows their future rate for certain, which is why splitting between the
          two is a reasonable hedge — and why capturing the full employer match beats this question
          entirely.
        </p>
        <p>
          <strong className="text-foreground">What most calculators miss.</strong> Between 60 and 65
          the income tax is often the <em>smaller</em> cost. A conversion raises the income figure
          used for ACA subsidies, and since the enhanced credits expired at the end of 2025, one
          dollar over 400% of the poverty line forfeits the whole credit. From 63, it separately
          raises your Medicare premium two years later. These are the years to convert
          deliberately, not casually.
        </p>
        <p className="text-xs">
          Federal tax only — it ignores state tax, capital gains stacking, and the taxation of Social
          Security benefits, and it models the first IRMAA tier only (higher tiers cost more). ACA
          MAGI counts traditional withdrawals, conversions, capital gains, pensions and{" "}
          <em>all</em> Social Security benefits; Roth withdrawals do not count. An educational
          estimate, not tax advice — a conversion is exactly the decision worth checking with a
          qualified professional.
        </p>
      </div>
    </div>
  );
}
