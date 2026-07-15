import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const primary = [
  { href: "/checkup", label: "Plan", matches: ["checkup", "late-starters"] },
  {
    href: "/topics/retirement",
    label: "Learn",
    matches: ["retirement", "money-psychology", "decision-tools", "watch"],
  },
  { href: "/tools", label: "Calculate", matches: ["tools"] },
  { href: "/decisions", label: "Decide", matches: ["decisions"] },
  { href: "/forum", label: "Community", matches: ["forum"] },
] as const;

const secondary = [
  { href: "/late-starters", label: "Late-starter path", match: "late-starters" },
  { href: "/watch", label: "Videos", match: "watch" },
  { href: "/glossary", label: "Glossary", match: "glossary" },
  { href: "/sources", label: "2026 sources", match: "sources" },
] as const;

function isPrimaryActive(item: (typeof primary)[number], active?: string) {
  return (item.matches as readonly string[]).includes(active || "");
}

function navClass(active: boolean) {
  return cn(
    "rounded-md px-2.5 py-2 text-sm transition-colors",
    active
      ? "bg-accent font-medium text-foreground"
      : "text-muted-foreground hover:bg-accent hover:text-foreground",
  );
}

export function Sidebar({ active }: { active?: string }) {
  return (
    <aside className="print-hidden flex flex-col gap-6 border-b border-border bg-card/40 p-4 md:min-h-screen md:border-b-0 md:border-r md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 px-2 text-[1.05rem] font-semibold tracking-tight text-foreground"
        >
          <span className="grid size-6 place-items-center rounded-md bg-primary text-[0.7rem] font-bold text-primary-foreground">
            K
          </span>
          Know Plain
        </Link>
        <details className="group w-full border-t border-border pt-3 md:hidden">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-md px-2.5 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Menu
            <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <nav aria-label="Primary" className="mt-2 grid gap-1 border-b border-border pb-3">
            {primary.map((item) => (
              <Link key={item.href} href={item.href} aria-current={isPrimaryActive(item, active) ? "page" : undefined} className={`${navClass(isPrimaryActive(item, active))} min-h-11`}>
                {item.label}
              </Link>
            ))}
          </nav>
          <nav aria-label="More" className="grid gap-1 pt-3">
            {secondary.map((item) => (
              <Link key={item.href} href={item.href} aria-current={active === item.match ? "page" : undefined} className={`${navClass(active === item.match)} min-h-11`}>
                {item.label}
              </Link>
            ))}
          </nav>
        </details>
      </div>

      <div className="hidden gap-6 md:grid">
        <nav aria-label="Primary" className="grid gap-0.5">
          <p className="px-2.5 py-1.5 text-xs font-medium text-muted-foreground">Start here</p>
          {primary.map((item) => (
            <Link key={item.href} href={item.href} aria-current={isPrimaryActive(item, active) ? "page" : undefined} className={navClass(isPrimaryActive(item, active))}>
              {item.label}
            </Link>
          ))}
        </nav>
        <nav aria-label="More" className="grid gap-0.5">
          <p className="px-2.5 py-1.5 text-xs font-medium text-muted-foreground">More</p>
          {secondary.map((item) => (
            <Link key={item.href} href={item.href} aria-current={active === item.match ? "page" : undefined} className={navClass(active === item.match)}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <p className="mt-auto hidden px-2.5 text-xs leading-relaxed text-muted-foreground md:block">
        Know where you stand, understand the tradeoffs, and take the next plain step.
      </p>
    </aside>
  );
}
