import Link from "next/link";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import { createThread } from "./actions";

export const metadata: Metadata = {
  title: "Forum",
  description: "Community Q&A for retirement and money psychology.",
};

export default async function ForumPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let threads: any[] = [];
  let errorMsg = null;

  const { data, error } = await supabase
    .from("knowplain_forum_threads")
    .select(`
      id,
      title,
      pillar,
      created_at,
      knowplain_profiles ( display_name )
    `)
    .order("created_at", { ascending: false });

  if (error && error.code === 'PGRST205') {
    errorMsg = "Forum tables haven't been created in the database yet.";
  } else if (data) {
    threads = data;
  }

  return (
    <AppShell active="forum">
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="text-xl font-semibold">Community Forum</h1>
      </div>
      
      {errorMsg && (
        <div className="mb-6 rounded-md bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Database setup required:</strong> {errorMsg} Run the SQL schema to enable the forum.
        </div>
      )}
      
      {user && (
        <div className="mb-8 rounded-[14px] border border-line bg-surface p-5 shadow-soft">
          <h2 className="mb-3 font-semibold">Start a new discussion</h2>
          <form action={createThread} className="flex flex-col gap-3">
            <input 
              name="title" 
              required 
              placeholder="Discussion title..." 
              className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm outline-hidden focus:border-ink"
            />
            <textarea 
              name="content" 
              required 
              placeholder="What's on your mind?" 
              rows={3}
              className="w-full resize-none rounded-md border border-line bg-white px-3 py-2 text-sm outline-hidden focus:border-ink"
            />
            <div className="flex items-center justify-between">
              <select name="pillar" className="rounded-md border border-line bg-white px-3 py-2 text-sm outline-hidden">
                <option value="retirement">Retirement</option>
                <option value="money-psychology">Money Psychology</option>
                <option value="decision-tools">Decision Tools</option>
              </select>
              <button type="submit" className="kp-btn-primary">Post Thread</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-3">
        {threads?.map((t: any) => (
          <Link key={t.id} href={`/forum/${t.id}`} className="block rounded-xl border border-line bg-white p-4 hover:border-ink">
            <strong className="text-lg">{t.title}</strong>
            <div className="mt-1 flex gap-3 text-xs text-muted">
              <span>{t.pillar}</span>
              <span>•</span>
              <span>by {t.knowplain_profiles?.display_name || "Anonymous"}</span>
              <span>•</span>
              <span>{new Date(t.created_at).toLocaleDateString()}</span>
            </div>
          </Link>
        ))}
        {(!threads || threads.length === 0) && (
          <div className="py-10 text-center text-sm text-muted">No threads yet. Be the first to start a discussion!</div>
        )}
      </div>
    </AppShell>
  );
}
