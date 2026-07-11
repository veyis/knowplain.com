"use client";

import { track } from "@vercel/analytics";

type AnalyticsValue = string | number | boolean | null | undefined;
type AnalyticsProperties = Record<string, AnalyticsValue>;

export function isGlobalPrivacyControlEnabled() {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.globalPrivacyControl === true;
}

export function trackProductEvent(name: string, properties?: AnalyticsProperties) {
  if (isGlobalPrivacyControlEnabled()) return;
  track(name, properties);
}
