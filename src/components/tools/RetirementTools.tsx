"use client";

import { useMemo, useRef, useState } from "react";
import { trackProductEvent } from "@/lib/analytics";
import { currency, runRetirementCheckup } from "@/lib/checkup";
import { ssBenefitFactor, ssBreakEvenAge } from "@/lib/facts-2026";

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
        ["Age", age, setAge],
        ["Target retirement age", targetAge, setTargetAge],
        ["Current retirement savings", savings, setSavings],
        ["Annual contribution", contribution, setContribution],
        ["Annual retirement spending", spending, setSpending],
        ["Annual Social Security estimate", socialSecurity, setSocialSecurity],
      ]}
      result={
        <>
          <Metric label="Annual portfolio gap" value={currency(result.annualGap)} />
          <Metric label="Projected savings range" value={`${currency(result.projectedSavingsLow)} - ${currency(result.projectedSavingsHigh)}`} />
          <Metric label="Planning target range" value={`${currency(result.targetPortfolioLow)} - ${currency(result.targetPortfolioHigh)}`} />
          <p className="text-sm leading-relaxed text-muted-foreground">{result.summary}</p>
        </>
      }
    />
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
          ["Age", age, setAge],
          ["Current retirement savings", savings, setSavings],
          ["Annual contribution", contribution, setContribution],
          ["Annual retirement spending", spending, setSpending],
          ["Annual Social Security estimate", socialSecurity, setSocialSecurity],
        ]}
        result={<p className="text-sm text-muted-foreground">Compare how extra working years affect projected savings and healthcare bridge risk.</p>}
      />
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
    </div>
  );
}

export function SocialSecurityBreakEvenTool() {
  const [fraBenefit, setFraBenefit] = useState(2500);
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
        ["Estimated monthly benefit at full retirement age", fraBenefit, setFraBenefit],
        ["Full retirement age", fra, setFra],
      ]}
      result={
        <>
          <Metric label="Claim at 62 estimate" value={currency(early)} />
          <Metric label="Claim at full retirement age" value={currency(fraBenefit)} />
          <Metric label="Claim at 70 estimate" value={currency(delayed)} />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Rough break-even: age {breakEvenEarlyFra.toFixed(1)} for 62 vs full retirement age, and age {breakEvenFraDelayed.toFixed(1)} for full retirement age vs 70. This excludes taxes, survivor benefits, investment returns, and health.
          </p>
        </>
      }
    />
  );
}

// This used to back three tools via a `kind` switch, and two of them lied.
//
// The catch-up "tool" could not see the user's age or wages, so it never showed the
// 60-63 super catch-up and never warned about the mandatory-Roth rule — it would happily
// suggest a pre-tax catch-up the law no longer permits. Now CatchUpPlannerTool.
//
// The "Sequence-Risk Stress Test" did no sequencing whatsoever: it multiplied a balance
// by a rate. The page promised "see why early returns matter more than the average" and
// then never varied the order of returns. Now SequenceRiskTool, which actually runs the
// same returns in two orders.
//
// What is left is the one case the shape genuinely fits: one input, one rate, one line.
export function SimpleAssumptionTool() {
  const [value, setValue] = useState(78000);
  const [rate, setRate] = useState(3);
  const output = `${currency(value)} becomes about ${currency(value * Math.pow(1 + rate / 100, 10))} in 10 years at ${rate}% inflation.`;

  return (
    <ToolFrame
      analyticsName="inflation-spending"
      inputs={[
        ["Annual spending today", value, setValue],
        ["Inflation rate", rate, setRate],
      ]}
      result={<p className="text-lg font-semibold tracking-tight">{output}</p>}
    />
  );
}

function ToolFrame({
  analyticsName,
  inputs,
  result,
}: {
  analyticsName: string;
  inputs: [string, number, (value: number) => void][];
  result: React.ReactNode;
}) {
  const tracked = useRef(false);

  const trackUsed = () => {
    if (tracked.current) return;
    tracked.current = true;
    trackProductEvent("Tool Used", { tool: analyticsName });
  };

  return (
    <div className="grid gap-5 rounded-xl border border-border bg-card p-5 lg:grid-cols-[320px_1fr]">
      <div className="grid gap-4">
        {inputs.map(([label, value, setValue]) => (
          <label key={label} className="grid gap-1.5 text-sm font-medium">
            {label}
            <input
              type="number"
              value={value}
              onChange={(e) => {
                trackUsed();
                setValue(Number(e.target.value));
              }}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-hidden focus:border-foreground"
            />
          </label>
        ))}
      </div>
      <div className="grid content-start gap-3 rounded-lg bg-secondary/70 p-4">{result}</div>
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
