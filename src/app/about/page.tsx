import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { pageMeta, pillars, site } from "@/lib/site";

export const metadata = pageMeta(
  "/about",
  "About",
  "Know Plain explains retirement, money psychology, and decision tools in plain language — sourced, reviewed, and educational-only.",
);

export default function AboutPage() {
  return (
    <AppShell active="home">
      <article className="max-w-[680px]">
        <h1 className="mb-4 text-[1.75rem] font-semibold tracking-tight">About Know Plain</h1>
        <p className="mb-4 leading-relaxed">
          Know Plain is a knowledge portal for curious adults. We explain retirement math, money
          psychology, and decision tools without jargon — the ideas that decide financial outcomes,
          made plain enough to act on.
        </p>
        <div className="my-5 border-l-[3px] border-ink bg-card px-4 py-3">
          <strong>Mission:</strong> {site.tagline}
        </div>

        <h2 className="mb-2 mt-8 text-lg font-semibold tracking-tight">Who writes Know Plain</h2>
        <p className="mb-4 leading-relaxed text-foreground/80">
          Articles are published by the <strong>Know Plain Editorial</strong> team. We draft with the
          help of AI tools and review and edit every piece for accuracy and clarity, grounding
          factual claims in primary sources like the SSA and IRS. How we work is spelled out in our{" "}
          <Link href="/editorial-policy" className="text-brand hover:underline">
            editorial standards
          </Link>
          .
        </p>

        <h2 className="mb-2 mt-8 text-lg font-semibold tracking-tight">What we cover</h2>
        <div className="mb-4 grid gap-2">
          {(Object.keys(pillars) as Array<keyof typeof pillars>).map((id) => (
            <Link key={id} href={pillars[id].path} className="flex items-center justify-between gap-4 rounded-lg bg-secondary/60 px-3 py-2.5 text-sm transition-colors hover:bg-accent">
              <strong>{pillars[id].title}</strong>
              <span className="shrink-0 text-xs text-muted-foreground">Hub</span>
            </Link>
          ))}
        </div>

        <p className="mb-4 leading-relaxed text-foreground/80">
          Content is educational only — not financial, tax, medical, or legal advice. Some tool and
          book links are affiliates; see our{" "}
          <Link href="/disclosure" className="text-brand hover:underline">
            disclosure
          </Link>
          .
        </p>
        <p className="text-sm text-muted-foreground">
          Find us on YouTube:{" "}
          <a href={site.youtube} className="text-brand hover:underline" rel="noopener noreferrer">
            @explainstudio9
          </a>{" "}
          (public brand: Know Plain).
        </p>
      </article>
    </AppShell>
  );
}
