"use client";

import { useEffect } from "react";
import { trackProductEvent } from "@/lib/analytics";
import type { SearchQueryCategory } from "@/lib/search";

export function SearchInsights({
  hasQuery,
  resultCount,
  zeroResultCategory,
}: {
  hasQuery: boolean;
  resultCount: number;
  zeroResultCategory: SearchQueryCategory;
}) {
  useEffect(() => {
    if (hasQuery && resultCount === 0) {
      // Never send the query: a person may type ages, balances, health context, or fears.
      trackProductEvent("Search Zero Results", { category: zeroResultCategory });
    }
  }, [hasQuery, resultCount, zeroResultCategory]);

  return null;
}
