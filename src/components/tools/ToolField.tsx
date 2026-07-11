"use client";

import { useId } from "react";

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
 * 2. **No bounds.** An unbounded money field is a bug, not a convenience: clearing a number
 *    input yields Number("") === 0, which is how the Social Security tool ended up rendering
 *    a 596% benefit. `min`/`max` in HTML are advisory — typing past them still reaches state
 *    — so we clamp on the way in too.
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

  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-describedby={hint ? hintId : undefined}
        onChange={(e) => {
          const n = Number(e.target.value);
          onChange(Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min);
        }}
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-hidden focus:border-foreground"
      />
      {hint && (
        <span id={hintId} className="text-xs font-normal text-muted-foreground">
          {hint}
        </span>
      )}
    </label>
  );
}
