import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "/methodology",
  "Methodology and calculator assumptions",
  "Units, range construction, exclusions, sensitivity, source standards, and review practices behind Know Plain retirement tools.",
);

const sections = [
  ["units-and-time-value", "Units and time value", "Retirement checkup projections and targets are both expressed in today’s dollars. Return assumptions are real—after inflation—unless a tool explicitly labels a nominal rate. Annual income, spending, contributions, and premiums are annual amounts; Social Security inputs labeled monthly remain monthly."],
  ["range-construction", "How ranges are constructed", "We show ranges when credible methods answer different questions. The core retirement target uses a forward-looking withdrawal-rate estimate and a historical worst-case result as separate anchors. We do not average them or imply that either endpoint is guaranteed."],
  ["projection-timing", "Projection timing", "Savings projections generally assume contributions arrive at year end and compound annually. Withdrawal projections remove spending before applying that year’s return. Changing either convention changes the result, so tools disclose it near the output."],
  ["excluded-factors", "What is excluded", "Unless a tool says otherwise, estimates exclude state tax, investment fees, account-specific tax lots, individualized Social Security rules, long-term-care costs, estate goals, and advice about asset selection. Healthcare tools use national reference premiums, not local quotes."],
  ["sensitivity-and-uncertainty", "Sensitivity and uncertainty", "Return order, retirement age, spending flexibility, healthcare coverage, longevity, tax law, and reliable income can move a result materially. High-risk outputs show ranges, threshold maps, scenario comparisons, or explicit omitted-factor notes rather than a single confidence-sounding number."],
  ["source-update-policy", "Source and update policy", "IRS, SSA, CMS, HealthCare.gov, HHS, Federal Reserve, and other primary sources take priority. Each volatile fact carries a verification date and is rechecked when legislation or agency guidance changes. Material corrections are shown on the affected article."],
] as const;

export default function MethodologyPage() {
  return (
    <AppShell active="home">
      <article className="max-w-[780px]">
        <header className="mb-7">
          <h1 className="mb-3 text-[clamp(1.8rem,4vw,2.5rem)] font-semibold tracking-tight">Methodology and assumptions</h1>
          <p className="leading-relaxed text-muted-foreground">Know Plain tools frame decisions; they do not forecast a personal future. This page defines what the numbers mean, how ranges are formed, and where the simplified models stop.</p>
        </header>
        <div className="grid gap-5">
          {sections.map(([id, title, body]) => <section id={id} key={id} className="scroll-mt-24 border-t border-border pt-5"><h2 className="text-lg font-semibold tracking-tight">{title}</h2><p className="mt-2 leading-relaxed text-muted-foreground">{body}</p></section>)}
        </div>
        <section className="mt-7 rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold">Audit the inputs yourself</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">The public <Link href="/sources" className="underline">2026 source ledger</Link> shows the exact values, primary source, verification date, and volatility status. The <Link href="/changes/2026" className="underline">annual changelog</Link> explains what changed. Report a problem through the <Link href="/corrections" className="underline">correction process</Link>.</p>
        </section>
      </article>
    </AppShell>
  );
}
