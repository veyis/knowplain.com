import Link from "next/link";
import { pillars } from "@/lib/site";

const explore = [
  { href: "/", label: "Search home", match: "home" },
  { href: "/topics/retirement", label: "Topics", match: "topics" },
  { href: "/tools", label: "Tools", match: "tools" },
  { href: "/watch", label: "Videos", match: "watch" },
  { href: "/forum", label: "Forum", match: "forum" },
] as const;

export function Sidebar({ active }: { active?: string }) {
  return (
    <aside className="flex flex-col gap-6 border-b border-line bg-surface p-4 md:min-h-screen md:border-b-0 md:border-r md:p-5">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="px-2 text-[1.15rem] font-bold tracking-tight text-ink">
          Know Plain
        </Link>
        <nav className="flex flex-wrap gap-2 md:hidden">
          {explore.slice(1).map((item) => (
            <Link key={item.href} href={item.href} className="rounded-lg bg-chip px-2.5 py-1 text-xs text-ink">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <nav className="hidden gap-6 md:grid">
        <div className="grid gap-0.5">
          <div className="px-2 py-1.5 text-[0.68rem] font-semibold uppercase tracking-wider text-muted">
            Explore
          </div>
          {explore.map((item) => {
            const on =
              active === item.match ||
              (item.match === "home" && active === "home");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-2.5 py-2 text-sm ${
                  on ? "bg-accent-soft font-semibold text-accent" : "text-ink hover:bg-chip"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="grid gap-0.5">
          <div className="px-2 py-1.5 text-[0.68rem] font-semibold uppercase tracking-wider text-muted">
            Pillars
          </div>
          {(Object.keys(pillars) as Array<keyof typeof pillars>).map((id) => (
            <Link
              key={id}
              href={pillars[id].path}
              className={`rounded-lg px-2.5 py-2 text-sm ${
                active === id ? "bg-accent-soft font-semibold text-accent" : "text-ink hover:bg-chip"
              }`}
            >
              {pillars[id].title}
            </Link>
          ))}
        </div>
      </nav>

      <p className="mt-auto hidden px-2 text-xs leading-relaxed text-muted md:block">
        Demo shell · Sanity models + Typesense would power these surfaces in production.
      </p>
    </aside>
  );
}
