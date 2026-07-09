"use client";

import { useState } from "react";

export function Simulator() {
  const [balance, setBalance] = useState(1000000);
  const [withdrawal, setWithdrawal] = useState(40000);
  const [growth, setGrowth] = useState(6);
  const [inflation, setInflation] = useState(2.5);

  const calculate = () => {
    let currentBalance = balance;
    let currentWithdrawal = withdrawal;
    const years = [];
    
    for (let i = 0; i < 30; i++) {
      if (currentBalance <= 0) {
        years.push({ year: i, balance: 0, withdrawal: 0 });
        continue;
      }
      
      years.push({ year: i, balance: currentBalance, withdrawal: currentWithdrawal });
      
      // End of year math:
      const growthAmount = currentBalance * (growth / 100);
      currentBalance = currentBalance + growthAmount - currentWithdrawal;
      
      // Adjust next year's withdrawal for inflation
      currentWithdrawal = currentWithdrawal * (1 + inflation / 100);
    }
    
    return years;
  };

  const results = calculate();

  return (
    <div className="grid gap-8 md:grid-cols-[300px_1fr]">
      <div className="grid gap-5 rounded-2xl border border-line bg-surface p-5">
        <div>
          <label className="mb-1 block text-sm font-semibold">Starting Balance ($)</label>
          <input
            type="number"
            value={balance}
            onChange={(e) => setBalance(Number(e.target.value))}
            className="w-full rounded-lg border border-line bg-canvas px-3 py-2 outline-hidden focus:border-ink"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Initial Annual Withdrawal ($)</label>
          <input
            type="number"
            value={withdrawal}
            onChange={(e) => setWithdrawal(Number(e.target.value))}
            className="w-full rounded-lg border border-line bg-canvas px-3 py-2 outline-hidden focus:border-ink"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Expected Annual Growth (%)</label>
          <input
            type="number"
            value={growth}
            step="0.1"
            onChange={(e) => setGrowth(Number(e.target.value))}
            className="w-full rounded-lg border border-line bg-canvas px-3 py-2 outline-hidden focus:border-ink"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Expected Inflation (%)</label>
          <input
            type="number"
            value={inflation}
            step="0.1"
            onChange={(e) => setInflation(Number(e.target.value))}
            className="w-full rounded-lg border border-line bg-canvas px-3 py-2 outline-hidden focus:border-ink"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-5 overflow-hidden">
        <h3 className="mb-4 text-lg font-semibold tracking-tight">30-Year Projection</h3>
        <div className="max-h-[400px] overflow-y-auto pr-2">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-surface">
              <tr className="border-b border-line">
                <th className="pb-2 font-semibold">Year</th>
                <th className="pb-2 font-semibold">Starting Balance</th>
                <th className="pb-2 font-semibold">Withdrawal</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.year} className="border-b border-line last:border-0">
                  <td className="py-2.5 text-muted">Year {r.year + 1}</td>
                  <td className={`py-2.5 ${r.balance <= 0 ? 'text-red-600 font-medium' : ''}`}>
                    {r.balance > 0 ? "$" + Math.round(r.balance).toLocaleString() : "$0"}
                  </td>
                  <td className="py-2.5 text-muted">
                    {r.withdrawal > 0 && r.balance > 0 ? "$" + Math.round(r.withdrawal).toLocaleString() : "$0"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
