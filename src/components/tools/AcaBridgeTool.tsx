"use client";

import { useMemo, useState } from "react";
import { currency } from "@/lib/checkup";
import { acaSubsidyStatus } from "@/lib/facts-2026";

export function AcaBridgeTool() {
  const [household, setHousehold] = useState(2);
  const [magi, setMagi] = useState(70000);
  const status = useMemo(() => acaSubsidyStatus(magi, household), [magi, household]);

  const state = status.overCliff ? "over" : status.belowFloor ? "floor" : "under";
  const pill =
    state === "over"
      ? "border-amber-300/60 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200"
      : state === "floor"
        ? "border-border bg-secondary text-muted-foreground"
        : "border-emerald-300/60 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200";
  const headline =
    state === "over"
      ? "Over the 400% cliff — $0 premium tax credit under 2026 law"
      : state === "floor"
        ? "Below 100% of the poverty level"
        : "Under the 400% cliff — you qualify for a premium tax credit";

  return (
    <div className="grid gap-5 rounded-xl border border-border bg-card p-5 lg:grid-cols-[320px_1fr]">
      <div className="grid gap-4">
        <label className="grid gap-1.5 text-sm font-medium">
          Household size
          <input
            type="number"
            min={1}
            value={household}
            onChange={(e) => setHousehold(Math.max(1, Number(e.target.value)))}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-hidden focus:border-foreground"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Estimated annual household MAGI
          <input
            type="number"
            value={magi}
            onChange={(e) => setMagi(Number(e.target.value))}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-hidden focus:border-foreground"
          />
        </label>
        <p className="text-xs leading-relaxed text-muted-foreground">
          MAGI ≈ adjusted gross income + tax-exempt interest + untaxed Social Security. As an early
          retiree you can often steer it — Roth vs. pre-tax withdrawals, capital-gain timing — which
          is what makes the cliff a planning lever, not just a number.
        </p>
      </div>

      <div className="grid content-start gap-3 rounded-lg bg-secondary/70 p-4">
        <span className={`w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${pill}`}>
          {headline}
        </span>

        <div className="grid gap-3 sm:grid-cols-2">
          <Metric label="Your income vs. poverty level" value={`${Math.round(status.fplPercent)}% of FPL`} />
          <Metric label="400% cliff for your household" value={currency(status.cliffMagi)} />
          <Metric
            label={status.overCliff ? "Over the cliff by" : "MAGI room before the cliff"}
            value={currency(Math.abs(status.headroomToCliff))}
          />
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          {status.overCliff
            ? "A household $1 over 400% of poverty gets no premium tax credit and pays the full unsubsidized premium. Lowering MAGI under the cliff can restore thousands in annual credits."
            : status.belowFloor
              ? "Below 100% of poverty, marketplace credits generally don't apply — Medicaid may. Check your state's rules."
              : "You're under the cliff, so a premium tax credit applies. Keeping MAGI under the cliff protects it — a reason to plan withdrawals and Roth conversions around this line."}
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          ⚠️ The ARPA/IRA enhanced subsidies expired Dec 31, 2025, restoring the 400% cliff for 2026;
          an extension is under debate in Congress. This is a pre-65 bridge estimate using 2025 poverty
          guidelines (48 states) — educational only. Verify current law and your benchmark plan cost.
        </p>
      </div>
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
