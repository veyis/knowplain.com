import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { fact } from "@/lib/facts-display";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "/late-starters",
  "Retirement action paths for starting at 45, 50, or 55",
  "Age-specific, plain-language retirement action paths for people starting or restarting at 45, 50, or 55.",
);

const agePaths = [
  {
    age: 45,
    horizon: "You still have time for compounding—but not for vague intentions.",
    first: "Get the whole employer match and automate the next contribution increase.",
    steps: [
      ["Measure the gap", "Run one readiness check using current savings, annual contributions, retirement spending, and reliable income.", "/checkup", "Run the checkup"],
      ["Choose debt deliberately", "Protect the employer match first, then compare expensive debt with additional investing instead of following a blanket rule.", "/decisions/pay-debt-or-invest", "Compare debt and investing"],
      ["Make increases automatic", "Schedule contribution increases with raises. A rate that rises without a fresh decision is more dependable than an annual promise.", "/topics/retirement/starting-retirement-savings-at-45", "Read the age-45 guide"],
      ["Test more than one retirement age", "Compare 65, 67, and 70. Extra working years add contributions, reduce withdrawals, and may increase Social Security.", "/tools/retirement-age-tradeoff", "Compare retirement ages"],
    ],
  },
  {
    age: 50,
    horizon: "Catch-up room opens, and the retirement date becomes a financial lever.",
    first: `Check whether payroll is using the age-50 catch-up; the 2026 limit is ${fact("401k.catchUp50")} above the regular deferral.`,
    steps: [
      ["Use the catch-up intentionally", "Do not assume payroll raises the contribution automatically. Check the annual total and the plan election.", "/tools/catch-up-contributions", "Calculate catch-up room"],
      ["Turn spending into an income target", "Separate essential retirement spending from flexible spending, then subtract Social Security and pensions before sizing the portfolio gap.", "/tools/am-i-on-track", "Estimate the planning range"],
      ["Price the years before Medicare", "Retiring before 65 adds a health-insurance bridge. Model it before treating 62 or 63 as an affordable date.", "/tools/aca-bridge", "Model the healthcare bridge"],
      ["Build a second version of retirement", "Compare full retirement with part-time income. A modest earned-income bridge can reduce early portfolio withdrawals.", "/topics/retirement/part-time-retirement", "Explore part-time retirement"],
    ],
  },
  {
    age: 55,
    horizon: "The next ten years connect saving, healthcare, Social Security, and withdrawal order.",
    first: "Build a coordinated 55-to-65 plan instead of optimizing each account separately.",
    steps: [
      ["Model the retirement date first", "At this horizon, working one or two additional years can affect contributions, health coverage, Social Security, and the number of withdrawal years at once.", "/tools/retirement-age-tradeoff", "Compare working longer"],
      ["Protect the pre-Medicare bridge", "Map coverage through 65 and test income around ACA eligibility. Treat current law as volatile and recheck it before acting.", "/tools/aca-bridge", "Test ACA scenarios"],
      ["Compare Social Security claiming ages", "Do not use break-even age alone. Include longevity, survivor needs, work income, taxes, and the portfolio withdrawals needed while delaying.", "/decisions/claim-social-security-now-or-later", "Frame the claiming decision"],
      ["Draft the first retirement paycheque", "List which account funds spending first, where taxes come from, and how you avoid selling risky assets after a decline.", "/topics/decision-tools/withdrawal-plan", "Build a withdrawal order"],
    ],
  },
] as const;

export default function LateStartersPage() {
  return (
    <AppShell active="late-starters">
      <header className="mb-8 max-w-[780px]">
        <p className="mb-2 text-sm font-medium text-muted-foreground">Late is a planning condition, not a verdict</p>
        <h1 className="mb-3 text-[clamp(2rem,5vw,3rem)] font-semibold tracking-tight">Start where you are: 45, 50, or 55.</h1>
        <p className="text-lg leading-relaxed text-muted-foreground">The useful order changes with time. Pick the closest starting age, take its first action, then work down the sequence. These are planning paths—not promises that one savings rate or retirement age fits everyone.</p>
        <nav aria-label="Choose a starting age" className="mt-5 flex flex-wrap gap-2">
          {agePaths.map((path) => <a key={path.age} href={`#start-${path.age}`} className="min-h-11 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-accent">Starting at {path.age}</a>)}
        </nav>
      </header>

      <div className="grid gap-10">
        {agePaths.map((path) => (
          <section key={path.age} id={`start-${path.age}`} aria-labelledby={`start-${path.age}-heading`} className="scroll-mt-24 border-t border-border pt-7">
            <div className="mb-5 max-w-[760px]">
              <p className="text-sm font-semibold text-muted-foreground">Starting at {path.age}</p>
              <h2 id={`start-${path.age}-heading`} className="mt-1 text-2xl font-semibold tracking-tight">{path.horizon}</h2>
              <p className="mt-3 rounded-lg bg-secondary p-4 text-sm leading-relaxed"><strong>First move:</strong> {path.first}</p>
            </div>
            <ol className="grid gap-0 border-y border-border">
              {path.steps.map(([title, detail, href, action], index) => (
                <li key={title} className="grid gap-3 border-b border-border py-5 last:border-0 sm:grid-cols-[2.5rem_minmax(0,1fr)_auto] sm:items-start">
                  <span className="grid size-8 place-items-center rounded-full bg-foreground text-sm font-semibold text-background" aria-hidden="true">{index + 1}</span>
                  <div><h3 className="font-semibold">{title}</h3><p className="mt-1 max-w-[680px] text-sm leading-relaxed text-muted-foreground">{detail}</p></div>
                  <Link href={href} className="min-h-11 self-center rounded-lg border border-border px-3 py-2.5 text-sm font-medium hover:bg-accent">{action}</Link>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      <aside className="mt-10 rounded-xl border border-border bg-card p-5 text-sm leading-relaxed text-muted-foreground">
        <strong className="text-foreground">Across every age:</strong> capture the full employer match when available, keep emergency cash, and do not treat an educational projection as personalized investment, tax, or healthcare advice. Re-run the <Link href="/checkup" className="underline">Retirement Checkup</Link> after a material change—not after every market headline.
      </aside>
    </AppShell>
  );
}
