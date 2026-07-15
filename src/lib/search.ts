import type { PillarId } from "./site";

export type ContentType = "explainer" | "tool" | "video" | "thread" | "decision" | "glossary";

export type SearchDoc = {
  type: ContentType;
  title: string;
  href: string;
  snippet: string;
  pillar?: PillarId;
  aliases?: string[];
  keywords?: string[];
  body?: string;
};

export type SearchResult = SearchDoc & {
  score: number;
  matchedOn: "title" | "question" | "topic" | "description" | "body";
};

const stopWords = new Set([
  "a", "an", "and", "at", "can", "do", "does", "for", "how", "i", "in", "is", "it",
  "my", "of", "on", "should", "the", "to", "what", "when", "with",
]);

const synonymGroups = [
  ["retire", "retirement", "retiring"],
  ["healthcare", "health", "insurance", "coverage", "aca", "medicare"],
  ["enough", "ready", "track", "afford"],
  ["withdraw", "withdrawal", "spend", "spending"],
  ["claim", "take", "timing"],
  ["late", "behind", "catchup", "catch-up"],
  ["work", "working", "job"],
];

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/401\(k\)/g, "401k")
    .replace(/[^a-z0-9%]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function queryTokens(query: string) {
  const base = normalize(query).split(" ").filter((token) => token && !stopWords.has(token));
  const expanded = new Set(base);
  for (const token of base) {
    const group = synonymGroups.find((items) => items.includes(token));
    group?.forEach((item) => expanded.add(item));
  }
  return [...expanded];
}

function editDistanceAtMostOne(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 1) return false;
  if (a === b) return true;
  let edits = 0;
  for (let i = 0, j = 0; i < a.length || j < b.length;) {
    if (a[i] === b[j]) {
      i += 1;
      j += 1;
      continue;
    }
    edits += 1;
    if (edits > 1) return false;
    if (a.length > b.length) i += 1;
    else if (b.length > a.length) j += 1;
    else {
      i += 1;
      j += 1;
    }
  }
  return true;
}

function tokenMatches(text: string, token: string) {
  if (text.includes(token)) return true;
  const words = text.split(" ");
  if (token.length >= 3 && words.some((word) => word.startsWith(token))) return true;
  return token.length >= 5 && words.some((word) => editDistanceAtMostOne(word, token));
}

/** Pure deterministic ranker: explainable, testable, and safe to run locally. */
export function rankSearchDocs(docs: SearchDoc[], rawQuery: string): SearchResult[] {
  const query = normalize(rawQuery);
  if (!query) {
    return docs.map((doc) => ({ ...doc, score: 0, matchedOn: "topic" as const }));
  }
  const tokens = queryTokens(query);

  return docs
    .map((doc): SearchResult | null => {
      const title = normalize(doc.title);
      const aliases = normalize(doc.aliases?.join(" ") || "");
      const keywords = normalize(`${doc.keywords?.join(" ") || ""} ${doc.pillar || ""}`);
      const snippet = normalize(doc.snippet);
      const body = normalize(doc.body || "");
      let score = 0;

      if (title === query) score += 140;
      else if (title.includes(query)) score += 90;
      if (aliases.includes(query)) score += 100;
      if (keywords.includes(query)) score += 55;
      if (snippet.includes(query)) score += 45;
      if (body.includes(query)) score += 20;

      const fieldScores = {
        title: tokens.filter((token) => tokenMatches(title, token)).length * 18,
        question: tokens.filter((token) => tokenMatches(aliases, token)).length * 14,
        topic: tokens.filter((token) => tokenMatches(keywords, token)).length * 9,
        description: tokens.filter((token) => tokenMatches(snippet, token)).length * 6,
        body: tokens.filter((token) => tokenMatches(body, token)).length * 2,
      };
      score += Object.values(fieldScores).reduce((sum, value) => sum + value, 0);
      const matchedOn = (Object.entries(fieldScores).sort((a, b) => b[1] - a[1])[0]?.[0] ||
        "description") as SearchResult["matchedOn"];

      // Synonym expansion is intentionally broad; at least one original meaningful token
      // must exist in the document unless an exact phrase already produced a strong match.
      const originals = query.split(" ").filter((token) => !stopWords.has(token));
      const searchable = `${title} ${aliases} ${keywords} ${snippet} ${body}`;
      if (!originals.some((token) => tokenMatches(searchable, token)) && score < 90) return null;
      return score > 0 ? { ...doc, score, matchedOn } : null;
    })
    .filter((result): result is SearchResult => result !== null)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
}

export type SearchQueryCategory =
  | "timing"
  | "healthcare"
  | "social-security"
  | "saving"
  | "tax"
  | "other";

/** Coarse telemetry category only; the raw query never leaves the request/browser. */
export function classifySearchQuery(rawQuery: string): SearchQueryCategory {
  const query = normalize(rawQuery);
  if (/medicare|aca|health|insurance|coverage/.test(query)) return "healthcare";
  if (/social security|claim|benefit/.test(query)) return "social-security";
  if (/tax|roth|rmd|conversion/.test(query)) return "tax";
  if (/save|saving|401k|ira|catch up|behind/.test(query)) return "saving";
  if (/retire|retirement|age|when|work longer/.test(query)) return "timing";
  return "other";
}
