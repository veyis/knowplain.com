import { CHECKUP_ESTIMATED_FIELDS, type CheckupInput } from "./checkup.ts";

export const CHECKUP_STORAGE_KEY = "knowplain.retirement-checkup.v1";
export const CHECKUP_SNAPSHOTS_KEY = "knowplain.retirement-checkup.snapshots.v1";

type StoredCheckup = {
  version: 1;
  savedAt: string;
  input: CheckupInput;
};

export type CheckupSnapshot = {
  id: string;
  name: string;
  createdAt: string;
  input: CheckupInput;
};

const numericBounds: Record<
  Exclude<keyof CheckupInput, "retireBefore65" | "partTimePossible" | "spendingFlexibility" | "estimatedFields">,
  [number, number]
> = {
  age: [18, 90],
  targetRetirementAge: [40, 90],
  retirementSavings: [0, 50_000_000],
  annualContribution: [0, 500_000],
  annualSpending: [0, 2_000_000],
  socialSecurityAnnual: [0, 200_000],
  pensionAnnual: [0, 500_000],
  debtPaymentsAnnual: [0, 500_000],
};

export function isCheckupInput(value: unknown): value is CheckupInput {
  if (!value || typeof value !== "object") return false;
  const input = value as Record<string, unknown>;
  for (const [key, [min, max]] of Object.entries(numericBounds)) {
    const number = input[key];
    if (typeof number !== "number" || !Number.isFinite(number) || number < min || number > max) {
      return false;
    }
  }
  return (
    typeof input.retireBefore65 === "boolean" &&
    typeof input.partTimePossible === "boolean" &&
    ["low", "medium", "high"].includes(String(input.spendingFlexibility)) &&
    (input.estimatedFields === undefined ||
      (Array.isArray(input.estimatedFields) &&
        input.estimatedFields.length <= CHECKUP_ESTIMATED_FIELDS.length &&
        new Set(input.estimatedFields).size === input.estimatedFields.length &&
        input.estimatedFields.every((field) =>
          CHECKUP_ESTIMATED_FIELDS.includes(field as (typeof CHECKUP_ESTIMATED_FIELDS)[number]),
        )))
  );
}

export function serializeCheckupDraft(input: CheckupInput, now = new Date()): string {
  const stored: StoredCheckup = { version: 1, savedAt: now.toISOString(), input };
  return JSON.stringify(stored);
}

export function parseCheckupDraft(raw: string | null): StoredCheckup | null {
  if (!raw) return null;
  try {
    const stored = JSON.parse(raw) as Partial<StoredCheckup>;
    if (stored.version !== 1 || typeof stored.savedAt !== "string" || !isCheckupInput(stored.input)) {
      return null;
    }
    if (!Number.isFinite(Date.parse(stored.savedAt))) return null;
    return stored as StoredCheckup;
  } catch {
    return null;
  }
}

function isSnapshot(value: unknown): value is CheckupSnapshot {
  if (!value || typeof value !== "object") return false;
  const snapshot = value as Partial<CheckupSnapshot>;
  return (
    typeof snapshot.id === "string" &&
    /^[a-zA-Z0-9-]{1,80}$/.test(snapshot.id) &&
    typeof snapshot.name === "string" &&
    snapshot.name.trim().length >= 1 &&
    snapshot.name.trim().length <= 48 &&
    typeof snapshot.createdAt === "string" &&
    Number.isFinite(Date.parse(snapshot.createdAt)) &&
    isCheckupInput(snapshot.input)
  );
}

export function parseCheckupSnapshots(raw: string | null): CheckupSnapshot[] {
  if (!raw) return [];
  try {
    const stored = JSON.parse(raw) as { version?: unknown; snapshots?: unknown };
    if (stored.version !== 1 || !Array.isArray(stored.snapshots)) return [];
    return stored.snapshots.filter(isSnapshot).slice(0, 10);
  } catch {
    return [];
  }
}

export function serializeCheckupSnapshots(snapshots: CheckupSnapshot[]): string {
  return JSON.stringify({ version: 1, snapshots: snapshots.filter(isSnapshot).slice(0, 10) });
}

export function createCheckupSnapshot(
  id: string,
  name: string,
  input: CheckupInput,
  now = new Date(),
): CheckupSnapshot | null {
  const snapshot = { id, name: name.trim(), createdAt: now.toISOString(), input };
  return isSnapshot(snapshot) ? snapshot : null;
}
