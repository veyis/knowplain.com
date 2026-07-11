import Link from "next/link";
import type { Metadata } from "next";
import { FileText, MessagesSquare, PlayCircle, SearchX, Wrench } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SearchForm } from "@/components/SearchForm";
import { Badge } from "@/components/ui/badge";
import { searchDocs, type ContentType } from "@/lib/content";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

const typeMeta: Record<ContentType, { label: string; Icon: typeof FileText }> = {
  explainer: { label: "Explainer", Icon: FileText },
  tool: { label: "Tool", Icon: Wrench },
  video: { label: "Video", Icon: PlayCircle },
  thread: { label: "Thread", Icon: MessagesSquare },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const hits = searchDocs(q);

  return (
    <AppShell active="home">
      <div className="mb-6 max-w-xl">
        <SearchForm initialQuery={q} />
      </div>

      <div className="mb-4 flex items-baseline justify-between">
        <h1 className="text-base font-semibold tracking-tight">Search results</h1>
        <span className="text-sm text-muted-foreground">
          {q ? `for “${q}”` : "all content"} · {hits.length} {hits.length === 1 ? "hit" : "hits"}
        </span>
      </div>

      {hits.length === 0 ? (
        <div className="grid justify-items-center gap-3 rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
          <SearchX className="size-6 text-muted-foreground" />
          <p className="text-sm font-medium">No results for “{q}”</p>
          <p className="max-w-[36ch] text-sm text-muted-foreground">
            Try a broader term, or press{" "}
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 [font-family:system-ui,sans-serif] text-[0.65rem]">
              ⌘K
            </kbd>{" "}
            to browse everything.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {hits.map((h) => {
            const meta = typeMeta[h.type];
            const Icon = meta.Icon;
            return (
              <Link
                key={h.href}
                href={h.href}
                className="group grid gap-1.5 px-4 py-4 transition-colors hover:bg-accent"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1 font-normal">
                    <Icon className="size-3" />
                    {meta.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">knowplain.com</span>
                </div>
                <div className="text-[1.05rem] font-semibold tracking-tight group-hover:underline">
                  {h.title}
                </div>
                <div className="text-sm text-muted-foreground">{h.snippet}</div>
              </Link>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
