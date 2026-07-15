import { test } from "node:test";
import assert from "node:assert/strict";
import { incomeBridgeLedger } from "../src/lib/income-bridge.ts";

test("income bridge keeps spendable cash separate from ACA MAGI", () => {
  const result = incomeBridgeLedger({
    spending: 85_000,
    socialSecurityAndPension: 28_000,
    taxableAccountWithdrawal: 32_000,
    realizedGains: 8_000,
    traditionalWithdrawal: 10_000,
    rothWithdrawal: 15_000,
    rothConversion: 12_000,
    otherTaxableIncome: 0,
  });
  assert.equal(result.cashAvailable, 85_000);
  assert.equal(result.acaMagi, 58_000);
  assert.equal(result.cashGap, 0);
  assert.equal(result.cashSurplus, 0);
});

test("conversion raises MAGI without filling a spending gap", () => {
  const result = incomeBridgeLedger({ spending: 50_000, socialSecurityAndPension: 0, taxableAccountWithdrawal: 0, realizedGains: 20_000, traditionalWithdrawal: 0, rothWithdrawal: 0, rothConversion: 40_000, otherTaxableIncome: 0 });
  assert.equal(result.cashAvailable, 0);
  assert.equal(result.acaMagi, 40_000);
  assert.equal(result.cashGap, 50_000);
});

test("realized gains cannot exceed the taxable-account cash withdrawal", () => {
  const result = incomeBridgeLedger({ spending: 0, socialSecurityAndPension: 0, taxableAccountWithdrawal: 5_000, realizedGains: 50_000, traditionalWithdrawal: 0, rothWithdrawal: 0, rothConversion: 0, otherTaxableIncome: 0 });
  assert.equal(result.acaMagi, 5_000);
});
