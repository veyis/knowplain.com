export type ArticleSource = {
  title: string;
  publisher: string;
  url: string;
  accessed?: string;
  note?: string;
};

export function SourceList({ sources }: { sources?: readonly ArticleSource[] }) {
  if (!sources?.length) return null;

  return (
    <section className="mt-8 rounded-xl border border-border bg-card p-4">
      <h2 className="mb-3 text-base font-semibold tracking-tight">Sources and notes</h2>
      <ol className="grid gap-3 text-sm text-muted-foreground">
        {sources.map((source) => (
          <li key={source.url} className="grid gap-0.5">
            <a
              href={source.url}
              rel="noopener noreferrer"
              className="font-medium text-foreground underline underline-offset-2 hover:opacity-80"
            >
              {source.title}
            </a>
            <span>
              {source.publisher}
              {source.accessed ? ` · Accessed ${source.accessed}` : ""}
            </span>
            {source.note && <span>{source.note}</span>}
          </li>
        ))}
      </ol>
    </section>
  );
}

