import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { JsonLd } from "@/components/JsonLd";
import { Badge } from "@/components/ui/badge";
import { editorialPeople, isEditorialPersonSlug } from "@/lib/editorial";
import { profilePageJsonLd } from "@/lib/schema";
import { site, pageMeta } from "@/lib/site";

export function generateStaticParams() {
  return Object.keys(editorialPeople).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isEditorialPersonSlug(slug)) return {};
  const person = editorialPeople[slug];
  return pageMeta(`/authors/${slug}`, person.name, person.bio);
}

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isEditorialPersonSlug(slug)) notFound();
  const person = editorialPeople[slug];

  const url = `${site.url}/authors/${slug}`;

  return (
    <AppShell active="home">
      <JsonLd
        data={profilePageJsonLd({
          name: person.name,
          role: person.role,
          bio: person.bio,
          url,
          sameAs: person.sameAs,
        })}
      />
      <main className="max-w-[720px]">
        <Badge variant="secondary" className="mb-4 font-normal">
          Author profile
        </Badge>
        <h1 className="mb-3 text-[clamp(1.8rem,4vw,2.4rem)] font-semibold tracking-tight">
          {person.name}
        </h1>
        <p className="mb-2 text-sm font-medium text-muted-foreground">{person.role}</p>
        <p className="mb-6 leading-relaxed text-foreground/80">{person.bio}</p>
        {person.credentials?.length ? (
          <section className="mb-6 rounded-xl border border-border bg-card p-4">
            <h2 className="mb-2 text-base font-semibold">Credentials</h2>
            <ul className="ml-5 list-disc space-y-1 text-sm text-muted-foreground">
              {person.credentials.map((credential) => (
                <li key={credential}>{credential}</li>
              ))}
            </ul>
          </section>
        ) : null}
        {person.disclosures?.length ? (
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-2 text-base font-semibold">Disclosures</h2>
            <ul className="ml-5 list-disc space-y-1 text-sm text-muted-foreground">
              {person.disclosures.map((disclosure) => (
                <li key={disclosure}>{disclosure}</li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </AppShell>
  );
}
