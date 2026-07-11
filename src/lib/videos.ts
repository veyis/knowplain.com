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

