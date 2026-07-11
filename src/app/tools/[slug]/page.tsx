import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { JsonLd } from "@/components/JsonLd";
import { SourceList } from "@/components/SourceList";
import {
  OnTrackTool,
  RetirementAgeTradeoffTool,
  SimpleAssumptionTool,
  SocialSecurityBreakEvenTool,
} from "@/components/tools/RetirementTools";
import { AcaBridgeTool } from "@/components/tools/AcaBridgeTool";
import { CatchUpPlannerTool } from "@/components/tools/CatchUpPlannerTool";
import { SequenceRiskTool } from "@/components/tools/SequenceRiskTool";
import { breadcrumbJsonLd } from "@/lib/schema";
import { site } from "@/lib/site";
import { isToolSlug, toolPages } from "@/lib/tools";

export function generateStaticParams() {
  return Object.keys(toolPages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isToolSlug(slug)) return {};
  const tool = toolPages[slug];
  return {
    title: tool.title,
    description: tool.description,
    alternates: { canonical: `/tools/${slug}` },
  };
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
      {tool.kind === "sequence" && <SequenceRiskTool />}
      {tool.kind === "inflation" && <SimpleAssumptionTool />}
      {tool.kind === "catchup" && <CatchUpPlannerTool />}
      <SourceList sources={tool.sources} />
      <p className="mt-6 max-w-[760px] text-sm leading-relaxed text-muted-foreground">
        These tools use simplified assumptions. Use them to frame better questions, then verify
        details against primary sources or a qualified professional.
      </p>
    </AppShell>
  );
}

