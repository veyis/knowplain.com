"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { trackProductEvent } from "@/lib/analytics";
import { currency } from "@/lib/checkup";
import { CONTRIBUTION_2026, catchUpPlan2026 } from "@/lib/facts-2026";
import { ToolField } from "./ToolField";

const tierLabel = {
  none: "No catch-up yet — it starts at 50",
  standard: "Standard catch-up (age 50+)",
  super: "Super catch-up (ages 60-63 only)",
} as const;

function Row({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-2 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <strong className="shrink-0 tabular-nums">{value}</strong>
    </div>
  );
}

export function CatchUpPlannerTool() {
  const [age, setAge] = useState(61);
  const [priorWages, setPriorWages] = useState(90_000);
  const [currentDeferral, setCurrentDeferral] = useState(20_000);
  const tracked = useRef(false);

  const plan = useMemo(
    () => catchUpPlan2026(age, priorWages, currentDeferral),
    [age, priorWages, currentDeferral],
  );

  const trackUsed = () => {
    if (tracked.current) return;
    tracked.current = true;
    trackProductEvent("Tool Used", { tool: "catch-up-contributions" });
  };

  return (
    <div className="grid min-w-0 gap-5 rounded-xl border border-border bg-card p-5 lg:grid-cols-[320px_minmax(0,1fr)]">
      <fieldset className="calculator-inputs grid min-w-0 gap-4">
        <legend className="sr-only">Catch-up contribution inputs</legend>
        <ToolField label="Your age at the end of 2026" value={age} min={18} max={99} onChange={(value) => { trackUsed(); setAge(value); }} />
        <ToolField
          label="2025 wages from this employer"
          value={priorWages}
          min={0}
          max={5_000_000}
          hint="Social Security (FICA) wages from the employer that sponsors your plan. If you had none from them, enter 0."
          onChange={(value) => { trackUsed(); setPriorWages(value); }}
        />
        <ToolField label="What you already contribute a year" value={currentDeferral} min={0} max={500_000} onChange={(value) => { trackUsed(); setCurrentDeferral(value); }} />
      </fieldset>

      <div className="grid content-start gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{tierLabel[plan.tier]}</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            {plan.atLimit
              ? "You are already at your 2026 limit."
              : `You can still add ${currency(plan.remainingRoom)} this year.`}
          </h2>
        </div>

        {plan.catchUpMustBeRoth && (
          <div className="flex gap-3 rounded-lg border border-amber-300/60 bg-amber-50 p-4 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <div className="text-sm">
              <strong className="block">Your catch-up must be Roth in 2026.</strong>{" "}
              Because your 2025 wages from this employer were above{" "}
              {currency(CONTRIBUTION_2026.mandatoryRothCatchUpWageThreshold)}, SECURE 2.0 requires the{" "}
              {currency(plan.catchUp)} catch-up portion to go in as Roth (after-tax). Pre-tax is no
              longer an option for it. The base {currency(plan.baseDeferral)} is unaffected.
            </div>
          </div>
        )}

        {plan.tier === "super" && (
          <p className="rounded-lg bg-secondary p-3 text-sm text-muted-foreground">
            This is your window. The {currency(CONTRIBUTION_2026.superCatchUp60to63)} super catch-up
            applies only at ages 60-63 — at 64 it drops back to{" "}
            {currency(CONTRIBUTION_2026.catchUp50)}.
          </p>
        )}

        <div className="rounded-lg border border-border p-4">
          <Row
            label="Base 401(k) deferral"
            value={currency(plan.baseDeferral)}
            hint="Everyone, any age"
          />
          <Row
            label="Catch-up"
            value={plan.eligible ? `+ ${currency(plan.catchUp)}` : "—"}
            hint={plan.eligible ? tierLabel[plan.tier] : "Starts the year you turn 50"}
          />
          <Row label="Your 401(k) maximum" value={currency(plan.maxDeferral)} />
          <Row
            label="IRA on top"
            value={`+ ${currency(plan.iraTotal)}`}
            hint={
              plan.iraCatchUp
                ? `${currency(plan.iraLimit)} + ${currency(plan.iraCatchUp)} catch-up`
                : `${currency(plan.iraLimit)} limit`
            }
          />
          <Row
            label="Total tax-advantaged room"
            value={currency(plan.totalTaxAdvantaged)}
            hint="Before any employer match, which sits on top"
          />
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          2026 figures from IRS Notice 2025-67. The Roth catch-up rule tests your prior-year Social
          Security wages from the employer sponsoring the plan, so a job change or self-employment
          income can change the answer — and IRA deductibility phases out at higher incomes. If your
          catch-up must be Roth, it also raises your taxable income now, which can matter for{" "}
          <Link href="/tools/aca-bridge">ACA subsidies before 65</Link>. Educational estimate, not tax
          advice.
        </p>
      </div>
    </div>
  );
}
