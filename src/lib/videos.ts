export type KnowPlainVideo = {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  published_at: string;
  duration?: string;
  chapters?: { time: string; title: string; summary: string }[];
  transcript?: string;
  related?: string[];
};

/** "3:10" -> 190. Accepts "m:ss" or "h:mm:ss". Returns 0 for anything unparseable. */
export function timeToSeconds(time: string): number {
  const parts = time.split(":").map((p) => Number(p.trim()));
  if (parts.some((n) => !Number.isFinite(n) || n < 0)) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parts[0];
  return 0;
}

/** ISO 8601 duration ("PT18M", "PT1H2M3S") -> seconds. Undefined if absent or unparseable. */
export function isoDurationToSeconds(duration?: string): number | undefined {
  if (!duration) return undefined;
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(duration);
  if (!m || (!m[1] && !m[2] && !m[3])) return undefined;
  return Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0);
}

export type VideoClip = { name: string; startOffset: number; endOffset?: number; url: string };

/**
 * Chapters -> Google "key moments" clips.
 *
 * Each clip needs a start, a name, and a URL that actually seeks to that point — Google
 * will not show key moments for timestamps it cannot link to. Each chapter's end is the
 * next chapter's start; the last one runs to the video's duration if we know it.
 * Chapters that are out of order or run past the video are dropped rather than emitted
 * as broken markup.
 */
export function videoClips(video: KnowPlainVideo, pageUrl: string): VideoClip[] {
  if (!video.chapters?.length) return [];
  const total = isoDurationToSeconds(video.duration);

  // Build the valid sequence FIRST, then derive ends from it. Deriving ends from the raw
  // list and filtering afterwards throws away good chapters whenever a bad one follows
  // them — the end of a kept chapter must come from the next *kept* chapter, not the next
  // one in the file.
  const kept: { title: string; start: number }[] = [];
  for (const chapter of video.chapters) {
    const start = timeToSeconds(chapter.time);
    const previous = kept[kept.length - 1]?.start;
    if (previous !== undefined && start <= previous) continue; // doesn't advance
    if (total !== undefined && start >= total) continue; // starts after the video ends
    kept.push({ title: chapter.title, start });
  }

  return kept.map((chapter, i) => ({
    name: chapter.title,
    startOffset: chapter.start,
    endOffset: kept[i + 1]?.start ?? total,
    url: `${pageUrl}?t=${chapter.start}`,
  }));
}

export const fallbackVideos: KnowPlainVideo[] = [
  {
    id: "retirement-playbook",
    title: "Complete Retirement Playbook",
    description:
      "A plain-language walkthrough of retirement math, spending gaps, Social Security timing, healthcare before Medicare, and withdrawal risk.",
    thumbnail_url: null,
    published_at: "2026-07-09",
    duration: "PT18M",
    chapters: [
      { time: "0:00", title: "The real retirement question", summary: "The date is an output of the funding math." },
      { time: "3:10", title: "Spending gap", summary: "Start with spending minus guaranteed income." },
      { time: "7:20", title: "Social Security timing", summary: "Compare early, full-retirement-age, and delayed claiming." },
      { time: "11:40", title: "Healthcare bridge", summary: "Retiring before 65 needs a coverage plan." },
      { time: "15:30", title: "Withdrawal risk", summary: "Stress-test the first decade, not just average returns." },
    ],
    transcript:
      "Retirement is not a date first. It is a funding question. Start with annual spending, subtract reliable income, then test whether the portfolio can cover the gap through bad markets, inflation, taxes, and healthcare costs. This video is educational only.",
    related: ["/checkup", "/tools/am-i-on-track", "/decisions/retire-now-or-wait"],
  },
  {
    id: "late-starter-path",
    title: "Late Starter Retirement Path",
    description:
      "What to do first if you are starting or restarting retirement saving after 40.",
    thumbnail_url: null,
    published_at: "2026-07-09",
    duration: "PT12M",
    chapters: [
      { time: "0:00", title: "Not doomed", summary: "A late start is a planning signal, not a verdict." },
      { time: "2:40", title: "Find the match", summary: "Employer match and high-interest debt are early triage." },
      { time: "6:20", title: "Use catch-up room", summary: "Older savers may have extra contribution room." },
      { time: "9:30", title: "Work longer or differently", summary: "Part-time work can reduce early withdrawals." },
    ],
    transcript:
      "If you are starting late, do not begin with shame. Begin with levers: employer match, high-interest debt, contribution increases, catch-up limits, retirement age, and part-time income. The goal is one measurable improvement this month.",
    related: ["/late-starters", "/tools/catch-up-contributions", "/topics/retirement/starting-retirement-savings-at-45"],
  },
];

export function getFallbackVideo(id: string) {
  return fallbackVideos.find((video) => video.id === id);
}

