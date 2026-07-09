import { AppShell } from "@/components/AppShell";
import { pageMeta, site } from "@/lib/site";

export const metadata = pageMeta(
  "/about",
  "About",
  "Know Plain explains big ideas plainly — retirement, money psychology, and decision tools.",
);

export default function AboutPage() {
  return (
    <AppShell active="home">
      <article className="max-w-[680px]">
        <h1 className="mb-4 text-[1.75rem] font-semibold tracking-tight">About Know Plain</h1>
        <p className="mb-4 leading-relaxed">
          Know Plain is a knowledge portal for curious adults. We explain retirement math, money
          psychology, science, and the news without jargon.
        </p>
        <div className="my-5 border-l-[3px] border-ink bg-white px-4 py-3">
          <strong>Mission:</strong> {site.tagline}
        </div>
        <p className="mb-4 leading-relaxed text-[#2a2a2a]">
          Content is educational only — not financial, tax, medical, or legal advice. Some tool and
          book links are affiliates; see Disclosure.
        </p>
        <p className="text-sm text-muted">
          YouTube:{" "}
          <a href={site.youtube} className="text-accent" rel="noopener noreferrer">
            @explainstudio9
          </a>{" "}
          (public brand: Know Plain).
        </p>
      </article>
    </AppShell>
  );
}
