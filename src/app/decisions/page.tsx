import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/schema";
import { decisions } from "@/lib/decisions";
import { pageMeta, site } from "@/lib/site";

export const metadata = pageMeta(
  "/decisions",
  "Decision Library",
  "Plain-language retirement decisions with calculators, checklists, sources, and next steps.",
);

export default function DecisionsPage() {
  const list = Object.entries(decisions);
  return (
    <AppShell active="decisions">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: site.url },
            { name: "Decision Library", url: `${site.url}/decisions` },
          ]),
          itemListJsonLd(list.map(([slug, decision]) => ({ name: decision.title, url: `${site.url}/decisions/${slug}` }))),
        ]}
      />
      <header className="mb-6 max-w-[760px]">
        <h1 className="mb-3 text-[clamp(1.8rem,4vw,2.5rem)] font-semibold tracking-tight">
          Decision Library
        </h1>
        <p className="text-muted-foreground">
          Start with the decision, then use the explainer, calculator, checklist, and source notes.
        </p>
      </header>
      <div className="grid gap-3 md:grid-cols-2">
        {list.map(([slug, decision]) => (
          <Link key={slug} href={`/decisions/${slug}`} className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/20">
            <strong className="tracking-tight">{decision.title}</strong>
            <p className="mt-2 text-sm text-muted-foreground">{decision.description}</p>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}

