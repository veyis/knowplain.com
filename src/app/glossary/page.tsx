import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/schema";
import { glossary } from "@/lib/glossary";
import { pageMeta, site } from "@/lib/site";

export const metadata = pageMeta(
  "/glossary",
  "Glossary",
  "Plain-language definitions of retirement and money terms — sequence risk, safe withdrawal rate, present bias, and more.",
);

export default function GlossaryPage() {
  const definedTermSet = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: `${site.name} Glossary`,
    url: `${site.url}/glossary`,
    hasDefinedTerm: glossary.map((t) => ({
      "@type": "DefinedTerm",
      name: t.term,
      description: t.definition,
      url: `${site.url}/glossary#${t.id}`,
      inDefinedTermSet: `${site.url}/glossary`,
    })),
  };

  return (
    <AppShell active="home">
      <JsonLd
        data={[
          definedTermSet,
          breadcrumbJsonLd([
            { name: "Home", url: site.url },
            { name: "Glossary", url: `${site.url}/glossary` },
          ]),
        ]}
      />
      <header className="mb-6 max-w-[680px]">
        <h1 className="mb-2 text-[1.6rem] font-semibold tracking-tight">Glossary</h1>
        <p className="text-muted">
          Retirement and money terms, known plain. Each definition links to a fuller explainer.
        </p>
      </header>
      <dl className="grid gap-3">
        {glossary.map((t) => (
          <div key={t.id} id={t.id} className="kp-card scroll-mt-24">
            <dt className="tracking-tight">
              <strong>{t.term}</strong>
            </dt>
            <dd className="text-sm leading-relaxed text-[#2a2a2a]">{t.definition}</dd>
            {t.see && (
              <Link href={t.see.href} className="text-sm font-medium text-accent hover:underline">
                See: {t.see.label} →
              </Link>
            )}
          </div>
        ))}
      </dl>
    </AppShell>
  );
}
