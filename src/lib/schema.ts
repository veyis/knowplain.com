import { site } from "./site";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    logo: `${site.url}/icon`,
    description: site.description,
    sameAs: [site.youtube],
  };
}

/**
 * WebSite markup is kept ONLY for Google's site-name feature. The SearchAction /
 * sitelinks-search-box it used to carry was removed by Google on 2024-11-21 and
 * no longer produces anything, so it is deliberately not emitted.
 * https://developers.google.com/search/blog/2024/10/sitelinks-search-box
 */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
  };
}

export function articleJsonLd(input: {
  title: string;
  description: string;
  url: string;
  image: string;
  datePublished: string;
  dateModified: string;
  author?: { name: string; url: string; type?: "Person" | "Organization" };
  reviewer?: { name: string; url: string };
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    image: [input.image],
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    author: {
      "@type": input.author?.type || "Organization",
      name: input.author?.name || `${site.name} Editorial`,
      url: input.author?.url || site.url,
    },
    ...(input.reviewer
      ? {
          reviewedBy: {
            "@type": "Organization",
            name: input.reviewer.name,
            url: input.reviewer.url,
          },
        }
      : {}),
    publisher: { "@type": "Organization", name: site.name, url: site.url },
    mainEntityOfPage: input.url,
  };
}

// Removed: faqJsonLd (FAQPage). Google removed the FAQ rich result on 2026-05-07 and
// deleted its documentation on 2026-06-15, so the markup produces nothing. The visible
// "Common questions" block stays — it is for readers and for LLM extraction.
//
// Removed: webApplicationJsonLd. The software-app rich result requires offers.price AND
// aggregateRating/review; a free calculator with no genuine ratings earns nothing, and
// inventing ratings to qualify would be a spam violation. Tools ship as ordinary pages.
//
// Removed: qaPageJsonLd. QAPage requires that users be able to submit answers; our
// seeded question pages are staff-written. Re-add when the moderated forum earns it.

export function profilePageJsonLd(input: {
  name: string;
  role: string;
  bio: string;
  url: string;
  sameAs?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: input.name,
      jobTitle: input.role,
      description: input.bio,
      url: input.url,
      sameAs: input.sameAs,
    },
  };
}

/**
 * VideoObject is one of the few types here that still earns a live rich result, and
 * `hasPart` Clips drive Google's "key moments". Google will not show a key moment it
 * cannot link to, so every clip carries a URL that seeks to its timestamp.
 * https://developers.google.com/search/docs/appearance/structured-data/video
 */
export function videoObjectJsonLd(input: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  embedUrl: string;
  url: string;
  duration?: string;
  clips?: { name: string; startOffset: number; endOffset?: number; url: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: input.name,
    description: input.description,
    thumbnailUrl: [input.thumbnailUrl],
    uploadDate: input.uploadDate,
    embedUrl: input.embedUrl,
    contentUrl: input.url,
    duration: input.duration,
    ...(input.clips?.length
      ? {
          hasPart: input.clips.map((clip) => ({
            "@type": "Clip",
            name: clip.name,
            startOffset: clip.startOffset,
            ...(clip.endOffset !== undefined ? { endOffset: clip.endOffset } : {}),
            url: clip.url,
          })),
        }
      : {}),
    publisher: { "@type": "Organization", name: site.name, url: site.url },
  };
}

export function itemListJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: item.url,
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
