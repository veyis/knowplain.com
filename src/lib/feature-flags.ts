export type FeatureFlagKey = "localToolScenarios" | "checkupEstimateLabels";

export function publicFlag(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined || value === "") return defaultValue;
  if (["1", "true", "on", "yes"].includes(value.toLowerCase())) return true;
  if (["0", "false", "off", "no"].includes(value.toLowerCase())) return false;
  return defaultValue;
}

export const featureFlags: Record<FeatureFlagKey, boolean> = {
  localToolScenarios: publicFlag(process.env.NEXT_PUBLIC_KNOWPLAIN_LOCAL_TOOL_SCENARIOS, true),
  checkupEstimateLabels: publicFlag(process.env.NEXT_PUBLIC_KNOWPLAIN_CHECKUP_ESTIMATE_LABELS, true),
};

export const rolloutRegistry = {
  localToolScenarios: {
    env: "NEXT_PUBLIC_KNOWPLAIN_LOCAL_TOOL_SCENARIOS",
    owner: "Product and engineering",
    hypothesis: "Explicit device-only save controls reduce repeated data entry without increasing privacy confusion.",
    primaryMetric: "Result saved locally",
    guardrails: ["No values in analytics or URLs", "No rise in privacy-related corrections"],
    rollback: "Disable if save/restore errors exceed 1% or users reasonably mistake local storage for cloud backup.",
  },
  checkupEstimateLabels: {
    env: "NEXT_PUBLIC_KNOWPLAIN_CHECKUP_ESTIMATE_LABELS",
    owner: "Product and editorial",
    hypothesis: "Explicit rough-estimate labels increase completion without making provisional results look final.",
    primaryMetric: "Checkup completion",
    guardrails: ["No increase in step errors", "Provisional-result warning remains visible"],
    rollback: "Disable if completion falls materially or usability review finds the labels create more confusion than honesty.",
  },
} as const satisfies Record<FeatureFlagKey, {
  env: string;
  owner: string;
  hypothesis: string;
  primaryMetric: string;
  guardrails: readonly string[];
  rollback: string;
}>;
