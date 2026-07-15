import type { SearchDoc } from "./search";

/**
 * Deliberately lean browser-side command data.
 *
 * Full search includes article bodies and transcripts and stays on the server. Importing that
 * corpus into CommandMenu would ship every article to every visitor merely to open ⌘K.
 */
export const commandDocs: SearchDoc[] = [
  { type: "tool", title: "Age 60–64 Income Bridge Planner", href: "/tools/income-bridge-60-64", snippet: "Coordinate spending cash, ACA MAGI, Roth conversions, and Medicare lookback years." },
  { type: "explainer", title: "What changed in 2026", href: "/changes/2026", snippet: "Annual retirement-rules changelog with primary sources." },
  { type: "explainer", title: "How much is enough to retire?", href: "/topics/retirement/how-much-is-enough", snippet: "Turn retirement spending and reliable income into a planning range." },
  { type: "explainer", title: "Health care before Medicare", href: "/topics/retirement/health-care-before-medicare", snippet: "Plan the coverage and income bridge before age 65." },
  { type: "explainer", title: "When to claim Social Security", href: "/topics/retirement/social-security-timing", snippet: "Compare early, full-age, and delayed claiming." },
  { type: "explainer", title: "Starting retirement savings at 45", href: "/topics/retirement/starting-retirement-savings-at-45", snippet: "Prioritize the levers that still matter after a late start." },
  { type: "tool", title: "Am I On Track?", href: "/tools/am-i-on-track", snippet: "Compare projected savings with a plain retirement target." },
  { type: "tool", title: "ACA Bridge Before Medicare", href: "/tools/aca-bridge", snippet: "Estimate income exposure around the ACA subsidy cliff." },
  { type: "tool", title: "Social Security Break-Even", href: "/tools/social-security-break-even", snippet: "Compare claiming-age break-even points." },
  { type: "tool", title: "Sequence Risk", href: "/tools/sequence-risk", snippet: "See how the order of returns changes withdrawal outcomes." },
];
