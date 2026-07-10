import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import { site } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: video } = await supabase.from("knowplain_videos").select("*").eq("id", slug).single();
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
  const supabase = await createClient();
  const { data: video } = await supabase.from("knowplain_videos").select("*").eq("id", slug).single();
  
  if (!video) notFound();

  return (
    <AppShell active="watch">
      <div className="mb-4 text-sm text-muted">
        <Link href="/watch">Videos</Link> › {video.title}
      </div>
      
      <div className="mb-6 grid aspect-video place-items-center rounded-[14px] bg-black text-white overflow-hidden">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${video.id}`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="border-0"
        ></iframe>
      </div>

      <article className="max-w-[680px]">
        <h2 className="mb-4 text-xl font-semibold">Description & Transcript</h2>
        <div className="mb-6 whitespace-pre-wrap text-sm text-muted">
          {video.description}
        </div>
        {video.transcript ? (
          <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-secondary">
            {video.transcript}
          </div>
        ) : (
          <div className="rounded-md bg-surface p-4 text-sm text-muted border border-line">
            No transcript available for this video.
          </div>
        )}
      </article>
    </AppShell>
  );
}
