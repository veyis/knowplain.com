import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "/editorial-policy",
  "Editorial standards",
  "How Know Plain writes, sources, reviews, and updates its explainers — and the limits of educational content.",
);

export default function EditorialPolicyPage() {
  return (
    <AppShell active="home">
      <article className="max-w-[680px]">
        <h1 className="mb-4 text-[1.75rem] font-semibold tracking-tight">Editorial standards</h1>
        <p className="mb-6 leading-relaxed text-muted">
          Know Plain publishes plain-language explainers about retirement and money. Because these
          are consequential topics, here is exactly how we produce, source, and maintain them — and
          what our content is not.
        </p>

        <h2 className="mb-2 mt-8 text-lg font-semibold tracking-tight">Educational only</h2>
        <p className="mb-4 leading-relaxed text-[#2a2a2a]">
          Everything here is general education, not personalized financial, tax, legal, or medical
          advice. We don&rsquo;t know your situation, and no article can. For decisions that affect
          your life, talk to a qualified professional.
        </p>

        <h2 className="mb-2 mt-8 text-lg font-semibold tracking-tight">How we write</h2>
        <p className="mb-4 leading-relaxed text-[#2a2a2a]">
          Articles are drafted with the help of AI tools and then reviewed and edited by the Know
          Plain editorial team for accuracy, clarity, and plain language before publishing. We aim
          to explain established ideas simply — not to chase predictions or hot takes.
        </p>

        <h2 className="mb-2 mt-8 text-lg font-semibold tracking-tight">How we source</h2>
        <p className="mb-4 leading-relaxed text-[#2a2a2a]">
          Factual claims are grounded in primary and authoritative sources — for example the{" "}
          <a href="https://www.ssa.gov/" className="text-accent hover:underline" rel="noopener noreferrer">
            Social Security Administration
          </a>
          , the{" "}
          <a href="https://www.irs.gov/" className="text-accent hover:underline" rel="noopener noreferrer">
            IRS
          </a>
          , and the foundational research behind ideas like the 4% rule. Where a claim rests on a
          study, we name it.
        </p>

        <h2 className="mb-2 mt-8 text-lg font-semibold tracking-tight">Updates &amp; corrections</h2>
        <p className="mb-4 leading-relaxed text-[#2a2a2a]">
          Every explainer shows a last-updated date, and we revise pieces as rules and data change.
          If you spot an error, tell us via our{" "}
          <a href="https://www.youtube.com/@explainstudio9" className="text-accent hover:underline" rel="noopener noreferrer">
            YouTube channel
          </a>{" "}
          and we&rsquo;ll fix it.
        </p>

        <h2 className="mb-2 mt-8 text-lg font-semibold tracking-tight">Affiliates</h2>
        <p className="leading-relaxed text-[#2a2a2a]">
          Some tool and book links are affiliates, which may earn Know Plain a commission at no extra
          cost to you. This never changes what we recommend. See our{" "}
          <Link href="/disclosure" className="text-accent hover:underline">
            full disclosure
          </Link>
          .
        </p>
      </article>
    </AppShell>
  );
}
