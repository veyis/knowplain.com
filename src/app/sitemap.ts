import type { MetadataRoute } from "next";
import { articles } from "@/lib/content";
import { decisions } from "@/lib/decisions";
import { editorialPeople } from "@/lib/editorial";
import { seededQuestions } from "@/lib/forum-seeds";
import { pillars, site } from "@/lib/site";
import { toolPages } from "@/lib/tools";
import { fallbackVideos } from "@/lib/videos";

export default function sitemap(): MetadataRoute.Sitemap {
  // Indexable routes only. /search is noindex, so keep it out.
  const staticRoutes = [
    "",
    "/checkup",
    "/changes/2026",
    "/decisions",
    "/late-starters",
    "/tools",
    "/watch",
    "/forum",
    "/forum/guidelines",
    "/forum/questions",
    "/about",
    "/disclosure",
    "/privacy",
    "/operations",
    "/glossary",
    "/sources",
    "/editorial-policy",
    "/corrections",
    "/methodology",
  ];
  const pillarRoutes = Object.values(pillars).map((p) => p.path);
  const toolRoutes = [
    ...Object.keys(toolPages).map((slug) => `/tools/${slug}`),
    // Hand-rolled route, not in the toolPages registry — it was live, indexable, linked
    // twice internally, and missing from the sitemap entirely.
    "/tools/withdrawal-simulator",
  ];
  const decisionRoutes = Object.keys(decisions).map((slug) => `/decisions/${slug}`);
  const questionRoutes = Object.keys(seededQuestions).map((slug) => `/forum/questions/${slug}`);
  // One URL per person, matching the role they actually hold. This used to be a cross-product
  // (2 people x 2 roles), which submitted /authors/retirement-review-board and
  // /reviewers/know-plain-editorial to Google: two orphan pages, zero inbound links, and
  // near-duplicates of the real ones — on the site's most E-E-A-T-sensitive URLs.
  const personRoutes = Object.values(editorialPeople).map((person) =>
    person.reviews ? `/reviewers/${person.slug}` : `/authors/${person.slug}`,
  );
  const videoRoutes = fallbackVideos.map((video) => `/watch/${video.id}`);

  const staticEntries = [
    ...staticRoutes,
    ...pillarRoutes,
    ...toolRoutes,
    ...decisionRoutes,
    ...questionRoutes,
    ...personRoutes,
    ...videoRoutes,
  ].map((path) => ({
    url: `${site.url}${path}`,
  }));
  const articleEntries = articles.map((a) => {
    // Tolerate non-ISO `updated` values: omit lastModified rather than emit an invalid date.
    const d = new Date(a.updated);
    return {
      url: `${site.url}/topics/${a.pillar}/${a.slug}`,
      ...(Number.isNaN(d.getTime()) ? {} : { lastModified: d }),
    };
  });

  return [...staticEntries, ...articleEntries];
}
