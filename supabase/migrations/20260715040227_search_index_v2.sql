alter table public.knowplain_search_index
  add column if not exists aliases text[] not null default '{}',
  add column if not exists keywords text[] not null default '{}',
  add column if not exists body text not null default '';

alter table public.knowplain_search_index drop column if exists fts;
alter table public.knowplain_search_index
  add column fts tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(array_to_string(aliases, ' '), '')), 'A') ||
    setweight(to_tsvector('english', coalesce(array_to_string(keywords, ' '), '')), 'B') ||
    setweight(to_tsvector('english', coalesce(snippet, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(body, '')), 'D')
  ) stored;

create index if not exists knowplain_search_index_fts_idx
  on public.knowplain_search_index using gin (fts);
create index if not exists knowplain_search_index_type_pillar_idx
  on public.knowplain_search_index (type, pillar);

create or replace function public.knowplain_search(
  search_query text,
  result_limit integer default 30
)
returns table (
  id text,
  type text,
  title text,
  href text,
  snippet text,
  pillar text,
  rank real
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    document.id,
    document.type,
    document.title,
    document.href,
    document.snippet,
    document.pillar,
    ts_rank_cd(document.fts, websearch_to_tsquery('english', search_query)) as rank
  from public.knowplain_search_index as document
  where char_length(btrim(search_query)) between 1 and 200
    and document.fts @@ websearch_to_tsquery('english', search_query)
  order by rank desc, document.title asc
  limit least(greatest(result_limit, 1), 100);
$$;

revoke execute on function public.knowplain_search(text, integer) from public;
grant execute on function public.knowplain_search(text, integer) to anon, authenticated;
