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

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${site.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
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

export function faqJsonLd(items?: { q: string; a: string }[]) {
  if (!items?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

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

export function webApplicationJsonLd(input: {
  name: string;
  description: string;
  url: string;
  applicationCategory?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: input.name,
    description: input.description,
    url: input.url,
    applicationCategory: input.applicationCategory || "FinanceApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@type": "Organization", name: site.name, url: site.url },
  };
}

export function videoObjectJsonLd(input: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  embedUrl: string;
  url: string;
  duration?: string;
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
    publisher: { "@type": "Organization", name: site.name, url: site.url },
  };
}

export function qaPageJsonLd(input: {
  question: string;
  url: string;
  answers: { text: string; author: string; upvotes?: number; accepted?: boolean }[];
}) {
  const acceptedAnswer = input.answers.find((answer) => answer.accepted) || input.answers[0];
  return {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: input.question,
      text: input.question,
      url: input.url,
      answerCount: input.answers.length,
      acceptedAnswer: acceptedAnswer
        ? {
            "@type": "Answer",
            text: acceptedAnswer.text,
            upvoteCount: acceptedAnswer.upvotes || 0,
            author: { "@type": "Person", name: acceptedAnswer.author },
          }
        : undefined,
      suggestedAnswer: input.answers
        .filter((answer) => answer !== acceptedAnswer)
        .map((answer) => ({
          "@type": "Answer",
          text: answer.text,
          upvoteCount: answer.upvotes || 0,
          author: { "@type": "Person", name: answer.author },
        })),
    },
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
