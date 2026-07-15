import { expect, test } from "@playwright/test";

const nestedRoutes = [
  ["/tools/am-i-on-track", "Am I On Track?"],
  ["/tools/withdrawal-simulator", "Withdrawal Simulator"],
  ["/topics/retirement/how-much-is-enough", "How much is enough to retire?"],
  ["/decisions/retire-now-or-wait", "Retire now or wait?"],
  ["/watch/retirement-playbook", "Complete Retirement Playbook"],
  ["/forum/questions/retire-before-medicare", "Can I retire before Medicare if I need ACA coverage?"],
  ["/forum/guidelines", "Guidelines"],
] as const;

test.describe("nested-page orientation", () => {
  test.skip(({ isMobile }) => isMobile, "Breadcrumb semantics are viewport-independent.");

  for (const [path, currentLabel] of nestedRoutes) {
    test(`${path} exposes a semantic breadcrumb with a current page`, async ({ page }) => {
      await page.goto(path);
      const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
      await expect(breadcrumb).toHaveCount(1);
      await expect(breadcrumb.getByRole("list")).toBeVisible();
      await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText(currentLabel);
      await expect(breadcrumb.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    });
  }
});
