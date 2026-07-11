"use client";

import { useMemo, useRef, useState } from "react";
import { AlertTriangle, Gift, Scale, TrendingUp } from "lucide-react";
import { trackProductEvent } from "@/lib/analytics";
import { ToolField } from "./ToolField";
import { currency } from "@/lib/checkup";
import { INVEST_RISK_PREMIUM, debtVsInvesting } from "@/lib/facts-2026";

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;


export function DebtVsInvestingTool() {
  const [debtBalance, setDebtBalance] = useState(12_000);
  const [debtApr, setDebtApr] = useState(22);
  const [monthlyPayment, setMonthlyPayment] = useState(300);
  const [extraMonthly, setExtraMonthly] = useState(200);
  const [expectedReturn, setExpectedReturn] = useState(7);
  const [salary, setSalary] = useState(80_000);
  const [contributionRate, setContributionRate] = useState(2);
  // Was hardcoded 50%/6%. Roughly a third of private-sector workers have no match at all,
  // and the "take the free money" verdict OVERRIDES the correct answer — so for them the
  // tool was telling them to chase money that does not exist instead of killing a 22% card.
  // 0 is a legal value in both fields.
  const [matchRate, setMatchRate] = useState(50);
  const [matchLimit, setMatchLimit] = useState(6);
  const tracked = useRef(false);

  const track = () => {
    if (tracked.current) return;
    tracked.current = true;
    trackProductEvent("Tool Used", { tool: "debt-vs-investing" });
  };

  const r = useMemo(
    () =>
      debtVsInvesting({
        debtBalance,
        debtApr: debtApr / 100,
        monthlyPayment,
        extraMonthly,
        expectedReturn: expectedReturn / 100,
        salary,
        employerMatchRate: matchRate / 100,
        employerMatchLimit: matchLimit / 100,
        currentContributionRate: contributionRate / 100,
      }),
    [
      debtBalance,
      debtApr,
      monthlyPayment,
      extraMonthly,
      expectedReturn,
      salary,
      contributionRate,
      matchRate,
      matchLimit,
    ],
  );

  // Two different "never"s, and the old code only checked one. `monthsToPayoff` includes
  // the extra payment, so a minimum that never clears the balance while the extra DOES
  // slipped through as a normal result — and the stats grid printed "$0 interest".
  const neverPaysOff = !Number.isFinite(r.monthsToPayoff); // even WITH the extra
  const minimumNeverPaysOff = !Number.isFinite(r.interestIfMinimum); // without it
  const extraIsTheDifference = minimumNeverPaysOff && !neverPaysOff;

  const verdict = {
    match: {
      icon: Gift,
      tone: "border-emerald-300/60 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200",
      title: `Take the free money first — you are leaving ${currency(r.matchLeftOnTable)} a year behind.`,
      body: `Your employer matches ${matchRate} cents on the dollar up to ${matchLimit}% of salary. Contributing enough to capture the full match is an instant ${matchRate}% return, guaranteed, before the money is even invested. Nothing else in personal finance competes — not even paying off a credit card. Do this first, then come back to the debt.`,
    },
    debt: {
      icon: AlertTriangle,
      tone: "border-amber-300/60 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200",
      title: `Pay the debt. ${pct(r.guaranteedReturn)} guaranteed beats ${pct(r.expectedReturn)} hoped for.`,
      body: "Clearing this debt returns its interest rate with certainty. Investing might return more, and might not — and there is no rule saying the good years arrive when you need them. When the certain return is the higher one, it is not a close call.",
    },
    invest: {
      icon: TrendingUp,
      tone: "border-emerald-300/60 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200",
      title: `Investing has the edge — ${pct(r.expectedReturn)} expected against ${pct(r.guaranteedReturn)} guaranteed.`,
      body: "The gap is wide enough to be worth the uncertainty. Keep paying the debt on schedule; it is cheap money. But do not confuse an expected return with a promised one — if a paid-off balance would help you sleep, that is a real return too, and it is not irrational to take it.",
    },
    close: {
      icon: Scale,
      tone: "border-border bg-secondary text-foreground",
      title: "Too close to call — and a tie should go to the debt.",
      body: `Investing is ahead by less than ${pct(INVEST_RISK_PREMIUM)}, which is not enough to pay you for the uncertainty. One of these returns is guaranteed and the other is a forecast. Splitting the extra between them is a perfectly reasonable answer here.`,
    },
  }[r.verdict];

  const Icon = verdict.icon;

  return (
    <div className="grid gap-5">
      <div className="grid gap-5 rounded-xl border border-border bg-card p-5 lg:grid-cols-[300px_1fr]">
        <div className="grid content-start gap-4" onChange={track}>
          <ToolField label="Debt balance"
            min={0}
            max={5000000} value={debtBalance} onChange={setDebtBalance} step={500} />
          <ToolField label="Interest rate (%)"
            min={0}
            max={60} value={debtApr} onChange={setDebtApr} step={0.5} />
          <ToolField
            label="Current monthly payment"
            min={0}
            max={200000}
            value={monthlyPayment}
            onChange={setMonthlyPayment}
            step={50}
          />
          <ToolField
            label="Spare cash each month"
            min={0}
            max={200000}
            value={extraMonthly}
            onChange={setExtraMonthly}
            step={50}
            hint="The money you are deciding what to do with."
          />
          <ToolField
            label="Expected market return (%)"
            min={-20}
            max={30}
            value={expectedReturn}
            onChange={setExpectedReturn}
            step={0.5}
            hint="A long-run guess, not a promise."
          />
          <ToolField label="Annual salary"
            min={0}
            max={5000000} value={salary} onChange={setSalary} step={1000} />
          <ToolField
            label="You contribute (% of salary)"
            min={0}
            max={100}
            value={contributionRate}
            onChange={setContributionRate}
            step={1}
          />
          <ToolField
            label="Employer matches (cents on the dollar, %)"
            min={0}
            max={200}
            value={matchRate}
            onChange={setMatchRate}
            step={5}
            hint="Set to 0 if you have no employer match."
          />
          <ToolField
            label="…up to this % of salary"
            min={0}
            max={100}
            value={matchLimit}
            onChange={setMatchLimit}
            step={1}
          />
        </div>

        <div className="grid content-start gap-4">
          <div className={`flex gap-3 rounded-lg border p-4 ${verdict.tone}`}>
            <Icon className="mt-0.5 size-4 shrink-0" />
            <div className="text-sm">
              <strong className="block">{verdict.title}</strong>{" "}
              {verdict.body}
            </div>
          </div>

          {neverPaysOff ? (
            <div className="flex gap-3 rounded-lg border border-red-300/60 bg-red-50 p-4 text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <div className="text-sm">
                <strong className="block">This payment never clears the balance.</strong>{" "}
                At {pct(debtApr / 100)} the interest alone is about{" "}
                {currency((debtBalance * (debtApr / 100)) / 12)} a month, which is more than you are
                paying. The balance grows no matter how long you keep going. This is not a
                debt-versus-investing question any more — it is the only thing to fix.
              </div>
            </div>
          ) : (
            <>
              {/* The single most motivating fact this tool can produce, and it used to be
                  rendered as "$0". The minimum payment never clears the balance; the extra
                  is the entire difference between never and a finite date. */}
              {extraIsTheDifference && (
                <div className="flex gap-3 rounded-lg border border-red-300/60 bg-red-50 p-4 text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  <div className="text-sm">
                    <strong className="block">
                      Your minimum payment alone never clears this debt.
                    </strong>{" "}
                    At {pct(debtApr / 100)}, interest is about{" "}
                    {currency((debtBalance * (debtApr / 100)) / 12)} a month — more than the{" "}
                    {currency(monthlyPayment)} you are paying, so the balance grows forever. The
                    extra {currency(extraMonthly)} is not an optimisation. It is the difference
                    between <em>never</em> and {r.monthsToPayoff} months.
                  </div>
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">Debt gone in</p>
                  <strong>
                    {r.monthsToPayoff} month{r.monthsToPayoff === 1 ? "" : "s"}
                  </strong>
                </div>
                <div className="rounded-lg bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">Interest if you add nothing</p>
                  <strong>
                    {minimumNeverPaysOff ? "Never repaid" : currency(r.interestIfMinimum)}
                  </strong>
                </div>
                <div className="rounded-lg bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">Interest saved by the extra</p>
                  <strong>
                    {minimumNeverPaysOff ? "Unpayable → payable" : currency(r.interestSaved)}
                  </strong>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-2 rounded-xl border border-border bg-card p-5 text-sm leading-relaxed text-muted-foreground">
        <p>
          <strong className="text-foreground">The order that actually holds.</strong>{" "}
          Capture the full employer match, because an instant 50% return beats everything. Then kill high-interest
          debt, because its return is guaranteed and the market&rsquo;s is not. Then invest the rest.
          Almost every &ldquo;debt or invest?&rdquo; argument is really an argument about steps two
          and three, and it is settled by asking which return is <em>certain</em>.
        </p>
        <p>
          <strong className="text-foreground">Why a tie goes to the debt.</strong> A 7% expected
          return and a 7% interest rate are not the same thing. One is a forecast with a wide range
          of outcomes; the other is a fact. We only call it for investing when the expected return
          clears the debt rate by at least {pct(INVEST_RISK_PREMIUM)} — enough to be paid something
          for taking the risk.
        </p>
        <p className="text-xs">
          Deliberately produces no &ldquo;you will be $X richer&rdquo; figure: that number requires
          predicting the market, and false precision is exactly what this site exists to avoid. It
          ignores tax deductibility of mortgage interest, and assumes a 50%-up-to-6% match — check
          your own plan. It also cannot price peace of mind, which is a real return for some people.
          Educational estimate, not financial advice.
        </p>
      </div>
    </div>
  );
}
