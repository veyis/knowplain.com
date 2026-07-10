import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { pageMeta } from "@/lib/site";
import { Simulator } from "./Simulator";
import { createClient } from "@/lib/supabase/server";

export const metadata = pageMeta(
  "/tools/withdrawal-simulator",
  "Withdrawal Simulator",
  "Interactive tool to stress-test your retirement withdrawals against inflation and growth.",
);

export default async function WithdrawalSimulatorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <AppShell active="tools">
      <div className="mb-4 text-sm text-muted">
        <Link href="/tools">Tools</Link> › Withdrawal Simulator
      </div>
      <div className="mb-8">
        <h1 className="mb-2 text-[1.5rem] font-semibold tracking-tight">Withdrawal Simulator</h1>
        <p className="max-w-[52ch] text-muted">
          Stress-test your withdrawal rate against expected growth and inflation over a 30-year retirement period.
        </p>
      </div>

      <Simulator user={user} />

      <p className="mt-8 rounded-xl border border-dashed border-line bg-white p-4 text-sm text-muted">
        Educational tool only. Real market returns do not follow a flat straight line. 
        For a more thorough DIY stress-test, we recommend <a href="https://www.boldin.com/" className="underline" target="_blank" rel="noopener noreferrer">Boldin</a>.
      </p>
    </AppShell>
  );
}
