import { site } from "./site";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    logo: { "@type": "ImageObject", url: `${site.url}/opengraph-image` },
    description: site.description,
    sameAs: [site.youtube],
    // The publisher-trust properties Google documents for YMYL. The pages were already
    // written and simply never declared — a free signal we were throwing away.
    publishingPrinciples: `${site.url}/editorial-policy`,
    correctionsPolicy: `${site.url}/corrections`,
    ethicsPolicy: `${site.url}/disclosure`,
    actionableFeedbackPolicy: `${site.url}/corrections`,
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

/** Publisher node, with the logo Google's Article guidance asks for. */
function publisher() {
  return {
    "@type": "Organization",
    name: site.name,
    url: site.url,
    logo: { "@type": "ImageObject", url: `${site.url}/opengraph-image` },
  };
}

/**
 * Article + WebPage as an @graph.
 *
 * `reviewedBy` and `lastReviewed` are properties of **WebPage**, not Article — emitting them
 * on an Article node is invalid and parsers may drop them. They are also the machine-readable
 * E-E-A-T signals Google's Quality Rater Guidelines call out for YMYL money pages, so putting
 * them on the wrong node meant doing the editorial work and discarding the signal.
 *
 * `lastReviewed` was previously never emitted at all, despite every article carrying a
 * `reviewed:` date that the page already renders visibly to readers.
 *
 * The reviewer's `@type` is threaded rather than hardcoded to Organization: today it is an
 * editorial board, and the day a named credentialed human reviews these pages the markup has
 * to be able to say Person.
 */
export function articleJsonLd(input: {
  title: string;
  description: string;
  url: string;
  image: string;
  datePublished: string;
  dateModified: string;
  lastReviewed?: string;
  author?: { name: string; url: string; type?: "Person" | "Organization" };
  reviewer?: { name: string; url: string; type?: "Person" | "Organization" };
}) {
  const webPageId = `${input.url}#webpage`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": webPageId,
        url: input.url,
        name: input.title,
        description: input.description,
        isPartOf: { "@type": "WebSite", name: site.name, url: site.url },
        ...(input.lastReviewed ? { lastReviewed: input.lastReviewed } : {}),
        ...(input.reviewer
          ? {
              reviewedBy: {
                "@type": input.reviewer.type || "Organization",
                name: input.reviewer.name,
                url: input.reviewer.url,
              },
            }
          : {}),
      },
      {
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
        publisher: publisher(),
        mainEntityOfPage: { "@id": webPageId },
        isPartOf: { "@id": webPageId },
      },
    ],
  };
}

/**
 * A plain WebPage node for calculator and decision pages.
 *
 * No rich result is expected or wanted here — SoftwareApplication needs offers.price and
 * aggregateRating, and inventing ratings for a free calculator would be a spam violation
 * (see the removal note below). But a YMYL page that outputs retirement numbers should still
 * declare who is behind it and when it was last reviewed. That costs nothing and is the
 * signal that actually matters.
 */
export function toolPageJsonLd(input: {
  title: string;
  description: string;
  url: string;
  dateModified: string;
  lastReviewed?: string;
  reviewer?: { name: string; url: string; type?: "Person" | "Organization" };
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: input.url,
    name: input.title,
    description: input.description,
    dateModified: input.dateModified,
    isPartOf: { "@type": "WebSite", name: site.name, url: site.url },
    publisher: publisher(),
    ...(input.lastReviewed ? { lastReviewed: input.lastReviewed } : {}),
    ...(input.reviewer
      ? {
          reviewedBy: {
            "@type": input.reviewer.type || "Organization",
            name: input.reviewer.name,
            url: input.reviewer.url,
          },
        }
      : {}),
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
