import { expect, test } from "@playwright/test";

test("command search is keyboard operable, traps focus, and restores focus", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const trigger = page.getByRole("button", { name: "Search (⌘K)", exact: true });
  await trigger.focus();

  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Search Know Plain" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByPlaceholder("Type to search…")).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(dialog.locator(":focus")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("mobile navigation and calculator fields work without a pointer", async ({ page, isMobile }) => {
  test.skip(!isMobile, "This interaction only exists in the compact navigation.");
  await page.goto("/tools/am-i-on-track");

  const menu = page.getByText("Menu", { exact: true });
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();

  const age = page.getByRole("spinbutton", { name: "Age", exact: true });
  await age.focus();
  await page.keyboard.press("ArrowUp");
  await expect(age).toHaveValue("51");

  const result = page.getByRole("region", { name: "Calculator result" });
  await expect(result).toHaveAttribute("aria-live", "polite");
});
