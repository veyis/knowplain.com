import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { pageMeta, site } from "@/lib/site";
import { toolPages } from "@/lib/tools";

export const metadata = pageMeta(
  "/tools",
  "Tools",
  "Retirement roadmap pack and planning tools Know Plain recommends.",
);

export default function ToolsPage() {
  return (
    <AppShell active="tools">
      <div className="mb-4 grid gap-3 rounded-2xl border border-line bg-surface p-6">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[0.72rem] font-semibold text-brand">
            Tool
          </span>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[0.72rem] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            Free
          </span>
        </div>
        <h1 className="text-[1.5rem] font-semibold tracking-tight">Retirement Roadmap Pack</h1>
        <p className="max-w-[52ch] text-muted-foreground">
          Spreadsheet + one-page plan + checklist. Know if you’re roughly on track in under 30
          minutes.
        </p>
        <div className="mt-1 flex flex-wrap gap-2">
          <Button asChild>
            <a href={site.legacyRoadmapUrl} rel="noopener noreferrer">Open live calculator</a>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/topics/retirement">Browse retirement hub</Link>
          </Button>
        </div>
      </div>

      <div className="mb-3 mt-8 flex items-baseline justify-between">
        <h2 className="text-base font-semibold">Owned planning tools</h2>
        <span className="text-sm text-muted-foreground">Transparent assumptions</span>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {Object.entries(toolPages).map(([slug, tool]) => (
          <Link key={slug} href={`/tools/${slug}`} className="group grid gap-1.5 rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/20">
            <div className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">Tool</div>
            <strong>{tool.title}</strong>
            <p className="text-sm text-muted-foreground">{tool.description}</p>
          </Link>
        ))}
      </div>

      {/* FTC 16 CFR 255: the disclosure must be plain-language, unavoidable, and adjacent to
          the endorsement — before the first paid link, not only in the footer or on /disclosure. */}
      <h2 className="mb-2 mt-8 text-base font-semibold">Planning apps we link to</h2>
      <p className="mb-3 text-sm text-muted-foreground">
        We may earn a commission if you sign up through paid links below. It costs you nothing extra.
        That pays for this site, and it is why we label each one. See our{" "}
        <Link href="/disclosure">Disclosure</Link>.
      </p>
      <div className="grid gap-3 md:grid-cols-3">
        <a className="group grid gap-1.5 rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/20" href={site.empowerUrl} rel="sponsored noopener noreferrer" target="_blank">
          <div className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">Paid link</div>
          <strong>Empower dashboard</strong>
          <p className="text-sm text-muted-foreground">Free net worth + retirement planner.</p>
        </a>
        <a className="group grid gap-1.5 rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/20" href={site.boldinUrl} rel="noopener noreferrer" target="_blank">
          <div className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">Tool</div>
          <strong>Boldin</strong>
          <p className="text-sm text-muted-foreground">DIY stress-test planner.</p>
        </a>
        {/* Was labelled "Coming" while fully live, indexable, and linked from two places. */}
        <Link href="/tools/withdrawal-simulator" className="group grid gap-1.5 rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/20">
          <div className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">Tool</div>
          <strong>Withdrawal simulator</strong>
          <p className="text-sm text-muted-foreground">
            Watch a 30-year drawdown play out, and save the scenario.
          </p>
        </Link>
      </div>
      <p className="mt-6 rounded-xl border border-dashed border-line bg-card p-4 text-sm text-muted-foreground">
        Some links are affiliates. If you use them, Know Plain may earn a commission at no extra cost
        to you. See <Link href="/disclosure">Disclosure</Link>.
      </p>
    </AppShell>
  );
}
