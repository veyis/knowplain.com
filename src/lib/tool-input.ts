export type NumericInputResult =
  | { state: "valid"; value: number }
  | { state: "empty" | "non-finite" | "underflow" | "overflow" };

/**
 * Classify calculator input without turning an empty field into a real zero.
 *
 * The browser's number input constraints are only advisory, and `Number("")` is 0.
 * Keeping this policy pure and shared makes every calculator treat unfinished,
 * non-finite, and out-of-range values the same way.
 */
export function parseToolNumber(raw: string, min: number, max: number): NumericInputResult {
  if (raw.trim() === "") return { state: "empty" };

  const value = Number(raw);
  if (!Number.isFinite(value)) return { state: "non-finite" };
  if (value < min) return { state: "underflow" };
  if (value > max) return { state: "overflow" };
  return { state: "valid", value };
}

export function toolNumberError(
  result: Exclude<NumericInputResult, { state: "valid" }>,
  min: number,
  max: number,
): string {
  switch (result.state) {
    case "empty":
      return "Enter a value, or use 0 only when none is the right answer.";
    case "non-finite":
      return "Enter a finite number.";
    case "underflow":
      return `Enter ${min.toLocaleString()} or more.`;
    case "overflow":
      return `Enter ${max.toLocaleString()} or less.`;
  }
}
