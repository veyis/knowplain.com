import type { ReactNode } from "react";
import { currency } from "@/lib/checkup";

export function ToolResultRegion({
  id,
  children,
  className = "",
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-labelledby={`${id}-heading`}
      aria-live="polite"
      aria-atomic="false"
      className={`grid min-w-0 content-start gap-3 rounded-lg bg-secondary/70 p-4 ${className}`}
    >
      <h2 id={`${id}-heading`} className="sr-only">Calculator result</h2>
      {children}
    </section>
  );
}

export function ToolMetric({
  label,
  value,
  boxed = false,
}: {
  label: string;
  value: ReactNode;
  boxed?: boolean;
}) {
  return (
    <div className={boxed ? "rounded-lg bg-background p-3" : undefined}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold tracking-tight tabular-nums">{value}</p>
    </div>
  );
}

export function CurrencyRange({ low, high }: { low: number; high: number }) {
  if (!Number.isFinite(low) || !Number.isFinite(high)) {
    return <span>Not calculable from these inputs</span>;
  }
  const orderedLow = Math.min(low, high);
  const orderedHigh = Math.max(low, high);
  return <span>{currency(orderedLow)}&ndash;{currency(orderedHigh)}</span>;
}

export function PercentageValue({ value, digits = 1 }: { value: number; digits?: number }) {
  return <span>{Number.isFinite(value) ? `${value.toFixed(digits)}%` : "Not calculable"}</span>;
}

export function AssumptionPanel({ children }: { children: ReactNode }) {
  return (
    <aside
      aria-label="Calculator assumptions and limitations"
      className="rounded-xl border border-border bg-card p-5 text-sm leading-relaxed text-muted-foreground"
    >
      <h2 className="mb-2 font-semibold tracking-tight text-foreground">Assumptions and limits</h2>
      {children}
    </aside>
  );
}

export function BoundaryNotice({ children }: { children: ReactNode }) {
  return (
    <p role="status" className="rounded-lg border border-border bg-background p-3 text-sm text-muted-foreground">
      {children}
    </p>
  );
}
