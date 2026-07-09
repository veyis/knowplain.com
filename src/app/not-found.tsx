import Link from "next/link";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { SearchForm } from "@/components/SearchForm";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <AppShell active="home">
      <div className="grid justify-items-center gap-4 py-16 text-center">
        <div className="text-sm font-semibold uppercase tracking-wider text-muted">404</div>
        <h1 className="text-[1.6rem] font-semibold tracking-tight">We couldn’t find that page</h1>
        <p className="max-w-[44ch] text-muted">
          The link may be old or moved. Try a search, or jump back to the topic hubs.
        </p>
        <div className="mt-2 w-full max-w-md">
          <SearchForm variant="hero" />
        </div>
        <Link href="/" className="kp-btn">
          Back home
        </Link>
      </div>
    </AppShell>
  );
}
