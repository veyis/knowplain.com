import { test } from "node:test";
import assert from "node:assert/strict";
import {
  FACT_SOURCES,
  MEDICARE_2026,
  SENIOR_DEDUCTION,
  acaSubsidyCliffMagi,
  acaSubsidyStatus,
  crossesIrmaaTier1,
  seniorDeduction2026,
} from "../src/lib/facts-2026.ts";

test("the annual fact ledger has current, auditable source metadata", () => {
  const sources = Object.entries(FACT_SOURCES);
  assert.ok(sources.length > 0, "the fact ledger must not be empty");

  for (const [key, source] of sources) {
    assert.ok(source.title.trim(), `${key}: title is required`);
    assert.ok(source.publisher.trim(), `${key}: publisher is required`);
    assert.match(source.url, /^https:\/\//, `${key}: source must use HTTPS`);
    assert.match(source.verified, /^2026-\d{2}-\d{2}$/, `${key}: re-verify for the 2026 fact year`);
    assert.equal(
      new Date(`${source.verified}T00:00:00Z`).toISOString().slice(0, 10),
      source.verified,
      `${key}: verified must be a real ISO calendar date`,
    );

    if ("volatile" in source && source.volatile) {
      assert.ok("note" in source && source.note.trim(), `${key}: volatile facts need a warning note`);
    }
  }
});

test("ACA cliff changes exactly one dollar above the statutory line", () => {
  for (const householdSize of [1, 2]) {
    const cliff = acaSubsidyCliffMagi(householdSize);
    const atLine = acaSubsidyStatus(cliff, householdSize);
    const oneDollarOver = acaSubsidyStatus(cliff + 1, householdSize);

    assert.equal(atLine.overCliff, false, `household ${householdSize}: exactly 400% FPL stays eligible`);
    assert.equal(atLine.headroomToCliff, 0);
    assert.equal(oneDollarOver.overCliff, true, `household ${householdSize}: $1 over loses eligibility`);
    assert.equal(oneDollarOver.headroomToCliff, -1);
  }
});

test("IRMAA begins exactly one dollar above each first-tier threshold", () => {
  for (const filing of ["single", "mfj"]) {
    const threshold =
      filing === "single"
        ? MEDICARE_2026.irmaaFirstTierSingle
        : MEDICARE_2026.irmaaFirstTierJoint;

    assert.equal(crossesIrmaaTier1(threshold, filing), false);
    assert.equal(crossesIrmaaTier1(threshold + 1, filing), true);
  }
});

test("senior deduction phase-out is exact at its start and end boundaries", () => {
  assert.equal(seniorDeduction2026(SENIOR_DEDUCTION.phaseOutStart.single, "single", 1), 6_000);
  assert.equal(seniorDeduction2026(SENIOR_DEDUCTION.phaseOutStart.single + 1, "single", 1), 6_000);
  assert.equal(seniorDeduction2026(SENIOR_DEDUCTION.phaseOutStart.single + 9, "single", 1), 5_999);
  assert.equal(seniorDeduction2026(SENIOR_DEDUCTION.fullyPhasedOut.single - 1, "single", 1), 0);
  assert.equal(seniorDeduction2026(SENIOR_DEDUCTION.fullyPhasedOut.single, "single", 1), 0);

  assert.equal(seniorDeduction2026(SENIOR_DEDUCTION.phaseOutStart.mfj, "mfj", 2), 12_000);
  assert.equal(seniorDeduction2026(SENIOR_DEDUCTION.phaseOutStart.mfj + 1, "mfj", 2), 12_000);
  assert.equal(seniorDeduction2026(SENIOR_DEDUCTION.phaseOutStart.mfj + 9, "mfj", 2), 11_999);
  assert.equal(seniorDeduction2026(SENIOR_DEDUCTION.fullyPhasedOut.mfj, "mfj", 2), 0);
});
