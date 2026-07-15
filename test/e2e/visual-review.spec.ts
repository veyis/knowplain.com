import { expect, test } from "@playwright/test";

const reviewRoutes = [
  { name: "homepage", path: "/" },
  { name: "checkup", path: "/checkup" },
  { name: "aca-calculator", path: "/tools/aca-bridge" },
  { name: "retirement-article", path: "/topics/retirement/how-much-is-enough" },
  { name: "operations", path: "/operations" },
] as const;

test.describe("visual review captures", () => {
  test.skip(Boolean(process.env.CI), "Manual visual-review artifacts are generated locally, not used as pixel gates in CI.");

  for (const theme of ["light", "dark"] as const) {
    for (const route of reviewRoutes) {
      test(`${route.name} — ${theme}`, async ({ page }, testInfo) => {
        await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
        await page.goto(route.path);
        await page.waitForLoadState("networkidle");
        await expect(page.locator("main")).toBeVisible();

        const screenshot = await page.screenshot({
          fullPage: true,
          animations: "disabled",
          caret: "hide",
          scale: "css",
        });
        await testInfo.attach(`${route.name}-${theme}-${testInfo.project.name}.png`, {
          body: screenshot,
          contentType: "image/png",
        });
      });
    }
  }
});
