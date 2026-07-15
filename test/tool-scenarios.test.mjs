import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isAcaBridgeScenario,
  isIncomeBridgeScenario,
  parseToolScenario,
  serializeToolScenario,
} from "../src/lib/tool-scenarios.ts";

const incomeBridge = {
  age: 60,
  household: 2,
  filing: "mfj",
  spending: 85_000,
  reliableIncome: 28_000,
  taxableWithdrawal: 32_000,
  realizedGains: 8_000,
  traditionalWithdrawal: 10_000,
  rothWithdrawal: 15_000,
  conversion: 12_000,
  otherIncome: 0,
};

test("income-bridge scenarios round-trip with a version and timestamp", () => {
  const now = new Date("2026-07-14T20:00:00.000Z");
  assert.deepEqual(parseToolScenario(serializeToolScenario(incomeBridge, now), isIncomeBridgeScenario), {
    version: 1,
    savedAt: now.toISOString(),
    scenario: incomeBridge,
  });
});

test("scenario validators reject extra keys, non-finite values, and inconsistent gains", () => {
  assert.equal(isIncomeBridgeScenario({ ...incomeBridge, secret: "extra" }), false);
  assert.equal(isIncomeBridgeScenario({ ...incomeBridge, spending: Infinity }), false);
  assert.equal(isIncomeBridgeScenario({ ...incomeBridge, realizedGains: 40_000 }), false);
  assert.equal(parseToolScenario("not-json", isIncomeBridgeScenario), null);
  assert.equal(
    parseToolScenario(JSON.stringify({ version: 2, savedAt: new Date().toISOString(), scenario: incomeBridge }), isIncomeBridgeScenario),
    null,
  );
});

test("ACA scenarios enforce all legal field bounds", () => {
  const scenario = {
    age: 60,
    retirementAge: 62,
    household: 2,
    magi: 65_000,
    spouseCovered: true,
    spouseAge: 58,
  };
  assert.equal(isAcaBridgeScenario(scenario), true);
  assert.equal(isAcaBridgeScenario({ ...scenario, age: 65 }), false);
  assert.equal(isAcaBridgeScenario({ ...scenario, spouseCovered: "yes" }), false);
});
