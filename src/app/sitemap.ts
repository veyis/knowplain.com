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
    "/decisions",
    "/late-starters",
    "/tools",
    "/watch",
    "/forum",
    "/forum/questions",
    "/about",
    "/disclosure",
    "/privacy",
    "/glossary",
    "/editorial-policy",
    "/corrections",
    "/methodology",
  ];
  const pillarRoutes = Object.values(pillars).map((p) => p.path);
  const toolRoutes = Object.keys(toolPages).map((slug) => `/tools/${slug}`);
  const decisionRoutes = Object.keys(decisions).map((slug) => `/decisions/${slug}`);
  const questionRoutes = Object.keys(seededQuestions).map((slug) => `/forum/questions/${slug}`);
  const authorRoutes = Object.keys(editorialPeople).flatMap((slug) => [
    `/authors/${slug}`,
    `/reviewers/${slug}`,
  ]);
  const videoRoutes = fallbackVideos.map((video) => `/watch/${video.id}`);

  const staticEntries = [
    ...staticRoutes,
    ...pillarRoutes,
    ...toolRoutes,
    ...decisionRoutes,
    ...questionRoutes,
    ...authorRoutes,
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
