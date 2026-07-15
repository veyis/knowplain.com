"use client";

import { useEffect } from "react";
import { trackProductEvent } from "@/lib/analytics";

export default function RouteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Deliberately exclude the Error object. Messages and stacks can contain form values or URLs.
    trackProductEvent("Application Error Shown", { surface: "route", code: "render_error" });
  }, []);

  return (
    <main className="mx-auto grid min-h-[60vh] max-w-xl place-content-center gap-4 px-5 text-center">
      <p className="text-sm font-medium text-muted-foreground">Something did not load correctly</p>
      <h1 className="text-2xl font-semibold tracking-tight">Your information was not submitted.</h1>
      <p className="leading-relaxed text-muted-foreground">
        Try this page again. If the problem continues, return home and report the page—not the financial values you entered.
      </p>
      <button type="button" onClick={reset} className="mx-auto min-h-11 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        Try again
      </button>
    </main>
  );
}
