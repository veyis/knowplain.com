import Link from "next/link";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { SearchForm } from "@/components/SearchForm";
import { searchDocs } from "@/lib/content";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
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
      <div className="mb-3 flex items-baseline justify-between">
        <h1 className="text-base font-semibold">Search results</h1>
        <span className="text-sm text-muted">
          {q ? `for “${q}”` : "demo index"} · {hits.length} hits · noindex
        </span>
      </div>
      <div>
        {hits.map((h) => (
          <Link
            key={h.href + h.title}
            href={h.href}
            className="grid gap-1 border-b border-line py-4 hover:[&_.title]:underline"
          >
            <div className="flex items-center gap-2">
              <span className="kp-badge">{h.type}</span>
              <span className="text-xs text-[#8a8a8a]">knowplain.com</span>
            </div>
            <div className="title text-[1.1rem] font-semibold tracking-tight">{h.title}</div>
            <div className="text-sm text-muted">{h.snippet}</div>
          </Link>
        ))}
      </div>
      <p className="mt-6 rounded-xl border border-dashed border-line bg-white p-4 text-sm text-muted">
        Phase 1 uses an in-memory index. Phase 2: Typesense/Algolia or Postgres full-text via
        Supabase. Keep this route <strong>noindex</strong>.
      </p>
    </AppShell>
  );
}
