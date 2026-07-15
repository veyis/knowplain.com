import { AppShell } from "@/components/AppShell";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "/privacy",
  "Privacy and data handling",
  "Exactly which Know Plain data stays in your browser, which account data is stored, and what analytics excludes.",
);

export default function PrivacyPage() {
  return (
    <AppShell>
      <article className="max-w-[720px]">
        <h1 className="mb-3 text-[1.75rem] font-semibold tracking-tight">Privacy and data handling</h1>
        <p className="mb-7 leading-relaxed text-muted-foreground">Financial planning inputs deserve a more specific answer than “we value privacy.” The storage boundary depends on the action you choose.</p>

        <div className="grid gap-6">
          <section id="checkup-data" className="scroll-mt-24"><h2 className="font-semibold">Stays in this browser by default</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Calculator inputs are evaluated in the browser. Checkup drafts and named local snapshots use browser local storage on this device. They are not sent to analytics. Clearing site data, using another browser, or using private browsing can remove or isolate them.</p></section>
          <section><h2 className="font-semibold">Stored when you explicitly use an account feature</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">If you sign in and choose “save to account,” the named checkup or withdrawal scenario is stored in Know Plain’s Supabase database and tied to your authenticated user ID. Row-level security restricts normal account access to the owner. Authentication uses secure cookies needed to maintain the session.</p></section>
          <section id="analytics-data" className="scroll-mt-24"><h2 className="font-semibold">Analytics and operational errors</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">The analytics boundary is deny-by-default. It accepts an allowlisted event name and coarse fields such as a tool slug, checkup step name, broad zero-result search category, or coarse application-failure class. It rejects arbitrary properties, raw error messages and stacks, URLs, raw search queries, balances, income, debt, spending, conversion amounts, scenario notes, and email addresses. Global Privacy Control suppresses analytics, performance beacons, and operational-error events.</p></section>
          <section><h2 className="font-semibold">Community data</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Published forum threads and replies are public. New submissions can remain pending for moderation. Reports are tied to the reporting account and intended for moderation, not public display. Do not post account numbers, contact details, health information, or other sensitive personal data.</p></section>
          <section><h2 className="font-semibold">What we do not do</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Know Plain does not sell personal data and does not use entered financial values for advertising profiles. External source, affiliate, and YouTube links leave this site and are governed by those services’ privacy practices.</p></section>
        </div>
      </article>
    </AppShell>
  );
}
