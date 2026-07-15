import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, Brain, CheckCircle2, FileText, Landmark, PlayCircle, Wrench } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { JsonLd } from "@/components/JsonLd";
import { SearchForm } from "@/components/SearchForm";
import { Badge } from "@/components/ui/badge";
import { organizationJsonLd, websiteJsonLd } from "@/lib/schema";
import { pageMeta, pillars } from "@/lib/site";

// The site's highest-authority URL was spending its title tag on a tagline. Nobody searches
// for an unknown brand name — target the head term instead. The root template appends
// "· Know Plain", so the brand is still there.
export const metadata: Metadata = pageMeta(
  "/",
  "Retirement Planning, Known Plain",
  "Clear, sourced answers on retirement: how much is enough, when to claim Social Security, and what the 2026 rules actually changed. Free calculators, primary sources, no jargon.",
);

const pillarIcon = {
  retirement: Landmark,
  "money-psychology": Brain,
  "decision-tools": Wrench,
} as const;

const chips = [
  { href: "/checkup", label: "Retirement checkup" },
  { href: "/decisions", label: "Decision library" },
  { href: "/late-starters", label: "Late starter path" },
  { href: "/search?q=How%20much%20do%20I%20need%20to%20retire", label: "Retirement math" },
];

export default function HomePage() {
  return (
    <AppShell active="home">
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />

      <section className="grid min-w-0 grid-cols-[minmax(0,1fr)] justify-items-center gap-5 py-12 text-center md:py-16">
        <Badge variant="secondary" className="gap-1.5 font-normal text-muted-foreground">
          <span className="size-1.5 rounded-full bg-success" />
          Big ideas, known plain
        </Badge>
        <h1 className="max-w-full text-[clamp(2rem,5vw,3rem)] font-semibold leading-[1.1] tracking-tight">
          Retirement &amp; money,
          <br className="hidden sm:block" /> without the jargon.
        </h1>
        <p className="max-w-[46ch] text-[1.05rem] text-muted-foreground">
          Search, run a checkup, compare decisions, and leave with the next plain step.
        </p>
        <SearchForm variant="hero" />
        <p className="text-xs text-muted-foreground">
          or press{" "}
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 [font-family:system-ui,sans-serif] text-[0.65rem]">
            ⌘K
          </kbd>{" "}
          to search anywhere
        </p>
        <div className="flex flex-wrap justify-center gap-2 pt-1">
          {chips.map((c) => (
            <Link key={c.href} href={c.href} className="inline-flex items-center rounded-full border border-border bg-secondary px-3.5 py-1.5 text-sm text-secondary-foreground transition-colors hover:bg-accent">
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      <div className="mb-4 mt-6 flex items-baseline justify-between gap-4">
        <h2 className="text-base font-semibold tracking-tight">Start with your numbers</h2>
        <span className="text-sm text-muted-foreground">5-minute snapshot</span>
      </div>
      <Link
        href="/checkup"
        className="group grid gap-3 rounded-xl border border-border bg-card p-5 transition-all hover:border-foreground/20 hover:shadow-sm md:grid-cols-[auto_1fr_auto] md:items-center"
      >
        <span className="grid size-10 place-items-center rounded-lg bg-secondary text-foreground">
          <CheckCircle2 className="size-5" />
        </span>
        <span>
          <strong className="block tracking-tight">Run the Know Plain Retirement Checkup</strong>
          <span className="mt-1 block text-sm text-muted-foreground">
            Estimate your spending gap, plain scores, top risks, and next tools.
          </span>
        </span>
        <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </Link>

      <div className="mb-4 mt-10 flex items-baseline justify-between gap-4">
        <h2 className="text-base font-semibold tracking-tight">Topic hubs</h2>
        <span className="text-sm text-muted-foreground">Pillars for topical authority</span>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {(Object.keys(pillars) as Array<keyof typeof pillars>).map((id) => {
          const Icon = pillarIcon[id];
          return (
            <Link
              key={id}
              href={pillars[id].path}
              className="group relative grid gap-2 rounded-xl border border-border bg-card p-5 transition-all hover:border-foreground/20 hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="grid size-9 place-items-center rounded-lg bg-secondary text-foreground">
                  <Icon className="size-[18px]" />
                </span>
                <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <strong className="tracking-tight">{pillars[id].title}</strong>
              <p className="text-sm text-muted-foreground">{pillars[id].lede}</p>
            </Link>
          );
        })}
      </div>

      <div className="mb-4 mt-10 flex items-baseline justify-between gap-4">
        <h2 className="text-base font-semibold tracking-tight">Continue</h2>
        <span className="text-sm text-muted-foreground">Mixed content types</span>
      </div>
      <div className="grid gap-3 md:grid-cols-[1.4fr_1fr]">
        <Link
          href="/topics/retirement/retirement-isnt-a-date"
          className="group grid gap-2 rounded-xl border border-border bg-card p-5 transition-all hover:border-foreground/20 hover:shadow-sm"
        >
          <Badge variant="secondary" className="w-fit gap-1.5 font-normal">
            <FileText className="size-3" /> Explainer
          </Badge>
          <strong className="tracking-tight">How to plan for retirement</strong>
          <p className="text-sm text-muted-foreground">
            The four questions that decide it — and why the date is an output, not an input.
          </p>
        </Link>
        <Link
          href="/watch"
          className="group grid gap-2 rounded-xl border border-border bg-card p-5 transition-all hover:border-foreground/20 hover:shadow-sm"
        >
          <Badge variant="secondary" className="w-fit gap-1.5 font-normal">
            <PlayCircle className="size-3" /> Video
          </Badge>
          <strong className="tracking-tight">Complete Retirement Playbook</strong>
          <p className="text-sm text-muted-foreground">18 min · chapters + transcript page for SEO.</p>
        </Link>
      </div>
    </AppShell>
  );
}
