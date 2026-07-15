import { expect, test } from "@playwright/test";

test("calculator fields preserve the last valid result while an entry is unfinished or invalid", async ({ page }) => {
  await page.goto("/tools/am-i-on-track");

  // The accessible description intentionally expands when validation appears, so
  // anchor this locator by its stable fieldset position rather than its changing name.
  const field = page.getByRole("group", { name: "Calculator inputs" }).getByRole("spinbutton").first();
  const result = page.getByRole("region", { name: "Calculator result" });
  const originalResult = await result.innerText();

  await field.fill("");
  await expect(field).toHaveAttribute("aria-invalid", "true");
  const validationAlert = page.getByRole("alert").filter({ hasText: "last valid value" });
  await expect(validationAlert).toContainText("Enter a value");
  await expect(validationAlert).toContainText("last valid value");
  await expect.poll(() => result.innerText()).toBe(originalResult);

  await field.fill("91");
  await expect(validationAlert).toContainText("90 or less");
  await expect.poll(() => result.innerText()).toBe(originalResult);

  await field.fill("90");
  await field.blur();
  await expect(field).toHaveAttribute("aria-invalid", "false");
  await expect(validationAlert).toHaveCount(0);
});

test("calculator boundaries accept exact minimum and maximum values", async ({ page }) => {
  await page.goto("/tools/withdrawal-simulator");

  const growth = page.getByLabel("Expected growth (%)");
  await growth.fill("-20");
  await expect(growth).toHaveAttribute("aria-invalid", "false");
  await growth.fill("20");
  await expect(growth).toHaveAttribute("aria-invalid", "false");
});
