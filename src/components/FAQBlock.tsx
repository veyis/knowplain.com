export type FAQItem = {
  q: string;
  a: string;
};

export function FAQBlock({ items }: { items?: FAQItem[] }) {
  if (!items?.length) return null;

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-xl font-semibold tracking-tight">FAQ</h2>
      <div className="grid gap-3">
        {items.map((item) => (
          <details key={item.q} className="rounded-xl border border-border bg-card p-4">
            <summary className="cursor-pointer font-medium tracking-tight">{item.q}</summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

