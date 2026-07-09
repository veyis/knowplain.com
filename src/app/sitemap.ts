import type { MetadataRoute } from "next";
import { articles } from "@/lib/content";
import { pillars, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // Indexable routes only — /forum and /search are noindex, so keep them out.
  const staticRoutes = ["", "/tools", "/watch", "/about", "/disclosure", "/privacy"];
  const pillarRoutes = Object.values(pillars).map((p) => p.path);

  const staticEntries = [...staticRoutes, ...pillarRoutes].map((path) => ({
    url: `${site.url}${path}`,
  }));
  const articleEntries = articles.map((a) => ({
    url: `${site.url}/topics/${a.pillar}/${a.slug}`,
    lastModified: new Date(a.updated),
  }));

  return [...staticEntries, ...articleEntries];
}
