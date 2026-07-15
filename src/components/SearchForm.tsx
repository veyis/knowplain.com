"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trackProductEvent } from "@/lib/analytics";

type Props = {
  variant?: "hero" | "bar";
  initialQuery?: string;
  className?: string;
};

export function SearchForm({
  variant = "bar",
  initialQuery = "",
  className = "",
}: Props) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const query = q.trim() || "retirement";
    // Deliberately omit the query. Retirement searches can contain sensitive facts.
    trackProductEvent("Search Submitted");
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  if (variant === "hero") {
    return (
      <form
        onSubmit={onSubmit}
        className={cn(
          "flex w-full max-w-[580px] items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3 shadow-soft transition-colors focus-within:border-foreground/30 focus-within:ring-4 focus-within:ring-ring/10",
          className,
        )}
      >
        <Search className="size-[18px] shrink-0 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          type="search"
          placeholder="Ask anything…"
          aria-label="Ask anything"
          className="min-w-0 flex-1 bg-transparent text-[1.05rem] text-foreground outline-hidden placeholder:text-muted-foreground"
        />
        <Button type="submit" size="sm">
          Search
        </Button>
      </form>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "flex max-w-[560px] flex-1 items-center gap-2.5 rounded-lg border border-border bg-background px-3.5 py-2 transition-colors focus-within:border-foreground/30 focus-within:bg-card",
        className,
      )}
    >
      <Search className="size-4 shrink-0 text-muted-foreground" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        type="search"
        name="q"
        placeholder="Search explainers, videos, tools…"
        aria-label="Search Know Plain"
        className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-hidden placeholder:text-muted-foreground"
      />
    </form>
  );
}
