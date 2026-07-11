"use client";

import { useMemo, useRef, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle } from "lucide-react";
import { trackProductEvent } from "@/lib/analytics";
import { ToolField } from "./ToolField";
import { currency } from "@/lib/checkup";
import { sequenceRiskComparison } from "@/lib/facts-2026";

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;


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
  const luckyAlsoRuined = result.goodFirst.depletedInYear !== null;
  const bothRuined = ruined && luckyAlsoRuined;

  /**
   * The headline used to branch on `shortfall > 0`. When BOTH portfolios deplete they both
   * end at $0, so shortfall is 0 — and the tool announced "the order makes no difference at
   * all" while the banner below it simultaneously reported a year-9 wipeout. Two false and
   * contradictory statements on one screen, at exactly the withdrawal rates where the tool's
   * lesson matters most.
   *
   * When both run dry, the story isn't the ending balance (identical, zero) — it's how many
   * years of solvency the order cost. Branch on the real condition.
   */
  const yearsSooner =
    bothRuined && result.goodFirst.depletedInYear && result.badFirst.depletedInYear
      ? result.goodFirst.depletedInYear - result.badFirst.depletedInYear
      : 0;

  const headline = (() => {
    if (withdrawalRate === 0) return "With nothing withdrawn, the order makes no difference at all.";
    if (badReturn === goodReturn)
      return "Both decades are identical — there is no bad sequence to meet.";
    if (bothRuined) {
      return yearsSooner > 0
        ? `Both run dry — but the bad decade first empties the portfolio ${yearsSooner} years sooner.`
        : "Both portfolios run dry. At this withdrawal rate, the rate is the problem, not the order.";
    }
    if (result.shortfall > 0) return `Meeting the bad decade first costs ${currency(result.shortfall)}.`;
    if (result.shortfall < 0)
      return "Your “bad” return is higher than your “good” one — swap them to see the effect.";
    return "The order makes no difference at these inputs.";
  })();

  return (
    <div className="grid gap-5">
      <div className="grid gap-5 rounded-xl border border-border bg-card p-5 lg:grid-cols-[300px_1fr]">
        <div className="grid content-start gap-4" onChange={track}>
          <ToolField label="Starting portfolio"
            min={0}
            max={50000000} value={balance} onChange={setBalance} step={10_000} />
          <ToolField
            label="First-year withdrawal rate (%)"
            min={0}
            max={20}
            value={withdrawalRate}
            onChange={setWithdrawalRate}
            step={0.1}
            hint="Rises with inflation each year after."
          />
          <ToolField
            label="Return in the bad decade (%)"
            min={-50}
            max={50}
            value={badReturn}
            onChange={setBadReturn}
            step={0.5}
            hint="Applied to the first 10 years, or the last 10."
          />
          <ToolField
            label="Return in the other 20 years (%)"
            min={-50}
            max={50}
            value={goodReturn}
            onChange={setGoodReturn}
            step={0.5}
          />
          <ToolField label="Inflation (%)"
            min={0}
            max={20} value={inflation} onChange={setInflation} step={0.1} />
        </div>

        <div className="grid content-start gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Both retirees earn the same {pct(result.averageReturn)} average return over 30 years.
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">{headline}</h2>
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
                {/* Only claim the lucky one survived if they actually did. */}
                {luckyAlsoRuined ? (
                  <>
                    The lucky one runs out too, in year {result.goodFirst.depletedInYear} — same
                    returns, {yearsSooner > 0 ? `${yearsSooner} more years of solvency` : "no better off"}. When both
                    orders fail, the withdrawal rate is too high for this portfolio, and no amount of
                    good luck early on fixes that. Lower the rate and watch both lines survive.
                  </>
                ) : (
                  <>
                    The lucky one, on exactly the same returns, does not. Nothing separates them but
                    timing — which is the one thing neither of them controls.
                  </>
                )}
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
