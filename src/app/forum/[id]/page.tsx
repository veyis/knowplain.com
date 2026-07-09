import { notFound } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import { createPost } from "../actions";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: thread } = await supabase
    .from("knowplain_forum_threads")
    .select(`
      id,
      title,
      pillar,
      created_at,
      knowplain_profiles ( display_name )
    `)
    .eq("id", id)
    .single();

  if (!thread) notFound();

  const { data: posts } = await supabase
    .from("knowplain_forum_posts")
    .select(`
      id,
      content,
      created_at,
      knowplain_profiles ( display_name )
    `)
    .eq("thread_id", id)
    .order("created_at", { ascending: true });

  return (
    <AppShell active="forum">
      <div className="mb-4 text-sm text-muted">
        <Link href="/forum">Forum</Link> › {thread.title}
      </div>

      <h1 className="mb-6 text-2xl font-bold">{thread.title}</h1>

      <div className="mb-8 grid gap-4">
        {posts?.map((p: any) => (
          <div key={p.id} className="rounded-xl border border-line bg-surface p-5 shadow-soft">
            <div className="mb-3 flex items-center justify-between text-xs text-muted">
              <strong>{p.knowplain_profiles?.display_name || "Anonymous"}</strong>
              <span>{new Date(p.created_at).toLocaleString()}</span>
            </div>
            <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-secondary">{p.content}</div>
          </div>
        ))}
      </div>

      {user ? (
        <div className="rounded-[14px] border border-line bg-surface p-5">
          <h3 className="mb-3 font-semibold">Reply</h3>
          <form action={createPost} className="flex flex-col gap-3">
            <input type="hidden" name="thread_id" value={thread.id} />
            <textarea 
              name="content" 
              required 
              rows={4}
              placeholder="Write a reply..."
              className="w-full resize-none rounded-md border border-line bg-white px-3 py-2 text-sm outline-hidden focus:border-ink"
            />
            <button type="submit" className="kp-btn-primary self-end">Post Reply</button>
          </form>
        </div>
      ) : (
        <div className="rounded-xl border border-line bg-surface p-4 text-center text-sm">
          <Link href="/login" className="font-semibold underline">Sign in</Link> to join the discussion.
        </div>
      )}
    </AppShell>
  );
}
