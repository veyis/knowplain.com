import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { EditorialPerson } from "@/lib/editorial";
import { VerificationStamp } from "@/components/VerificationStamp";

export function ArticleTrust({
  author,
  reviewer,
  published,
  updated,
  reviewed,
  riskLevel,
  sourceCount,
  volatile,
  volatileNote,
  correction,
}: {
  author: EditorialPerson;
  /** Absent when nobody qualified has actually reviewed this page — say nothing rather than claim it. */
  reviewer?: EditorialPerson;
  published?: string;
  updated: string;
  reviewed?: string;
  riskLevel?: string;
  sourceCount?: number;
  volatile?: boolean;
  volatileNote?: string;
  correction?: { date: string; summary: string };
}) {
  return (
    <div className="mb-6 grid gap-3 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="font-normal">
          Educational only
        </Badge>
        {riskLevel && (
          <Badge variant="outline" className="font-normal">
            {riskLevel} review priority
          </Badge>
        )}
        {volatile && (
          <Badge variant="outline" className="border-amber-400/60 bg-amber-50 font-normal text-amber-950 dark:bg-amber-950/30 dark:text-amber-100">
            Law or guidance can change
          </Badge>
        )}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <span>
          By{" "}
          <Link href={`/authors/${author.slug}`} className="font-medium text-foreground hover:underline">
            {author.name}
          </Link>
        </span>
        {reviewer && (
          <span>
            Reviewed by{" "}
            <Link href={`/reviewers/${reviewer.slug}`} className="font-medium text-foreground hover:underline">
              {reviewer.name}
            </Link>
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {published && <span>Published {published}</span>}
        <span>Updated {updated}</span>
        {reviewer && reviewed && <span>Reviewed {reviewed}</span>}
      </div>
      <details className="text-xs">
        <summary className="cursor-pointer font-medium text-foreground">What these dates mean</summary>
        <p className="mt-1 leading-relaxed">Published is the original release. Updated records a material content change. Reviewed records the latest documented factual or editorial review; it does not mean personalized professional advice.</p>
      </details>
      {volatile && volatileNote && (
        <p className="rounded-lg border border-amber-300/50 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100"><strong>Volatile assumption:</strong> {volatileNote}</p>
      )}
      {correction && (
        <aside aria-label="Correction note" className="rounded-lg border border-border bg-secondary p-3 text-xs leading-relaxed text-foreground">
          <strong>Correction — {correction.date}:</strong> {correction.summary}
        </aside>
      )}
      <VerificationStamp
        label={reviewer ? "Editorial review recorded" : "Source review recorded"}
        verified={reviewed || updated}
        sourceCount={sourceCount}
        detailsHref="/methodology"
      />
    </div>
  );
}
