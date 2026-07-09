import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Videos",
  description: "Know Plain YouTube explainers with chapters and transcript pages for SEO.",
};

const chapters = [
  "0:00 Hook — retirement isn’t a date",
  "3:12 Compound growth",
  "8:40 Sequence risk",
  "14:05 The plain playbook",
];

export default function WatchPage() {
  return (
    <AppShell active="watch">
      <div className="mb-3 flex items-baseline justify-between">
        <h1 className="text-base font-semibold">Videos</h1>
        <span className="text-sm text-muted">/watch — embed + transcript SEO</span>
      </div>
      <div className="mb-4 grid aspect-video place-items-center rounded-[14px] bg-ink text-white">
        <div className="text-center">
          <div className="mb-2 text-xs opacity-50">YOUTUBE EMBED</div>
          <strong>The Complete Retirement Playbook</strong>
          <div className="mt-3">
            <a className="kp-btn-primary" href={site.youtube} target="_blank" rel="noopener noreferrer">
              Watch on YouTube
            </a>
          </div>
        </div>
      </div>
      <h2 className="mb-2 text-base font-semibold">Chapters</h2>
      <div className="grid gap-2">
        {chapters.map((c) => (
          <div key={c} className="kp-spoke">
            <strong>{c}</strong>
            <span className="text-xs text-muted">Chapter</span>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
