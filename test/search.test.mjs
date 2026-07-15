import { test } from "node:test";
import assert from "node:assert/strict";

const { classifySearchQuery, rankSearchDocs } = await import("../src/lib/search.ts");

const docs = [
  {
    type: "tool",
    title: "Am I On Track?",
    href: "/tools/am-i-on-track",
    snippet: "Compare projected savings with a retirement target.",
    aliases: ["can i afford to retire", "how much do i need to retire"],
  },
  {
    type: "explainer",
    title: "Health care before Medicare",
    href: "/topics/retirement/health-care-before-medicare",
    snippet: "Plan an ACA coverage bridge when retiring before age 65.",
    aliases: ["health insurance before medicare", "can i stop working before medicare"],
  },
  {
    type: "tool",
    title: "ACA Bridge Before Medicare",
    href: "/tools/aca-bridge",
    snippet: "Estimate pre-Medicare Marketplace income exposure.",
    aliases: ["retire before 65", "health insurance before medicare"],
  },
  {
    type: "decision",
    title: "Claim Social Security now or later?",
    href: "/decisions/claim-social-security-now-or-later",
    snippet: "Compare early claiming with delayed benefits.",
    aliases: ["take social security at 62 or 70"],
  },
  {
    type: "tool",
    title: "Social Security Break-Even",
    href: "/tools/social-security-break-even",
    snippet: "Calculate claiming-age break-even points.",
    aliases: ["take social security at 62 or 70"],
  },
  {
    type: "explainer",
    title: "Starting retirement savings at 45",
    href: "/topics/retirement/starting-retirement-savings-at-45",
    snippet: "A late start is a planning signal, not a verdict.",
    aliases: ["behind on retirement", "no retirement savings at 45"],
    body: "Employer matching contributions should be captured before optimizing other accounts.",
  },
  {
    type: "explainer",
    title: "Retirement action paths for starting at 45, 50, or 55",
    href: "/late-starters",
    snippet: "Age-specific sequences for closing a retirement gap without false precision.",
    aliases: ["starting retirement at 50", "starting retirement at 55", "late retirement saver"],
    keywords: ["catch up behind late starter action plan"],
  },
];

const searchDocs = (query) => rankSearchDocs(docs, query);

const topHrefs = (query, count = 3) => searchDocs(query).slice(0, count).map((hit) => hit.href);

test("natural readiness questions prioritize the checkup or readiness explanation", () => {
  const hits = topHrefs("How much do I need to retire?");
  assert.ok(
    hits.includes("/tools/am-i-on-track") ||
      hits.includes("/topics/retirement/how-much-is-enough"),
    `unexpected top results: ${hits.join(", ")}`,
  );
});

test("pre-Medicare retirement questions find the coverage bridge", () => {
  const hits = topHrefs("Can I stop working before Medicare?");
  assert.ok(
    hits.includes("/tools/aca-bridge") ||
      hits.includes("/topics/retirement/health-care-before-medicare"),
    `unexpected top results: ${hits.join(", ")}`,
  );
});

test("Social Security questions return both decision and calculation help", () => {
  const hits = topHrefs("Should I take Social Security at 62 or 70?", 5);
  assert.ok(hits.includes("/decisions/claim-social-security-now-or-later"));
  assert.ok(hits.includes("/tools/social-security-break-even"));
});

test("late-starter language works without matching the exact title", () => {
  const hits = topHrefs("I am behind and have almost no retirement savings at 45");
  assert.ok(hits.includes("/topics/retirement/starting-retirement-savings-at-45"));
});

test("unknown queries return an honest empty state", () => {
  assert.deepEqual(searchDocs("marine diesel injector repair"), []);
});

test("bounded typo tolerance recovers a retirement misspelling", () => {
  const hits = topHrefs("retirment savings at 45");
  assert.ok(hits.includes("/topics/retirement/starting-retirement-savings-at-45"));
});

test("prefix matching works for meaningful partial terms", () => {
  const hits = topHrefs("medic cover");
  assert.ok(
    hits.includes("/tools/aca-bridge") ||
      hits.includes("/topics/retirement/health-care-before-medicare"),
  );
});

test("article body text is searchable at lower weight", () => {
  const hits = topHrefs("employer matching contributions");
  assert.equal(hits[0], "/topics/retirement/starting-retirement-savings-at-45");
});

test("zero-result telemetry uses only coarse categories", () => {
  assert.equal(classifySearchQuery("ACA insurance at age 62 with $430,000"), "healthcare");
  assert.equal(classifySearchQuery("a very personal unrelated sentence"), "other");
});

test("age-specific late-starter language finds the combined action path", () => {
  const results = searchDocs("starting retirement at 55");
  assert.equal(results[0]?.href, "/late-starters");
});
