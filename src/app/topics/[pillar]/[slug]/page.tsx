import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXContent } from "@content-collections/mdx/react";
import { ArticleTrust } from "@/components/ArticleTrust";
import { DecisionCta } from "@/components/DecisionCta";
import { FAQBlock } from "@/components/FAQBlock";
import { AppShell } from "@/components/AppShell";
import { JsonLd } from "@/components/JsonLd";
import { SourceList } from "@/components/SourceList";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { mdxComponents } from "@/components/mdx-components";
import { articles, getArticle, isPillarId } from "@/lib/content";
import { defaultArticleAuthor, getEditorialPerson, getReviewer } from "@/lib/editorial";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/schema";
import { pageMeta, pillars, site } from "@/lib/site";

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
  // Each article generates its own OG card (see opengraph-image.tsx alongside this file).
  // Both the meta tags and the Article schema pointed at the generic site card instead.
  const image = `${site.url}${path}/opengraph-image`;
  const base = pageMeta(path, article.title, article.description, image);
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: "article",
      // Was `article.updated` for BOTH — so every article claimed it was first published on
      // the day it was last touched. `published` is right here and the page already reads it.
      publishedTime: article.published ?? article.updated,
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
  const author = getEditorialPerson(article.author || defaultArticleAuthor);
  // Pass the pillar: the retirement review board does not review money-psychology articles,
  // and this used to claim it did on all nine of them.
  const reviewer = getReviewer(article.reviewer, pillar);
  const published = article.published || article.updated;
  const reviewed = article.reviewed || article.updated;
  const relatedTool = article.relatedTools?.[0];
  const jsonLd = [
    articleJsonLd({
      title: article.title,
      description: article.description,
      url,
      image: `${url}/opengraph-image`,
      datePublished: published,
      dateModified: article.updated,
      // Emitted on the WebPage node now, where schema.org actually defines it. The date was
      // already rendered to readers and simply never reached the markup.
      lastReviewed: reviewed,
      author: {
        name: author.name,
        url: `${site.url}/authors/${author.slug}`,
        type: author.type,
      },
      reviewer: reviewer
        ? {
            name: reviewer.name,
            url: `${site.url}/reviewers/${reviewer.slug}`,
            type: reviewer.type,
          }
        : undefined,
    }),
    breadcrumbJsonLd([
      { name: "Home", url: site.url },
      { name: p.title, url: `${site.url}${p.path}` },
      { name: article.title, url },
    ]),
    // No FAQPage: Google removed the FAQ rich result on 2026-05-07. The visible
    // FAQBlock below stays — it serves readers and LLM extraction, not a SERP feature.
  ].filter(Boolean) as Record<string, unknown>[];

  return (
    <AppShell active={pillar}>
      <JsonLd data={jsonLd} />
      <article className="max-w-[680px]">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: p.title, href: p.path }, { label: article.title }]} />
        <h1 className="mb-3 text-[clamp(1.6rem,3vw,2rem)] font-semibold leading-tight tracking-tight">
          {article.title}
        </h1>
        <ArticleTrust
          author={author}
          reviewer={reviewer}
          published={published}
          updated={article.updated}
          reviewed={reviewed}
          riskLevel={article.riskLevel}
          sourceCount={article.sources?.length}
          volatile={article.volatile}
          volatileNote={article.volatileNote}
          correction={article.correction}
        />
        <p className="mb-4 leading-relaxed text-foreground/80">{article.description}</p>
        <div className="my-5 border-l-[3px] border-ink bg-card px-4 py-3 text-[0.95rem]">
          <strong>Plain answer:</strong> {article.plainAnswer}
        </div>
        {relatedTool && (
          <DecisionCta
            body="Use a calculator before treating this article as settled. The useful answer depends on your age, spending, savings, Social Security estimate, and flexibility."
            toolHref={relatedTool.href}
            toolLabel={relatedTool.label}
          />
        )}
        <MDXContent code={article.mdx} components={mdxComponents} />
        <FAQBlock items={article.faqs} />
        <SourceList sources={article.sources} />
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
