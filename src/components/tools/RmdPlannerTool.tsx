"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Info } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { trackProductEvent } from "@/lib/analytics";
import { currency } from "@/lib/checkup";
import {
  CONTRIBUTION_2026,
  MEDICARE_2026,
  SOCIAL_SECURITY_2026,
  crossesIrmaaTier1,
  projectRmds,
  rmdDivisor,
  rmdStartAge,
} from "@/lib/facts-2026";

const CURRENT_YEAR = 2026;

function Field({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  hint?: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          onChange(Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min);
        }}
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-hidden focus:border-foreground"
      />
      {hint && <span className="text-xs font-normal text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function RmdPlannerTool() {
  const [birthYear, setBirthYear] = useState(1962);
  const [balance, setBalance] = useState(900_000);
  const [growth, setGrowth] = useState(5);
  const [otherIncome, setOtherIncome] = useState(40_000);
  const [filing, setFiling] = useState<"single" | "mfj">("mfj");
  const tracked = useRef(false);

  const track = () => {
    if (tracked.current) return;
    tracked.current = true;
    trackProductEvent("Tool Used", { tool: "rmd-planner" });
  };

  const currentAge = CURRENT_YEAR - birthYear;
  const startAge = rmdStartAge(birthYear);
  const yearsUntil = Math.max(0, startAge - currentAge);
  const startYear = birthYear + startAge;

  const rows = useMemo(
    () =>
      projectRmds({
        currentBalance: balance,
        currentAge,
        birthYear,
        annualReturn: growth / 100,
        throughAge: 95,
      }),
    [balance, currentAge, birthYear, growth],
  );

  const firstRmd = rows.find((r) => r.rmd > 0);
  const at85 = rows.find((r) => r.age === 85);
  const chart = rows.filter((r) => r.rmd > 0).map((r) => ({ age: r.age, RMD: r.rmd }));

  // The RMD is ordinary income. Stacked on everything else, it is what lifts a retiree over
  // the IRMAA threshold and drags Social Security into tax — years after the decision that
  // could have prevented it.
  const incomeAtFirstRmd = otherIncome + (firstRmd?.rmd ?? 0);
  const irmaaAtFirst = firstRmd ? crossesIrmaaTier1(incomeAtFirstRmd, filing) : false;
  const incomeAt85 = otherIncome + (at85?.rmd ?? 0);
  const irmaaAt85 = at85 ? crossesIrmaaTier1(incomeAt85, filing) : false;

  const field =
    "rounded-lg border border-border bg-background px-3 py-2 text-sm outline-hidden focus:border-foreground";

  return (
    <div className="grid gap-5">
      <div className="grid gap-5 rounded-xl border border-border bg-card p-5 lg:grid-cols-[300px_1fr]">
        <div className="grid content-start gap-4" onChange={track}>
          <Field
            label="Birth year"
            value={birthYear}
            onChange={setBirthYear}
            min={1930}
            max={2000}
            hint="This — not your age — decides when RMDs start."
          />
          <Field
            label="Traditional IRA / 401(k) balance"
            value={balance}
            onChange={setBalance}
            min={0}
            max={20_000_000}
            step={10_000}
          />
          <Field
            label="Assumed annual return (%)"
            value={growth}
            onChange={setGrowth}
            min={-10}
            max={15}
            step={0.5}
          />
          <Field
            label="Other retirement income"
            value={otherIncome}
            onChange={setOtherIncome}
            min={0}
            max={1_000_000}
            step={1_000}
            hint="Social Security, pension, taxable interest — everything but the RMD."
          />
          <label className="grid gap-1.5 text-sm font-medium">
            Filing status
            <select
              value={filing}
              onChange={(e) => setFiling(e.target.value as "single" | "mfj")}
              className={field}
            >
              <option value="single">Single</option>
              <option value="mfj">Married, filing jointly</option>
            </select>
          </label>
        </div>

        <div className="grid content-start gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Born in {birthYear}, your RMDs begin at {startAge} — in {startYear}
              {yearsUntil > 0 ? `, ${yearsUntil} ${yearsUntil === 1 ? "year" : "years"} from now` : ""}.
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              {firstRmd
                ? `Your first forced withdrawal is about ${currency(firstRmd.rmd)}.`
                : "No required distribution yet."}
            </h2>
          </div>

          {/* The headline differentiator. Almost every RMD calculator online defaults to 73. */}
          {birthYear >= 1960 && (
            <div className="flex gap-3 rounded-lg border border-slate-300/60 bg-slate-50 p-4 text-slate-900 dark:border-slate-700/50 dark:bg-slate-900/40 dark:text-slate-200">
              <Info className="mt-0.5 size-4 shrink-0" />
              <div className="text-sm">
                <strong className="block">Not 73. You get two more years.</strong> SECURE 2.0 set{" "}
                <em>two</em> RMD ages: 73 for those born 1951–1959, and 75 for anyone born in 1960 or
                later. Most calculators — and most articles — quote a flat 73. Being born in{" "}
                {birthYear} buys you two extra years in which you, not the IRS, decide your taxable
                income. That is precisely the window a{" "}
                <Link href="/topics/retirement/roth-conversion-ladder" className="underline">
                  Roth conversion plan
                </Link>{" "}
                is built in.
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-secondary p-3">
              <p className="text-xs text-muted-foreground">First RMD, at {startAge}</p>
              <strong>{firstRmd ? currency(firstRmd.rmd) : "—"}</strong>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {firstRmd ? `${(firstRmd.percentOfBalance * 100).toFixed(1)}% of the balance` : ""}
              </p>
            </div>
            <div className="rounded-lg bg-secondary p-3">
              <p className="text-xs text-muted-foreground">RMD at 85</p>
              <strong>{at85 ? currency(at85.rmd) : "—"}</strong>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {at85 ? `${(at85.percentOfBalance * 100).toFixed(1)}% of the balance` : ""}
              </p>
            </div>
            <div className="rounded-lg bg-secondary p-3">
              <p className="text-xs text-muted-foreground">Divisor at {startAge} → 85</p>
              <strong>
                {rmdDivisor(startAge).toFixed(1)} → {rmdDivisor(85).toFixed(1)}
              </strong>
              <p className="mt-0.5 text-xs text-muted-foreground">smaller divisor, bigger forced cut</p>
            </div>
          </div>

          {chart.length > 1 && (
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="age"
                    tick={{ fontSize: 12 }}
                    stroke="var(--muted-foreground)"
                    label={{ value: "Age", position: "insideBottom", offset: -2, fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="var(--muted-foreground)"
                    tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
                    width={48}
                  />
                  <Tooltip
                    formatter={(v) => currency(Number(v ?? 0))}
                    labelFormatter={(l) => `Age ${l}`}
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="RMD"
                    stroke="var(--foreground)"
                    strokeWidth={2}
                    fill="var(--foreground)"
                    fillOpacity={0.08}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {(irmaaAtFirst || irmaaAt85) && (
            <div className="flex gap-3 rounded-lg border border-amber-300/60 bg-amber-50 p-4 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <div className="text-sm">
                <strong className="block">
                  {irmaaAtFirst
                    ? "Your very first RMD pushes you over the Medicare IRMAA threshold."
                    : "By 85, the RMD alone pushes you over the Medicare IRMAA threshold."}
                </strong>{" "}
                The RMD is ordinary income. Stacked on your other{" "}
                {currency(otherIncome)}, it reaches{" "}
                {currency(irmaaAtFirst ? incomeAtFirstRmd : incomeAt85)} — past the{" "}
                {currency(
                  filing === "mfj"
                    ? MEDICARE_2026.irmaaFirstTierJoint
                    : MEDICARE_2026.irmaaFirstTierSingle,
                )}{" "}
                tier-1 line, which lifts your Medicare premium two years later and can drag more of
                your Social Security into tax. You cannot fix this at {startAge}. You fix it in the
                years before it, by{" "}
                <Link href="/tools/roth-vs-traditional" className="underline">
                  converting deliberately
                </Link>
                .
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-2 rounded-xl border border-border bg-card p-5 text-sm leading-relaxed text-muted-foreground">
        <p>
          <strong className="text-foreground">Why the RMD keeps growing.</strong> It is the balance
          divided by a divisor from the IRS Uniform Lifetime Table, and that divisor shrinks every
          year — {rmdDivisor(startAge).toFixed(1)} at {startAge}, {rmdDivisor(85).toFixed(1)} at 85,{" "}
          {rmdDivisor(90).toFixed(1)} at 90. So the forced withdrawal rises as a{" "}
          <em>share of the account</em>, not just in dollars, even while the balance compounds. A
          plan that ignores it lets the IRS choose your taxable income in your eighties.
        </p>
        <p>
          <strong className="text-foreground">The two levers.</strong> Convert to Roth before RMDs
          start — Roth IRAs have no RMD while you are alive. And from 70½ you can send up to{" "}
          {currency(CONTRIBUTION_2026.qcdLimit)} a year straight from an IRA to charity as a{" "}
          <em>qualified charitable distribution</em>: it satisfies the RMD and never enters your
          income at all, so it never lifts IRMAA and never taxes another dollar of Social Security.
        </p>
        <p className="text-xs">
          Uses the IRS Uniform Lifetime Table (Pub 590-B, Appendix B). If your spouse is your sole
          beneficiary <em>and</em> more than 10 years younger, you use the Joint Life table instead
          and your real RMD is <em>smaller</em> than shown here. Roth 401(k)s no longer have RMDs
          (SECURE 2.0 §325). Inherited IRAs follow different rules entirely. Social Security
          benefit taxation begins at{" "}
          {currency(
            filing === "mfj"
              ? SOCIAL_SECURITY_2026.benefitTaxThresholdJoint
              : SOCIAL_SECURITY_2026.benefitTaxThresholdSingle,
          )}{" "}
          of combined income and is not modelled here. Educational estimate, not tax advice.
        </p>
      </div>
    </div>
  );
}
