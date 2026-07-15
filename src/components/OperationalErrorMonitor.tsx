"use client";

import { useEffect, useRef } from "react";
import { trackProductEvent } from "@/lib/analytics";

/**
 * Reports only a coarse failure class. Never inspect or transmit Error.message,
 * stack, URL query strings, component props, form state, or rejection values.
 */
export function OperationalErrorMonitor() {
  const reported = useRef(new Set<string>());

  useEffect(() => {
    const reportOnce = (surface: "window" | "promise", code: "uncaught_error" | "unhandled_rejection") => {
      const key = `${surface}:${code}`;
      if (reported.current.has(key)) return;
      reported.current.add(key);
      trackProductEvent("Application Error Shown", { surface, code });
    };
    const onError = () => reportOnce("window", "uncaught_error");
    const onRejection = () => reportOnce("promise", "unhandled_rejection");
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
