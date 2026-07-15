import { test } from "node:test";
import assert from "node:assert/strict";
import { analyticsEvents } from "../src/lib/analytics-policy.ts";
import { publicFlag, rolloutRegistry } from "../src/lib/feature-flags.ts";
import { baselineWindow, productFunnel } from "../src/lib/product-funnels.ts";

test("public feature flags have deterministic rollback parsing", () => {
  assert.equal(publicFlag(undefined, true), true);
  assert.equal(publicFlag("false", true), false);
  assert.equal(publicFlag("0", true), false);
  assert.equal(publicFlag("ON", false), true);
  assert.equal(publicFlag("unexpected", false), false);
});

test("every material feature flag has a full release and rollback contract", () => {
  for (const [key, release] of Object.entries(rolloutRegistry)) {
    assert.match(release.env, /^NEXT_PUBLIC_KNOWPLAIN_[A-Z_]+$/);
    assert.ok(release.owner.length > 5, `${key}: owner required`);
    assert.ok(release.hypothesis.length > 50, `${key}: concrete hypothesis required`);
    assert.ok(release.primaryMetric.length > 5, `${key}: primary metric required`);
    assert.ok(release.guardrails.length >= 2, `${key}: at least two guardrails required`);
    assert.ok(release.rollback.length > 50, `${key}: explicit rollback condition required`);
  }
});

test("the product dashboard defines a measurable end-to-end funnel without fake baselines", () => {
  assert.deepEqual(productFunnel.map((stage) => stage.name), ["Acquisition", "Activation", "Value", "Retention"]);
  for (const stage of productFunnel) {
    assert.ok(stage.numerator.length > 5);
    assert.ok(stage.denominator.length > 5);
    assert.equal(stage.baseline, "pending-production-data");
    if (stage.event) assert.ok(analyticsEvents.includes(stage.event));
  }
  assert.equal(baselineWindow.durationDays, 14);
  assert.equal(baselineWindow.status, "not-started");
});
