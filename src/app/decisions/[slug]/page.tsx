import { notFound } from "next/navigation";
import { DecisionCta } from "@/components/DecisionCta";
import { AppShell } from "@/components/AppShell";
import { JsonLd } from "@/components/JsonLd";
import { SourceList } from "@/components/SourceList";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { breadcrumbJsonLd } from "@/lib/schema";
import { decisions, isDecisionSlug } from "@/lib/decisions";
import { site, pageMeta } from "@/lib/site";

export function generateStaticParams() {
  return Object.keys(decisions).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isDecisionSlug(slug)) return {};
  const decision = decisions[slug];
  return pageMeta(`/decisions/${slug}`, decision.title, decision.description);
}

export default async function DecisionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isDecisionSlug(slug)) notFound();
  const decision = decisions[slug];
  return (
    <AppShell active="decisions">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: site.url },
          { name: "Decisions", url: `${site.url}/decisions` },
          { name: decision.title, url: `${site.url}/decisions/${slug}` },
        ])}
      />
      <article className="max-w-[760px]">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Decisions", href: "/decisions" }, { label: decision.title }]} />
        <h1 className="mb-3 text-[clamp(1.8rem,4vw,2.5rem)] font-semibold tracking-tight">
          {decision.title}
        </h1>
        <p className="mb-5 text-muted-foreground">{decision.description}</p>
        <div className="my-5 border-l-[3px] border-ink bg-card px-4 py-3 text-[0.95rem]">
          <strong>Plain answer:</strong> {decision.plainAnswer}
        </div>
        <DecisionCta
          body="Run the matching tool before acting on the decision. The useful answer depends on your numbers and constraints."
          toolHref={decision.toolHref}
          toolLabel={decision.toolLabel}
        />
        <section className="grid gap-3 md:grid-cols-2">
          {[
            ["Use this when", "You need a practical frame before choosing a timing, tax, saving, or debt lever."],
            ["Do not use this when", "You need individualized tax, legal, medical, or investment advice."],
            ["Common mistake", "Looking for one perfect answer before checking the few variables that actually move the decision."],
            ["Next plain step", "Run the calculator, save the result, then read the source-backed article linked from the result."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-xl border border-border bg-card p-4">
              <h2 className="mb-2 text-base font-semibold">{title}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </section>
        <SourceList sources={decision.sources} />
      </article>
    </AppShell>
  );
}
