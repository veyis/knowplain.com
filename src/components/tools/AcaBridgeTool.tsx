"use client";

import { useMemo, useRef, useState } from "react";
import { trackProductEvent } from "@/lib/analytics";
import { currency } from "@/lib/checkup";
import { ACA_2026, acaLostEnhancedCreditReference, acaSubsidyStatus } from "@/lib/facts-2026";

export function AcaBridgeTool() {
  const [age, setAge] = useState(60);
  const [retirementAge, setRetirementAge] = useState(60);
  const [household, setHousehold] = useState(1);
  const [magi, setMagi] = useState(65000);
  const tracked = useRef(false);
  const status = useMemo(() => acaSubsidyStatus(magi, household), [magi, household]);
  const bridgeStartAge = Math.max(age, retirementAge);
  const bridgeYears = Math.max(0, 65 - bridgeStartAge);

  const trackUsed = () => {
    if (tracked.current) return;
    tracked.current = true;
    trackProductEvent("Tool Used", { tool: "aca-bridge" });
  };

  const state = status.overCliff ? "over" : status.belowFloor ? "floor" : "under";
  const pill =
    state === "over"
      ? "border-amber-300/60 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200"
      : state === "floor"
        ? "border-border bg-secondary text-muted-foreground"
        : "border-emerald-300/60 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200";
  const headline =
    bridgeYears === 0
      ? "No pre-Medicare bridge in this scenario"
      : state === "over"
        ? "Over the 400% cliff — $0 premium tax credit under 2026 law"
        : state === "floor"
          ? "Below 100% of the poverty level"
          : "Under the 400% cliff — you qualify for a premium tax credit";

  const cliffScenario =
    state === "over"
      ? `Current law: at this MAGI, the benchmark silver reference cost is the full ${currency(status.currentLawBenchmarkCost)} national average for a 60-year-old.`
      : `Current law: at this MAGI, you are still under the 400% FPL cliff by ${currency(status.headroomToCliff)}.`;
  const restoredScenario =
    status.restoredEnhancedBenchmarkSavings > 0
      ? `Restored-enhanced-credit scenario: the benchmark silver reference cost would be about ${currency(status.restoredEnhancedBenchmarkCost)}, a ${currency(status.restoredEnhancedBenchmarkSavings)} difference from current law.`
      : `Restored-enhanced-credit scenario: above-cliff relief matters most once MAGI crosses 400% FPL; this scenario shows no additional above-cliff savings.`;

  return (
    <div className="grid gap-5 rounded-xl border border-border bg-card p-5 lg:grid-cols-[340px_1fr]">
      <div className="grid gap-4">
        <label className="grid gap-1.5 text-sm font-medium">
          Current age
          <input
            type="number"
            min={18}
            max={64}
            value={age}
            onChange={(e) => {
              trackUsed();
              setAge(Number(e.target.value));
            }}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-hidden focus:border-foreground"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Planned retirement age
          <input
            type="number"
            min={18}
            max={70}
            value={retirementAge}
            onChange={(e) => {
              trackUsed();
              setRetirementAge(Number(e.target.value));
            }}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-hidden focus:border-foreground"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Household size
          <input
            type="number"
            min={1}
            value={household}
            onChange={(e) => {
              trackUsed();
              setHousehold(Math.max(1, Number(e.target.value)));
            }}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-hidden focus:border-foreground"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Projected annual ACA MAGI
          <input
            type="number"
            value={magi}
            onChange={(e) => {
              trackUsed();
              setMagi(Number(e.target.value));
            }}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-hidden focus:border-foreground"
          />
        </label>
        <p className="text-xs leading-relaxed text-muted-foreground">
          ACA MAGI includes adjusted gross income, tax-exempt interest, untaxed Social Security,
          traditional IRA/401(k) withdrawals, Roth conversions, capital gains, and pensions. Roth
          withdrawals do not count.
        </p>
      </div>

      <div className="grid content-start gap-4 rounded-lg bg-secondary/70 p-4">
        <span className={`w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${pill}`}>
          {headline}
        </span>

        <div className="grid gap-3 sm:grid-cols-2">
          <Metric label="Pre-Medicare bridge" value={bridgeYears ? `${bridgeYears} years` : "None"} />
          <Metric label="Your income vs. poverty level" value={`${Math.round(status.fplPercent)}% of FPL`} />
          <Metric label="400% cliff for your household" value={currency(status.cliffMagi)} />
          <Metric
            label={status.overCliff ? "Over the cliff by" : "MAGI room before the cliff"}
            value={currency(Math.abs(status.headroomToCliff))}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Scenario title="Current 2026 law" body={cliffScenario} />
          <Scenario title="If enhanced credits returned" body={restoredScenario} />
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          {bridgeYears === 0
            ? "This tool matters most when you retire before 65 and need individual-market coverage before Medicare."
            : status.overCliff
              ? "Falling one dollar over 400% of poverty means no premium tax credit under current 2026 law. The practical lever is MAGI timing, not asset allocation."
              : status.belowFloor
                ? "Below 100% of poverty, marketplace credits generally do not apply — Medicaid may. Check your state's rules."
                : "You are under the cliff, so protecting MAGI headroom can protect the credit. Roth conversions and capital gains can use that headroom quickly."}
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Verified {ACA_2026.lastVerified}. KFF reference: a 60-year-old at {currency(ACA_2026.restoredEnhancedCreditReference.annualIncome)}
          pays {currency(acaLostEnhancedCreditReference())} more per year after enhanced credits expired.
          National average 60-year-old annual premiums: {currency(ACA_2026.averageAge60AnnualPremium.lowestCostBronze)}
          bronze and {currency(ACA_2026.averageAge60AnnualPremium.benchmarkSilver)} benchmark silver. Local
          premiums vary by county and state. Educational estimate only.
        </p>
      </div>
    </div>
  );
}

function Scenario({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
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
