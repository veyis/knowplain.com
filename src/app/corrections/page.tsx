import { AppShell } from "@/components/AppShell";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "/corrections",
  "Corrections",
  "How Know Plain handles corrections, updates, and reader feedback.",
);

export default function CorrectionsPage() {
  return (
    <AppShell active="home">
      <main className="max-w-[720px]">
        <h1 className="mb-3 text-[1.7rem] font-semibold tracking-tight">Corrections</h1>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          Know Plain updates finance explainers when rules, thresholds, data, or source guidance
          change. When a correction materially changes a conclusion, we note that change on the page.
        </p>
        <div className="grid gap-3 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          <p>
            Send correction notes through the contact path listed on the About page. Include the page
            URL, the claim, and the source you believe should be reviewed.
          </p>
          <p>
            Editorial updates are educational only and do not create an adviser-client relationship.
          </p>
        </div>
      </main>
    </AppShell>
  );
}

