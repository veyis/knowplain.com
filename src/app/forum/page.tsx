import Link from "next/link";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { seededQuestions } from "@/lib/forum-seeds";
import { createThread } from "./actions";
import { MessageSquare, Heart, PlusCircle } from "lucide-react";

type ThreadList = {
  id: string;
  title: string;
  pillar: string;
  created_at: string;
  knowplain_profiles?: { display_name: string } | null;
  knowplain_forum_posts?: { count: number }[] | null;
  knowplain_forum_likes?: { count: number }[] | null;
};

export const metadata: Metadata = pageMeta(
  "/forum",
  "Forum",
  "Community Q&A for retirement and money psychology.",
);

const pillarColors: Record<string, string> = {
  "retirement": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  "money-psychology": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  "decision-tools": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
};

export default async function ForumPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let threads: ThreadList[] = [];
  let errorMsg = null;

  const { data, error } = await supabase
    .from("knowplain_forum_threads")
    .select(`
      id,
      title,
      pillar,
      created_at,
      knowplain_profiles ( display_name ),
      knowplain_forum_posts ( count ),
      knowplain_forum_likes ( count )
    `)
    .order("created_at", { ascending: false });

  if (error && error.code === 'PGRST205') {
    errorMsg = "Forum tables haven't been created in the database yet.";
  } else if (data) {
    threads = data as unknown as ThreadList[];
  }

  return (
    <AppShell active="forum">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold tracking-tight">Community Forum</h1>
          <p className="text-muted-foreground">Discuss retirement strategies and money psychology.</p>
        </div>
      </div>
      
      {errorMsg && (
        <div className="mb-8 rounded-xl bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          <strong>Database setup required:</strong> {errorMsg} Run the SQL schema to enable the forum.
        </div>
      )}
      <div className="mb-8 rounded-2xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold tracking-tight">Curated answer hubs</h2>
            <p className="text-sm text-muted-foreground">Moderated starter questions for common retirement decisions.</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/forum/questions">View all</Link>
          </Button>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {Object.entries(seededQuestions).slice(0, 4).map(([slug, q]) => (
            <Link key={slug} href={`/forum/questions/${slug}`} className="rounded-lg bg-secondary/70 px-3 py-2.5 text-sm hover:bg-accent">
              <strong>{q.title}</strong>
            </Link>
          ))}
        </div>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Threads List */}
        <div className="grid gap-4">
          {threads?.map((t: ThreadList) => {
            const replyCount = t.knowplain_forum_posts?.[0]?.count || 0;
            const likeCount = t.knowplain_forum_likes?.[0]?.count || 0;
            const pColor = pillarColors[t.pillar] || "bg-secondary text-secondary-foreground";

            return (
              <Link 
                key={t.id} 
                href={`/forum/${t.id}`} 
                className="group flex flex-col justify-between gap-4 rounded-2xl border border-line bg-surface p-5 transition-shadow hover:shadow-md sm:flex-row sm:items-center"
              >
                <div>
                  <span className={`mb-3 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${pColor}`}>
                    {t.pillar.replace("-", " ")}
                  </span>
                  <h3 className="mb-1 text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {t.title}
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    Started by <span className="font-medium text-ink">{t.knowplain_profiles?.display_name || "Anonymous"}</span> • {new Date(t.created_at).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Heart className="h-4 w-4" />
                    <span>{likeCount}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4" />
                    <span>{replyCount}</span>
                  </div>
                </div>
              </Link>
            );
          })}
          {(!threads || threads.length === 0) && !errorMsg && (
            <div className="rounded-2xl border border-dashed border-line py-12 text-center text-muted-foreground">
              No threads yet. Be the first to start a discussion!
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          {user ? (
            <div className="sticky top-6 rounded-2xl border border-line bg-surface p-6 shadow-xs">
              <div className="mb-5 flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-blue-600" />
                <h2 className="font-semibold tracking-tight">New Discussion</h2>
              </div>
              <form action={createThread} className="flex flex-col gap-4">
                <input 
                  name="title" 
                  required 
                  placeholder="Discussion title..." 
                  className="w-full rounded-xl border border-line bg-canvas px-4 py-2.5 text-sm outline-hidden focus:border-ink"
                />
                <textarea 
                  name="content" 
                  required 
                  placeholder="What's on your mind?" 
                  rows={4}
                  className="w-full resize-none rounded-xl border border-line bg-canvas px-4 py-2.5 text-sm outline-hidden focus:border-ink"
                />
                <select name="pillar" className="w-full rounded-xl border border-line bg-canvas px-4 py-2.5 text-sm outline-hidden focus:border-ink">
                  <option value="retirement">Retirement</option>
                  <option value="money-psychology">Money Psychology</option>
                  <option value="decision-tools">Decision Tools</option>
                </select>
                <Button type="submit" className="w-full">Post Thread</Button>
              </form>
            </div>
          ) : (
            <div className="sticky top-6 rounded-2xl border border-line bg-blue-50 p-6 dark:bg-blue-950/20">
              <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">Join the Conversation</h3>
              <p className="mb-4 text-sm text-blue-800 dark:text-blue-200">
                Sign in to start a new discussion or reply to existing threads.
              </p>
              <Button asChild className="w-full">
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
