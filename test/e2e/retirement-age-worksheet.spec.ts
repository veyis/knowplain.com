import { expect, test } from "@playwright/test";

test("retirement-age worksheet records local reasoning and has a print layout", async ({ page }) => {
  await page.goto("/tools/retirement-age-tradeoff");
  const worksheet = page.getByRole("region", { name: "Write down why this age works—not just what it produces." });
  await expect(worksheet).toBeVisible();

  await worksheet.getByLabel("Age I am currently testing").selectOption("67");
  await expect(worksheet.getByText(/testing retirement at 67/)).toBeVisible();
  await worksheet.getByRole("checkbox").first().check();
  const notes = worksheet.getByLabel(/What would make me move/);
  await notes.fill("A change in health coverage or caregiving responsibilities.");

  await page.emulateMedia({ media: "print" });
  await expect(worksheet).toBeVisible();
  await expect(worksheet.getByRole("button", { name: "Print worksheet" })).toBeHidden();
  await expect(notes).toHaveValue("A change in health coverage or caregiving responsibilities.");
});
