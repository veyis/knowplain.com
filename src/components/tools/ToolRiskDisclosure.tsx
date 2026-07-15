import { AlertTriangle } from "lucide-react";
import type { HighRiskToolDisclosure } from "@/lib/tools";

export function ToolRiskDisclosure({ disclosure }: { disclosure: HighRiskToolDisclosure }) {
  return (
    <aside
      aria-labelledby="high-risk-disclosure-heading"
      className="mt-5 rounded-xl border border-amber-300/70 bg-amber-50/70 p-5 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-amber-100"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide">High-impact estimate</p>
          <h2 id="high-risk-disclosure-heading" className="mt-1 text-lg font-semibold tracking-tight">
            What this result cannot decide for you
          </h2>
          <p className="mt-2 max-w-[78ch] text-sm leading-relaxed">{disclosure.uncertainty}</p>
        </div>
      </div>
      <div className="mt-4 pl-8">
        <h3 className="text-sm font-semibold">Important factors not modeled</h3>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
          {disclosure.omissions.map((omission) => <li key={omission}>{omission}</li>)}
        </ul>
        <a
          href={disclosure.verifyHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-current px-4 py-2 text-sm font-semibold underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {disclosure.verifyLabel}
        </a>
      </div>
    </aside>
  );
}
