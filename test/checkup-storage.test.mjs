import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createCheckupSnapshot,
  parseCheckupDraft,
  parseCheckupSnapshots,
  serializeCheckupDraft,
  serializeCheckupSnapshots,
} from "../src/lib/checkup-storage.ts";

const input = {
  age: 52,
  targetRetirementAge: 67,
  retirementSavings: 325000,
  annualContribution: 24000,
  annualSpending: 78000,
  socialSecurityAnnual: 32000,
  pensionAnnual: 0,
  debtPaymentsAnnual: 6000,
  retireBefore65: false,
  partTimePossible: true,
  spendingFlexibility: "medium",
};

test("valid checkup drafts round-trip with a version and timestamp", () => {
  const now = new Date("2026-07-14T20:00:00.000Z");
  const parsed = parseCheckupDraft(serializeCheckupDraft(input, now));
  assert.deepEqual(parsed, { version: 1, savedAt: now.toISOString(), input });
});

test("corrupt, incompatible, and out-of-range drafts are rejected", () => {
  assert.equal(parseCheckupDraft("not json"), null);
  assert.equal(parseCheckupDraft(JSON.stringify({ version: 2, savedAt: new Date().toISOString(), input })), null);
  assert.equal(
    parseCheckupDraft(
      JSON.stringify({
        version: 1,
        savedAt: new Date().toISOString(),
        input: { ...input, retirementSavings: -1 },
      }),
    ),
    null,
  );
});

test("drafts never contain an email address", () => {
  const raw = serializeCheckupDraft(input);
  assert.doesNotMatch(raw, /email|@/i);
});

test("named snapshots are bounded, validated, and remain local-input records", () => {
  const now = new Date("2026-07-14T21:00:00.000Z");
  const snapshot = createCheckupSnapshot("scenario-1", "Retire at 65", input, now);
  assert.ok(snapshot);
  assert.deepEqual(parseCheckupSnapshots(serializeCheckupSnapshots([snapshot])), [snapshot]);
  assert.equal(createCheckupSnapshot("bad id!", "Scenario", input), null);
  assert.equal(createCheckupSnapshot("scenario-2", "", input), null);
  assert.equal(parseCheckupSnapshots("not-json").length, 0);

  const many = Array.from({ length: 12 }, (_, index) =>
    createCheckupSnapshot(`scenario-${index}`, `Scenario ${index}`, input, now),
  ).filter(Boolean);
  assert.equal(parseCheckupSnapshots(serializeCheckupSnapshots(many)).length, 10);
});

test("rough-estimate provenance persists, while unknown or duplicate field names are rejected", () => {
  const estimated = { ...input, estimatedFields: ["annualSpending", "socialSecurityAnnual"] };
  assert.deepEqual(parseCheckupDraft(serializeCheckupDraft(estimated))?.input, estimated);

  const envelope = (estimatedFields) =>
    JSON.stringify({
      version: 1,
      savedAt: "2026-07-14T20:00:00.000Z",
      input: { ...input, estimatedFields },
    });
  assert.equal(parseCheckupDraft(envelope(["annualSpending", "madeUpField"])), null);
  assert.equal(parseCheckupDraft(envelope(["annualSpending", "annualSpending"])), null);
});
