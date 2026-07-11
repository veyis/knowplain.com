"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Mail, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { captureCheckupLead } from "./actions";
import { trackProductEvent } from "@/lib/analytics";
import { currency, runRetirementCheckup, type CheckupInput } from "@/lib/checkup";

const defaults: CheckupInput = {
  age: 52,
  targetRetirementAge: 67,
  retirementSavings: 325000,
  annualContribution: 24000,
  annualSpending: 78000,
  socialSecurityAnnual: 32000,
  pensionAnnual: 0,
  debtPaymentsAnnual: 6000,
  retireBefore65: false,
  partTimePossible: true,
  spendingFlexibility: "medium",
};

function ScoreBar({ label, value, inverse }: { label: string; value: number; inverse?: boolean }) {
  const effective = inverse ? 100 - value : value;
  const tone = effective >= 70 ? "bg-emerald-500" : effective >= 45 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="grid gap-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{value}/100</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${tone}`} style={{ width: `${Math.max(4, value)}%` }} />
      </div>
    </div>
  );
}

export function RetirementCheckup() {
  const [input, setInput] = useState<CheckupInput>(defaults);
  const [email, setEmail] = useState("");
  const [leadStatus, setLeadStatus] = useState<"idle" | "saved" | "sent" | "error">("idle");
  const [leadError, setLeadError] = useState("");
  const [isPending, startTransition] = useTransition();
  const editedTracked = useRef(false);
  const result = useMemo(() => runRetirementCheckup(input), [input]);

  useEffect(() => {
    trackProductEvent("Checkup Viewed");
  }, []);

  const trackEdited = () => {
    if (editedTracked.current) return;
    editedTracked.current = true;
    trackProductEvent("Checkup Edited");
  };

  const updateNumber = (key: keyof CheckupInput, value: string) => {
    trackEdited();
    setInput((current) => ({ ...current, [key]: Number(value) }));
  };

  const saveEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      const form = new FormData();
      form.set("email", email);
      form.set("summary", result.summary);
      const response = await captureCheckupLead(form);
      // "sent" and "saved" are different claims. Only make the one that is true.
      setLeadStatus(response.ok ? (response.sent ? "sent" : "saved") : "error");
      setLeadError(response.ok ? "" : response.error || "We could not save that.");
      if (response.ok) {
        trackProductEvent("Checkup Lead Captured", { sent: Boolean(response.sent) });
      }
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold tracking-tight">Your 10 numbers</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Change the assumptions and watch the plain scores move.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setInput(defaults)} aria-label="Reset">
            <RotateCcw className="size-4" />
          </Button>
        </div>
        <div className="grid gap-4">
          {[
            ["age", "Current age"],
            ["targetRetirementAge", "Target retirement age"],
            ["retirementSavings", "Retirement savings"],
            ["annualContribution", "Annual contribution"],
            ["annualSpending", "Annual retirement spending"],
            ["socialSecurityAnnual", "Annual Social Security estimate"],
            ["pensionAnnual", "Annual pension/guaranteed income"],
            ["debtPaymentsAnnual", "Annual debt payments"],
          ].map(([key, label]) => (
            <label key={key} className="grid gap-1.5 text-sm font-medium">
              {label}
              <input
                type="number"
                value={input[key as keyof CheckupInput] as number}
                onChange={(e) => updateNumber(key as keyof CheckupInput, e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-hidden focus:border-foreground"
              />
            </label>
          ))}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={input.retireBefore65}
              onChange={(e) => {
                trackEdited();
                setInput((current) => ({ ...current, retireBefore65: e.target.checked }));
              }}
            />
            Retiring before Medicare age 65
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={input.partTimePossible}
              onChange={(e) => {
                trackEdited();
                setInput((current) => ({ ...current, partTimePossible: e.target.checked }));
              }}
            />
            Part-time work is possible
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            Spending flexibility
            <select
              value={input.spendingFlexibility}
              onChange={(e) => {
                trackEdited();
                setInput((current) => ({
                  ...current,
                  spendingFlexibility: e.target.value as CheckupInput["spendingFlexibility"],
                }));
              }}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-hidden focus:border-foreground"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
        </div>
      </section>

      <section className="grid gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="mb-2 text-sm font-medium text-muted-foreground">Plain answer</p>
          <h2 className="text-2xl font-semibold tracking-tight">{result.summary}</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-secondary p-3">
              <p className="text-xs text-muted-foreground">Annual spending gap</p>
              <strong>{currency(result.annualGap)}</strong>
            </div>
            <div className="rounded-lg bg-secondary p-3">
              <p className="text-xs text-muted-foreground">Projected savings range</p>
              <strong>
                {currency(result.projectedSavingsLow)} - {currency(result.projectedSavingsHigh)}
              </strong>
            </div>
            <div className="rounded-lg bg-secondary p-3">
              <p className="text-xs text-muted-foreground">Target portfolio range</p>
              <strong>
                {currency(result.targetPortfolioLow)} - {currency(result.targetPortfolioHigh)}
              </strong>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            The target range is bracketed by the two credible withdrawal-rate benchmarks, not an average of
            them. The low end assumes <strong>4.7%</strong> (Bengen&rsquo;s historical worst case, a more
            aggressive portfolio); the high end assumes <strong>3.9%</strong> (Morningstar&rsquo;s
            forward-looking rate for a rigid, inflation-adjusted paycheck at 90% confidence over 30 years).
            They answer different questions, so there is no single &ldquo;safe&rdquo; number. Projections
            assume 3%&ndash;6% annual returns and are hypothetical, not a guarantee. This is an educational
            estimate, not financial advice.
          </p>
        </div>

        <div className="grid gap-4 rounded-xl border border-border bg-card p-5">
          <ScoreBar label="Confidence" value={result.scores.confidence} />
          <ScoreBar label="Flexibility" value={result.scores.flexibility} />
          <ScoreBar label="Sequence risk" value={result.scores.sequenceRisk} inverse />
          <ScoreBar label="Healthcare gap" value={result.scores.healthcareGap} inverse />
          <ScoreBar label="Tax complexity" value={result.scores.taxComplexity} inverse />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 font-semibold tracking-tight">Top risks</h3>
            <ul className="grid gap-2 text-sm text-muted-foreground">
              {(result.topRisks.length ? result.topRisks : ["No single red flag stands out, but assumptions still need review."]).map((risk) => (
                <li key={risk}>{risk}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 font-semibold tracking-tight">Next steps</h3>
            <div className="grid gap-2">
              {result.nextSteps.map((step) => (
                <Link
                  key={step.href}
                  href={step.href}
                  className="rounded-lg border border-border bg-background p-3 text-sm transition-colors hover:bg-accent"
                >
                  <span className="flex items-center justify-between gap-3 font-medium">
                    {step.label}
                    <ArrowRight className="size-4" />
                  </span>
                  <span className="mt-1 block text-muted-foreground">{step.reason}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={saveEmail} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold tracking-tight">Save this checkup</h3>
            <p className="text-sm text-muted-foreground">
              We store your email and the one-line verdict above — nothing else. Your ages, balances, and
              debts stay in this browser and are never sent to us. We&rsquo;ll use this to let you know when
              checkup email summaries are available.
            </p>
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-hidden focus:border-foreground"
          />
          <Button type="submit" disabled={isPending} className="gap-2">
            <Mail className="size-4" />
            {isPending ? "Saving" : "Save"}
          </Button>
          {leadStatus === "sent" && (
            <span className="text-sm text-emerald-600">Sent — check your inbox.</span>
          )}
          {leadStatus === "saved" && (
            <span className="text-sm text-emerald-600">Saved. We&rsquo;ll send it shortly.</span>
          )}
          {leadStatus === "error" && <span className="text-sm text-red-600">{leadError}</span>}
        </form>
      </section>
    </div>
  );
}
