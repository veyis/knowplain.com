import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen, FileText, GitCompareArrows, MessagesSquare, PlayCircle, SearchX, Wrench } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SearchForm } from "@/components/SearchForm";
import { SearchInsights } from "@/components/SearchInsights";
import { Badge } from "@/components/ui/badge";
import { searchDocs, type ContentType } from "@/lib/content";
import { classifySearchQuery } from "@/lib/search";
import { pillars, type PillarId } from "@/lib/site";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

const typeMeta: Record<ContentType, { label: string; Icon: typeof FileText }> = {
  explainer: { label: "Explainer", Icon: FileText },
  tool: { label: "Tool", Icon: Wrench },
  video: { label: "Video", Icon: PlayCircle },
  thread: { label: "Thread", Icon: MessagesSquare },
  decision: { label: "Decision", Icon: GitCompareArrows },
  glossary: { label: "Definition", Icon: BookOpen },
};

const starterQuestions = [
  "How much do I need to retire?",
  "Can I retire before 65?",
  "When should I claim Social Security?",
];

const contentTypes = Object.keys(typeMeta) as ContentType[];

function filterHref(q: string, type?: string, pillar?: string) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (type) params.set("type", type);
  if (pillar) params.set("pillar", pillar);
  return `/search?${params.toString()}`;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; pillar?: string }>;
}) {
  const { q = "", type, pillar } = await searchParams;
  const ranked = searchDocs(q);
  const activeType = contentTypes.includes(type as ContentType) ? (type as ContentType) : undefined;
  const activePillar = pillar && pillar in pillars ? (pillar as PillarId) : undefined;
  const hits = ranked.filter(
    (hit) => (!activeType || hit.type === activeType) && (!activePillar || hit.pillar === activePillar),
  );
  const firstTool = hits.findIndex((hit) => hit.type === "tool");
  const firstDecision = hits.findIndex((hit) => hit.type === "decision");

  return (
    <AppShell active="home">
      <SearchInsights
        hasQuery={Boolean(q.trim())}
        resultCount={ranked.length}
        zeroResultCategory={classifySearchQuery(q)}
      />
      <div className="mb-6 max-w-xl">
        <SearchForm initialQuery={q} />
      </div>

      <div className="mb-4 flex items-baseline justify-between">
        <h1 className="text-base font-semibold tracking-tight">Search results</h1>
        <span className="text-sm text-muted-foreground">
          {q ? `for “${q}”` : "all content"} · {hits.length} {hits.length === 1 ? "hit" : "hits"}
        </span>
      </div>

      <nav aria-label="Filter search results" className="mb-5 grid gap-3 rounded-xl border border-border bg-card p-3 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">Type</span>
          <Link href={filterHref(q, undefined, activePillar)} aria-current={!activeType ? "page" : undefined} className="rounded-full border border-border px-3 py-1.5 aria-[current=page]:bg-foreground aria-[current=page]:text-background">All</Link>
          {contentTypes.map((value) => (
            <Link key={value} href={filterHref(q, value, activePillar)} aria-current={activeType === value ? "page" : undefined} className="rounded-full border border-border px-3 py-1.5 aria-[current=page]:bg-foreground aria-[current=page]:text-background">
              {typeMeta[value].label}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">Topic</span>
          <Link href={filterHref(q, activeType)} aria-current={!activePillar ? "page" : undefined} className="rounded-full border border-border px-3 py-1.5 aria-[current=page]:bg-foreground aria-[current=page]:text-background">All</Link>
          {(Object.keys(pillars) as PillarId[]).map((value) => (
            <Link key={value} href={filterHref(q, activeType, value)} aria-current={activePillar === value ? "page" : undefined} className="rounded-full border border-border px-3 py-1.5 aria-[current=page]:bg-foreground aria-[current=page]:text-background">
              {pillars[value].title}
            </Link>
          ))}
        </div>
      </nav>

      {hits.length === 0 ? (
        <div className="grid justify-items-center gap-3 rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
          <SearchX className="size-6 text-muted-foreground" />
          <p className="text-sm font-medium">No results for “{q}”</p>
          <p className="max-w-[36ch] text-sm text-muted-foreground">
            Try one of these common retirement questions, or use fewer details.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {starterQuestions.map((question) => (
              <Link
                key={question}
                href={`/search?q=${encodeURIComponent(question)}`}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-sm hover:bg-accent"
              >
                {question}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {hits.map((h, index) => {
            const meta = typeMeta[h.type];
            const Icon = meta.Icon;
            const resultRole = index === 0
              ? "Best answer"
              : index === firstTool
                ? "Calculator"
                : index === firstDecision
                  ? "Decision guide"
                  : h.type === "explainer"
                    ? "Supporting reading"
                    : undefined;
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
                  {resultRole && <Badge variant="outline">{resultRole}</Badge>}
                  {h.pillar && <span className="text-xs text-muted-foreground">{pillars[h.pillar].title}</span>}
                  <span className="text-xs text-muted-foreground">knowplain.com</span>
                </div>
                <div className="text-[1.05rem] font-semibold tracking-tight group-hover:underline">
                  {h.title}
                </div>
                <div className="text-sm text-muted-foreground">{h.snippet}</div>
                <div className="text-xs text-muted-foreground">
                  Matched in {h.matchedOn === "question" ? "a common question" : h.matchedOn === "body" ? "the article or transcript" : h.matchedOn}.
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
