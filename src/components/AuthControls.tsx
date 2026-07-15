"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/**
 * Keeps authentication out of the public server-render path.
 *
 * Public pages render a stable signed-out control and remain eligible for static output.
 * Once hydrated, this small island discovers the current session and updates in place. No
 * article, calculator, or landing page needs to call cookies() just to draw its header.
 */
export function AuthControls() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  useEffect(() => {
    if (!configured) return;

    let active = true;
    const refreshStatus = () => {
      void fetch("/api/auth-status", { credentials: "same-origin", cache: "no-store" })
        .then((response) => response.ok ? response.json() as Promise<{ authenticated?: boolean }> : null)
        .then((data) => {
          if (active) setAuthenticated(Boolean(data?.authenticated));
        })
        .catch(() => {
          if (active) setAuthenticated(false);
        });
    };
    refreshStatus();
    const onVisible = () => {
      if (document.visibilityState === "visible") refreshStatus();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      active = false;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [configured]);

  async function signOut() {
    if (!configured) return;
    const response = await fetch("/api/auth-status", { method: "DELETE", credentials: "same-origin" });
    if (!response.ok) return;
    setAuthenticated(false);
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="flex min-w-0 items-center justify-end sm:min-w-[8.5rem]">
      {authenticated ? (
        <>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/profile">Profile</Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="hidden text-muted-foreground sm:inline-flex"
            onClick={signOut}
          >
            Sign out
          </Button>
        </>
      ) : (
        <Button variant="ghost" size="sm" asChild>
          <Link href="/login">Sign in</Link>
        </Button>
      )}
    </div>
  );
}
