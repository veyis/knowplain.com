import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { pageMeta } from "@/lib/site";
import { featureFlags, rolloutRegistry } from "@/lib/feature-flags";
import { baselineWindow, productFunnel } from "@/lib/product-funnels";

export const metadata = pageMeta(
  "/operations",
  "Operations and product decision log",
  "Know Plain’s review cadence, quality ownership, and evidence-linked product decisions.",
);

const decisions = [
  { date: "2026-07-14", decision: "Keep detailed checkup inputs in the browser by default.", evidence: "The checkup does not need server storage to calculate a result, and balances, income, and debts create avoidable privacy risk.", verify: "/privacy#checkup-data" },
  { date: "2026-07-14", decision: "Use ranges and threshold maps instead of confidence-sounding single forecasts.", evidence: "Withdrawal-rate methods answer different questions, while ACA and Medicare costs change discontinuously at legal thresholds.", verify: "/methodology#range-construction" },
  { date: "2026-07-14", decision: "Require moderation before community submissions become public.", evidence: "Retirement questions are high-stakes and can attract scams, personalized securities advice, and unsafe identity disclosure.", verify: "/forum/guidelines" },
  { date: "2026-07-14", decision: "Deny analytics properties by default and monitor failures only by coarse class.", evidence: "Raw search, error, URL, and form context can contain health details, balances, email addresses, or tax information.", verify: "/privacy#analytics-data" },
] as const;

export default function OperationsPage() {
  return (
    <AppShell>
      <article className="max-w-[820px]">
        <header className="mb-8">
          <h1 className="text-[clamp(1.8rem,4vw,2.5rem)] font-semibold tracking-tight">Operations and decision log</h1>
          <p className="mt-3 leading-relaxed text-muted-foreground">A public record of how Know Plain keeps volatile facts current, reviews product quality, and connects material decisions to evidence.</p>
        </header>

        <section aria-labelledby="weekly-review" className="border-t border-border py-6">
          <h2 id="weekly-review" className="text-xl font-semibold tracking-tight">Weekly volatile-fact review</h2>
          <p className="mt-2 text-sm text-muted-foreground"><strong className="text-foreground">Owner:</strong> editorial operations. <strong className="text-foreground">Escalation:</strong> engineering when a canonical fact or calculator changes.</p>
          <ol className="mt-4 grid gap-2 text-sm leading-relaxed text-muted-foreground">
            <li>1. Check ACA legislation, CMS announcements, IRS guidance, and SSA updates represented by volatile records in the <Link href="/sources" className="underline">source ledger</Link>.</li>
            <li>2. Record the check date even when the value is unchanged; update the canonical fact and every dependent test when it changes.</li>
            <li>3. Run unit, content-token, calculator-evidence, and production-build verification.</li>
            <li>4. Add a visible correction when a published output was materially wrong, then document the change in the annual changelog.</li>
          </ol>
        </section>

        <section aria-labelledby="monthly-review" className="border-t border-border py-6">
          <h2 id="monthly-review" className="text-xl font-semibold tracking-tight">Monthly product-quality review</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground"><strong className="text-foreground">Owners:</strong> product and engineering. Review accessibility failures, broken links, zero-result categories, checkup completion, calculator boundaries, community reports, corrections, performance, and privacy-policy conformance. New journey changes require a hypothesis, primary metric, guardrail, and rollback condition before release.</p>
        </section>

        <section aria-labelledby="funnel-dashboard" className="border-t border-border py-6">
          <h2 id="funnel-dashboard" className="text-xl font-semibold tracking-tight">Product funnel dashboard</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Instrumentation is deployed. Baselines remain explicitly pending until a complete {baselineWindow.durationDays}-day production window exists; no sample or fabricated counts are shown.
          </p>
          <div className="mt-4 overflow-x-auto" role="region" aria-label="Product funnel metric definitions" tabIndex={0}>
            <table className="min-w-[700px] w-full text-left text-sm">
              <caption className="sr-only">Acquisition, activation, value, and retention funnel definitions and baseline status</caption>
              <thead><tr className="border-b border-border"><th className="p-2">Stage</th><th className="p-2">Rate</th><th className="p-2">Initial target</th><th className="p-2">Baseline</th></tr></thead>
              <tbody>{productFunnel.map((stage) => (
                <tr key={stage.name} className="border-b border-border last:border-0">
                  <th scope="row" className="p-2 font-semibold">{stage.name}</th>
                  <td className="p-2 text-muted-foreground">{stage.numerator} ÷ {stage.denominator}</td>
                  <td className="p-2 tabular-nums">{stage.target}</td>
                  <td className="p-2"><span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">Pending production data</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground"><strong className="text-foreground">Baseline rule:</strong> {baselineWindow.rule}</p>
        </section>

        <section aria-labelledby="release-controls" className="border-t border-border py-6">
          <h2 id="release-controls" className="text-xl font-semibold tracking-tight">Reversible release controls</h2>
          <p className="mt-2 text-sm text-muted-foreground">Material interaction changes ship with an owner, hypothesis, metric, guardrails, and rollback condition.</p>
          <div className="mt-4 grid gap-4">
            {(Object.keys(rolloutRegistry) as Array<keyof typeof rolloutRegistry>).map((key) => {
              const release = rolloutRegistry[key];
              return (
                <article key={key} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold tracking-tight">{key}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${featureFlags[key] ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100" : "bg-muted text-muted-foreground"}`}>{featureFlags[key] ? "Enabled" : "Rolled back"}</span>
                  </div>
                  <dl className="mt-3 grid gap-2 text-sm">
                    <div><dt className="inline font-semibold">Owner: </dt><dd className="inline text-muted-foreground">{release.owner}</dd></div>
                    <div><dt className="inline font-semibold">Hypothesis: </dt><dd className="inline text-muted-foreground">{release.hypothesis}</dd></div>
                    <div><dt className="inline font-semibold">Primary metric: </dt><dd className="inline text-muted-foreground">{release.primaryMetric}</dd></div>
                    <div><dt className="inline font-semibold">Rollback: </dt><dd className="inline text-muted-foreground">{release.rollback}</dd></div>
                  </dl>
                </article>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="decision-log" className="border-t border-border py-6">
          <h2 id="decision-log" className="text-xl font-semibold tracking-tight">Decision log</h2>
          <div className="mt-4 grid gap-4">
            {decisions.map((entry) => (
              <article key={`${entry.date}-${entry.decision}`} className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs font-medium text-muted-foreground">{entry.date}</p>
                <h3 className="mt-1 font-semibold tracking-tight">{entry.decision}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{entry.evidence}</p>
                <Link href={entry.verify} className="mt-2 inline-block text-sm font-medium underline underline-offset-2">Inspect supporting policy</Link>
              </article>
            ))}
          </div>
        </section>
      </article>
    </AppShell>
  );
}
