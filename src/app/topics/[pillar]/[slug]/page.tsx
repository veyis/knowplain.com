import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXContent } from "@content-collections/mdx/react";
import { AppShell } from "@/components/AppShell";
import { JsonLd } from "@/components/JsonLd";
import { mdxComponents } from "@/components/mdx-components";
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
  const path = `/topics/${pillar}/${slug}`;
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      siteName: site.name,
      title: article.title,
      description: article.description,
      url: `${site.url}${path}`,
      publishedTime: article.updated,
      modifiedTime: article.updated,
    },
  };
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
            image: `${site.url}/opengraph-image`,
            datePublished: article.updated,
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
          By{" "}
          <Link href="/about" className="hover:underline">
            Know Plain Editorial
          </Link>{" "}
          · Updated {article.updated} · Educational only
        </p>
        <p className="mb-4 leading-relaxed text-[#2a2a2a]">{article.description}</p>
        <div className="my-5 border-l-[3px] border-ink bg-white px-4 py-3 text-[0.95rem]">
          <strong>Plain answer:</strong> {article.plainAnswer}
        </div>
        <MDXContent code={article.mdx} components={mdxComponents} />
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
