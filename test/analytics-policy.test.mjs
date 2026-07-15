import { test } from "node:test";
import assert from "node:assert/strict";
import { sanitizeAnalyticsEvent } from "../src/lib/analytics-policy.ts";

test("analytics rejects unknown events", () => {
  assert.equal(sanitizeAnalyticsEvent("User financial profile"), null);
});

test("analytics drops arbitrary and sensitive properties", () => {
  assert.deepEqual(
    sanitizeAnalyticsEvent("Checkup Viewed", {
      retirementSavings: 750000,
      email: "person@example.com",
      query: "I am 61 with cancer and $750k",
    }),
    { name: "Checkup Viewed" },
  );
});

test("analytics preserves only event-specific coarse properties", () => {
  assert.deepEqual(sanitizeAnalyticsEvent("Tool Used", { tool: "aca-bridge", balance: 500000 }), {
    name: "Tool Used",
    properties: { tool: "aca-bridge" },
  });
  assert.deepEqual(
    sanitizeAnalyticsEvent("Checkup Step Completed", { step: "Timing", age: 55 }),
    { name: "Checkup Step Completed", properties: { step: "Timing" } },
  );
  assert.deepEqual(
    sanitizeAnalyticsEvent("Checkup Completed", { category: "healthcare", annualSpending: 85000 }),
    { name: "Checkup Completed", properties: { category: "healthcare" } },
  );
  assert.deepEqual(
    sanitizeAnalyticsEvent("Recommended Action Opened", { category: "household-85000" }),
    { name: "Recommended Action Opened" },
  );
  assert.deepEqual(
    sanitizeAnalyticsEvent("Tool Result Viewed", { tool: "rmd-planner", balance: 900000 }),
    { name: "Tool Result Viewed", properties: { tool: "rmd-planner" } },
  );
});

test("zero-result analytics accepts a coarse category but drops raw query text", () => {
  assert.deepEqual(
    sanitizeAnalyticsEvent("Search Zero Results", {
      category: "healthcare",
      query: "retire at 62 with 430000 and cancer",
    }),
    { name: "Search Zero Results", properties: { category: "healthcare" } },
  );
  assert.deepEqual(
    sanitizeAnalyticsEvent("Search Zero Results", { category: "retire-at-62" }),
    { name: "Search Zero Results" },
  );
});

test("operational error telemetry keeps only coarse classes and drops sensitive context", () => {
  assert.deepEqual(
    sanitizeAnalyticsEvent("Application Error Shown", {
      surface: "route",
      code: "render_error",
      message: "Failed for person@example.com with balance $750,000",
      stack: "https://knowplain.com/checkup?savings=750000",
      digest: "opaque-server-id",
    }),
    {
      name: "Application Error Shown",
      properties: { surface: "route", code: "render_error" },
    },
  );
  assert.deepEqual(
    sanitizeAnalyticsEvent("Application Error Shown", {
      surface: "checkup?savings=750000",
      code: "person@example.com",
    }),
    { name: "Application Error Shown" },
  );
});
