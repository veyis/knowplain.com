import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { pageMeta } from "@/lib/site";
import { videos } from "@/lib/content";

export const metadata = pageMeta(
  "/watch",
  "Videos",
  "Know Plain YouTube explainers with chapters and transcript pages for SEO.",
);

export default function WatchPage() {
  return (
    <AppShell active="watch">
      <div className="mb-3 flex items-baseline justify-between">
        <h1 className="text-base font-semibold">Videos</h1>
        <span className="text-sm text-muted">/watch — embed + transcript SEO</span>
      </div>
      <div className="grid gap-4">
        {videos.map((video) => (
          <Link key={video.slug} href={`/watch/${video.slug}`} className="kp-card">
            <div className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted">Video</div>
            <strong className="text-lg tracking-tight">{video.title}</strong>
            <p className="text-sm text-muted">{video.description}</p>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
