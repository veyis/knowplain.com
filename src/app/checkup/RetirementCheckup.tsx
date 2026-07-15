"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookmarkPlus,
  Check,
  Mail,
  Printer,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VerificationStamp } from "@/components/VerificationStamp";
import { captureCheckupLead, saveCheckupToAccount } from "./actions";
import { trackProductEvent } from "@/lib/analytics";
import { REAL_RETURN, SWR } from "@/lib/facts-2026";
import {
  compareCheckupScenarios,
  currency,
  runRetirementCheckup,
  type CheckupEstimatedField,
  type CheckupInput,
} from "@/lib/checkup";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { checkupResumePath } from "@/lib/checkup-resume";
import { featureFlags } from "@/lib/feature-flags";
import {
  CHECKUP_STORAGE_KEY,
  CHECKUP_SNAPSHOTS_KEY,
  createCheckupSnapshot,
  isCheckupInput,
  parseCheckupDraft,
  parseCheckupSnapshots,
  serializeCheckupDraft,
  serializeCheckupSnapshots,
  type CheckupSnapshot,
} from "@/lib/checkup-storage";

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

const steps = [
  { title: "Timing", description: "Where you are now and when retirement may begin." },
  { title: "Savings and spending", description: "The resources going in and the lifestyle they need to support." },
  { title: "Income and flexibility", description: "The reliable income and options that can absorb surprises." },
  { title: "Your plain result", description: "A range, the main risks, and one next test." },
] as const;

const numberFields = {
  age: { label: "Current age", help: "Sets how many years your savings have to grow.", min: 18, max: 90, step: 0 },
  targetRetirementAge: { label: "Target retirement age", help: "Sets the growth period and flags any health-coverage bridge before 65.", min: 40, max: 90, step: 0 },
  retirementSavings: { label: "Retirement savings", help: "Use the current total across accounts intended for retirement.", estimateHelp: "Add the latest balances from workplace plans and IRAs; exclude your home unless you plan to spend its equity.", min: 0, max: 50_000_000, step: 1 },
  annualContribution: { label: "Annual contribution", help: "Include your contributions and any employer contribution you expect to continue.", estimateHelp: "Multiply one paycheck contribution by pay periods, then add the employer contribution shown on your plan statement.", min: 0, max: 500_000, step: 1 },
  annualSpending: { label: "Annual retirement spending", help: "A best estimate is enough; use today’s dollars so it matches the projection.", estimateHelp: "Start with average monthly spending × 12, then remove work costs and add retirement health coverage or travel you expect.", min: 0, max: 2_000_000, step: 1 },
  debtPaymentsAnnual: { label: "Annual debt payments", help: "Enter 0 if none; these payments add to what retirement income must cover.", estimateHelp: "Add required monthly payments that will remain in retirement and multiply by 12. Use 0 only if none will remain.", min: 0, max: 500_000, step: 1 },
  socialSecurityAnnual: { label: "Annual Social Security estimate", help: "Enter 0 if not included yet; this reduces the amount your portfolio must supply.", estimateHelp: "Use your my Social Security estimate at the claiming age you are testing, then multiply the monthly amount by 12.", min: 0, max: 200_000, step: 2 },
  pensionAnnual: { label: "Annual pension or guaranteed income", help: "Enter 0 if none or not included yet; use the annual amount before tax.", estimateHelp: "Use the annual benefit from your latest pension statement. Keep the placeholder at 0 only when you want the result to exclude it.", min: 0, max: 500_000, step: 2 },
} as const;

function ScoreBar({ label, value, inverse }: { label: string; value: number; inverse?: boolean }) {
  const effective = inverse ? 100 - value : value;
  const tone = effective >= 70 ? "bg-emerald-500" : effective >= 45 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="grid gap-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{value}/100 · higher is {inverse ? "more risk" : "better"}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${tone}`} style={{ width: `${Math.max(4, value)}%` }} />
      </div>
    </div>
  );
}

export function RetirementCheckup() {
  const [currentStep, setCurrentStep] = useState(0);
  const [input, setInput] = useState<CheckupInput>(defaults);
  const [email, setEmail] = useState("");
  const [leadStatus, setLeadStatus] = useState<"idle" | "saved" | "sent" | "error">("idle");
  const [leadError, setLeadError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isAccountPending, startAccountTransition] = useTransition();
  const [storageReady, setStorageReady] = useState(false);
  const [draftStatus, setDraftStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [snapshots, setSnapshots] = useState<CheckupSnapshot[]>([]);
  const [snapshotName, setSnapshotName] = useState("");
  const [comparisonSnapshotId, setComparisonSnapshotId] = useState("");
  const [scenarioBaseline, setScenarioBaseline] = useState<CheckupInput | null>(null);
  const [scenarioActive, setScenarioActive] = useState(false);
  const [accountStatus, setAccountStatus] = useState<"idle" | "saved" | "auth" | "error">("idle");
  const [accountError, setAccountError] = useState("");
  const [accountResumePath, setAccountResumePath] = useState("");
  const [accountEmailSent, setAccountEmailSent] = useState(false);
  const [accountLoadError, setAccountLoadError] = useState("");
  const [stepError, setStepError] = useState("");
  const editedTracked = useRef(false);
  const result = useMemo(() => runRetirementCheckup(input), [input]);
  const recommendationCategory =
    result.recommendedStep.href === "/tools/am-i-on-track"
      ? "readiness"
      : result.recommendedStep.href === "/tools/aca-bridge"
        ? "healthcare"
        : result.recommendedStep.href === "/tools/sequence-risk"
          ? "sequence"
          : "timing";
  const baselineResult = useMemo(
    () => (scenarioBaseline ? runRetirementCheckup(scenarioBaseline) : null),
    [scenarioBaseline],
  );
  const comparisonSnapshot = snapshots.find(
    (snapshot) => snapshot.id === comparisonSnapshotId,
  );
  const snapshotComparison = useMemo(
    () =>
      comparisonSnapshot
        ? compareCheckupScenarios(input, comparisonSnapshot.input)
        : null,
    [comparisonSnapshot, input],
  );

  useEffect(() => {
    trackProductEvent("Checkup Viewed");
    // Read after the first paint so server HTML and the hydration pass agree. The callback
    // is the external-storage notification boundary, rather than a cascade during the effect.
    const frame = window.requestAnimationFrame(() => {
      const draft = parseCheckupDraft(window.localStorage.getItem(CHECKUP_STORAGE_KEY));
      setSnapshots(
        parseCheckupSnapshots(window.localStorage.getItem(CHECKUP_SNAPSHOTS_KEY)),
      );
      if (draft) {
        setInput(draft.input);
        setSavedAt(draft.savedAt);
        setDraftStatus("saved");
      }
      setStorageReady(true);

      const savedId = new URLSearchParams(window.location.search).get("saved");
      const configured = Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      );
      if (configured && savedId && checkupResumePath(savedId)) {
        void createBrowserClient()
          .from("knowplain_saved_checkups")
          .select("input")
          .eq("id", savedId)
          .single()
          .then(({ data, error }) => {
            if (error || !data || !isCheckupInput(data.input)) {
              setAccountLoadError("That saved scenario could not be loaded.");
              return;
            }
            editedTracked.current = true;
            setInput(data.input);
            setScenarioBaseline(data.input);
            setScenarioActive(false);
            setCurrentStep(3);
            trackProductEvent("Checkup Snapshot Loaded");
          });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!storageReady || !editedTracked.current) return;
    setDraftStatus("saving");
    const timer = window.setTimeout(() => {
      const now = new Date();
      window.localStorage.setItem(CHECKUP_STORAGE_KEY, serializeCheckupDraft(input, now));
      setSavedAt(now.toISOString());
      setDraftStatus("saved");
      trackProductEvent("Checkup Draft Saved Locally");
    }, 500);
    return () => window.clearTimeout(timer);
  }, [input, storageReady]);

  const trackEdited = () => {
    if (editedTracked.current) return;
    editedTracked.current = true;
    trackProductEvent("Checkup Edited");
  };

  const clearDraft = () => {
    window.localStorage.removeItem(CHECKUP_STORAGE_KEY);
    editedTracked.current = false;
    setInput(defaults);
    setSavedAt(null);
    setDraftStatus("idle");
    setCurrentStep(0);
    setScenarioBaseline(null);
    setScenarioActive(false);
    trackProductEvent("Checkup Draft Cleared");
  };

  // Clamp on the way in — HTML min/max is advisory and does not stop typed input.
  const updateNumber = (key: keyof CheckupInput, value: string, min: number, max: number) => {
    trackEdited();
    setStepError("");
    const n = Number(value);
    const clamped = Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;
    setInput((current) => ({
      ...current,
      [key]: clamped,
      estimatedFields: current.estimatedFields?.filter((field) => field !== key),
      ...(key === "targetRetirementAge" ? { retireBefore65: clamped < 65 } : {}),
    }));
  };

  const toggleEstimatedField = (key: CheckupEstimatedField) => {
    trackEdited();
    setInput((current) => {
      const fields = current.estimatedFields ?? [];
      return {
        ...current,
        estimatedFields: fields.includes(key)
          ? fields.filter((field) => field !== key)
          : [...fields, key],
      };
    });
  };

  const validateStep = (step: number) => {
    if (step === 0 && input.targetRetirementAge < input.age) {
      return "Target retirement age must be your current age or later.";
    }
    if (step === 1 && input.annualSpending <= 0) {
      return "Enter a rough annual retirement spending estimate greater than $0.";
    }
    return "";
  };

  const continueFromStep = () => {
    const error = validateStep(currentStep);
    setStepError(error);
    if (error) return;
    moveToStep(currentStep + 1);
  };

  const moveToStep = (step: number) => {
    const bounded = Math.min(steps.length - 1, Math.max(0, step));
    if (bounded > currentStep) {
      trackProductEvent("Checkup Step Completed", { step: steps[currentStep].title });
    }
    if (bounded === 3 && currentStep < 3) {
      setScenarioBaseline(input);
      setScenarioActive(false);
      trackProductEvent("Checkup Completed", { category: recommendationCategory });
    }
    setCurrentStep(bounded);
    window.requestAnimationFrame(() => {
      document.getElementById("checkup-step-heading")?.focus({ preventScroll: false });
    });
  };

  const printSummary = () => {
    trackProductEvent("Checkup Result Printed");
    window.print();
  };

  const applyScenario = (
    transform: (current: CheckupInput) => CheckupInput,
  ) => {
    trackEdited();
    if (!scenarioBaseline) setScenarioBaseline(input);
    setInput((current) => transform(current));
    setScenarioActive(true);
    trackProductEvent("Checkup Scenario Applied");
  };

  const resetScenario = () => {
    if (!scenarioBaseline) return;
    trackEdited();
    setInput(scenarioBaseline);
    setScenarioActive(false);
    trackProductEvent("Checkup Scenario Reset");
  };

  const saveSnapshot = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fallbackName = `Scenario ${snapshots.length + 1}`;
    const snapshot = createCheckupSnapshot(
      crypto.randomUUID(),
      snapshotName.trim() || fallbackName,
      input,
    );
    if (!snapshot) return;
    const next = [snapshot, ...snapshots].slice(0, 10);
    window.localStorage.setItem(CHECKUP_SNAPSHOTS_KEY, serializeCheckupSnapshots(next));
    setSnapshots(next);
    setSnapshotName("");
    trackProductEvent("Checkup Snapshot Saved");
    trackProductEvent("Result Saved Local");
  };

  const loadSnapshot = (snapshot: CheckupSnapshot) => {
    editedTracked.current = true;
    setInput(snapshot.input);
    setScenarioBaseline(snapshot.input);
    setScenarioActive(false);
    setCurrentStep(3);
    trackProductEvent("Checkup Snapshot Loaded");
  };

  const deleteSnapshot = (id: string) => {
    const next = snapshots.filter((snapshot) => snapshot.id !== id);
    window.localStorage.setItem(CHECKUP_SNAPSHOTS_KEY, serializeCheckupSnapshots(next));
    setSnapshots(next);
    if (comparisonSnapshotId === id) setComparisonSnapshotId("");
    trackProductEvent("Checkup Snapshot Deleted");
  };

  const saveAccountSnapshot = () => {
    const name = snapshotName.trim() || `Scenario ${snapshots.length + 1}`;
    setAccountStatus("idle");
    setAccountError("");
    setAccountResumePath("");
    setAccountEmailSent(false);
    startAccountTransition(async () => {
      const form = new FormData();
      form.set("name", name);
      form.set("input", JSON.stringify(input));
      const response = await saveCheckupToAccount(form);
      if (response.ok) {
        setAccountStatus("saved");
        setAccountResumePath(response.resumePath || "");
        setAccountEmailSent(Boolean(response.emailed));
        setSnapshotName("");
        trackProductEvent("Checkup Snapshot Saved");
      } else {
        setAccountStatus(response.requiresAuth ? "auth" : "error");
        setAccountError(response.error || "We could not save that scenario.");
      }
    });
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
      <section className="print-hidden rounded-xl border border-border bg-card p-5">
        <ol aria-label="Checkup progress" className="mb-6 grid grid-cols-4 gap-1.5">
          {steps.map((step, index) => (
            <li key={step.title}>
              <button
                type="button"
                onClick={() => index <= currentStep && moveToStep(index)}
                disabled={index > currentStep}
                aria-current={index === currentStep ? "step" : undefined}
                className="grid min-h-11 w-full place-items-center rounded-md text-xs font-medium disabled:cursor-not-allowed"
              >
                <span
                  className={`grid size-7 place-items-center rounded-full border ${
                    index < currentStep
                      ? "border-primary bg-primary text-primary-foreground"
                      : index === currentStep
                        ? "border-foreground text-foreground"
                        : "border-border text-muted-foreground"
                  }`}
                >
                  {index < currentStep ? <Check className="size-3.5" /> : index + 1}
                </span>
                <span className="sr-only">{step.title}</span>
              </button>
            </li>
          ))}
        </ol>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="checkup-step-heading" tabIndex={-1} className="font-semibold tracking-tight outline-none">
              {steps[currentStep].title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {steps[currentStep].description}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={clearDraft} aria-label="Clear saved checkup and reset">
            <RotateCcw className="size-4" />
          </Button>
        </div>
        <div className="mb-5 rounded-lg bg-secondary px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span aria-live="polite">
              {draftStatus === "saving"
                ? "Saving privately on this device…"
                : savedAt
                  ? `Saved privately on this device ${new Date(savedAt).toLocaleString()}.`
                  : "Edits save privately on this device."}
            </span>
            {savedAt && (
              <button type="button" onClick={clearDraft} className="font-medium text-foreground underline underline-offset-2">
                Clear saved data
              </button>
            )}
          </div>
          <p className="mt-1">Your ages, balances, income, and debts are not sent to Know Plain.</p>
        </div>
        {currentStep < 3 ? (
        <fieldset className="grid gap-4">
          <legend className="sr-only">{steps[currentStep].title}</legend>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Rough estimates are useful here. Enter 0 only where the note says none or not included.
          </p>
          {/* Bounded. An unbounded money field is a bug: clearing a number input yields
              Number("") === 0, and nothing here should silently accept a negative balance
              or an age of 4,000. */}
          {(Object.entries(numberFields) as Array<[
            keyof typeof numberFields,
            (typeof numberFields)[keyof typeof numberFields],
          ]>)
            .filter(([, field]) => field.step === currentStep)
            .map(([key, field]) => (
            <div key={key} className="grid gap-1.5 text-sm font-medium">
              <label htmlFor={`checkup-${key}`} className="flex flex-wrap items-center gap-2">
                {field.label}
                {featureFlags.checkupEstimateLabels && "estimateHelp" in field && input.estimatedFields?.includes(key as CheckupEstimatedField) && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900 dark:bg-amber-950 dark:text-amber-100">Rough estimate</span>
                )}
              </label>
              <input
                id={`checkup-${key}`}
                type="number"
                min={field.min}
                max={field.max}
                value={input[key as keyof CheckupInput] as number}
                onInput={(e) => updateNumber(key as keyof CheckupInput, e.currentTarget.value, field.min, field.max)}
                onBlur={() => {
                  const error = validateStep(currentStep);
                  if (error) setStepError(error);
                }}
                aria-invalid={Boolean(stepError)}
                aria-describedby={stepError ? "checkup-step-error" : undefined}
                className="min-h-11 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
              />
              <span className="text-xs font-normal leading-relaxed text-muted-foreground">{field.help}</span>
              {featureFlags.checkupEstimateLabels && "estimateHelp" in field && (
                <span className="grid gap-1.5 text-xs font-normal leading-relaxed">
                  <button
                    type="button"
                    onClick={() => toggleEstimatedField(key as CheckupEstimatedField)}
                    className="w-fit font-medium text-foreground underline underline-offset-2"
                  >
                    {input.estimatedFields?.includes(key as CheckupEstimatedField)
                      ? "I verified this value"
                      : "I’m not sure — mark as a rough estimate"}
                  </button>
                  {input.estimatedFields?.includes(key as CheckupEstimatedField) && (
                    <span className="rounded-lg bg-secondary px-3 py-2 text-muted-foreground">{field.estimateHelp}</span>
                  )}
                </span>
              )}
            </div>
          ))}
          {currentStep === 0 && input.targetRetirementAge < 65 && (
            <p className="rounded-lg bg-secondary px-3 py-2 text-sm text-secondary-foreground">
              Retiring at {input.targetRetirementAge} creates a bridge before Medicare eligibility at 65.
            </p>
          )}
          {currentStep === 2 && (
          <>
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
              className="min-h-11 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          </>
          )}
          {stepError && (
            <p id="checkup-step-error" role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {stepError}
            </p>
          )}
          <div className="mt-2 flex items-center justify-between gap-3">
            <Button type="button" variant="ghost" onClick={() => moveToStep(currentStep - 1)} disabled={currentStep === 0}>
              <ArrowLeft className="size-4" /> Back
            </Button>
            <Button type="button" onClick={continueFromStep}>
              {currentStep === 2 ? "See my result" : "Continue"} <ArrowRight className="size-4" />
            </Button>
          </div>
        </fieldset>
        ) : (
          <div className="grid gap-3">
            <p className="text-sm text-muted-foreground">
              Your result uses the values saved privately on this device. Change any section to test a different assumption.
            </p>
            <Button type="button" variant="outline" onClick={() => moveToStep(2)}>
              <ArrowLeft className="size-4" /> Review answers
            </Button>
            <Button type="button" variant="outline" onClick={printSummary}>
              <Printer className="size-4" /> Print private summary
            </Button>
          </div>
        )}
      </section>

      {currentStep === 3 ? (
      <section id="checkup-result" className="grid gap-4">
        {accountLoadError && (
          <p role="alert" className="print-hidden rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {accountLoadError}
          </p>
        )}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="mb-2 text-sm font-medium text-muted-foreground">Plain answer</p>
          <h2 className="text-2xl font-semibold tracking-tight">{result.summary}</h2>
          {result.estimatedFields.length > 0 && (
            <div role="note" className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm leading-relaxed text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
              <strong>This is a provisional result.</strong> {result.estimatedFields.length} {result.estimatedFields.length === 1 ? "input is" : "inputs are"} marked as a rough estimate. Use the range to frame the next question, then replace estimates before making a decision.
            </div>
          )}
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
            them. The low end assumes <strong>{(SWR.bengenRevised * 100).toFixed(1)}%</strong>{" "}
            (Bengen&rsquo;s historical worst case, a more aggressive portfolio); the high end assumes{" "}
            <strong>{(SWR.morningstar2026 * 100).toFixed(1)}%</strong> (Morningstar&rsquo;s
            forward-looking rate for a rigid, inflation-adjusted paycheck at 90% confidence over 30 years).
            They answer different questions, so there is no single &ldquo;safe&rdquo; number.{" "}
            {/* This used to say "3%-6% annual returns", which was both stale AND the unit bug: a
                nominal-looking return compared against a target built from TODAY'S spending. Both
                sides are now in today's dollars, and the copy has to say so or the reader cannot
                tell whether the headline number flatters them. */}
            <strong>Everything here is in today&rsquo;s dollars.</strong> Savings are projected to grow at{" "}
            {(REAL_RETURN.conservative * 100).toFixed(0)}%&ndash;
            {(REAL_RETURN.optimistic * 100).toFixed(0)}% a year <em>after inflation</em>, so the projection
            and the target are directly comparable, and holding your contribution flat in today&rsquo;s
            dollars assumes you raise it with inflation each year. Hypothetical, not a guarantee. An
            educational estimate, not financial advice.
          </p>
          <div className="mt-4 rounded-lg border border-border p-3">
            <h3 className="text-sm font-semibold">Three assumptions that move this result most</h3>
            <ul className="mt-2 grid gap-1.5 text-xs leading-relaxed text-muted-foreground">
              <li><strong className="text-foreground">Spending:</strong> {currency(input.annualSpending)} a year in today&rsquo;s dollars, plus {currency(input.debtPaymentsAnnual)} of debt payments.{(input.estimatedFields?.includes("annualSpending") || input.estimatedFields?.includes("debtPaymentsAnnual")) ? " At least one is a rough estimate." : ""}</li>
              <li><strong className="text-foreground">Income floor:</strong> {currency(input.socialSecurityAnnual + input.pensionAnnual)} a year from Social Security and pensions.{(input.estimatedFields?.includes("socialSecurityAnnual") || input.estimatedFields?.includes("pensionAnnual")) ? " At least one is a rough estimate." : ""}</li>
              <li><strong className="text-foreground">Time and growth:</strong> {result.yearsToRetirement} years of contributions with {(REAL_RETURN.conservative * 100).toFixed(0)}%&ndash;{(REAL_RETURN.optimistic * 100).toFixed(0)}% annual growth after inflation.</li>
            </ul>
          </div>
          <div className="mt-4">
            <VerificationStamp
              label="2026 planning assumptions checked"
              verified="2026-07-11"
              sourceCount={2}
              detailsHref="/sources"
            />
          </div>
        </div>

        <div className="print-hidden rounded-xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold tracking-tight">What could improve this?</h3>
              <p className="mt-1 max-w-[62ch] text-sm text-muted-foreground">
                Try one reversible planning lever. These are scenarios, not recommendations, and they update only this browser.
              </p>
            </div>
            {scenarioActive && (
              <Button type="button" variant="ghost" size="sm" onClick={resetScenario}>
                Reset scenarios
              </Button>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={input.targetRetirementAge >= 90}
              onClick={() =>
                applyScenario((current) => ({
                  ...current,
                  targetRetirementAge: Math.min(90, current.targetRetirementAge + 1),
                  retireBefore65: current.targetRetirementAge + 1 < 65,
                }))
              }
            >
              Work one year longer
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={input.annualSpending <= 0}
              onClick={() =>
                applyScenario((current) => ({
                  ...current,
                  annualSpending: Math.round(current.annualSpending * 0.95),
                }))
              }
            >
              Spend 5% less
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={input.annualContribution >= 500_000}
              onClick={() =>
                applyScenario((current) => ({
                  ...current,
                  annualContribution: Math.min(500_000, current.annualContribution + 5_000),
                }))
              }
            >
              Save $5,000 more yearly
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={input.partTimePossible}
              onClick={() =>
                applyScenario((current) => ({ ...current, partTimePossible: true }))
              }
            >
              Add part-time flexibility
            </Button>
          </div>
          {scenarioActive && baselineResult && (
            <div aria-live="polite" className="mt-4 grid gap-2 rounded-lg bg-secondary p-3 text-sm sm:grid-cols-2">
              <p>
                <span className="block text-xs text-muted-foreground">Projected midpoint change</span>
                <strong>
                  {currency(
                    (result.projectedSavingsLow + result.projectedSavingsHigh) / 2 -
                      (baselineResult.projectedSavingsLow + baselineResult.projectedSavingsHigh) / 2,
                  )}
                </strong>
              </p>
              <p>
                <span className="block text-xs text-muted-foreground">Target midpoint change</span>
                <strong>
                  {currency(
                    (result.targetPortfolioLow + result.targetPortfolioHigh) / 2 -
                      (baselineResult.targetPortfolioLow + baselineResult.targetPortfolioHigh) / 2,
                  )}
                </strong>
              </p>
            </div>
          )}
        </div>

        <div className="print-hidden rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold tracking-tight">Private snapshots</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Save up to ten named scenarios on this device. They are not uploaded or tied to an account.
          </p>
          <form onSubmit={saveSnapshot} className="mt-4 flex flex-col gap-2 sm:flex-row">
            <label className="sr-only" htmlFor="snapshot-name">Snapshot name</label>
            <input
              id="snapshot-name"
              value={snapshotName}
              maxLength={48}
              onChange={(event) => setSnapshotName(event.target.value)}
              placeholder={`Scenario ${snapshots.length + 1}`}
              className="min-h-11 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button type="submit" variant="outline">
              <BookmarkPlus className="size-4" /> Save snapshot
            </Button>
          </form>
          <div className="mt-3 border-t border-border pt-3">
            <p className="text-xs leading-relaxed text-muted-foreground">
              Optional account save: pressing the button below explicitly uploads this named scenario—including its financial inputs—to your private account so you can open it on another device. It stays there until you delete it from your profile.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={saveAccountSnapshot}
                disabled={isAccountPending}
              >
                {isAccountPending ? "Saving…" : "Save to my account and email a resume link"}
              </Button>
              {accountStatus === "saved" && (
                <span role="status" className="text-sm text-success">
                  Saved to your private account. {accountEmailSent ? "Secure resume link sent." : "Email is not configured, so no message was claimed or queued."}
                  {accountResumePath && <> <Link href={accountResumePath} className="font-medium underline">Open saved scenario</Link>.</>}
                </span>
              )}
              {accountStatus === "auth" && (
                <span className="text-sm text-muted-foreground">
                  {accountError} <Link href="/login" className="font-medium text-foreground underline">Sign in</Link>
                </span>
              )}
              {accountStatus === "error" && (
                <span role="alert" className="text-sm text-destructive">{accountError}</span>
              )}
            </div>
          </div>
          {snapshots.length > 0 && (
            <div className="mt-4 rounded-lg border border-border p-3">
              <label htmlFor="snapshot-comparison" className="grid gap-1.5 text-sm font-medium">
                Compare current plan with
                <select
                  id="snapshot-comparison"
                  value={comparisonSnapshotId}
                  onChange={(event) => setComparisonSnapshotId(event.target.value)}
                  className="min-h-11 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Choose a saved snapshot</option>
                  {snapshots.map((snapshot) => (
                    <option key={snapshot.id} value={snapshot.id}>{snapshot.name}</option>
                  ))}
                </select>
              </label>
              {snapshotComparison && comparisonSnapshot && (
                <div aria-live="polite" className="mt-3">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Current plan minus <strong className="text-foreground">{comparisonSnapshot.name}</strong>.
                    These differences reflect changed assumptions and modeled outcomes—not investment returns
                    or measured portfolio performance.
                  </p>
                  <dl className="mt-3 grid gap-x-5 gap-y-2 text-sm sm:grid-cols-2">
                    {[
                      ["Retirement age", `${snapshotComparison.targetRetirementAge >= 0 ? "+" : ""}${snapshotComparison.targetRetirementAge} years`],
                      ["Savings entered", `${snapshotComparison.retirementSavings >= 0 ? "+" : "−"}${currency(Math.abs(snapshotComparison.retirementSavings))}`],
                      ["Annual contribution", `${snapshotComparison.annualContribution >= 0 ? "+" : "−"}${currency(Math.abs(snapshotComparison.annualContribution))}`],
                      ["Annual spending", `${snapshotComparison.annualSpending >= 0 ? "+" : "−"}${currency(Math.abs(snapshotComparison.annualSpending))}`],
                      ["Reliable income entered", `${snapshotComparison.incomeFloor >= 0 ? "+" : "−"}${currency(Math.abs(snapshotComparison.incomeFloor))}`],
                      ["Modeled projection midpoint", `${snapshotComparison.projectedMidpoint >= 0 ? "+" : "−"}${currency(Math.abs(snapshotComparison.projectedMidpoint))}`],
                      ["Modeled target midpoint", `${snapshotComparison.targetMidpoint >= 0 ? "+" : "−"}${currency(Math.abs(snapshotComparison.targetMidpoint))}`],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between gap-3 border-b border-border py-1.5">
                        <dt className="text-muted-foreground">{label}</dt>
                        <dd className="font-medium tabular-nums">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          )}
          {snapshots.length > 0 && (
            <ul className="mt-4 divide-y divide-border border-y border-border">
              {snapshots.map((snapshot) => (
                <li key={snapshot.id} className="flex items-center gap-2 py-2.5">
                  <button
                    type="button"
                    onClick={() => loadSnapshot(snapshot)}
                    className="min-h-11 min-w-0 flex-1 rounded-md px-2 text-left hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="block truncate text-sm font-medium">{snapshot.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      Saved {new Date(snapshot.createdAt).toLocaleDateString()}
                    </span>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteSnapshot(snapshot.id)}
                    aria-label={`Delete ${snapshot.name}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
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
            <h3 className="mb-1 font-semibold tracking-tight">Your next plain step</h3>
            <p className="mb-3 text-xs text-muted-foreground">Recommended from the constraint that stands out most in this checkup.</p>
            <div className="grid gap-2">
              <Link
                href={result.recommendedStep.href}
                onClick={() => trackProductEvent("Recommended Action Opened", { category: recommendationCategory })}
                className="rounded-lg border border-foreground bg-background p-3 text-sm transition-colors hover:bg-accent"
              >
                <span className="flex items-center justify-between gap-3 font-medium">
                  {result.recommendedStep.label}
                  <ArrowRight className="size-4" />
                </span>
                <span className="mt-1 block text-muted-foreground">{result.recommendedStep.reason}</span>
              </Link>
              <Link href={result.supportingArticle.href} onClick={() => trackProductEvent("Supporting Explainer Opened")} className="px-1 py-2 text-sm text-muted-foreground underline underline-offset-4">
                Read: {result.supportingArticle.label}
              </Link>
            </div>
          </div>
        </div>

        <form onSubmit={saveEmail} className="print-hidden flex flex-col gap-3 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center">
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
            <span className="text-sm text-emerald-600">Email saved. No message was sent because transactional email is not configured.</span>
          )}
          {leadStatus === "error" && <span className="text-sm text-red-600">{leadError}</span>}
        </form>
      </section>
      ) : (
        <section className="print-hidden grid min-h-[420px] place-items-center rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
          <div className="max-w-sm">
            <p className="text-sm font-medium">Your result is waiting</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Complete the three short sections. Your numbers stay in this browser, and the final page will explain the range before recommending one next test.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
