"use client";

import { useRef, useState, useTransition } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Save, AlertCircle } from "lucide-react";
import { trackProductEvent } from "@/lib/analytics";
import { saveSimulation } from "./actions";
import type { User } from "@supabase/supabase-js";

export function Simulator({ user }: { user: User | null }) {
  const [balance, setBalance] = useState(1000000);
  const [withdrawal, setWithdrawal] = useState(40000);
  const [growth, setGrowth] = useState(6);
  const [inflation, setInflation] = useState(2.5);
  
  const [simName, setSimName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const tracked = useRef(false);

  const trackUsed = () => {
    if (tracked.current) return;
    tracked.current = true;
    trackProductEvent("Tool Used", { tool: "withdrawal-simulator" });
  };

  const calculate = () => {
    let currentBalance = balance;
    let currentWithdrawal = withdrawal;
    const years = [];
    
    for (let i = 0; i <= 30; i++) {
      if (currentBalance <= 0) {
        years.push({ year: i, balance: 0, withdrawal: 0 });
        continue;
      }
      
      years.push({ year: i, balance: Math.round(currentBalance), withdrawal: Math.round(currentWithdrawal) });
      
      // End of year math
      const growthAmount = currentBalance * (growth / 100);
      currentBalance = currentBalance + growthAmount - currentWithdrawal;
      currentWithdrawal = currentWithdrawal * (1 + inflation / 100);
    }
    
    return years;
  };

  const results = calculate();
  const runsOutYear = results.find(r => r.balance <= 0)?.year;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simName.trim()) return;
    
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", simName);
      formData.append("balance", balance.toString());
      formData.append("withdrawal", withdrawal.toString());
      formData.append("growth", growth.toString());
      formData.append("inflation", inflation.toString());
      
      const res = await saveSimulation(formData);
      if (res?.error) {
        setSaveStatus("error");
        trackProductEvent("Simulation Save Failed");
      } else {
        setSaveStatus("success");
        trackProductEvent("Simulation Saved");
        setSimName("");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
      {/* Inputs (Glassmorphism) */}
      <div className="grid gap-5 rounded-[20px] border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-black/40">
        <h2 className="text-xl font-bold tracking-tight">Parameters</h2>
        
        <div>
          <label className="mb-1.5 block text-sm font-medium">Starting Balance ($)</label>
          <input
            type="number"
            value={balance}
            onChange={(e) => {
              trackUsed();
              setBalance(Number(e.target.value));
            }}
            className="w-full rounded-xl border border-line bg-white/60 px-4 py-2.5 text-sm transition-all focus:border-ink focus:ring-2 focus:ring-ink/20 focus:outline-hidden dark:bg-black/60"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Annual Withdrawal ($)</label>
          <input
            type="number"
            value={withdrawal}
            onChange={(e) => {
              trackUsed();
              setWithdrawal(Number(e.target.value));
            }}
            className="w-full rounded-xl border border-line bg-white/60 px-4 py-2.5 text-sm transition-all focus:border-ink focus:ring-2 focus:ring-ink/20 focus:outline-hidden dark:bg-black/60"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Expected Growth (%)</label>
          <input
            type="number"
            value={growth}
            step="0.1"
            onChange={(e) => {
              trackUsed();
              setGrowth(Number(e.target.value));
            }}
            className="w-full rounded-xl border border-line bg-white/60 px-4 py-2.5 text-sm transition-all focus:border-ink focus:ring-2 focus:ring-ink/20 focus:outline-hidden dark:bg-black/60"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Expected Inflation (%)</label>
          <input
            type="number"
            value={inflation}
            step="0.1"
            onChange={(e) => {
              trackUsed();
              setInflation(Number(e.target.value));
            }}
            className="w-full rounded-xl border border-line bg-white/60 px-4 py-2.5 text-sm transition-all focus:border-ink focus:ring-2 focus:ring-ink/20 focus:outline-hidden dark:bg-black/60"
          />
        </div>

        <div className="mt-4 border-t border-line pt-5">
          {user ? (
            <form onSubmit={handleSave} className="grid gap-3">
              <label className="text-sm font-medium">Save this simulation</label>
              <input
                type="text"
                placeholder="Simulation Name..."
                value={simName}
                onChange={(e) => setSimName(e.target.value)}
                required
                className="w-full rounded-xl border border-line bg-white/60 px-4 py-2 text-sm focus:border-ink focus:outline-hidden dark:bg-black/60"
              />
              <button 
                type="submit" 
                disabled={isPending || !simName.trim()}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {isPending ? "Saving..." : "Save"}
              </button>
              {saveStatus === "success" && <p className="text-xs text-green-600">Simulation saved!</p>}
              {saveStatus === "error" && <p className="text-xs text-red-600">Failed to save.</p>}
            </form>
          ) : (
            <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
              Sign in to save simulations to your profile.
            </div>
          )}
        </div>
      </div>

      {/* Chart Output */}
      <div className="flex flex-col rounded-[20px] border border-line bg-surface p-6 shadow-xs">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold tracking-tight">30-Year Projection</h3>
            <p className="text-muted-foreground">Portfolio balance over time</p>
          </div>
          {runsOutYear !== undefined && (
            <div className="flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 dark:bg-red-950/30 dark:text-red-400">
              <AlertCircle className="h-4 w-4" />
              Runs out in Year {runsOutYear}
            </div>
          )}
        </div>
        
        <div className="h-[400px] w-full flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={results} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#000" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#000" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
              <XAxis 
                dataKey="year" 
                tickFormatter={(val) => `Yr ${val}`}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#8a8a8a' }}
                dy={10}
              />
              <YAxis 
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#8a8a8a' }}
                dx={-10}
              />
              <Tooltip 
                formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Balance']}
                labelFormatter={(label) => `Year ${label}`}
                contentStyle={{ borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
              />
              <Area 
                type="monotone" 
                dataKey="balance" 
                stroke="#000" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorBalance)" 
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
