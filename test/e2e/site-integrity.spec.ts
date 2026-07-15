import { expect, test } from "@playwright/test";

test.describe("site integrity", () => {
  test.describe.configure({ mode: "serial" });
  test.skip(({ isMobile }) => isMobile, "A single crawl covers shared server-rendered metadata.");

  test("every sitemap URL resolves with complete canonical metadata", async ({ request }) => {
    const sitemapResponse = await request.get("/sitemap.xml");
    expect(sitemapResponse.ok()).toBeTruthy();

    const sitemap = await sitemapResponse.text();
    const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
    expect(urls.length).toBeGreaterThan(50);
    expect(new Set(urls).size).toBe(urls.length);

    const failures: string[] = [];
    for (const url of urls) {
      const parsedUrl = new URL(url);
      const path = `${parsedUrl.pathname}${parsedUrl.search}`;
      const response = await request.get(path);
      if (!response.ok()) {
        failures.push(`${path}: HTTP ${response.status()}`);
        continue;
      }

      const html = await response.text();
      const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
      const description = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]?.trim()
        ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)?.[1]?.trim();
      const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1]?.trim()
        ?? html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i)?.[1]?.trim();

      if (!title) failures.push(`${path}: missing title`);
      if (!description) failures.push(`${path}: missing meta description`);
      if (!canonical) failures.push(`${path}: missing canonical URL`);
    }

    expect(failures, failures.join("\n")).toEqual([]);
  });

  test("key journeys contain no broken internal links", async ({ page, request }) => {
    const routes = ["/", "/checkup", "/tools", "/topics/retirement", "/forum/guidelines"];
    const hrefs = new Set<string>();

    for (const route of routes) {
      await page.goto(route);
      for (const href of await page.locator("a[href]").evaluateAll((links) =>
        links.map((link) => (link as HTMLAnchorElement).getAttribute("href") || ""),
      )) {
        if (href.startsWith("/") && !href.startsWith("//")) hrefs.add(href.split("#")[0]);
      }
    }

    const failures: string[] = [];
    for (const href of hrefs) {
      const response = await request.get(href);
      if (!response.ok()) failures.push(`${href}: HTTP ${response.status()}`);
    }
    expect(failures, failures.join("\n")).toEqual([]);
  });
});
