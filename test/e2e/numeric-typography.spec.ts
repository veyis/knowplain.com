import { expect, test } from "@playwright/test";

test("calculator inputs, metrics, and comparison tables use tabular figures", async ({ page }) => {
  await page.goto("/tools/aca-bridge");

  const input = page.getByLabel("Projected annual ACA MAGI");
  const metric = page.getByText("400% cliff for your household").locator("..").locator("p").nth(1);
  const table = page.getByRole("table", { name: /Annual benchmark premium cost/i });

  for (const locator of [input, metric, table]) {
    await expect(locator).toBeVisible();
    const variant = await locator.evaluate((element) => getComputedStyle(element).fontVariantNumeric);
    expect(variant).toContain("tabular-nums");
  }
});
