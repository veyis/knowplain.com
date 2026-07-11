import Link from "next/link";
import { pillars } from "@/lib/site";
import { cn } from "@/lib/utils";

const explore = [
  { href: "/", label: "Search home", match: "home" },
  { href: "/checkup", label: "Checkup", match: "checkup" },
  { href: "/decisions", label: "Decisions", match: "decisions" },
  { href: "/late-starters", label: "Late starters", match: "late-starters" },
  { href: "/topics/retirement", label: "Topics", match: "topics" },
  { href: "/tools", label: "Tools", match: "tools" },
  { href: "/watch", label: "Videos", match: "watch" },
  { href: "/forum", label: "Forum", match: "forum" },
] as const;

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
    <aside className="flex flex-col gap-6 border-b border-border bg-card/40 p-4 md:min-h-screen md:border-b-0 md:border-r md:p-5">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 px-2 text-[1.05rem] font-semibold tracking-tight text-foreground"
        >
          <span className="grid size-6 place-items-center rounded-md bg-primary text-[0.7rem] font-bold text-primary-foreground">
            K
          </span>
          Know Plain
        </Link>
        <nav className="flex flex-wrap gap-1.5 md:hidden">
          {explore.slice(1).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md bg-secondary px-2.5 py-1 text-xs text-secondary-foreground transition-colors hover:bg-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <nav className="hidden gap-6 md:grid">
        <div className="grid gap-0.5">
          <div className="px-2.5 py-1.5 text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
            Explore
          </div>
          {explore.map((item) => {
            const on = active === item.match || (item.match === "home" && active === "home");
            return (
              <Link key={item.href} href={item.href} className={navClass(on)}>
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="grid gap-0.5">
          <div className="px-2.5 py-1.5 text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
            Pillars
          </div>
          {(Object.keys(pillars) as Array<keyof typeof pillars>).map((id) => (
            <Link key={id} href={pillars[id].path} className={navClass(active === id)}>
              {pillars[id].title}
            </Link>
          ))}
        </div>
      </nav>

      <p className="mt-auto hidden px-2.5 text-xs leading-relaxed text-muted-foreground md:block">
        Big ideas, known plain — explainers, tools, and community for retirement and money.
      </p>
    </aside>
  );
}
