"use client";

import { useSyncExternalStore } from "react";
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

// GPC is fixed for the life of the page, so there is nothing to subscribe to.
// useSyncExternalStore (rather than setState in an effect) reads it without a cascading
// render, and the server snapshot keeps SSR and hydration agreed: render nothing on the
// server, then decide on the client once navigator is actually available.
const neverChanges = () => () => {};
const isEnabledOnClient = () => !globalPrivacyControlEnabled();
const isEnabledOnServer = () => false;

export function AppAnalytics() {
  const enabled = useSyncExternalStore(neverChanges, isEnabledOnClient, isEnabledOnServer);

  // Belt and braces: this gate stops the script loading at all under GPC, and the
  // beforeSend handlers above stop any payload leaving even if it somehow does.
  if (!enabled) return null;

  return (
    <>
      <Analytics beforeSend={suppressForGpc} />
      <SpeedInsights beforeSend={suppressVitalsForGpc} />
    </>
  );
}
