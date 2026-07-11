"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { trackProductEvent } from "@/lib/analytics";
import { currency, runRetirementCheckup } from "@/lib/checkup";
import { REAL_RETURN, SWR, ssBenefitFactor, ssBreakEvenAge } from "@/lib/facts-2026";

export function OnTrackTool() {
  const [age, setAge] = useState(50);
  const [targetAge, setTargetAge] = useState(67);
  const [savings, setSavings] = useState(250000);
  const [contribution, setContribution] = useState(22000);
  const [spending, setSpending] = useState(76000);
  const [socialSecurity, setSocialSecurity] = useState(30000);

  const result = useMemo(
    () =>
      runRetirementCheckup({
        age,
        targetRetirementAge: targetAge,
        retirementSavings: savings,
        annualContribution: contribution,
        annualSpending: spending,
        socialSecurityAnnual: socialSecurity,
        pensionAnnual: 0,
        debtPaymentsAnnual: 0,
        retireBefore65: targetAge < 65,
        partTimePossible: false,
        spendingFlexibility: "medium",
      }),
    [age, targetAge, savings, contribution, spending, socialSecurity],
  );

  return (
    <ToolFrame
      analyticsName="am-i-on-track"
      inputs={[
        ["Age", age, setAge, { min: 18, max: 90 }],
        ["Target retirement age", targetAge, setTargetAge, { min: 40, max: 90 }],
        ["Current retirement savings", savings, setSavings, { min: 0, max: 50_000_000 }],
        ["Annual contribution", contribution, setContribution, { min: 0, max: 500_000 }],
        ["Annual retirement spending", spending, setSpending, { min: 0, max: 2_000_000 }],
        ["Annual Social Security estimate", socialSecurity, setSocialSecurity, { min: 0, max: 200_000 }],
      ]}
      result={
        <>
          <Metric label="Annual portfolio gap" value={currency(result.annualGap)} />
          <Metric label="Projected savings range" value={`${currency(result.projectedSavingsLow)} - ${currency(result.projectedSavingsHigh)}`} />
          <Metric label="Planning target range" value={`${currency(result.targetPortfolioLow)} - ${currency(result.targetPortfolioHigh)}`} />
          <p className="text-sm leading-relaxed text-muted-foreground">{result.summary}</p>
        </>
      }
      footnote={<OnTrackAssumptions />}
    />
  );
}

/**
 * The standalone tool used to ship no assumptions at all — the /checkup page disclosed
 * them carefully and the tool that actually ranks and gets shared disclosed nothing.
 * Everything here is load-bearing: get the units wrong and the headline number moves ~1.5x.
 */
function OnTrackAssumptions() {
  return (
    <div className="grid gap-2">
      <p>
        <strong className="text-foreground">Everything here is in today&rsquo;s dollars.</strong>{" "}
        Savings grow at {(REAL_RETURN.conservative * 100).toFixed(0)}%&ndash;
        {(REAL_RETURN.optimistic * 100).toFixed(0)}% a year <em>after inflation</em>, so the
        projection and the target are directly comparable. A nominal return compared against a
        today&rsquo;s-dollars target is the most common way a retirement calculator flatters you.
      </p>
      <p>
        <strong className="text-foreground">The target range is bracketed, not averaged.</strong>{" "}
        The low target uses Bengen&rsquo;s revised {(SWR.bengenRevised * 100).toFixed(1)}% (a
        historical worst case); the high target uses Morningstar&rsquo;s{" "}
        {(SWR.morningstar2026 * 100).toFixed(1)}% (forward-looking, 90% success over 30 years). They
        answer different questions, so we show both rather than splitting the difference.
      </p>
      <p className="text-xs">
        Holding your contribution flat in today&rsquo;s dollars assumes you raise it with inflation
        each year. If you never increase it, you will land below this range. Excludes taxes, fees,
        and any return sequence &mdash; the order of returns matters as much as the average, which
        is what the{" "}
        <Link href="/tools/sequence-risk" className="underline">
          sequence-risk tool
        </Link>{" "}
        is for.
      </p>
    </div>
  );
}

export function RetirementAgeTradeoffTool() {
  const [age, setAge] = useState(55);
  const [savings, setSavings] = useState(420000);
  const [contribution, setContribution] = useState(26000);
  const [spending, setSpending] = useState(82000);
  const [socialSecurity, setSocialSecurity] = useState(34000);
  const ages = [60, 62, 65, 67, 70].filter((target) => target > age);

  return (
    <div className="grid gap-5">
      <ToolFrame
        analyticsName="retirement-age-tradeoff"
        inputs={[
          ["Age", age, setAge, { min: 18, max: 90 }],
          ["Current retirement savings", savings, setSavings, { min: 0, max: 50_000_000 }],
          ["Annual contribution", contribution, setContribution, { min: 0, max: 500_000 }],
          ["Annual retirement spending", spending, setSpending, { min: 0, max: 2_000_000 }],
          ["Annual Social Security estimate", socialSecurity, setSocialSecurity, { min: 0, max: 200_000 }],
        ]}
        result={<p className="text-sm text-muted-foreground">Compare how extra working years affect projected savings and healthcare bridge risk.</p>}
      />
      {/* Past 70 every comparison age is behind you, so the table had headers and no rows.
          Say why instead of rendering an empty shell. */}
      {ages.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
          At {age}, every comparison age in this tool (60 to 70) is already behind you — there is no
          &ldquo;work a few more years&rdquo; trade-off left to model. The decisions that still move
          the needle are the withdrawal rate and the order of returns, not the retirement date.
        </div>
      ) : (
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary text-muted-foreground">
            <tr>
              <th className="p-3">Retire at</th>
              <th className="p-3">Years saving</th>
              <th className="p-3">Projected savings</th>
              <th className="p-3">Healthcare note</th>
            </tr>
          </thead>
          <tbody>
            {ages.map((targetAge) => {
              const result = runRetirementCheckup({
                age,
                targetRetirementAge: targetAge,
                retirementSavings: savings,
                annualContribution: contribution,
                annualSpending: spending,
                socialSecurityAnnual: socialSecurity,
                pensionAnnual: 0,
                debtPaymentsAnnual: 0,
                retireBefore65: targetAge < 65,
                partTimePossible: false,
                spendingFlexibility: "medium",
              });
              return (
                <tr key={targetAge} className="border-t border-border">
                  <td className="p-3 font-medium">{targetAge}</td>
                  <td className="p-3">{result.yearsToRetirement}</td>
                  <td className="p-3">{currency(result.projectedSavingsLow)} - {currency(result.projectedSavingsHigh)}</td>
                  <td className="p-3">{targetAge < 65 ? "Plan an ACA/COBRA/spouse coverage bridge." : "Medicare timing still needs review."}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}

/** Renders a break-even age, or says "never" — `Infinity.toFixed(1)` prints "Infinity". */
const breakEven = (age: number) => (Number.isFinite(age) ? `age ${age.toFixed(1)}` : "never");

export function SocialSecurityBreakEvenTool() {
  const [fraBenefit, setFraBenefit] = useState(2500);
  // FRA is not a free number — statute gives 65, 66, or 67 by birth year. It used to be a
  // bare number input, so clearing it (Number("") === 0) produced a 596% benefit factor.
  const [fra, setFra] = useState(67);
  // Benefit factors depend on FRA (SSA rules), not fixed 0.7/1.24 — see facts-2026.
  const early = Math.round(fraBenefit * ssBenefitFactor(fra, 62));
  const delayed = Math.round(fraBenefit * ssBenefitFactor(fra, 70));
  const breakEvenEarlyFra = ssBreakEvenAge(fraBenefit, fra, 62, fra);
  const breakEvenFraDelayed = ssBreakEvenAge(fraBenefit, fra, fra, 70);

  return (
    <ToolFrame
      analyticsName="social-security-break-even"
      inputs={[
        [
          "Estimated monthly benefit at full retirement age",
          fraBenefit,
          setFraBenefit,
          { min: 0, max: 10_000 },
        ],
        ["Full retirement age (65–67)", fra, setFra, { min: 65, max: 67 }],
      ]}
      result={
        <>
          <Metric label="Claim at 62 estimate" value={currency(early)} />
          <Metric label="Claim at full retirement age" value={currency(fraBenefit)} />
          <Metric label="Claim at 70 estimate" value={currency(delayed)} />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Rough break-even: {breakEven(breakEvenEarlyFra)} for 62 vs full retirement age, and{" "}
            {breakEven(breakEvenFraDelayed)} for full retirement age vs 70. This excludes taxes,
            survivor benefits, investment returns, and health.
          </p>
        </>
      }
      footnote={
        <p>
          <strong className="text-foreground">Break-even is not the whole decision.</strong> It
          treats Social Security as an investment to be maximised, when its real job is insurance
          against living a long time and against a surviving spouse being left on the smaller
          benefit. If you are the higher earner in a couple, your claiming age sets the{" "}
          <em>survivor</em> benefit for whoever outlives you &mdash; which is a reason to delay that
          break-even arithmetic never sees.{" "}
          <Link href="/topics/retirement/social-security-timing" className="underline">
            The full decision
          </Link>
          .
        </p>
      }
    />
  );
}

// SimpleAssumptionTool lived here and backed three tools through a `kind` switch. All
// three now have real implementations, so it is gone:
//   catch-up   -> CatchUpPlannerTool  (the old one was blind to age and wages, and would
//                 suggest a pre-tax catch-up the law no longer permits)
//   sequence   -> SequenceRiskTool    (the old one did no sequencing at all)
//   inflation  -> SpendingPlannerTool (the old one applied one rate to the whole budget,
//                 which quietly assumes healthcare behaves like groceries)

/** Bounds for a numeric input. Every field gets them — an unbounded money input is a bug. */
type Bounds = { min: number; max: number };

type ToolInput = [string, number, (value: number) => void, Bounds];

function ToolFrame({
  analyticsName,
  inputs,
  result,
  footnote,
}: {
  analyticsName: string;
  inputs: ToolInput[];
  result: React.ReactNode;
  footnote?: React.ReactNode;
}) {
  const tracked = useRef(false);

  const trackUsed = () => {
    if (tracked.current) return;
    tracked.current = true;
    trackProductEvent("Tool Used", { tool: analyticsName });
  };

  return (
    <div className="grid gap-5">
      <div className="grid gap-5 rounded-xl border border-border bg-card p-5 lg:grid-cols-[320px_1fr]">
        <div className="grid gap-4">
          {inputs.map(([label, value, setValue, bounds]) => (
            <label key={label} className="grid gap-1.5 text-sm font-medium">
              {label}
              <input
                type="number"
                value={value}
                min={bounds.min}
                max={bounds.max}
                // Clamp on the way in. `min`/`max` are advisory in HTML — typing past them,
                // or clearing the field (Number("") === 0), still reaches the model.
                onChange={(e) => {
                  trackUsed();
                  const n = Number(e.target.value);
                  setValue(
                    Number.isFinite(n) ? Math.min(bounds.max, Math.max(bounds.min, n)) : bounds.min,
                  );
                }}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-hidden focus:border-foreground"
              />
            </label>
          ))}
        </div>
        <div className="grid content-start gap-3 rounded-lg bg-secondary/70 p-4">{result}</div>
      </div>
      {footnote && (
        <div className="rounded-xl border border-border bg-card p-5 text-sm leading-relaxed text-muted-foreground">
          {footnote}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold tracking-tight">{value}</p>
    </div>
  );
}
