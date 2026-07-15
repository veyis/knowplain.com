import { test } from "node:test";
import assert from "node:assert/strict";
import { parseToolNumber, toolNumberError } from "../src/lib/tool-input.ts";

test("calculator input keeps empty distinct from a real zero", () => {
  assert.deepEqual(parseToolNumber("", 0, 100), { state: "empty" });
  assert.deepEqual(parseToolNumber("   ", 0, 100), { state: "empty" });
  assert.deepEqual(parseToolNumber("0", 0, 100), { state: "valid", value: 0 });
});

test("calculator input rejects non-finite and out-of-bound values", () => {
  assert.deepEqual(parseToolNumber("1e309", 0, 100), { state: "non-finite" });
  assert.deepEqual(parseToolNumber("-0.01", 0, 100), { state: "underflow" });
  assert.deepEqual(parseToolNumber("100.01", 0, 100), { state: "overflow" });
});

test("calculator input accepts exact boundaries and finite decimals", () => {
  assert.deepEqual(parseToolNumber("-20", -20, 20), { state: "valid", value: -20 });
  assert.deepEqual(parseToolNumber("20", -20, 20), { state: "valid", value: 20 });
  assert.deepEqual(parseToolNumber("3.75", -20, 20), { state: "valid", value: 3.75 });
});

test("calculator validation errors tell people how to recover", () => {
  assert.match(toolNumberError({ state: "empty" }, 0, 100), /Enter a value/);
  assert.match(toolNumberError({ state: "non-finite" }, 0, 100), /finite number/);
  assert.match(toolNumberError({ state: "underflow" }, 10, 100), /10 or more/);
  assert.match(toolNumberError({ state: "overflow" }, 0, 100), /100 or less/);
});
