"use client";

import { useEffect } from "react";
import { trackProductEvent } from "@/lib/analytics";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    trackProductEvent("Application Error Shown", { surface: "global", code: "render_error" });
  }, []);

  return (
    <html lang="en">
      <body>
        <main style={{ margin: "15vh auto", maxWidth: 560, padding: 24, fontFamily: "system-ui", textAlign: "center" }}>
          <h1>Know Plain could not load this page.</h1>
          <p>Your information was not submitted. You can safely try again.</p>
          <button type="button" onClick={reset} style={{ minHeight: 44, padding: "8px 16px" }}>Try again</button>
        </main>
      </body>
    </html>
  );
}
