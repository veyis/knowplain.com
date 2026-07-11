import { AppShell } from "@/components/AppShell";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "/privacy",
  "Privacy",
  "How Know Plain handles analytics and account data.",
);

export default function PrivacyPage() {
  return (
    <AppShell>
      <article className="max-w-[680px]">
        <h1 className="mb-4 text-[1.75rem] font-semibold tracking-tight">Privacy</h1>
        <p className="leading-relaxed">
          We collect minimal, cookieless analytics needed to improve the site. We do not sell
          personal data, and we do not send calculator inputs such as balances, income, debt, or
          email addresses to analytics. If your browser sends Global Privacy Control, we suppress
          analytics and performance beacons. When Supabase Auth is enabled, account data is stored
          in your Supabase project under your control.
        </p>
      </article>
    </AppShell>
  );
}
