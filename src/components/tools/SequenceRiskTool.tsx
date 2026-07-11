"use client";

import { useMemo, useRef, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle } from "lucide-react";
import { trackProductEvent } from "@/lib/analytics";
import { currency } from "@/lib/checkup";
import { sequenceRiskComparison } from "@/lib/facts-2026";

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

function Field({
  label,
  value,
  onChange,
  hint,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
  step?: number;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-hidden focus:border-foreground"
      />
      {hint && <span className="text-xs font-normal text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function SequenceRiskTool() {
  const [balance, setBalance] = useState(1_000_000);
  const [withdrawalRate, setWithdrawalRate] = useState(4);
  const [badReturn, setBadReturn] = useState(-3);
  const [goodReturn, setGoodReturn] = useState(8);
  const [inflation, setInflation] = useState(3);
  const tracked = useRef(false);

  const track = () => {
    if (tracked.current) return;
    tracked.current = true;
    trackProductEvent("Tool Used", { tool: "sequence-risk" });
  };

  const result = useMemo(
    () =>
      sequenceRiskComparison({
        balance,
        withdrawalRate: withdrawalRate / 100,
        badReturn: badReturn / 100,
        goodReturn: goodReturn / 100,
        inflation: inflation / 100,
      }),
    [balance, withdrawalRate, badReturn, goodReturn, inflation],
  );

  const data = useMemo(
    () =>
      result.badFirst.balances.map((b, i) => ({
        year: i + 1,
        "Bad decade first": b,
        "Good decade first": result.goodFirst.balances[i],
      })),
    [result],
  );

  const ruined = result.badFirst.depletedInYear !== null;

  return (
    <div className="grid gap-5">
      <div className="grid gap-5 rounded-xl border border-border bg-card p-5 lg:grid-cols-[300px_1fr]">
        <div className="grid content-start gap-4" onChange={track}>
          <Field label="Starting portfolio" value={balance} onChange={setBalance} step={10_000} />
          <Field
            label="First-year withdrawal rate (%)"
            value={withdrawalRate}
            onChange={setWithdrawalRate}
            step={0.1}
            hint="Rises with inflation each year after."
          />
          <Field
            label="Return in the bad decade (%)"
            value={badReturn}
            onChange={setBadReturn}
            step={0.5}
            hint="Applied to the first 10 years, or the last 10."
          />
          <Field
            label="Return in the other 20 years (%)"
            value={goodReturn}
            onChange={setGoodReturn}
            step={0.5}
          />
          <Field label="Inflation (%)" value={inflation} onChange={setInflation} step={0.1} />
        </div>

        <div className="grid content-start gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Both retirees earn the same {pct(result.averageReturn)} average return over 30 years.
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              {result.shortfall > 0
                ? `Meeting the bad decade first costs ${currency(result.shortfall)}.`
                : "With nothing withdrawn, the order makes no difference at all."}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Same returns. Same average. Only the <em>order</em> changed.
            </p>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 12 }}
                  stroke="var(--muted-foreground)"
                  label={{ value: "Year of retirement", position: "insideBottom", offset: -2, fontSize: 12 }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="var(--muted-foreground)"
                  tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
                  width={48}
                />
                <Tooltip
                  formatter={(v) => currency(Number(v ?? 0))}
                  labelFormatter={(l) => `Year ${l}`}
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="Good decade first"
                  stroke="var(--color-emerald-500, #10b981)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Bad decade first"
                  stroke="var(--color-red-500, #ef4444)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-secondary p-3">
              <p className="text-xs text-muted-foreground">Bad decade first — ends with</p>
              <strong>{currency(result.badFirst.endingBalance)}</strong>
            </div>
            <div className="rounded-lg bg-secondary p-3">
              <p className="text-xs text-muted-foreground">Good decade first — ends with</p>
              <strong>{currency(result.goodFirst.endingBalance)}</strong>
            </div>
          </div>

          {ruined && (
            <div className="flex gap-3 rounded-lg border border-amber-300/60 bg-amber-50 p-4 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <div className="text-sm">
                <strong className="block">
                  The unlucky retiree runs out in year {result.badFirst.depletedInYear}.
                </strong>{" "}
                The lucky one, on exactly the same returns, does not. Nothing separates them but
                timing — which is the one thing neither of them controls.
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-2 rounded-xl border border-border bg-card p-5 text-sm leading-relaxed text-muted-foreground">
        <p>
          <strong className="text-foreground">Why the order matters at all.</strong> Compounding is
          commutative — set the withdrawal rate to 0 above and the two lines land on exactly the same
          number. What breaks the symmetry is <em>selling</em>. Money taken out during a downturn is
          gone for good and cannot take part in the recovery, and every withdrawal in a bad early year
          comes from a shrinking base. That is why the first decade of retirement carries more weight
          than the twenty years after it.
        </p>
        <p>
          <strong className="text-foreground">What actually helps.</strong> A cash or bond buffer to
          spend from instead of selling; a smaller first-year withdrawal; the willingness to trim
          spending after a bad year; part-time income; and delaying Social Security so more of your
          spending comes from guaranteed income. Flexibility is the lever — the static withdrawal rate
          is really just the price of refusing to adjust.
        </p>
        <p className="text-xs">
          A deliberately simple illustration, not a forecast: it uses one bad decade and one good
          period rather than real market history or a Monte Carlo run, and ignores taxes and fees. It
          is built to show <em>why</em> order matters, not to predict your portfolio. Educational
          only, not financial advice.
        </p>
      </div>
    </div>
  );
}
