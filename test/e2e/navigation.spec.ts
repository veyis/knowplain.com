import { test, expect } from "@playwright/test";

test("navigation exposes user-centered destinations and a working skip link", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toHaveAttribute("href", "#main-content");

  const width = page.viewportSize()?.width || 1280;
  if (width < 768) {
    await page.getByText("Menu", { exact: true }).click();
  }

  const primary = page.getByRole("navigation", { name: "Primary" });
  if (width < 768) {
    await expect(primary.getByRole("link", { name: "Plan" })).toBeVisible();
    await expect(primary.getByRole("link", { name: "Calculate" })).toBeVisible();
    await expect(primary.getByRole("link", { name: "Decide" })).toBeVisible();
    await expect(primary.getByRole("link", { name: "Community" })).toBeVisible();
  } else {
    await expect(page.getByRole("link", { name: "Plan", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Calculate", exact: true })).toBeVisible();
  }

  await page.goto("/tools/am-i-on-track");
  if ((page.viewportSize()?.width || 1280) < 768) await page.getByText("Menu", { exact: true }).click();
  await expect(page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Calculate" })).toHaveAttribute("aria-current", "page");
});
