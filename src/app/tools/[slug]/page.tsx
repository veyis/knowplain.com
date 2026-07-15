import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { JsonLd } from "@/components/JsonLd";
import { SourceList } from "@/components/SourceList";
import { VerificationStamp } from "@/components/VerificationStamp";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  OnTrackTool,
  RetirementAgeTradeoffTool,
  SocialSecurityBreakEvenTool,
} from "@/components/tools/RetirementTools";
import { AcaBridgeTool } from "@/components/tools/AcaBridgeTool";
import { CatchUpPlannerTool } from "@/components/tools/CatchUpPlannerTool";
import { SequenceRiskTool } from "@/components/tools/SequenceRiskTool";
import { RothConversionTool } from "@/components/tools/RothConversionTool";
import { DebtVsInvestingTool } from "@/components/tools/DebtVsInvestingTool";
import { SpendingPlannerTool } from "@/components/tools/SpendingPlannerTool";
import { RmdPlannerTool } from "@/components/tools/RmdPlannerTool";
import { IncomeBridgeTool } from "@/components/tools/IncomeBridgeTool";
import { ToolRiskDisclosure } from "@/components/tools/ToolRiskDisclosure";
import { ToolResultTracker } from "@/components/tools/ToolResultTracker";
import { editorialPeople } from "@/lib/editorial";
import { breadcrumbJsonLd, toolPageJsonLd } from "@/lib/schema";
import { pageMeta, site } from "@/lib/site";
import { highRiskToolDisclosures, isToolSlug, nextToolFor, toolEvidence, toolPages } from "@/lib/tools";

/** The calculators read every 2026 figure from facts-2026.ts, whose constants carry this date. */
const TOOLS_LAST_REVIEWED = "2026-07-11";
const reviewer = editorialPeople["retirement-review-board"];

export function generateStaticParams() {
  return Object.keys(toolPages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isToolSlug(slug)) return {};
  const tool = toolPages[slug];
  // Was title/description/canonical only, skipping openGraph and twitter entirely — so the
  // most shareable pages on the site inherited the ROOT og:url (the homepage) and a Twitter
  // card titled "Know Plain". pageMeta builds all three correctly.
  return pageMeta(`/tools/${slug}`, tool.title, tool.description);
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isToolSlug(slug)) notFound();
  const tool = toolPages[slug];
  const nextTool = nextToolFor(slug);
  const url = `${site.url}/tools/${slug}`;

  return (
    <AppShell active="tools">
      <JsonLd
        data={[
          // No SoftwareApplication — that rich result needs offers.price AND aggregateRating,
          // and inventing ratings for a free calculator is a spam violation (see schema.ts).
          // But a YMYL page that hands someone a retirement number should still say who stands
          // behind it and when it was last reviewed. That is free and it is the part that counts.
          toolPageJsonLd({
            title: tool.title,
            description: tool.description,
            url,
            dateModified: TOOLS_LAST_REVIEWED,
            lastReviewed: TOOLS_LAST_REVIEWED,
            reviewer: {
              name: reviewer.name,
              url: `${site.url}/reviewers/${reviewer.slug}`,
              type: reviewer.type,
            },
          }),
          breadcrumbJsonLd([
            { name: "Home", url: site.url },
            { name: "Tools", url: `${site.url}/tools` },
            { name: tool.title, url },
          ]),
        ]}
      />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Tools", href: "/tools" }, { label: tool.title }]} />
      <div className="tool-page">
      <ToolResultTracker tool={slug} />
      <header className="mb-6 max-w-[760px]">
        <h1 className="mb-3 text-[clamp(1.8rem,4vw,2.5rem)] font-semibold tracking-tight">
          {tool.title}
        </h1>
        <p className="text-muted-foreground">{tool.description} Educational only.</p>
        <div className="mt-4">
          <VerificationStamp
            label="Calculator assumptions reviewed"
            verified={TOOLS_LAST_REVIEWED}
            sourceCount={tool.sources.length}
            volatile={tool.kind === "aca-bridge" || tool.kind === "roth-conversion" || tool.kind === "income-bridge"}
            detailsHref="#sources"
          />
        </div>
      </header>
      {tool.kind === "on-track" && <OnTrackTool />}
      {tool.kind === "age-tradeoff" && <RetirementAgeTradeoffTool />}
      {tool.kind === "social-security" && <SocialSecurityBreakEvenTool />}
      {tool.kind === "aca-bridge" && <AcaBridgeTool />}
      {tool.kind === "roth-conversion" && <RothConversionTool />}
      {tool.kind === "debt-vs-investing" && <DebtVsInvestingTool />}
      {tool.kind === "sequence" && <SequenceRiskTool />}
      {tool.kind === "inflation" && <SpendingPlannerTool />}
      {tool.kind === "catchup" && <CatchUpPlannerTool />}
      {tool.kind === "rmd" && <RmdPlannerTool />}
      {tool.kind === "income-bridge" && <IncomeBridgeTool />}
      {slug in highRiskToolDisclosures && (
        <ToolRiskDisclosure
          disclosure={highRiskToolDisclosures[slug as keyof typeof highRiskToolDisclosures]}
        />
      )}
      <section id="result-evidence" aria-labelledby="result-evidence-heading" className="mt-5 rounded-xl border border-border bg-card p-4">
        <h2 id="result-evidence-heading" className="text-sm font-semibold tracking-tight">
          Numbers behind this result
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Open the exact public record for the legal figure or modeling convention used above.
        </p>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {toolEvidence[slug].map((evidence) => (
            <li key={evidence.href}>
              <Link href={evidence.href} className="underline underline-offset-2">
                {evidence.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <aside aria-labelledby="next-calculation-heading" className="print-hidden mt-6 rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-medium text-muted-foreground">One useful next calculation</p>
        <h2 id="next-calculation-heading" className="mt-1 text-lg font-semibold tracking-tight">
          {nextTool.title}
        </h2>
        <p className="mt-1 max-w-[70ch] text-sm leading-relaxed text-muted-foreground">
          {nextTool.reason}
        </p>
        <Link
          href={nextTool.href}
          className="mt-3 inline-flex min-h-11 items-center rounded-lg border border-foreground px-4 py-2 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Run {nextTool.title}
        </Link>
      </aside>
      <SourceList sources={tool.sources} />
      <p className="mt-6 max-w-[760px] text-sm leading-relaxed text-muted-foreground">
        These tools use simplified assumptions. Use them to frame better questions, then verify
        details against primary sources or a qualified professional.
      </p>
      </div>
    </AppShell>
  );
}
