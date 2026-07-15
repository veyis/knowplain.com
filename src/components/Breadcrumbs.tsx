import Link from "next/link";

export type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumbs({ items, className = "mb-4" }: { items: readonly BreadcrumbItem[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={`${className} text-sm text-muted-foreground`}>
      <ol className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-2">
              {index > 0 && <span aria-hidden="true">›</span>}
              {item.href && !current ? (
                <Link href={item.href} className="rounded-sm underline-offset-2 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{item.label}</Link>
              ) : (
                <span aria-current={current ? "page" : undefined} className={current ? "truncate text-foreground" : undefined}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
