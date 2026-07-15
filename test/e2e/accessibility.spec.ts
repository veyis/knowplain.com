import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const primaryRoutes = [
  { name: "homepage", path: "/" },
  { name: "checkup", path: "/checkup" },
  { name: "search results", path: "/search?q=retirement" },
  { name: "article", path: "/topics/retirement/how-much-is-enough" },
  { name: "calculator", path: "/tools/am-i-on-track" },
  { name: "RMD planner", path: "/tools/rmd-planner" },
  { name: "Social Security comparison", path: "/tools/social-security-break-even" },
  { name: "ACA scenario map", path: "/tools/aca-bridge" },
  { name: "Roth conversion calendar", path: "/tools/roth-vs-traditional" },
  { name: "income bridge planner", path: "/tools/income-bridge-60-64" },
  { name: "withdrawal simulator", path: "/tools/withdrawal-simulator" },
  { name: "community guidelines", path: "/forum/guidelines" },
  { name: "late-starter paths", path: "/late-starters" },
] as const;

for (const theme of ["light", "dark"] as const) {
  for (const route of primaryRoutes) {
    test(`${route.name} in ${theme} mode has no serious or critical automated accessibility violations`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme });
      await page.goto(route.path);
      await page.waitForLoadState("networkidle");

      const scan = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      const blocking = scan.violations.filter(
        (violation) => violation.impact === "serious" || violation.impact === "critical",
      );

      expect(
        blocking,
        blocking
          .map(
            (violation) =>
              `${violation.id}: ${violation.help}\n${violation.nodes
                .map((node) => `  ${node.target.join(" ")}: ${node.failureSummary || ""}`)
                .join("\n")}`,
          )
          .join("\n\n"),
      ).toEqual([]);
    });
  }
}
