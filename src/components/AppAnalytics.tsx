"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { BeforeSend as AnalyticsBeforeSend } from "@vercel/analytics/next";

function globalPrivacyControlEnabled() {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.globalPrivacyControl === true;
}

const suppressForGpc: AnalyticsBeforeSend = (event) => {
  return globalPrivacyControlEnabled() ? null : event;
};

const suppressVitalsForGpc = (event: { type: "vital"; url: string; route?: string }) => {
  return globalPrivacyControlEnabled() ? null : event;
};

export function AppAnalytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(!globalPrivacyControlEnabled());
  }, []);

  if (!enabled) return null;

  return (
    <>
      <Analytics beforeSend={suppressForGpc} />
      <SpeedInsights beforeSend={suppressVitalsForGpc} />
    </>
  );
}
