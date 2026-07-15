import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { highRiskToolDisclosures, nextToolFor, toolEvidence, toolPages, toolRecommendations } from "../src/lib/tools.ts";

const sourcePage = readFileSync(fileURLToPath(new URL("../src/app/sources/page.tsx", import.meta.url)), "utf8");
const methodologyPage = readFileSync(fileURLToPath(new URL("../src/app/methodology/page.tsx", import.meta.url)), "utf8");

test("every registered calculator has exactly one valid cross-tool recommendation", () => {
  const slugs = Object.keys(toolPages);
  assert.deepEqual(Object.keys(toolRecommendations).sort(), [...slugs].sort());

  for (const slug of slugs) {
    const next = nextToolFor(slug);
    assert.ok(next.slug in toolPages, `${slug} must point to a registered tool`);
    assert.notEqual(next.slug, slug, `${slug} must not recommend itself`);
    assert.equal(next.href, `/tools/${next.slug}`);
    assert.equal(next.title, toolPages[next.slug].title);
    assert.ok(next.reason.length >= 40, `${slug} needs a decision-specific reason`);
  }
});

test("recommendation rules do not form dead ends", () => {
  for (const slug of Object.keys(toolPages)) {
    const first = nextToolFor(slug);
    assert.ok(nextToolFor(first.slug), `${first.slug} must itself have a next step`);
  }
});

test("every calculator links its important numbers to exact public evidence anchors", () => {
  const slugs = Object.keys(toolPages);
  assert.deepEqual(Object.keys(toolEvidence).sort(), [...slugs].sort());

  for (const slug of slugs) {
    assert.ok(toolEvidence[slug].length >= 1, `${slug} needs at least one evidence record`);
    for (const evidence of toolEvidence[slug]) {
      assert.match(evidence.href, /^\/(?:sources|methodology)#[a-z0-9-]+$/);
      assert.ok(evidence.label.length >= 10);
      const [pagePath, anchor] = evidence.href.split("#");
      const pageSource = pagePath === "/sources" ? sourcePage : methodologyPage;
      assert.ok(pageSource.includes(`"${anchor}"`), `${evidence.href} must resolve to a declared anchor`);
    }
  }
});

test("every legally sensitive calculator has a concrete uncertainty and omission disclosure", () => {
  const expected = [
    "aca-bridge",
    "catch-up-contributions",
    "income-bridge-60-64",
    "rmd-planner",
    "roth-vs-traditional",
    "social-security-break-even",
  ];
  assert.deepEqual(Object.keys(highRiskToolDisclosures).sort(), expected);

  for (const [slug, disclosure] of Object.entries(highRiskToolDisclosures)) {
    assert.ok(slug in toolPages);
    assert.ok(disclosure.uncertainty.length >= 80, `${slug}: explain why the estimate is uncertain`);
    assert.ok(disclosure.omissions.length >= 3, `${slug}: name at least three omitted factor groups`);
    assert.ok(disclosure.omissions.every((item) => item.length >= 30));
    assert.match(disclosure.verifyHref, /^https:\/\//);
    assert.ok(disclosure.verifyLabel.length >= 20);
  }
});
