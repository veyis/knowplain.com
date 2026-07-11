import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { pageMeta } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import { fallbackVideos, type KnowPlainVideo } from "@/lib/videos";

export const metadata = pageMeta(
  "/watch",
  "Videos",
  "Know Plain YouTube explainers with chapters and transcript pages for SEO.",
);

export default async function WatchPage() {
  let videos: KnowPlainVideo[] | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("knowplain_videos")
      .select("*")
      .order("published_at", { ascending: false });
    videos = data as KnowPlainVideo[] | null;
  } catch {
    videos = null;
  }
  const videoList = videos?.length ? videos : fallbackVideos;

  return (
    <AppShell active="watch">
      <div className="mb-3 flex items-baseline justify-between">
        <h1 className="text-base font-semibold">Videos</h1>
        <span className="text-sm text-muted-foreground">/watch — embed + transcript SEO</span>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2">
        {videoList.map((video) => (
          <Link key={video.id} href={`/watch/${video.id}`} className="group grid gap-1.5 rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/20 overflow-hidden !p-0">
            <div className="relative grid aspect-video w-full place-items-center bg-line text-sm font-medium text-muted-foreground">
              {video.thumbnail_url ? (
                <Image src={video.thumbnail_url} alt={video.title} fill className="object-cover" />
              ) : (
                <span>Know Plain video</span>
              )}
            </div>
            <div className="p-4">
              <div className="mb-1 text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
                {new Date(video.published_at).toLocaleDateString()}
              </div>
              <strong className="line-clamp-2 text-lg tracking-tight leading-tight">{video.title}</strong>
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
