import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { JsonLd } from "@/components/JsonLd";
import { Badge } from "@/components/ui/badge";
import { breadcrumbJsonLd } from "@/lib/schema";
import { isSeededQuestionSlug, seededQuestions } from "@/lib/forum-seeds";
import { site, pageMeta } from "@/lib/site";

export function generateStaticParams() {
  return Object.keys(seededQuestions).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isSeededQuestionSlug(slug)) return {};
  const question = seededQuestions[slug];
  return pageMeta(`/forum/questions/${slug}`, question.title, question.summary);
}

export default async function SeededQuestionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isSeededQuestionSlug(slug)) notFound();
  const question = seededQuestions[slug];
  const url = `${site.url}/forum/questions/${slug}`;

  return (
    <AppShell active="forum">
      {/* No QAPage markup: Google requires that users be able to submit answers, and these
          are staff-written answer hubs. Earn the schema when the forum opens for real. */}
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: site.url },
            { name: "Forum", url: `${site.url}/forum` },
            { name: question.title, url },
          ]),
        ]}
      />
      <article className="max-w-[760px]">
        <div className="mb-4 text-sm text-muted-foreground">
          <Link href="/forum/questions">Curated questions</Link> / {question.pillar.replace("-", " ")}
        </div>
        <Badge variant="secondary" className="mb-4 font-normal">
          Moderated answer hub
        </Badge>
        <h1 className="mb-3 text-[clamp(1.7rem,4vw,2.4rem)] font-semibold tracking-tight">
          {question.title}
        </h1>
        <p className="mb-5 text-muted-foreground">{question.summary}</p>
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-2 text-base font-semibold">Accepted plain answer</h2>
          <p className="leading-relaxed text-foreground/80">{question.answer}</p>
        </section>
        <section className="mt-6">
          <h2 className="mb-3 text-base font-semibold">Related next steps</h2>
          <div className="grid gap-2">
            {question.related.map((href) => (
              <Link key={href} href={href} className="rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-accent">
                {href}
              </Link>
            ))}
          </div>
        </section>
      </article>
    </AppShell>
  );
}

