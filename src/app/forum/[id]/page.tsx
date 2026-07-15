import { notFound } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { createPost, reportContent, toggleLike } from "../actions";
import { Flag, Heart, Reply } from "lucide-react";

type Thread = {
  id: string;
  title: string;
  pillar: string;
  created_at: string;
  status: "pending" | "published" | "hidden" | "locked";
  knowplain_profiles?: { display_name: string } | null;
  knowplain_forum_likes?: { count: number }[] | null;
};

type Post = {
  id: string;
  content: string;
  created_at: string;
  status: "pending" | "published" | "hidden";
  knowplain_profiles?: { display_name: string } | null;
};

const pillarColors: Record<string, string> = {
  "retirement": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  "money-psychology": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  "decision-tools": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
};

// User-generated threads stay out of the index until moderation is real. Thin or
// unreviewed UGC on a YMYL finance domain drags site-wide quality, and Google's
// DiscussionForumPosting markup should be earned, not led with. Curated answers live
// at /forum/questions/* and ARE indexed.
export const metadata = {
  robots: { index: false, follow: true },
};

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("knowplain_forum_threads")
    .select(`
      id,
      title,
      pillar,
      created_at,
      status,
      knowplain_profiles ( display_name ),
      knowplain_forum_likes ( count )
    `)
    .eq("id", id)
    .single();

  const thread = data as unknown as Thread;

  if (!thread) notFound();

  let hasLiked = false;
  if (user) {
    const { data: likeData } = await supabase
      .from("knowplain_forum_likes")
      .select("user_id")
      .eq("thread_id", id)
      .eq("user_id", user.id)
      .single();
    if (likeData) hasLiked = true;
  }

  const { data: posts } = await supabase
    .from("knowplain_forum_posts")
    .select(`
      id,
      content,
      created_at,
      status,
      knowplain_profiles ( display_name )
    `)
    .eq("thread_id", id)
    .order("created_at", { ascending: true });

  const postList = (posts ?? []) as unknown as Post[];

  const pColor = pillarColors[thread.pillar] || "bg-secondary text-secondary-foreground";
  const likeCount = thread.knowplain_forum_likes?.[0]?.count || 0;

  return (
    <AppShell active="forum">
      <div className="mx-auto max-w-3xl">
        <Breadcrumbs className="mb-6" items={[{ label: "Home", href: "/" }, { label: "Forum", href: "/forum" }, { label: thread.title }]} />

        {/* Thread Header */}
        <div className="mb-8 border-b border-line pb-6">
          <span className={`mb-4 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${pColor}`}>
            {thread.pillar.replace("-", " ")}
          </span>
          <h1 className="mb-4 text-3xl font-bold tracking-tight">{thread.title}</h1>
          {thread.status === "pending" && (
            <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">Pending moderation. Only you and moderators can view this discussion.</p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Posted by <strong className="text-ink">{thread.knowplain_profiles?.display_name || "Anonymous"}</strong></span>
            <span>•</span>
            <span>{new Date(thread.created_at).toLocaleDateString()}</span>
          </div>
          
          <div className="mt-6 flex items-center gap-3">
            {user ? (
              <form action={toggleLike}>
                <input type="hidden" name="thread_id" value={thread.id} />
                <button 
                  type="submit" 
                  className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                    hasLiked 
                      ? 'border-red-200 bg-red-50 text-red-600 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400' 
                      : 'border-line bg-surface hover:bg-canvas text-muted-foreground hover:text-ink'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${hasLiked ? 'fill-current' : ''}`} />
                  {likeCount} {likeCount === 1 ? 'Upvote' : 'Upvotes'}
                </button>
              </form>
            ) : (
              <Link href="/login" className="flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 text-sm font-medium text-muted-foreground hover:bg-canvas">
                <Heart className="h-4 w-4" />
                {likeCount} {likeCount === 1 ? 'Upvote' : 'Upvotes'}
              </Link>
            )}
            {user && (
              <form action={reportContent} className="flex items-center gap-2">
                <input type="hidden" name="thread_id" value={thread.id} />
                <label className="sr-only" htmlFor="report-thread-reason">Report reason</label>
                <select id="report-thread-reason" name="reason" defaultValue="dangerous-advice" className="min-h-10 rounded-full border border-border bg-background px-3 text-xs">
                  <option value="dangerous-advice">Dangerous advice</option><option value="spam">Spam</option><option value="harassment">Harassment</option><option value="privacy">Private information</option><option value="other">Other</option>
                </select>
                <button type="submit" className="flex min-h-10 items-center gap-1.5 rounded-full border border-border px-3 text-xs"><Flag className="size-3.5" /> Report</button>
              </form>
            )}
          </div>
        </div>

        {/* Posts */}
        <div className="mb-10 grid gap-6">
          {postList.map((p) => (
            <div key={p.id} className="group rounded-2xl border border-line bg-surface p-6 shadow-xs transition-shadow hover:shadow-sm">
              <div className="mb-4 flex items-center justify-between border-b border-line pb-4 text-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-canvas font-bold text-ink">
                    {(p.knowplain_profiles?.display_name || "A").charAt(0).toUpperCase()}
                  </div>
                  <strong className="font-semibold text-ink">{p.knowplain_profiles?.display_name || "Anonymous"}</strong>
                </div>
                <span className="text-muted-foreground">{new Date(p.created_at).toLocaleString()}</span>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed text-secondary">
                {p.content}
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
                {p.status === "pending" ? <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Pending moderation · visible only to you</span> : <span />}
                {user && (
                  <form action={reportContent} className="flex items-center gap-2">
                    <input type="hidden" name="post_id" value={p.id} />
                    <label className="sr-only" htmlFor={`report-${p.id}`}>Report reason</label>
                    <select id={`report-${p.id}`} name="reason" defaultValue="dangerous-advice" className="min-h-10 rounded-full border border-border bg-background px-3 text-xs">
                      <option value="dangerous-advice">Dangerous advice</option><option value="spam">Spam</option><option value="harassment">Harassment</option><option value="privacy">Private information</option><option value="other">Other</option>
                    </select>
                    <button type="submit" className="flex min-h-10 items-center gap-1.5 rounded-full border border-border px-3 text-xs"><Flag className="size-3.5" /> Report</button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Reply Form */}
        <div id="reply">
          {user && thread.status !== "locked" ? (
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-xs">
              <div className="mb-4 flex items-center gap-2 font-semibold">
                <Reply className="h-5 w-5 text-blue-600" />
                <h3>Write a Reply</h3>
              </div>
                <form action={createPost} className="flex flex-col gap-4">
                <p className="text-xs text-muted-foreground">Replies remain pending until moderation. Do not include private account or contact information.</p>
                <input type="hidden" name="thread_id" value={thread.id} />
                <textarea 
                  name="content" 
                  required 
                  rows={5}
                  placeholder="Share your thoughts..."
                  className="w-full resize-none rounded-xl border border-line bg-canvas px-4 py-3 text-sm outline-hidden focus:border-ink"
                />
                <Button type="submit" className="self-end">Post Reply</Button>
              </form>
            </div>
          ) : thread.status === "locked" ? (
            <div className="rounded-2xl border border-line bg-secondary p-6 text-center text-sm text-muted-foreground">This discussion is locked and no longer accepts replies.</div>
          ) : (
            <div className="rounded-2xl border border-line bg-blue-50 p-6 text-center dark:bg-blue-950/20">
              <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">Join the Discussion</h3>
              <p className="mb-4 text-sm text-blue-800 dark:text-blue-200">
                You must be signed in to post a reply.
              </p>
              <Button asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
