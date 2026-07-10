import Link from "next/link";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { SearchForm } from "@/components/SearchForm";
import { createClient } from "@/lib/supabase/server";

type SearchHit = {
  id: string;
  href: string;
  type: string;
  title: string;
  snippet: string;
};

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
  const supabase = await createClient();

  let hits: SearchHit[] = [];
  let errorMsg = null;

  if (q) {
    // Perform Postgres full-text search against the fts vector, or fallback to simple ilike if no fts available
    const { data, error } = await supabase
      .from("knowplain_search_index")
      .select("*")
      .textSearch("fts", `'${q}'`, { config: 'english' })
      .limit(20);
    
    if (error && error.code === 'PGRST205') {
      errorMsg = "Search index table is missing.";
    } else if (data) {
      hits = data;
    }
  } else {
    // Just list all if no query
    const { data, error } = await supabase
      .from("knowplain_search_index")
      .select("*")
      .limit(20);
      
    if (error && error.code === 'PGRST205') {
      errorMsg = "Search index table is missing.";
    } else if (data) {
      hits = data;
    }
  }

  return (
    <AppShell active="home">
      <div className="mb-6 max-w-xl">
        <SearchForm initialQuery={q} />
      </div>
      
      {errorMsg && (
        <div className="mb-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
          <strong>Database missing:</strong> Run the SQL schema to enable search.
        </div>
      )}

      <div className="mb-3 flex items-baseline justify-between">
        <h1 className="text-base font-semibold">Search results</h1>
        <span className="text-sm text-muted">
          {q ? `for “${q}”` : "all content"} · {hits?.length || 0} hits
        </span>
      </div>
      <div>
        {hits?.map((h) => (
          <Link
            key={h.id}
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
    </AppShell>
  );
}
