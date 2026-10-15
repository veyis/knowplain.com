import { test, expect } from "@playwright/test";

/**
 * Production smoke monitor, run by Checkly (`pnpm checkly:test` / `pnpm checkly:deploy`).
 * Read-only: never submits a form, so it cannot create a lead or an account-saved scenario.
 */
test("homepage renders", async ({ page }) => {
  const res = await page.goto("/");
  expect(res?.status()).toBe(200);
  await expect(page.locator("h1").first()).toBeVisible();
});

test("checkup tool is usable after hydration", async ({ page }) => {
  const res = await page.goto("/checkup");
  expect(res?.status()).toBe(200);
  await expect(page.locator("h1").first()).toBeVisible();
  const continueButton = page.getByRole("button", { name: /Continue/ }).first();
  await expect(continueButton).toBeVisible();
  await expect(continueButton).toBeEnabled();
});

test("sitemap responds", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.status()).toBe(200);
  expect(await res.text()).toContain("<urlset");
});
