import { redirect } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { currency, runRetirementCheckup, type CheckupInput } from "@/lib/checkup";
import { isCheckupInput } from "@/lib/checkup-storage";
import { updateProfileName, deleteSimulation, deleteSavedCheckup } from "./actions";

type SavedSimulation = {
  id: string;
  name: string;
  balance: number;
  withdrawal: number;
  growth: number;
  inflation: number;
};

type SavedCheckup = {
  id: string;
  name: string;
  input: CheckupInput;
  created_at: string;
};

export const metadata = {
  title: "Profile",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("knowplain_profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  // Fetch user's saved simulations
  const { data: simulations } = await supabase
    .from("knowplain_saved_simulations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: rawCheckups } = await supabase
    .from("knowplain_saved_checkups")
    .select("id,name,input,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const checkups = (rawCheckups || []).filter(
    (item): item is SavedCheckup => isCheckupInput(item.input),
  );

  return (
    <AppShell active="">
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground">{user.email}</p>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1fr_300px]">
        <div>
          <section className="mb-12">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Saved retirement checkups</h2>
                <p className="mt-1 text-sm text-muted-foreground">Private scenarios you explicitly saved to your account.</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/checkup">Run a new checkup</Link>
              </Button>
            </div>
            {checkups.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-6">
                <p className="text-sm text-muted-foreground">No account-saved checkups yet. Local device snapshots stay on the device where you created them.</p>
              </div>
            ) : (
              <div className="divide-y divide-border rounded-xl border border-border bg-card">
                {checkups.map((checkup) => {
                  const result = runRetirementCheckup(checkup.input);
                  return (
                    <div key={checkup.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold">{checkup.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Annual gap {currency(result.annualGap)} · Target retirement age {checkup.input.targetRetirementAge} · Saved {new Date(checkup.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button asChild size="sm">
                          <Link href={`/checkup?saved=${checkup.id}`}>Open</Link>
                        </Button>
                        <form action={async () => {
                          "use server";
                          await deleteSavedCheckup(checkup.id);
                        }}>
                          <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                            Delete
                          </Button>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <h2 className="mb-6 text-xl font-semibold tracking-tight">Saved Simulations</h2>
          
          {!simulations || simulations.length === 0 ? (
            <div className="rounded-2xl border border-line bg-surface p-8 text-center">
              <p className="mb-4 text-sm text-muted-foreground">You haven&apos;t saved any simulations yet.</p>
              <Button asChild>
                <Link href="/tools/withdrawal-simulator">Try the Simulator</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {simulations.map((sim: SavedSimulation) => (
                <div key={sim.id} className="flex flex-col justify-between rounded-xl border border-line bg-surface p-5 shadow-xs transition-shadow hover:shadow-sm">
                  <div>
                    <h3 className="mb-2 text-lg font-bold">{sim.name}</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="text-muted-foreground">Balance:</div>
                      <div className="font-medium text-right">${Number(sim.balance).toLocaleString()}</div>
                      
                      <div className="text-muted-foreground">Withdrawal:</div>
                      <div className="font-medium text-right">${Number(sim.withdrawal).toLocaleString()}</div>
                      
                      <div className="text-muted-foreground">Growth:</div>
                      <div className="font-medium text-right">{sim.growth}%</div>
                      
                      <div className="text-muted-foreground">Inflation:</div>
                      <div className="font-medium text-right">{sim.inflation}%</div>
                    </div>
                  </div>
                  
                  <div className="mt-5 border-t border-line pt-4 text-right">
                    <form action={async () => {
                      "use server";
                      await deleteSimulation(sim.id);
                    }}>
                      <button type="submit" className="text-xs font-semibold text-red-600 hover:underline">
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-xs">
            <h2 className="mb-4 text-lg font-semibold tracking-tight">Settings</h2>
            
            <form action={updateProfileName} className="grid gap-3">
              <label className="text-sm font-medium">Display Name</label>
              <input
                type="text"
                name="displayName"
                defaultValue={profile?.display_name || ""}
                required
                className="w-full rounded-xl border border-line bg-canvas px-4 py-2.5 text-sm outline-hidden focus:border-ink"
              />
              <Button type="submit" className="w-full">
                Save Changes
              </Button>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
