import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { JsonLd } from "@/components/JsonLd";
import { SourceList } from "@/components/SourceList";
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
import { editorialPeople } from "@/lib/editorial";
import { breadcrumbJsonLd, toolPageJsonLd } from "@/lib/schema";
import { pageMeta, site } from "@/lib/site";
import { isToolSlug, toolPages } from "@/lib/tools";

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
      <div className="mb-4 text-sm text-muted-foreground">
        <Link href="/tools">Tools</Link> / {tool.title}
      </div>
      <header className="mb-6 max-w-[760px]">
        <h1 className="mb-3 text-[clamp(1.8rem,4vw,2.5rem)] font-semibold tracking-tight">
          {tool.title}
        </h1>
        <p className="text-muted-foreground">{tool.description} Educational only.</p>
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
      <SourceList sources={tool.sources} />
      <p className="mt-6 max-w-[760px] text-sm leading-relaxed text-muted-foreground">
        These tools use simplified assumptions. Use them to frame better questions, then verify
        details against primary sources or a qualified professional.
      </p>
    </AppShell>
  );
}

