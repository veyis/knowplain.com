import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { JsonLd } from "@/components/JsonLd";
import { articles, getArticle, isPillarId } from "@/lib/content";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/schema";
import { pillars, site } from "@/lib/site";

export function generateStaticParams() {
  return articles.map((a) => ({ pillar: a.pillar, slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pillar: string; slug: string }>;
}) {
  const { pillar, slug } = await params;
  const article = getArticle(pillar, slug);
  if (!article) return {};
  return { title: article.title, description: article.description };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ pillar: string; slug: string }>;
}) {
  const { pillar, slug } = await params;
  if (!isPillarId(pillar)) notFound();
  const article = getArticle(pillar, slug);
  if (!article) notFound();
  const p = pillars[pillar];
  const url = `${site.url}/topics/${pillar}/${slug}`;

  return (
    <AppShell active={pillar}>
      <JsonLd
        data={[
          articleJsonLd({
            title: article.title,
            description: article.description,
            url,
            dateModified: article.updated,
          }),
          breadcrumbJsonLd([
            { name: "Home", url: site.url },
            { name: p.title, url: `${site.url}${p.path}` },
            { name: article.title, url },
          ]),
        ]}
      />
      <article className="max-w-[680px]">
        <div className="mb-4 text-sm text-muted">
          <Link href={p.path}>Topics</Link> › {p.title} › Explainer
        </div>
        <h1 className="mb-3 text-[clamp(1.6rem,3vw,2rem)] font-semibold leading-tight tracking-tight">
          {article.title}
        </h1>
        <p className="mb-6 text-sm text-muted">
          By Know Plain Editorial · Updated {article.updated} · Educational only
        </p>
        <p className="mb-4 leading-relaxed text-[#2a2a2a]">{article.description}</p>
        <div className="my-5 border-l-[3px] border-ink bg-white px-4 py-3 text-[0.95rem]">
          <strong>Plain answer:</strong> {article.plainAnswer}
        </div>
        {article.body.map((para) => (
          <p key={para.slice(0, 24)} className="mb-4 leading-relaxed text-[#2a2a2a]">
            {para}
          </p>
        ))}
        {article.related && (
          <div className="mt-8 grid gap-2">
            {article.related.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="rounded-[10px] border border-line bg-surface px-3 py-3 text-sm hover:border-ink"
              >
                {r.label}
              </Link>
            ))}
          </div>
        )}
      </article>
    </AppShell>
  );
}
