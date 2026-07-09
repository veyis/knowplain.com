import { AppShell } from "@/components/AppShell";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "/disclosure",
  "Disclosure",
  "Educational-only content and affiliate disclosure for Know Plain.",
);

export default function DisclosurePage() {
  return (
    <AppShell>
      <article className="max-w-[680px]">
        <h1 className="mb-4 text-[1.75rem] font-semibold tracking-tight">Disclosure</h1>
        <p className="mb-4 leading-relaxed">
          <strong>Educational only.</strong> Content is for education. Not financial, tax,
          investment, medical, or legal advice.
        </p>
        <p className="leading-relaxed">
          <strong>Affiliates.</strong> Some links (including Empower via Impact and Amazon
          Associates) may earn Know Plain a commission at no extra cost to you.
        </p>
      </article>
    </AppShell>
  );
}
