import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, videoObjectJsonLd } from "@/lib/schema";
import { site } from "@/lib/site";
import { fallbackVideos, getFallbackVideo, videoClips } from "@/lib/videos";
import { decisions, isDecisionSlug } from "@/lib/decisions";
import { isToolSlug, toolPages } from "@/lib/tools";

/**
 * Turn a related href into something a human would click. The page used to print the raw
 * path ("/tools/am-i-on-track") as the link text. Labels are read from the tool and
 * decision registries rather than duplicated here, so a renamed tool renames itself.
 */
function resolveRelated(href: string): { label: string; description?: string } {
  const toolSlug = href.replace(/^\/tools\//, "");
  if (href.startsWith("/tools/") && isToolSlug(toolSlug)) {
    return { label: toolPages[toolSlug].title, description: toolPages[toolSlug].description };
  }

  const decisionSlug = href.replace(/^\/decisions\//, "");
  if (href.startsWith("/decisions/") && isDecisionSlug(decisionSlug)) {
    return {
      label: decisions[decisionSlug].title,
      description: decisions[decisionSlug].description,
    };
  }

  if (href === "/checkup") {
    return {
      label: "Retirement Checkup",
      description: "A five-minute snapshot of where your plan actually stands.",
    };
  }

  return { label: href };
}

/** Seconds -> "3:10", for a chapter whose original label we no longer have. */
function formatOffset(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const video = getFallbackVideo(slug);
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

export function generateStaticParams() {
  return fallbackVideos.map((video) => ({ slug: video.id }));
}

export default async function VideoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const video = getFallbackVideo(slug);
  
  if (!video) notFound();
  const isYoutubeId = /^[a-zA-Z0-9_-]{11}$/.test(video.id);
  // youtube-nocookie: same player, but YouTube sets no tracking cookies until the user
  // actually presses play. Keeps a plain page view out of "sharing" territory (see the
  // privacy section of the strategy guide) at zero cost.
  const embedUrl = isYoutubeId
    ? `https://www.youtube-nocookie.com/embed/${video.id}`
    : `${site.url}/watch/${video.id}`;
  const clips = videoClips(video, `${site.url}/watch/${slug}`);

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
            clips,
          }),
        ]}
      />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Videos", href: "/watch" }, { label: video.title }]} />
      
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
        {clips.length ? (
          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold">Chapters</h2>
            <div className="grid gap-2">
              {clips.map((clip, i) => {
                const summary = video.chapters?.find((c) => c.title === clip.name)?.summary;
                const body = (
                  <>
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {video.chapters?.[i]?.time ?? formatOffset(clip.startOffset)}
                    </div>
                    <strong>{clip.name}</strong>
                    {summary && <p className="mt-1 text-sm text-muted-foreground">{summary}</p>}
                  </>
                );
                // Only a real YouTube video can be seeked; the fallback pages have nothing to jump to.
                return isYoutubeId ? (
                  <a
                    key={clip.name}
                    href={`https://www.youtube.com/watch?v=${video.id}&t=${clip.startOffset}s`}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="rounded-xl border border-border bg-card p-3 transition-colors hover:border-foreground/20"
                  >
                    {body}
                  </a>
                ) : (
                  <div key={clip.name} className="rounded-xl border border-border bg-card p-3">
                    {body}
                  </div>
                );
              })}
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
              {video.related.map((href) => {
                const link = resolveRelated(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className="grid gap-0.5 rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    <strong>{link.label}</strong>
                    {link.description && (
                      <span className="text-muted-foreground">{link.description}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}
      </article>
    </AppShell>
  );
}
