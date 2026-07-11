import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { JsonLd } from "@/components/JsonLd";
import { createClient } from "@/lib/supabase/server";
import { breadcrumbJsonLd, videoObjectJsonLd } from "@/lib/schema";
import { site } from "@/lib/site";
import { getFallbackVideo, type KnowPlainVideo } from "@/lib/videos";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let video: KnowPlainVideo | null = getFallbackVideo(slug) || null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("knowplain_videos").select("*").eq("id", slug).single();
    video = (data as KnowPlainVideo | null) || video;
  } catch {
    // Fall back to static video content.
  }
  if (!video) return {};
  
  return {
    title: video.title,
    description: video.description,
    alternates: { canonical: `/watch/${slug}` },
    openGraph: {
      type: "video.other",
      siteName: site.name,
      title: video.title,
      description: video.description,
      url: `${site.url}/watch/${slug}`,
    },
  };
}

export default async function VideoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let video: KnowPlainVideo | null = getFallbackVideo(slug) || null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("knowplain_videos").select("*").eq("id", slug).single();
    video = (data as KnowPlainVideo | null) || video;
  } catch {
    // Fall back to static video content.
  }
  
  if (!video) notFound();
  const isYoutubeId = /^[a-zA-Z0-9_-]{11}$/.test(video.id);
  const embedUrl = isYoutubeId ? `https://www.youtube.com/embed/${video.id}` : `${site.url}/watch/${video.id}`;

  return (
    <AppShell active="watch">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: site.url },
            { name: "Videos", url: `${site.url}/watch` },
            { name: video.title, url: `${site.url}/watch/${slug}` },
          ]),
          videoObjectJsonLd({
            name: video.title,
            description: video.description,
            thumbnailUrl: video.thumbnail_url || `${site.url}/opengraph-image`,
            uploadDate: video.published_at,
            embedUrl,
            url: `${site.url}/watch/${slug}`,
            duration: video.duration,
          }),
        ]}
      />
      <div className="mb-4 text-sm text-muted-foreground">
        <Link href="/watch">Videos</Link> › {video.title}
      </div>
      
      <div className="mb-6 grid aspect-video place-items-center rounded-[14px] bg-black text-white overflow-hidden">
        {isYoutubeId ? (
          <iframe
            width="100%"
            height="100%"
            src={embedUrl}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="border-0"
          ></iframe>
        ) : (
          <div className="grid gap-2 text-center">
            <span className="text-lg font-semibold">{video.title}</span>
            <span className="text-sm text-white/70">Transcript-first fallback page</span>
          </div>
        )}
      </div>

      <article className="max-w-[680px]">
        <h1 className="mb-3 text-2xl font-semibold tracking-tight">{video.title}</h1>
        <div className="mb-6 whitespace-pre-wrap text-sm text-muted-foreground">
          {video.description}
        </div>
        {video.chapters?.length ? (
          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold">Chapters</h2>
            <div className="grid gap-2">
              {video.chapters.map((chapter) => (
                <div key={`${chapter.time}-${chapter.title}`} className="rounded-xl border border-border bg-card p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{chapter.time}</div>
                  <strong>{chapter.title}</strong>
                  <p className="mt-1 text-sm text-muted-foreground">{chapter.summary}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}
        <h2 className="mb-4 text-xl font-semibold">Transcript</h2>
        {video.transcript ? (
          <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-secondary">
            {video.transcript}
          </div>
        ) : (
          <div className="rounded-md bg-surface p-4 text-sm text-muted-foreground border border-line">
            No transcript available for this video.
          </div>
        )}
        {video.related?.length ? (
          <section className="mt-8">
            <h2 className="mb-3 text-xl font-semibold">Related next steps</h2>
            <div className="grid gap-2">
              {video.related.map((href) => (
                <Link key={href} href={href} className="rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-accent">
                  {href}
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </AppShell>
  );
}
