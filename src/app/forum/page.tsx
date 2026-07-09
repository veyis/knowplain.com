import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Forum",
  description: "Community Q&A for retirement and money psychology. Moderated. Coming soon.",
  robots: { index: false, follow: true },
};

const threads = [
  { title: "Starting late at 45 — what’s realistic?", stats: "Preview · Retirement · Moderated" },
  { title: "Does the 4% rule still hold with higher valuations?", stats: "Preview · Linked to explainer" },
  { title: "How do you talk money with a spouse who avoids it?", stats: "Preview · Money psychology" },
];

export default function ForumPage() {
  return (
    <AppShell active="forum">
      <div className="mb-3 flex items-baseline justify-between">
        <h1 className="text-base font-semibold">Forum</h1>
        <span className="text-sm text-muted">Phase 2 · Supabase-ready</span>
      </div>
      {threads.map((t) => (
        <div key={t.title} className="mb-2.5 grid gap-1 rounded-xl border border-line bg-surface p-4">
          <strong>{t.title}</strong>
          <div className="text-xs text-muted">{t.stats}</div>
        </div>
      ))}
      <p className="mt-4 rounded-xl border border-dashed border-line bg-white p-4 text-sm text-muted">
        Forums ship after pillar density + moderation. Wire Supabase Auth + `forum_threads` table in
        Phase 2. Schema: QAPage / DiscussionForumPosting.
      </p>
    </AppShell>
  );
}
