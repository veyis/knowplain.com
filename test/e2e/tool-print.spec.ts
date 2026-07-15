import { expect, test } from "@playwright/test";

const toolPaths = [
  "/tools/income-bridge-60-64",
  "/tools/am-i-on-track",
  "/tools/retirement-age-tradeoff",
  "/tools/aca-bridge",
  "/tools/roth-vs-traditional",
  "/tools/debt-vs-investing",
  "/tools/social-security-break-even",
  "/tools/sequence-risk",
  "/tools/inflation-spending",
  "/tools/catch-up-contributions",
  "/tools/rmd-planner",
  "/tools/withdrawal-simulator",
] as const;

test.describe("calculator print summaries", () => {
  test.skip(({ isMobile }) => isMobile, "Print layout is verified once in desktop Chromium.");

  for (const path of toolPaths) {
    test(`${path} preserves its answer and context in print media`, async ({ page }) => {
      await page.goto(path);
      await page.emulateMedia({ media: "print" });

      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator(".tool-page")).toBeVisible();
      await expect(page.locator(".calculator-inputs").first()).toBeHidden();
      await expect(page.locator("main")).not.toBeEmpty();

      const dimensions = await page.locator(".tool-page").evaluate((element) => ({
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
      }));
      expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);

      if (path !== "/tools/withdrawal-simulator") {
        await expect(page.getByRole("heading", { name: "Sources and notes" })).toBeVisible();
        await expect(page.getByText("Educational only.", { exact: false }).first()).toBeVisible();
      }
    });
  }
});
