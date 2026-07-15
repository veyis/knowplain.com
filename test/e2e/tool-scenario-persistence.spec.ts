import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/tools/aca-bridge");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
});

test("ACA scenario saves, restores, and deletes only in local browser storage", async ({ page }) => {
  const magi = page.getByLabel("Projected annual ACA MAGI");
  await magi.fill("70000");
  await page.getByRole("button", { name: "Save on this device" }).click();
  await expect(page.getByText(/Saved on this device/)).toBeVisible();

  const urlAfterSave = page.url();
  expect(new URL(urlAfterSave).search).toBe("");
  const savedKey = "knowplain.tool-scenario.v1.aca-bridge";
  await expect.poll(() => page.evaluate((key) => window.localStorage.getItem(key), savedKey)).not.toBeNull();

  await magi.fill("50000");
  await page.getByRole("button", { name: "Restore saved" }).click();
  await expect(magi).toHaveValue("70000");

  await page.reload();
  await expect(page.getByRole("button", { name: "Restore saved" })).toBeVisible();
  await page.getByRole("button", { name: "Delete saved" }).click();
  await expect(page.getByRole("button", { name: "Restore saved" })).toBeHidden();
  await expect.poll(() => page.evaluate((key) => window.localStorage.getItem(key), savedKey)).toBeNull();
});
