import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { EditorialPerson } from "@/lib/editorial";

export function ArticleTrust({
  author,
  reviewer,
  published,
  updated,
  reviewed,
  riskLevel,
}: {
  author: EditorialPerson;
  /** Absent when nobody qualified has actually reviewed this page — say nothing rather than claim it. */
  reviewer?: EditorialPerson;
  published?: string;
  updated: string;
  reviewed?: string;
  riskLevel?: string;
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
    </div>
  );
}

