import Link from "next/link";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tools",
  description: "Retirement roadmap pack and planning tools Know Plain recommends.",
};

export default function ToolsPage() {
  return (
    <AppShell active="tools">
      <div className="mb-4 grid gap-3 rounded-2xl border border-line bg-surface p-6">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[0.72rem] font-semibold text-accent">
            Tool
          </span>
          <span className="rounded-full bg-[#ecfdf3] px-2.5 py-1 text-[0.72rem] font-semibold text-ok">
            Free
          </span>
        </div>
        <h1 className="text-[1.5rem] font-semibold tracking-tight">Retirement Roadmap Pack</h1>
        <p className="max-w-[52ch] text-muted">
          Spreadsheet + one-page plan + checklist. Know if you’re roughly on track in under 30
          minutes.
        </p>
        <div className="mt-1 flex flex-wrap gap-2">
          <a className="kp-btn-primary" href={site.legacyRoadmapUrl} rel="noopener noreferrer">
            Open live calculator
          </a>
          <Link className="kp-btn" href="/topics/retirement">
            Browse retirement hub
          </Link>
        </div>
      </div>

      <div className="mb-3 mt-8 flex items-baseline justify-between">
        <h2 className="text-base font-semibold">Planning tools</h2>
        <span className="text-sm text-muted">Affiliate links disclosed</span>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <a className="kp-card" href={site.empowerUrl} rel="sponsored noopener noreferrer" target="_blank">
          <div className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted">Affiliate</div>
          <strong>Empower dashboard</strong>
          <p className="text-sm text-muted">Free net worth + retirement planner.</p>
        </a>
        <a className="kp-card" href={site.boldinUrl} rel="noopener noreferrer" target="_blank">
          <div className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted">Tool</div>
          <strong>Boldin</strong>
          <p className="text-sm text-muted">DIY stress-test planner.</p>
        </a>
        <a className="kp-card" href={site.ynabUrl} rel="noopener noreferrer" target="_blank">
          <div className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted">Tool</div>
          <strong>YNAB</strong>
          <p className="text-sm text-muted">Budgeting that sticks.</p>
        </a>
      </div>
      <p className="mt-6 rounded-xl border border-dashed border-line bg-white p-4 text-sm text-muted">
        Some links are affiliates. If you use them, Know Plain may earn a commission at no extra cost
        to you. See <Link href="/disclosure">Disclosure</Link>.
      </p>
    </AppShell>
  );
}
