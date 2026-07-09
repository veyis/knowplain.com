import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXContent } from "@content-collections/mdx/react";
import { AppShell } from "@/components/AppShell";
import { mdxComponents } from "@/components/mdx-components";
import { videos, getVideo } from "@/lib/content";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return videos.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const video = getVideo(slug);
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
  const video = getVideo(slug);
  if (!video) notFound();

  return (
    <AppShell active="watch">
      <div className="mb-4 text-sm text-muted">
        <Link href="/watch">Videos</Link> › {video.title}
      </div>
      
      <div className="mb-6 grid aspect-video place-items-center rounded-[14px] bg-ink text-white">
        <div className="text-center">
          <div className="mb-2 text-xs opacity-50">YOUTUBE EMBED ({video.youtubeId})</div>
          <strong>{video.title}</strong>
          <div className="mt-3">
            <a className="kp-btn-primary" href={site.youtube} target="_blank" rel="noopener noreferrer">
              Watch on YouTube
            </a>
          </div>
        </div>
      </div>
      
      {video.chapters && video.chapters.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">Chapters</h2>
          <div className="grid gap-2">
            {video.chapters.map((c, i) => (
              <div key={i} className="kp-spoke">
                <strong>{c.timestamp} {c.label}</strong>
                <span className="text-xs text-muted">Chapter</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <article className="max-w-[680px]">
        <h2 className="mb-4 text-xl font-semibold">Transcript & Notes</h2>
        <MDXContent code={video.mdx} components={mdxComponents} />
      </article>
    </AppShell>
  );
}
