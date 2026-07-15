import { expect, test, type Page } from "@playwright/test";

const auditRoutes = [
  "/",
  "/checkup",
  "/search?q=retirement",
  "/topics/retirement/how-much-is-enough",
  "/decisions/retire-now-or-wait",
  "/late-starters",
  "/tools/am-i-on-track",
  "/tools/aca-bridge",
  "/tools/roth-vs-traditional",
  "/tools/rmd-planner",
  "/tools/income-bridge-60-64",
  "/forum/guidelines",
  "/operations",
] as const;

async function visibleInteractiveElements(page: Page) {
  return page.locator('a[href], button:not([aria-label="Open Next.js Dev Tools"]), input, select, textarea, summary').filter({ visible: true });
}

test.describe("primary-journey accessibility audit", () => {
  test.skip(({ isMobile }) => isMobile, "Document semantics are viewport-independent.");

  for (const route of auditRoutes) {
    test(`${route} has a coherent document and form structure`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator("main#main-content")).toHaveCount(1);
      await expect(page.locator("h1")).toHaveCount(1);

      const structure = await page.evaluate(() => {
        const headings = [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")]
          .filter((heading) => {
            const style = getComputedStyle(heading);
            return style.display !== "none" && style.visibility !== "hidden";
          })
          .map((heading) => Number(heading.tagName.slice(1)));
        const skippedHeading = headings.some((level, index) => index > 0 && level > headings[index - 1] + 1);
        const unnamedTables = [...document.querySelectorAll("table")].filter(
          (table) => !table.querySelector("caption") && !table.getAttribute("aria-label") && !table.getAttribute("aria-labelledby"),
        ).length;
        const dataTablesWithoutHeaders = [...document.querySelectorAll("table")].filter(
          (table) => !table.querySelector("th"),
        ).length;
        return { skippedHeading, unnamedTables, dataTablesWithoutHeaders };
      });

      expect(structure.skippedHeading).toBe(false);
      expect(structure.unnamedTables).toBe(0);
      expect(structure.dataTablesWithoutHeaders).toBe(0);
    });
  }

  test("every primary interactive control shows a visible keyboard focus indicator", async ({ page }) => {
    for (const route of ["/", "/checkup", "/tools/am-i-on-track", "/forum/guidelines"] as const) {
      await page.goto(route);
      const controls = await visibleInteractiveElements(page);
      const count = await controls.count();
      for (let index = 0; index < count; index += 1) {
        const control = controls.nth(index);
        if (await control.isDisabled()) continue;
        await control.focus();
        const focus = await control.evaluate((element) => {
          const candidates = [element, element.parentElement, element.parentElement?.parentElement].filter(Boolean) as Element[];
          return {
            focused: document.activeElement === element,
            identity: `${element.tagName.toLowerCase()} ${element.getAttribute("aria-label") ?? element.textContent?.trim().slice(0, 50) ?? ""}`,
            visible: candidates.some((candidate) => {
              const style = getComputedStyle(candidate);
              return (style.outlineStyle !== "none" && Number.parseFloat(style.outlineWidth) > 0) || style.boxShadow !== "none";
            }),
          };
        });
        expect(focus.focused, `${route} control ${index} (${focus.identity}) must receive focus`).toBe(true);
        expect(focus.visible, `${route} control ${index} (${focus.identity}) must expose outline or focus ring`).toBe(true);
      }
    }
  });

  test("checkup validation errors are named, announced, and connected to the field", async ({ page }) => {
    await page.goto("/checkup");
    await page.getByRole("spinbutton", { name: "Current age" }).fill("70");
    await page.getByRole("spinbutton", { name: "Target retirement age" }).fill("60");
    await page.getByRole("button", { name: /Continue/ }).click();
    const error = page.locator("#checkup-step-error");
    await expect(error).toContainText("current age or later");
    await expect(page.getByRole("spinbutton", { name: "Target retirement age" })).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByRole("spinbutton", { name: "Target retirement age" })).toHaveAttribute("aria-describedby", "checkup-step-error");
  });

  test("keyboard-only journey reaches a checkup result and its recommended calculator", async ({ page }) => {
    await page.goto("/");
    const start = page.getByRole("link", { name: /Run the Know Plain Retirement Checkup/ });
    await start.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/checkup$/);

    for (let step = 0; step < 3; step += 1) {
      const next = page.getByRole("button", { name: step === 2 ? /See my result/ : /Continue/ });
      await next.focus();
      await page.keyboard.press("Enter");
    }
    await expect(page.getByText("Plain answer")).toBeVisible();
    const recommendation = page.getByRole("heading", { name: "Your next plain step" }).locator("..").getByRole("link").first();
    await recommendation.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/tools\//);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

test.describe("mobile target-size audit", () => {
  test.skip(({ isMobile }) => !isMobile, "Target sizing is checked in the compact viewport.");

  for (const route of ["/", "/checkup", "/tools/am-i-on-track"] as const) {
    test(`${route} provides at least 24px targets for controls`, async ({ page }) => {
      await page.goto(route);
      const controls = page.locator('button, input, select, textarea, summary, a[class*="rounded"]').filter({ visible: true });
      for (let index = 0; index < await controls.count(); index += 1) {
        const control = controls.nth(index);
        if (await control.isDisabled()) continue;
        const dimensions = await control.evaluate((element) => {
          const target = element instanceof HTMLInputElement && ["checkbox", "radio"].includes(element.type)
            ? element.closest("label") ?? element
            : element;
          const rect = target.getBoundingClientRect();
          return { width: rect.width, height: rect.height };
        });
        expect(dimensions.width, `${route} control ${index} width`).toBeGreaterThanOrEqual(24);
        expect(dimensions.height, `${route} control ${index} height`).toBeGreaterThanOrEqual(24);
      }
    });
  }
});
