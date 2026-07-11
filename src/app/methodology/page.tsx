import { AppShell } from "@/components/AppShell";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "/methodology",
  "Methodology",
  "The assumptions and source standards behind Know Plain tools, research, and retirement explainers.",
);

export default function MethodologyPage() {
  return (
    <AppShell active="home">
      <main className="max-w-[760px]">
        <h1 className="mb-3 text-[1.7rem] font-semibold tracking-tight">Methodology</h1>
        <p className="mb-6 leading-relaxed text-muted-foreground">
          Know Plain tools use transparent ranges and editable assumptions. Results are designed to
          point users toward better questions and next steps, not to replace individualized financial,
          tax, legal, or medical advice.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            ["Primary sources first", "IRS, SSA, Medicare, HealthCare.gov, BLS, Federal Reserve, and other official sources outrank secondary commentary."],
            ["Ranges over false precision", "Retirement results are shown as ranges because future returns, inflation, taxes, health costs, and life span are uncertain."],
            ["Assumptions visible", "Calculators should show default return, inflation, withdrawal, and timing assumptions before a user treats results as useful."],
            ["Actionable next steps", "Each tool or article should end with the next useful decision, calculator, checklist, or source-backed guide."],
          ].map(([title, body]) => (
            <section key={title} className="rounded-xl border border-border bg-card p-4">
              <h2 className="mb-2 text-base font-semibold">{title}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
            </section>
          ))}
        </div>
      </main>
    </AppShell>
  );
}

