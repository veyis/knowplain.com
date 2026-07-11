import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // /search is NOT disallowed here on purpose. It sets `robots: { index: false }` in its own
    // metadata, and a Disallow would stop Google crawling the page — which means it would never
    // SEE the noindex, and the URL could still surface as a bare listing. Blocking and
    // noindexing the same URL are mutually exclusive; the noindex is the one that works.
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/profile", "/login", "/auth/"] },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
