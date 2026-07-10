import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { pageMeta } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";

type Video = {
  id: string;
  title: string;
  thumbnail_url: string | null;
  published_at: string;
};

export const metadata = pageMeta(
  "/watch",
  "Videos",
  "Know Plain YouTube explainers with chapters and transcript pages for SEO.",
);

export default async function WatchPage() {
  const supabase = await createClient();
  const { data: videos } = await supabase
    .from("knowplain_videos")
    .select("*")
    .order("published_at", { ascending: false });

  return (
    <AppShell active="watch">
      <div className="mb-3 flex items-baseline justify-between">
        <h1 className="text-base font-semibold">Videos</h1>
        <span className="text-sm text-muted">/watch — embed + transcript SEO</span>
      </div>
      
      {!videos || videos.length === 0 ? (
        <div className="rounded-md bg-amber-50 p-4 text-sm text-amber-800">
          No videos found. Please run the YouTube sync script and ensure the schema is applied.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {videos.map((video: Video) => (
            <Link key={video.id} href={`/watch/${video.id}`} className="kp-card overflow-hidden !p-0">
              <div className="relative aspect-video w-full bg-line">
                {video.thumbnail_url && (
                  <Image src={video.thumbnail_url} alt={video.title} fill className="object-cover" />
                )}
              </div>
              <div className="p-4">
                <div className="mb-1 text-[0.7rem] font-semibold uppercase tracking-wide text-muted">
                  {new Date(video.published_at).toLocaleDateString()}
                </div>
                <strong className="line-clamp-2 text-lg tracking-tight leading-tight">{video.title}</strong>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
