export type EditorialPerson = {
  slug: string;
  name: string;
  role: string;
  bio: string;
  /**
   * schema.org node type. Both entries below are genuinely organizations — an editorial team
   * and a review board — and they are declared as such rather than dressed up as people.
   *
   * This is the site's binding E-E-A-T constraint, and it is a hiring problem, not a markup
   * problem: every top-ranking YMYL competitor puts a named human with a real credential
   * (CFP®/CFA/CPA) on the page. When there is one, add them here with `type: "Person"` and
   * populate `credentials` + `sameAs`. Do not fake it — inventing letters after a name on a
   * finance site is worse than having none.
   */
  type: "Person" | "Organization";
  /** Which pillars this person/board actually reviews. Used to refuse false attribution. */
  reviews?: string[];
  credentials?: string[];
  disclosures?: string[];
  sameAs?: string[];
};

export const editorialPeople: Record<string, EditorialPerson> = {
  "know-plain-editorial": {
    slug: "know-plain-editorial",
    name: "Know Plain Editorial",
    role: "Editorial team",
    type: "Organization",
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
    type: "Organization",
    // It reviews retirement pages. It has never reviewed a behavioural-finance article, and
    // the code used to claim otherwise — see getReviewer.
    reviews: ["retirement", "decision-tools"],
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

/**
 * The reviewer for an article — or `undefined` when nobody has actually reviewed it.
 *
 * This used to fall back to the retirement review board for ANY article with no `reviewer:`
 * in its frontmatter. None of the nine money-psychology articles declare one, so every one of
 * them rendered "Reviewed by Know Plain Retirement Review Board" and emitted it as
 * `reviewedBy` — a retirement board vouching for an article about loss aversion.
 *
 * On a YMYL site a review claim you cannot defend is worse than no claim at all. If the board
 * does not cover the pillar, we say nothing.
 */
export function getReviewer(slug: string | undefined, pillar?: string) {
  const person = slug && isEditorialPersonSlug(slug) ? editorialPeople[slug] : undefined;
  if (!person) return undefined;
  if (pillar && person.reviews && !person.reviews.includes(pillar)) return undefined;
  return person;
}

export const defaultArticleAuthor = "know-plain-editorial";
export const defaultArticleReviewer = "retirement-review-board";

export type EditorialPersonSlug = keyof typeof editorialPeople;

export function isEditorialPersonSlug(slug: string): slug is EditorialPersonSlug {
  return slug in editorialPeople;
}
