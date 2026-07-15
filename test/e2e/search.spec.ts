import { expect, test } from "@playwright/test";

test("search recovers a typo, explains the match, and preserves facets", async ({ page }) => {
  await page.goto("/search?q=retirment+savings+at+45");
  await expect(page.getByRole("link", { name: /Starting retirement savings at 45/i })).toBeVisible();
  await expect(page.getByText(/Matched in/i).first()).toBeVisible();

  await page.getByRole("navigation", { name: "Filter search results" })
    .getByRole("link", { name: "Explainer" })
    .click();
  await expect(page).toHaveURL(/type=explainer/);
  await expect(page.getByRole("link", { name: /Starting retirement savings at 45/i })).toBeVisible();

  await page.getByRole("navigation", { name: "Filter search results" })
    .getByRole("link", { name: "Retirement" })
    .click();
  await expect(page).toHaveURL(/pillar=retirement/);
  await expect(page).toHaveURL(/type=explainer/);
});

test("search labels the best action and calculator for a natural question", async ({ page }) => {
  await page.goto("/search?q=how+much+do+i+need+to+retire");
  await expect(page.getByText("Best answer", { exact: true })).toBeVisible();
  await expect(page.getByText("Calculator", { exact: true }).first()).toBeVisible();
});
