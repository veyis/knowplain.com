"use client";

import { useMemo, useRef, useState } from "react";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { trackProductEvent } from "@/lib/analytics";
import { ToolField } from "./ToolField";
import { currency } from "@/lib/checkup";
import { projectRetirementSpending } from "@/lib/facts-2026";

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;


export function SpendingPlannerTool() {
  const [essentials, setEssentials] = useState(40_000);
  const [healthcare, setHealthcare] = useState(8_000);
  const [discretionary, setDiscretionary] = useState(12_000);
  const [years, setYears] = useState(25);
  const [generalInflation, setGeneralInflation] = useState(3);
  const [healthcareInflation, setHealthcareInflation] = useState(5);
  const tracked = useRef(false);

  const track = () => {
    if (tracked.current) return;
    tracked.current = true;
    trackProductEvent("Tool Used", { tool: "inflation-spending" });
  };

  const p = useMemo(
    () =>
      projectRetirementSpending({
        essentials,
        healthcare,
        discretionary,
        years,
        generalInflation: generalInflation / 100,
        healthcareInflation: healthcareInflation / 100,
      }),
    [essentials, healthcare, discretionary, years, generalInflation, healthcareInflation],
  );

  const data = useMemo(
    () =>
      p.years.map((y) => ({
        year: y.year,
        Essentials: y.essentials,
        Healthcare: y.healthcare,
        Discretionary: y.discretionary,
      })),
    [p],
  );

  const diverging = healthcareInflation > generalInflation;

  return (
    <div className="grid gap-5">
      <div className="grid gap-5 rounded-xl border border-border bg-card p-5 lg:grid-cols-[300px_1fr]">
        <div className="calculator-inputs grid content-start gap-4" onChange={track}>
          <ToolField
            label="Essentials, per year"
            min={0}
            max={2000000}
            value={essentials}
            onChange={setEssentials}
            step={1000}
            hint="Housing, food, utilities, insurance."
          />
          <ToolField
            label="Healthcare, per year"
            min={0}
            max={2000000}
            value={healthcare}
            onChange={setHealthcare}
            step={500}
            hint="Premiums, deductibles, prescriptions."
          />
          <ToolField
            label="Discretionary, per year"
            min={0}
            max={2000000}
            value={discretionary}
            onChange={setDiscretionary}
            step={1000}
            hint="Travel, hobbies, gifts — the first thing you can cut."
          />
          <ToolField label="Years in retirement"
            min={1}
            max={60} value={years} onChange={setYears} />
          <ToolField
            label="General inflation (%)"
            min={0}
            max={20}
            value={generalInflation}
            onChange={setGeneralInflation}
            step={0.1}
          />
          <ToolField
            label="Healthcare inflation (%)"
            min={0}
            max={20}
            value={healthcareInflation}
            onChange={setHealthcareInflation}
            step={0.1}
            hint="Historically it has run hotter than everything else. Set it equal to see what changes."
          />
        </div>

        <div className="grid content-start gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Year 1: {currency(p.first.total)} &nbsp;·&nbsp; Year {years}: {currency(p.last.total)}
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              {diverging
                ? `Healthcare goes from ${pct(p.first.healthcareShare)} of your budget to ${pct(p.last.healthcareShare)}.`
                : "Healthcare stays the same share of your budget."}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {diverging
                ? "Not because you use more of it. Because its price runs faster than everything else."
                : "With healthcare inflating at the same rate as everything else, the mix never moves — only the total does. Raise the healthcare rate to see the real problem."}
            </p>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {/* Legend sits on top: at the bottom it collides with the x-axis label. */}
              <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 12, left: 8 }}>
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
                <Legend verticalAlign="top" height={22} wrapperStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="Essentials"
                  stackId="1"
                  stroke="var(--color-slate-400, #94a3b8)"
                  fill="var(--color-slate-400, #94a3b8)"
                  fillOpacity={0.35}
                />
                <Area
                  type="monotone"
                  dataKey="Healthcare"
                  stackId="1"
                  stroke="var(--color-red-500, #ef4444)"
                  fill="var(--color-red-500, #ef4444)"
                  fillOpacity={0.45}
                />
                <Area
                  type="monotone"
                  dataKey="Discretionary"
                  stackId="1"
                  stroke="var(--color-emerald-500, #10b981)"
                  fill="var(--color-emerald-500, #10b981)"
                  fillOpacity={0.35}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {diverging && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-secondary p-3">
                <p className="text-xs text-muted-foreground">
                  Year {years} budget if healthcare behaved like everything else
                </p>
                <strong>{currency(p.totalIfHealthcareTracked)}</strong>
              </div>
              <div className="rounded-lg bg-secondary p-3">
                <p className="text-xs text-muted-foreground">
                  What the faster healthcare inflation costs you that year
                </p>
                <strong>{currency(p.healthcarePremiumCost)}</strong>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-2 rounded-xl border border-border bg-card p-5 text-sm leading-relaxed text-muted-foreground">
        <p>
          <strong className="text-foreground">Why one inflation rate is not enough.</strong> Most
          calculators apply a single rate to your whole budget, which quietly assumes healthcare
          behaves like groceries. It has not. Two categories compounding at different rates diverge,
          and over a long retirement that divergence is the difference between a comfortable plan and
          a squeezed one. Set both rates the same above and watch the effect vanish — that is the
          proof it is the <em>gap</em> doing the work, not the level.
        </p>
        <p>
          <strong className="text-foreground">What it means in practice.</strong> Discretionary
          spending is the shock absorber: it is the part you can cut when markets fall or costs
          climb. The bigger healthcare grows as a share of the budget, the less absorber you have
          left — which is the same reason a bad early market year hurts so much.{" "}
          <em>Fidelity estimates a single 65-year-old retiring in 2025 needs about $172,500 for
          healthcare costs over retirement</em>, excluding long-term care.
        </p>
        <p className="text-xs">
          You supply the inflation rates; we do not forecast them. Historical healthcare inflation
          has generally outpaced general inflation, but by an amount that varies a great deal by year
          and by person, so the honest thing is to let you test a range rather than publish a number
          as if it were fact. Excludes long-term care, which is the largest uncovered risk in most
          retirements. Educational estimate, not financial advice.
        </p>
      </div>
    </div>
  );
}
