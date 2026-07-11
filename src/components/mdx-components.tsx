import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { fact } from "@/lib/facts-display";

/** Styles MDX article bodies to match the site's typography. */
export const mdxComponents = {
  /**
   * `<Fact id="swr.morningstar" />` — the ONLY way an article may state a 2026 number.
   * Resolves from facts-2026.ts, so prose cannot drift from what the calculators compute.
   */
  Fact: ({ id }: { id: string }) => <>{fact(id)}</>,

  // GFM tables. Every top-ranking finance page has one, and table-shaped answers are what
  // Google lifts for featured snippets. Wrapped so wide tables scroll instead of blowing
  // out the page on mobile.
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse text-left text-[0.9rem]" {...props} />
    </div>
  ),
  thead: (props: ComponentPropsWithoutRef<"thead">) => (
    <thead className="border-b-2 border-ink" {...props} />
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th className="px-3 py-2 font-semibold text-ink" {...props} />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td className="border-b border-border px-3 py-2 text-foreground/80" {...props} />
  ),

  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2 className="mb-3 mt-8 text-xl font-semibold tracking-tight" {...props} />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="mb-2 mt-6 text-lg font-semibold tracking-tight" {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p className="mb-4 leading-relaxed text-foreground/80" {...props} />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul className="mb-4 ml-5 list-disc space-y-1.5 text-foreground/80" {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol className="mb-4 ml-5 list-decimal space-y-1.5 text-foreground/80" {...props} />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => (
    <li className="leading-relaxed" {...props} />
  ),
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold text-ink" {...props} />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="my-5 border-l-[3px] border-ink bg-card px-4 py-3 text-[0.95rem]"
      {...props}
    />
  ),
  a: ({ href = "", ...props }: ComponentPropsWithoutRef<"a">) => {
    const cls = "text-brand underline underline-offset-2 hover:opacity-80";
    return href.startsWith("/") ? (
      <Link href={href} className={cls} {...props} />
    ) : (
      <a href={href} className={cls} rel="noopener noreferrer" {...props} />
    );
  },
};
