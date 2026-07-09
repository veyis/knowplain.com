"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

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
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  if (variant === "hero") {
    return (
      <form
        onSubmit={onSubmit}
        className={`flex w-full max-w-[580px] items-center gap-2.5 rounded-full border border-line bg-white px-4 py-3.5 shadow-soft ${className}`}
      >
        <SearchIcon />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          type="search"
          placeholder="Ask anything…"
          aria-label="Ask anything"
          className="min-w-0 flex-1 bg-transparent text-[1.05rem] outline-hidden placeholder:text-[#a3a3a3]"
        />
        <button type="submit" className="rounded-full bg-ink px-4 py-1.5 text-sm font-medium text-white">
          Search
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={`flex max-w-[560px] flex-1 items-center gap-2.5 rounded-full border border-line bg-canvas px-3.5 py-2 focus-within:border-ink focus-within:bg-white ${className}`}
    >
      <SearchIcon />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        type="search"
        name="q"
        placeholder="Search explainers, videos, tools…"
        aria-label="Search Know Plain"
        className="min-w-0 flex-1 bg-transparent text-sm outline-hidden placeholder:text-[#a3a3a3]"
      />
    </form>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 opacity-40">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
