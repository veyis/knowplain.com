import type { MetadataRoute } from "next";
import { articles } from "@/lib/content";
import { pillars, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/tools", "/watch", "/about", "/disclosure", "/privacy", "/forum"];
  const pillarRoutes = Object.values(pillars).map((p) => p.path);
  const articleRoutes = articles.map((a) => `/topics/${a.pillar}/${a.slug}`);

  return [...staticRoutes, ...pillarRoutes, ...articleRoutes].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(),
  }));
}
