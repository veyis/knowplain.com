import Link from "next/link";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { JsonLd } from "@/components/JsonLd";
import { SearchForm } from "@/components/SearchForm";
import { organizationJsonLd, websiteJsonLd } from "@/lib/schema";
import { pillars } from "@/lib/site";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function HomePage() {
  return (
    <AppShell active="home">
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      <section className="grid justify-items-center gap-5 py-10 text-center md:py-14">
        <h1 className="text-[clamp(1.8rem,4vw,2.4rem)] font-semibold tracking-tight">Know Plain</h1>
        <p className="max-w-[42ch] text-muted">
          Big ideas, known plain. Search across explainers, videos, tools, and community.
        </p>
        <SearchForm variant="hero" />
        <div className="flex flex-wrap justify-center gap-2">
          <Link className="kp-chip" href="/search?q=How%20much%20do%20I%20need%20to%20retire">
            Retirement math
          </Link>
          <Link className="kp-chip" href="/tools">
            Roadmap pack
          </Link>
          <Link className="kp-chip" href="/watch">
            Watch playbook
          </Link>
          <Link className="kp-chip" href="/forum">
            Ask the forum
          </Link>
        </div>
      </section>

      <div className="mb-3 mt-8 flex items-baseline justify-between gap-4">
        <h2 className="text-base font-semibold tracking-tight">Topic hubs</h2>
        <span className="text-sm text-muted">Pillars for topical authority</span>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {(Object.keys(pillars) as Array<keyof typeof pillars>).map((id) => (
          <Link key={id} href={pillars[id].path} className="kp-card">
            <div className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted">Pillar</div>
            <strong className="tracking-tight">{pillars[id].title}</strong>
            <p className="text-sm text-muted">{pillars[id].lede}</p>
          </Link>
        ))}
      </div>

      <div className="mb-3 mt-8 flex items-baseline justify-between gap-4">
        <h2 className="text-base font-semibold tracking-tight">Continue</h2>
        <span className="text-sm text-muted">Mixed content types</span>
      </div>
      <div className="grid gap-3 md:grid-cols-[1.4fr_1fr]">
        <Link href="/topics/retirement/retirement-isnt-a-date" className="kp-card">
          <div className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted">Explainer</div>
          <strong className="tracking-tight">Retirement isn’t a date — it’s math</strong>
          <p className="text-sm text-muted">
            Plain model for “enough” and why the calendar is the wrong target.
          </p>
        </Link>
        <Link href="/watch" className="kp-card">
          <div className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted">Video</div>
          <strong className="tracking-tight">Complete Retirement Playbook</strong>
          <p className="text-sm text-muted">18 min · chapters + transcript page for SEO.</p>
        </Link>
      </div>
    </AppShell>
  );
}
