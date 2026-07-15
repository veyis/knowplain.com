export const TOOL_SCENARIO_PREFIX = "knowplain.tool-scenario.v1.";

export type StoredToolScenario<T> = {
  version: 1;
  savedAt: string;
  scenario: T;
};

const finiteBetween = (value: unknown, min: number, max: number) =>
  typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;

const exactKeys = (value: Record<string, unknown>, keys: readonly string[]) =>
  Object.keys(value).length === keys.length && keys.every((key) => key in value);

export type IncomeBridgeScenario = {
  age: number;
  household: number;
  filing: "single" | "mfj";
  spending: number;
  reliableIncome: number;
  taxableWithdrawal: number;
  realizedGains: number;
  traditionalWithdrawal: number;
  rothWithdrawal: number;
  conversion: number;
  otherIncome: number;
};

const incomeBridgeKeys = [
  "age", "household", "filing", "spending", "reliableIncome", "taxableWithdrawal",
  "realizedGains", "traditionalWithdrawal", "rothWithdrawal", "conversion", "otherIncome",
] as const;

export function isIncomeBridgeScenario(value: unknown): value is IncomeBridgeScenario {
  if (!value || typeof value !== "object") return false;
  const scenario = value as Record<string, unknown>;
  return (
    exactKeys(scenario, incomeBridgeKeys) &&
    finiteBetween(scenario.age, 60, 64) &&
    finiteBetween(scenario.household, 1, 20) &&
    (scenario.filing === "single" || scenario.filing === "mfj") &&
    finiteBetween(scenario.spending, 0, 2_000_000) &&
    finiteBetween(scenario.reliableIncome, 0, 500_000) &&
    finiteBetween(scenario.taxableWithdrawal, 0, 2_000_000) &&
    finiteBetween(scenario.realizedGains, 0, Number(scenario.taxableWithdrawal)) &&
    finiteBetween(scenario.traditionalWithdrawal, 0, 2_000_000) &&
    finiteBetween(scenario.rothWithdrawal, 0, 2_000_000) &&
    finiteBetween(scenario.conversion, 0, 2_000_000) &&
    finiteBetween(scenario.otherIncome, 0, 2_000_000)
  );
}

export type AcaBridgeScenario = {
  age: number;
  retirementAge: number;
  household: number;
  magi: number;
  spouseCovered: boolean;
  spouseAge: number;
};

const acaBridgeKeys = ["age", "retirementAge", "household", "magi", "spouseCovered", "spouseAge"] as const;

export function isAcaBridgeScenario(value: unknown): value is AcaBridgeScenario {
  if (!value || typeof value !== "object") return false;
  const scenario = value as Record<string, unknown>;
  return (
    exactKeys(scenario, acaBridgeKeys) &&
    finiteBetween(scenario.age, 18, 64) &&
    finiteBetween(scenario.retirementAge, 18, 70) &&
    finiteBetween(scenario.household, 1, 20) &&
    finiteBetween(scenario.magi, 0, 5_000_000) &&
    typeof scenario.spouseCovered === "boolean" &&
    finiteBetween(scenario.spouseAge, 18, 64)
  );
}

export function serializeToolScenario<T>(scenario: T, now = new Date()): string {
  return JSON.stringify({ version: 1, savedAt: now.toISOString(), scenario });
}

export function parseToolScenario<T>(
  raw: string | null,
  validate: (value: unknown) => value is T,
): StoredToolScenario<T> | null {
  if (!raw) return null;
  try {
    const stored = JSON.parse(raw) as Partial<StoredToolScenario<unknown>>;
    if (
      stored.version !== 1 ||
      typeof stored.savedAt !== "string" ||
      !Number.isFinite(Date.parse(stored.savedAt)) ||
      !validate(stored.scenario)
    ) return null;
    return stored as StoredToolScenario<T>;
  } catch {
    return null;
  }
}
