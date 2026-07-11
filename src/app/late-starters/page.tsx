import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "/late-starters",
  "Late Starter Retirement Guide",
  "A plain-language path for people starting, restarting, or catching up on retirement saving after 40.",
);

const paths = [
  ["/topics/retirement/starting-retirement-savings-at-45", "Starting retirement savings at 45"],
  ["/tools/catch-up-contributions", "Catch-up contribution planner"],
  ["/decisions/pay-debt-or-invest", "Pay debt or invest?"],
  ["/tools/retirement-age-tradeoff", "Compare working longer"],
  ["/topics/retirement/part-time-retirement", "Part-time retirement"],
  ["/checkup", "Run the Retirement Checkup"],
];

export default function LateStartersPage() {
  return (
    <AppShell active="late-starters">
      <header className="mb-6 max-w-[760px]">
        <p className="mb-2 text-sm font-medium text-muted-foreground">Late, anxious, confused, but fixable</p>
        <h1 className="mb-3 text-[clamp(2rem,5vw,3rem)] font-semibold tracking-tight">
          A retirement path for late starters.
        </h1>
        <p className="text-muted-foreground">
          Start with the levers that still move: contribution rate, employer match, spending gap,
          debt, retirement age, part-time work, and healthcare timing.
        </p>
      </header>
      <div className="grid gap-3 md:grid-cols-2">
        {paths.map(([href, label]) => (
          <Link key={href} href={href} className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/20">
            <strong>{label}</strong>
            <p className="mt-2 text-sm text-muted-foreground">Open the next plain step.</p>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}

