export const analyticsEvents = [
  "Checkup Viewed",
  "Checkup Completed",
  "Checkup Edited",
  "Checkup Step Completed",
  "Checkup Draft Saved Locally",
  "Checkup Draft Cleared",
  "Checkup Result Printed",
  "Recommended Action Opened",
  "Tool Result Viewed",
  "Supporting Explainer Opened",
  "Result Saved Local",
  "Checkup Scenario Applied",
  "Checkup Scenario Reset",
  "Checkup Snapshot Saved",
  "Checkup Snapshot Loaded",
  "Checkup Snapshot Deleted",
  "Checkup Lead Captured",
  "Tool Used",
  "Simulation Save Failed",
  "Simulation Saved",
  "Search Submitted",
  "Search Zero Results",
  "Application Error Shown",
] as const;

export type AnalyticsEventName = (typeof analyticsEvents)[number];
export type AnalyticsValue = string | number | boolean | null | undefined;
export type AnalyticsProperties = Record<string, AnalyticsValue>;

const allowedSteps = new Set(["Timing", "Savings and spending", "Income and flexibility"]);
const safeSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const searchCategories = new Set(["timing", "healthcare", "social-security", "saving", "tax", "other"]);
const errorSurfaces = new Set(["route", "global", "window", "promise"]);
const errorCodes = new Set(["render_error", "uncaught_error", "unhandled_rejection"]);
const recommendationCategories = new Set(["readiness", "healthcare", "sequence", "timing"]);

/**
 * The analytics boundary is deny-by-default. Financial values, email addresses, raw search
 * queries, and arbitrary context never become telemetry merely because a caller supplied them.
 */
export function sanitizeAnalyticsEvent(
  name: string,
  properties?: AnalyticsProperties,
): { name: AnalyticsEventName; properties?: Record<string, string | boolean> } | null {
  if (!(analyticsEvents as readonly string[]).includes(name)) return null;
  const event = name as AnalyticsEventName;
  if (!properties) return { name: event };

  const safe: Record<string, string | boolean> = {};
  if (event === "Tool Used" && typeof properties.tool === "string" && safeSlug.test(properties.tool)) {
    safe.tool = properties.tool.slice(0, 64);
  }
  if (event === "Tool Result Viewed" && typeof properties.tool === "string" && safeSlug.test(properties.tool)) {
    safe.tool = properties.tool.slice(0, 64);
  }
  if (
    (event === "Checkup Completed" || event === "Recommended Action Opened") &&
    typeof properties.category === "string" &&
    recommendationCategories.has(properties.category)
  ) {
    safe.category = properties.category;
  }
  if (event === "Checkup Step Completed" && typeof properties.step === "string" && allowedSteps.has(properties.step)) {
    safe.step = properties.step;
  }
  if (event === "Checkup Lead Captured" && typeof properties.sent === "boolean") {
    safe.sent = properties.sent;
  }
  if (
    event === "Search Zero Results" &&
    typeof properties.category === "string" &&
    searchCategories.has(properties.category)
  ) {
    safe.category = properties.category;
  }
  if (event === "Application Error Shown") {
    if (typeof properties.surface === "string" && errorSurfaces.has(properties.surface)) {
      safe.surface = properties.surface;
    }
    if (typeof properties.code === "string" && errorCodes.has(properties.code)) {
      safe.code = properties.code;
    }
  }

  return Object.keys(safe).length ? { name: event, properties: safe } : { name: event };
}
