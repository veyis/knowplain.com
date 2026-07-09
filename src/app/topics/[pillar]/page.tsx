import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { JsonLd } from "@/components/JsonLd";
import { getArticlesByPillar, isPillarId } from "@/lib/content";
import { breadcrumbJsonLd } from "@/lib/schema";
import { pillars, site } from "@/lib/site";

export function generateStaticParams() {
  return Object.keys(pillars).map((pillar) => ({ pillar }));
}

export function generateMetadata({ params }: { params: Promise<{ pillar: string }> }) {
  return params.then(({ pillar }) => {
    if (!isPillarId(pillar)) return {};
    const p = pillars[pillar];
    return { title: p.title, description: p.lede };
  });
}

export default async function PillarPage({
  params,
}: {
  params: Promise<{ pillar: string }>;
}) {
  const { pillar } = await params;
  if (!isPillarId(pillar)) notFound();
  const p = pillars[pillar];
  const list = getArticlesByPillar(pillar);

  return (
    <AppShell active={pillar}>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: site.url },
          { name: p.title, url: `${site.url}${p.path}` },
        ])}
      />
      <div className="mb-4 rounded-2xl border border-line bg-surface p-6">
        <h1 className="mb-2 text-[1.35rem] font-semibold tracking-tight">{p.title}, known plain</h1>
        <p className="mb-4 max-w-[60ch] text-sm text-muted">
          {p.lede} Educational only — not financial advice.
        </p>
        <div className="grid gap-2">
          {list.map((a) => (
            <Link key={a.slug} href={`/topics/${a.pillar}/${a.slug}`} className="kp-spoke">
              <strong>{a.title}</strong>
              <span className="shrink-0 text-xs text-muted">Explainer</span>
            </Link>
          ))}
          {pillar === "retirement" && (
            <>
              <Link href="/tools" className="kp-spoke">
                <strong>Free Retirement Roadmap</strong>
                <span className="text-xs text-muted">Tool</span>
              </Link>
              <Link href="/watch" className="kp-spoke">
                <strong>Complete Retirement Playbook</strong>
                <span className="text-xs text-muted">Video</span>
              </Link>
            </>
          )}
          {pillar === "decision-tools" && (
            <Link href="/tools" className="kp-spoke">
              <strong>Retirement Roadmap Pack</strong>
              <span className="text-xs text-muted">Tool</span>
            </Link>
          )}
        </div>
      </div>
    </AppShell>
  );
}
