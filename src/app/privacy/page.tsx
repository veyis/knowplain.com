import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <AppShell>
      <article className="max-w-[680px]">
        <h1 className="mb-4 text-[1.75rem] font-semibold tracking-tight">Privacy</h1>
        <p className="leading-relaxed">
          We collect minimal analytics needed to improve the site. We do not sell personal data.
          When Supabase Auth is enabled, account data is stored in your Supabase project under your
          control.
        </p>
      </article>
    </AppShell>
  );
}
