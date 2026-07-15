import type { AnalyticsEventName } from "./analytics-policy.ts";

export type FunnelStage = {
  name: "Acquisition" | "Activation" | "Value" | "Retention";
  numerator: string;
  denominator: string;
  event?: AnalyticsEventName;
  target: string;
  baseline: "pending-production-data";
};

/** Definitions consumed by the operations dashboard and mirrored in Vercel Analytics. */
export const productFunnel: readonly FunnelStage[] = [
  { name: "Acquisition", numerator: "Checkup Viewed", denominator: "Homepage pageviews", event: "Checkup Viewed", target: "20%", baseline: "pending-production-data" },
  { name: "Activation", numerator: "Checkup Completed", denominator: "Checkup Viewed", event: "Checkup Completed", target: "65%", baseline: "pending-production-data" },
  { name: "Value", numerator: "Recommended Action Opened", denominator: "Checkup Completed", event: "Recommended Action Opened", target: "35%", baseline: "pending-production-data" },
  { name: "Retention", numerator: "Result Saved Local + Checkup Result Printed + Checkup Lead Captured", denominator: "Checkup Completed", event: "Result Saved Local", target: "15%", baseline: "pending-production-data" },
] as const;

export const baselineWindow = {
  durationDays: 14,
  startsAfter: "production instrumentation deployment",
  status: "not-started" as const,
  rule: "Do not promote targets to commitments or rank popular shortcuts until the full window has real production data.",
};
