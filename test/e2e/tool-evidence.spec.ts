import { expect, test } from "@playwright/test";

const tools = [
  "income-bridge-60-64",
  "am-i-on-track",
  "retirement-age-tradeoff",
  "aca-bridge",
  "roth-vs-traditional",
  "debt-vs-investing",
  "social-security-break-even",
  "sequence-risk",
  "inflation-spending",
  "catch-up-contributions",
  "rmd-planner",
] as const;

test.describe("calculator evidence traceability", () => {
  test.skip(({ isMobile }) => isMobile, "Evidence destinations are identical across viewports.");

  test("every calculator renders links to anchored source or methodology records", async ({ page }) => {
    for (const slug of tools) {
      await page.goto(`/tools/${slug}`);
      const evidence = page.getByRole("region", { name: "Numbers behind this result" });
      await expect(evidence).toBeVisible();
      const links = evidence.getByRole("link");
      expect(await links.count()).toBeGreaterThan(0);

      for (let index = 0; index < await links.count(); index += 1) {
        const href = await links.nth(index).getAttribute("href");
        expect(href).toMatch(/^\/(?:sources|methodology)#[a-z0-9-]+$/);
      }
    }
  });

  test("every distinct evidence fragment resolves to a rendered section", async ({ page }) => {
    const destinations = [
      "/sources#aca-cliff",
      "/sources#medicare",
      "/sources#withdrawal-rates",
      "/sources#aca-premium-credits",
      "/sources#aca-age-rating",
      "/sources#federal-income-tax",
      "/sources#contribution-limits",
      "/sources#social-security",
      "/sources#rmd-start-age",
      "/sources#rmd-calculation",
      "/methodology#excluded-factors",
      "/methodology#units-and-time-value",
      "/methodology#projection-timing",
      "/methodology#sensitivity-and-uncertainty",
    ] as const;

    for (const destination of destinations) {
      const id = destination.split("#")[1];
      const pathname = destination.split("#")[0];
      await page.goto(`${pathname}?evidence=${id}#${id}`);
      await expect(page.locator(`#${id}`)).toBeVisible();
      await expect.poll(() => page.evaluate(() => window.location.hash)).toBe(`#${id}`);
    }
  });

  test("high-risk calculators render uncertainty, omissions, and an external verification action", async ({ page }) => {
    const highRiskTools = [
      "income-bridge-60-64",
      "aca-bridge",
      "roth-vs-traditional",
      "social-security-break-even",
      "catch-up-contributions",
      "rmd-planner",
    ] as const;

    for (const slug of highRiskTools) {
      await page.goto(`/tools/${slug}`);
      const disclosure = page.getByRole("complementary", { name: "What this result cannot decide for you" });
      await expect(disclosure).toBeVisible();
      await expect(disclosure.getByRole("heading", { name: "Important factors not modeled" })).toBeVisible();
      await expect(disclosure.getByRole("listitem")).toHaveCount(3);
      await expect(disclosure.getByRole("link")).toHaveAttribute("href", /^https:\/\//);
    }
  });
});
