"use client";

import { useId, useState } from "react";
import { parseToolNumber, toolNumberError } from "@/lib/tool-input";

/**
 * One numeric input for the calculators.
 *
 * This replaces four near-identical copies, each of which had the same two defects:
 *
 * 1. **The hint was invisible to screen readers.** It rendered as a loose <span> with no
 *    programmatic relationship to the input, so the assumption it carried — often the whole
 *    reason the number means anything ("assumes a typical match", "you supply the rates, we
 *    do not forecast them") — was announced to nobody. `aria-describedby` fixes that.
 *
 * 2. **No reliable input states.** An unbounded money field is a bug, not a convenience:
 *    clearing a number input yields Number("") === 0, which is how the Social Security tool
 *    ended up rendering a 596% benefit. HTML bounds are advisory, so this field classifies
 *    empty, non-finite, underflow, and overflow states itself. Invalid drafts remain visible
 *    for correction while the calculation safely keeps its last valid value.
 */
export function ToolField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  hint,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  hint?: string;
}) {
  const hintId = useId();
  const errorId = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const parsed = parseToolNumber(draft ?? String(value), min, max);
  const error = parsed.state === "valid" ? "" : toolNumberError(parsed, min, max);
  const describedBy = [hint ? hintId : "", error ? errorId : ""].filter(Boolean).join(" ") || undefined;

  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={draft ?? value}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        onChange={(e) => {
          const nextDraft = e.target.value;
          const next = parseToolNumber(nextDraft, min, max);
          setDraft(nextDraft);
          if (next.state === "valid") onChange(next.value);
        }}
        onBlur={() => {
          if (parsed.state === "valid") setDraft(null);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setDraft(null);
            event.currentTarget.blur();
          }
        }}
        className="min-h-11 min-w-0 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-hidden focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
      />
      {hint && (
        <span id={hintId} className="text-xs font-normal text-muted-foreground">
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} role="alert" className="text-xs font-normal text-destructive">
          {error} The result below still uses the last valid value.
        </span>
      )}
    </label>
  );
}
