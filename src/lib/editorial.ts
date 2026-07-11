export type EditorialPerson = {
  slug: string;
  name: string;
  role: string;
  bio: string;
  credentials?: string[];
  disclosures?: string[];
  sameAs?: string[];
};

export const editorialPeople: Record<string, EditorialPerson> = {
  "know-plain-editorial": {
    slug: "know-plain-editorial",
    name: "Know Plain Editorial",
    role: "Editorial team",
    bio: "Know Plain Editorial turns retirement, money psychology, and decision-tool research into plain-language educational guides. The team prioritizes primary sources, visible assumptions, and clear limits on what educational content can and cannot answer.",
    disclosures: [
      "Know Plain may earn affiliate revenue from some tool links.",
      "Articles are educational only and are not individualized financial, tax, legal, or medical advice.",
    ],
    sameAs: ["https://www.youtube.com/@explainstudio9"],
  },
  "retirement-review-board": {
    slug: "retirement-review-board",
    name: "Know Plain Retirement Review Board",
    role: "Editorial review",
    bio: "The review board checks retirement articles for source quality, dated assumptions, and plain-language clarity. Reviewer coverage is strongest on pages involving Social Security, Medicare, IRS limits, withdrawals, and tax-sensitive decisions.",
    disclosures: [
      "Review means factual and editorial review, not a fiduciary recommendation.",
    ],
  },
};

export function getEditorialPerson(slug?: string) {
  if (!slug) return editorialPeople["know-plain-editorial"];
  return isEditorialPersonSlug(slug) ? editorialPeople[slug] : editorialPeople["know-plain-editorial"];
}

export function getReviewer(slug?: string) {
  if (!slug) return editorialPeople["retirement-review-board"];
  return isEditorialPersonSlug(slug) ? editorialPeople[slug] : editorialPeople["retirement-review-board"];
}

export const defaultArticleAuthor = "know-plain-editorial";
export const defaultArticleReviewer = "retirement-review-board";

export type EditorialPersonSlug = keyof typeof editorialPeople;

export function isEditorialPersonSlug(slug: string): slug is EditorialPersonSlug {
  return slug in editorialPeople;
}
