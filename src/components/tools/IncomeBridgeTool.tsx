"use client";

import { useMemo, useRef, useState } from "react";
import { AlertTriangle, Info } from "lucide-react";
import { trackProductEvent } from "@/lib/analytics";
import { currency } from "@/lib/checkup";
import { ACA_2026, MEDICARE_2026, acaSubsidyStatus, crossesIrmaaTier1 } from "@/lib/facts-2026";
import { incomeBridgeLedger } from "@/lib/income-bridge";
import { isIncomeBridgeScenario, type IncomeBridgeScenario } from "@/lib/tool-scenarios";
import { LocalScenarioControls } from "./LocalScenarioControls";
import { featureFlags } from "@/lib/feature-flags";
import { ToolField } from "./ToolField";
import { ToolMetric, ToolResultRegion } from "./ToolPrimitives";

export function IncomeBridgeTool() {
  const [age, setAge] = useState(60);
  const [household, setHousehold] = useState(2);
  const [filing, setFiling] = useState<"single" | "mfj">("mfj");
  const [spending, setSpending] = useState(85_000);
  const [reliableIncome, setReliableIncome] = useState(28_000);
  const [taxableWithdrawal, setTaxableWithdrawal] = useState(32_000);
  const [realizedGains, setRealizedGains] = useState(8_000);
  const [traditionalWithdrawal, setTraditionalWithdrawal] = useState(10_000);
  const [rothWithdrawal, setRothWithdrawal] = useState(15_000);
  const [conversion, setConversion] = useState(12_000);
  const [otherIncome, setOtherIncome] = useState(0);
  const tracked = useRef(false);

  const track = () => {
    if (tracked.current) return;
    tracked.current = true;
    trackProductEvent("Tool Used", { tool: "income-bridge-60-64" });
  };

  const ledger = useMemo(() => incomeBridgeLedger({
    spending,
    socialSecurityAndPension: reliableIncome,
    taxableAccountWithdrawal: taxableWithdrawal,
    realizedGains,
    traditionalWithdrawal,
    rothWithdrawal,
    rothConversion: conversion,
    otherTaxableIncome: otherIncome,
  }), [spending, reliableIncome, taxableWithdrawal, realizedGains, traditionalWithdrawal, rothWithdrawal, conversion, otherIncome]);
  const aca = useMemo(() => acaSubsidyStatus(ledger.acaMagi, household, [age]), [ledger.acaMagi, household, age]);
  const hitsIrmaa = crossesIrmaaTier1(ledger.acaMagi, filing);
  const scenario = useMemo<IncomeBridgeScenario>(() => ({
    age, household, filing, spending, reliableIncome, taxableWithdrawal, realizedGains,
    traditionalWithdrawal, rothWithdrawal, conversion, otherIncome,
  }), [age, household, filing, spending, reliableIncome, taxableWithdrawal, realizedGains, traditionalWithdrawal, rothWithdrawal, conversion, otherIncome]);
  const restoreScenario = (saved: IncomeBridgeScenario) => {
    setAge(saved.age);
    setHousehold(saved.household);
    setFiling(saved.filing);
    setSpending(saved.spending);
    setReliableIncome(saved.reliableIncome);
    setTaxableWithdrawal(saved.taxableWithdrawal);
    setRealizedGains(saved.realizedGains);
    setTraditionalWithdrawal(saved.traditionalWithdrawal);
    setRothWithdrawal(saved.rothWithdrawal);
    setConversion(saved.conversion);
    setOtherIncome(saved.otherIncome);
  };
  const years = Array.from({ length: 65 - age }, (_, index) => age + index);
  const fieldClass = "min-h-11 rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="grid gap-5">
      <div className="grid gap-5 rounded-xl border border-border bg-card p-5 lg:grid-cols-[340px_minmax(0,1fr)]">
        <fieldset className="calculator-inputs grid content-start gap-4" onChange={track}>
          <legend className="sr-only">Income bridge inputs</legend>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <ToolField label="Current age" value={age} onChange={setAge} min={60} max={64} />
            <ToolField label="Household size" value={household} onChange={setHousehold} min={1} max={20} />
          </div>
          <label className="grid gap-1.5 text-sm font-medium">Tax filing status
            <select value={filing} onChange={(event) => setFiling(event.target.value as "single" | "mfj")} className={fieldClass}><option value="single">Single</option><option value="mfj">Married filing jointly</option></select>
          </label>
          <ToolField label="Annual spending" value={spending} onChange={setSpending} min={0} max={2_000_000} step={1000} />
          <ToolField label="Social Security + pension cash" value={reliableIncome} onChange={setReliableIncome} min={0} max={500_000} step={1000} hint="For this ACA estimate, the full amount is included in MAGI." />
          <ToolField label="Taxable-account cash withdrawal" value={taxableWithdrawal} onChange={setTaxableWithdrawal} min={0} max={2_000_000} step={1000} hint="Only the realized gain—not returned principal—belongs in ACA MAGI." />
          <ToolField label="Realized gains inside that withdrawal" value={realizedGains} onChange={setRealizedGains} min={0} max={taxableWithdrawal} step={1000} />
          <ToolField label="Traditional IRA / 401(k) withdrawal" value={traditionalWithdrawal} onChange={setTraditionalWithdrawal} min={0} max={2_000_000} step={1000} />
          <ToolField label="Roth withdrawal" value={rothWithdrawal} onChange={setRothWithdrawal} min={0} max={2_000_000} step={1000} hint="Qualified Roth withdrawals fund spending without entering ACA MAGI." />
          <ToolField label="Roth conversion" value={conversion} onChange={setConversion} min={0} max={2_000_000} step={1000} hint="A conversion raises MAGI but does not fund this year’s spending." />
          <ToolField label="Other taxable income" value={otherIncome} onChange={setOtherIncome} min={0} max={2_000_000} step={1000} />
          {featureFlags.localToolScenarios && <LocalScenarioControls
            toolId="income-bridge-60-64"
            scenario={scenario}
            validate={isIncomeBridgeScenario}
            onRestore={restoreScenario}
          />}
        </fieldset>

        <ToolResultRegion id="income-bridge-result" className="gap-4">
          <div><p className="text-sm font-medium text-muted-foreground">Two ledgers, one bridge</p><p className="text-2xl font-semibold tracking-tight">{ledger.cashGap > 0 ? `${currency(ledger.cashGap)} of spending is still unfunded.` : `${currency(ledger.cashSurplus)} remains after planned spending.`}</p></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <ToolMetric boxed label="Spendable cash" value={currency(ledger.cashAvailable)} />
            <ToolMetric boxed label="Projected ACA MAGI" value={currency(ledger.acaMagi)} />
            <ToolMetric boxed label="ACA cliff for household" value={currency(aca.cliffMagi)} />
            <ToolMetric boxed label={aca.overCliff ? "MAGI over cliff" : "MAGI headroom"} value={currency(Math.abs(aca.headroomToCliff))} />
          </div>

          {aca.overCliff && <Notice warning title="Current plan is over the 2026 ACA cliff">Under current law, the projected premium tax credit is zero above {ACA_2026.subsidyCliffFplPercent}% of poverty. Recheck the law and a real Marketplace quote before changing withdrawals or conversions.</Notice>}
          {age >= 63 && hitsIrmaa && <Notice warning title={`Income may raise Medicare premiums at ${age + MEDICARE_2026.irmaaLookbackYears}`}>The same income is above the first IRMAA threshold for {filing === "mfj" ? "joint" : "single"} filers. This tool does not calculate every IRMAA tier.</Notice>}
          {ledger.cashGap > 0 && <Notice title="Close the cash gap separately from the tax target">A conversion cannot pay expenses. Test additional taxable-account principal, a traditional withdrawal, a qualified Roth withdrawal, lower spending, or earned income—then recheck MAGI.</Notice>}

          <div className="overflow-x-auto" role="region" aria-label="Age 60 through 64 income bridge" tabIndex={0}>
            <table className="min-w-[620px] w-full text-left text-sm">
              <caption className="mb-2 text-left font-semibold">What changes from 60 through 64</caption>
              <thead><tr className="border-b border-border"><th className="p-2">Age</th><th className="p-2">Coverage and MAGI</th><th className="p-2">Additional coordination</th></tr></thead>
              <tbody>{years.map((yearAge) => <tr key={yearAge} className="border-b border-border last:border-0"><td className="p-2 font-semibold tabular-nums">{yearAge}</td><td className="p-2">Marketplace income planning may apply until Medicare at 65.</td><td className="p-2">{yearAge >= 63 ? `This tax year can affect Medicare premiums at ${yearAge + 2}.` : "Before the age-65 Medicare lookback window."}</td></tr>)}</tbody>
            </table>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">Assumes qualified Roth withdrawals, uses national-average benchmark premiums, and does not model income tax, state Medicaid rules, Social Security taxation, capital-gain brackets, or account sustainability. ACA law is volatile. Educational coordination aid only.</p>
        </ToolResultRegion>
      </div>
    </div>
  );
}

function Notice({ title, children, warning = false }: { title: string; children: React.ReactNode; warning?: boolean }) {
  return <div className={`flex gap-3 rounded-lg border p-4 text-sm ${warning ? "border-amber-300/60 bg-amber-50 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100" : "border-border bg-background"}`}>{warning ? <AlertTriangle className="mt-0.5 size-4 shrink-0" /> : <Info className="mt-0.5 size-4 shrink-0" />}<div><strong className="block">{title}</strong><span className="leading-relaxed">{children}</span></div></div>;
}
