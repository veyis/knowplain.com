import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/schema";
import { seededQuestions } from "@/lib/forum-seeds";
import { pageMeta, site } from "@/lib/site";

export const metadata = pageMeta(
  "/forum/questions",
  "Curated Retirement Questions",
  "Moderated Know Plain answer hubs for common retirement and money questions.",
);

export default function ForumQuestionsPage() {
  const list = Object.entries(seededQuestions);
  return (
    <AppShell active="forum">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: site.url },
            { name: "Forum", url: `${site.url}/forum` },
            { name: "Curated questions", url: `${site.url}/forum/questions` },
          ]),
          itemListJsonLd(list.map(([slug, q]) => ({ name: q.title, url: `${site.url}/forum/questions/${slug}` }))),
        ]}
      />
      <header className="mb-6 max-w-[760px]">
        <h1 className="mb-3 text-[1.8rem] font-semibold tracking-tight">Curated answer hubs</h1>
        <p className="text-muted-foreground">
          Seeded, moderated retirement questions. Live community threads should only become indexable
          after moderation.
        </p>
      </header>
      <div className="grid gap-3">
        {list.map(([slug, q]) => (
          <Link key={slug} href={`/forum/questions/${slug}`} className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/20">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{q.pillar.replace("-", " ")}</span>
            <strong className="mt-1 block">{q.title}</strong>
            <p className="mt-2 text-sm text-muted-foreground">{q.summary}</p>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}

