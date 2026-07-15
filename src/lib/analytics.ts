"use client";

import { track } from "@vercel/analytics";
import {
  sanitizeAnalyticsEvent,
  type AnalyticsEventName,
  type AnalyticsProperties,
} from "./analytics-policy";

export function isGlobalPrivacyControlEnabled() {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.globalPrivacyControl === true;
}

export function trackProductEvent(name: AnalyticsEventName, properties?: AnalyticsProperties) {
  if (isGlobalPrivacyControlEnabled()) return;
  const event = sanitizeAnalyticsEvent(name, properties);
  if (!event) return;
  track(event.name, event.properties);
}
