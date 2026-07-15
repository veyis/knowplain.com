import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { JsonLd } from "@/components/JsonLd";
import { FACT_SOURCES } from "@/lib/facts-2026";
import { fact } from "@/lib/facts-display";
import { breadcrumbJsonLd } from "@/lib/schema";
import { pageMeta, site } from "@/lib/site";

export const metadata = pageMeta(
  "/changes/2026",
  "What changed for retirement planning in 2026",
  "A sourced 2026 retirement-rules changelog covering contribution limits, Roth catch-ups, Social Security, Medicare, ACA subsidies, deductions, and upcoming changes.",
);

type Change = {
  title: string;
  status: "effective" | "volatile" | "next";
  summary: React.ReactNode;
  action: string;
  source: keyof typeof FACT_SOURCES;
};

const changes: Change[] = [
  {
    title: "Retirement contribution limits were indexed upward",
    status: "effective",
    summary: <>The employee deferral is {fact("401k.deferral")}; the age-50 catch-up is {fact("401k.catchUp50")}. Ages 60–63 can use the larger {fact("401k.superCatchUp")} catch-up.</>,
    action: "Update payroll elections, especially if you turn 50, 60, or 64 this year.",
    source: "contributions",
  },
  {
    title: "Higher earners must make catch-up contributions as Roth",
    status: "effective",
    summary: <>The SECURE 2.0 Roth catch-up rule is effective in 2026. It applies when prior-year FICA wages from the sponsoring employer exceed {fact("401k.mandatoryRothWageThreshold")}.</>,
    action: "Confirm that your plan and payroll system can accept Roth catch-up contributions.",
    source: "contributions",
  },
  {
    title: "Social Security received its annual COLA",
    status: "effective",
    summary: <>Benefits rose {fact("ss.cola")}. The earnings-test limits are now {fact("ss.earningsTestUnderFra")} below full retirement age and {fact("ss.earningsTestFraYear")} during the year you reach it.</>,
    action: "Refresh benefit estimates and withholding assumptions rather than reusing a 2025 statement.",
    source: "socialSecurity",
  },
  {
    title: "Medicare premiums and thresholds changed",
    status: "effective",
    summary: <>The standard Part B premium is {fact("medicare.partBPremium")} per month and its deductible is {fact("medicare.partBDeductible")}. IRMAA still uses a {fact("medicare.irmaaLookback")}-year income lookback.</>,
    action: "Model 2026 premiums and remember that a conversion this year can affect Medicare costs two years later.",
    source: "medicare",
  },
  {
    title: "The enhanced ACA credits expired and the subsidy cliff returned",
    status: "volatile",
    summary: <>For 2026 coverage, premium-tax-credit eligibility again ends above {fact("aca.cliffPercent")} of the federal poverty level. The approximate one-person threshold is {fact("aca.cliffSingle")}.</>,
    action: "Recheck projected household income before conversions, capital gains, or large withdrawals—and verify the law again before acting.",
    source: "aca",
  },
  {
    title: "Excess advance ACA credits no longer have a repayment cap",
    status: "volatile",
    summary: <>Beginning with 2026 tax years, households may have to repay every dollar of excess advance premium tax credit, rather than relying on the old income-based repayment caps.</>,
    action: "Update marketplace income promptly when your income changes and keep a tax reserve.",
    source: "aptcRepayment",
  },
  {
    title: "A cash charitable deduction returned for non-itemizers",
    status: "effective",
    summary: <>Eligible cash gifts can be deducted up to {fact("charitable.nonItemizerSingle")} for single filers or {fact("charitable.nonItemizerMfj")} for married couples filing jointly.</>,
    action: "Keep receipts even if you expect to take the standard deduction.",
    source: "charitable",
  },
  {
    title: "The Saver’s Match begins next year",
    status: "next",
    summary: <>Starting in 2027, the Saver’s Credit is replaced by a government match of up to {fact("saversMatch.maxMatch")} deposited into a retirement account, subject to income limits.</>,
    action: "Treat this as a 2027 planning item; do not include it as a 2026 tax credit.",
    source: "saversMatch",
  },
];

const statusLabel = {
  effective: "Effective for 2026",
  volatile: "Recheck before acting",
  next: "Starts in 2027",
} as const;

export default function Changes2026Page() {
  return (
    <AppShell active="retirement">
      <JsonLd data={[breadcrumbJsonLd([
        { name: "Home", url: site.url },
        { name: "2026 retirement changes", url: `${site.url}/changes/2026` },
      ])]} />
      <article className="mx-auto max-w-[780px]">
        <header className="mb-8">
          <p className="mb-3 text-sm text-muted-foreground"><Link href="/sources">2026 sources</Link> / Annual changelog</p>
          <h1 className="text-[clamp(2rem,5vw,3.25rem)] font-semibold tracking-tight">What changed for retirement planning in 2026</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">The changes that can alter a contribution, tax estimate, healthcare bridge, or retirement-income decision—separated from rules that merely stayed in force.</p>
          <div className="mt-5 rounded-xl border border-border bg-secondary/60 p-4 text-sm leading-relaxed">
            <strong>How to use this page:</strong> update your assumptions, then follow the primary-source link before making an irreversible decision. Items marked “Recheck before acting” can change through legislation.
          </div>
        </header>

        <div className="grid gap-5">
          {changes.map((change) => {
            const source = FACT_SOURCES[change.source];
            return (
              <section key={change.title} className="rounded-xl border border-border bg-card p-5">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold tracking-tight">{change.title}</h2>
                  <span className={`rounded-full border px-2 py-0.5 text-[0.7rem] font-semibold ${change.status === "volatile" ? "border-amber-400/60 bg-amber-50 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100" : "border-border bg-secondary text-secondary-foreground"}`}>{statusLabel[change.status]}</span>
                </div>
                <p className="leading-relaxed text-foreground/85">{change.summary}</p>
                <p className="mt-3 text-sm"><strong>Planning response:</strong> {change.action}</p>
                <p className="mt-3 text-xs text-muted-foreground">Source: <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline">{source.publisher} — {source.title}</a>. Verified {source.verified}.</p>
              </section>
            );
          })}
        </div>

        <footer className="mt-8 rounded-xl border border-border p-5 text-sm leading-relaxed text-muted-foreground">
          This changelog is educational, not tax or investment advice. See the <Link href="/sources" className="underline">complete source ledger</Link>, <Link href="/methodology" className="underline">methodology</Link>, and <Link href="/corrections" className="underline">correction process</Link>.
        </footer>
      </article>
    </AppShell>
  );
}
