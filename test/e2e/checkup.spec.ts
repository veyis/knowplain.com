import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/checkup");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
});

test("guided checkup persists privately and recommends the dominant next action", async ({ page }) => {
  await expect(page.getByText("Your result is waiting")).toBeVisible();
  await page.getByLabel("Current age").fill("55");
  await page.getByLabel("Target retirement age").fill("62");
  await expect(page.getByText(/creates a bridge before Medicare/i)).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByRole("heading", { name: "Savings and spending" })).toBeFocused();
  await page.getByLabel("Retirement savings").fill("2000000");
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByRole("button", { name: "See my result" }).click();
  await expect(page.getByRole("heading", { name: "Your plain result" })).toBeFocused();
  await expect(page.getByRole("heading", { name: "Your next plain step" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Plan the bridge to Medicare/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Read: Health care before Medicare/i })).toBeVisible();

  await page.getByLabel("Snapshot name").fill("ACA bridge baseline");
  await expect(page.getByText(/explicitly uploads this named scenario/i)).toBeVisible();
  await expect(page.getByText(/until you delete it from your profile/i)).toBeVisible();
  await expect(page.getByRole("button", { name: "Save this scenario to my account" })).toBeVisible();
  await page.getByRole("button", { name: "Save snapshot" }).click();
  const savedSnapshot = page.getByRole("button", { name: /^ACA bridge baseline Saved/i });
  await expect(savedSnapshot).toBeVisible();
  await page.getByRole("button", { name: "Spend 5% less" }).click();
  await expect(page.getByText("Target midpoint change")).toBeVisible();
  await expect(page.getByRole("button", { name: "Reset scenarios" })).toBeVisible();
  await savedSnapshot.click();
  await expect(page.getByRole("button", { name: "Reset scenarios" })).toBeHidden();

  await expect.poll(async () =>
    page.evaluate(() => window.localStorage.getItem("knowplain.retirement-checkup.v1")),
  ).not.toBeNull();
  await expect.poll(async () =>
    page.evaluate(() => window.localStorage.getItem("knowplain.retirement-checkup.snapshots.v1")),
  ).not.toBeNull();

  await page.reload();
  await expect(page.getByLabel("Current age")).toHaveValue("55");
});

test("mobile checkup has no page-level horizontal overflow", async ({ page }) => {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();
});

test("checkup blocks contradictory timing with a plain error", async ({ page }) => {
  await page.getByLabel("Current age").fill("70");
  await page.getByLabel("Target retirement age").fill("65");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.locator("#checkup-step-error")).toHaveText(
    "Target retirement age must be your current age or later.",
  );
  await expect(page.getByRole("heading", { name: "Timing" })).toBeVisible();
});

test("unknown values stay labeled as estimates through the result and local draft", async ({ page }) => {
  await page.getByRole("button", { name: "Continue" }).click();

  const spendingField = page.getByLabel("Annual retirement spending");
  const spendingGroup = spendingField.locator("..");
  await spendingGroup.getByRole("button", { name: /mark as a rough estimate/i }).click();
  await expect(spendingGroup.getByText("Rough estimate", { exact: true })).toBeVisible();
  await expect(spendingGroup).toContainText("average monthly spending × 12");

  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "See my result" }).click();
  await expect(page.getByRole("note")).toContainText("provisional result");
  await expect(page.getByRole("note")).toContainText("1 input is marked as a rough estimate");

  await expect.poll(async () => {
    const raw = await page.evaluate(() => window.localStorage.getItem("knowplain.retirement-checkup.v1"));
    return raw ? JSON.parse(raw).input.estimatedFields : null;
  }).toEqual(["annualSpending"]);
});
