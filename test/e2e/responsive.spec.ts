import { expect, test, type Page } from "@playwright/test";

const routes = ["/", "/checkup", "/tools/am-i-on-track", "/tools/withdrawal-simulator"] as const;

async function expectNoPageOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    offenders: Array.from(document.querySelectorAll<HTMLElement>("body *"))
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.right > window.innerWidth + 1 || rect.left < -1;
      })
      .slice(0, 8)
      .map((element) => ({
        tag: element.tagName,
        className: element.className,
        text: element.textContent?.trim().slice(0, 80),
        rect: element.getBoundingClientRect().toJSON(),
      })),
  }));
  expect(dimensions.scrollWidth, JSON.stringify(dimensions.offenders, null, 2)).toBeLessThanOrEqual(
    dimensions.clientWidth,
  );
  await expect(page.locator("main")).toBeVisible();
}

for (const path of routes) {
  test(`${path} remains usable at 320px`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(path);
    await expectNoPageOverflow(page);
  });

  test(`${path} reflows at a 200%-zoom-equivalent width`, async ({ page }) => {
    // At 200% browser zoom a 1280px display exposes roughly 640 CSS pixels to layout.
    await page.setViewportSize({ width: 640, height: 800 });
    await page.goto(path);
    await expectNoPageOverflow(page);
  });

  test(`${path} tolerates a 200% default text size`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(path);
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    await expectNoPageOverflow(page);
  });
}
