"use client";

import { useEffect } from "react";
import { trackProductEvent } from "@/lib/analytics";

export function ToolResultTracker({ tool }: { tool: string }) {
  useEffect(() => {
    trackProductEvent("Tool Result Viewed", { tool });
  }, [tool]);
  return null;
}
