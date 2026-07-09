# MDX content pipeline — design spec

**Date:** 2026-07-09
**Status:** Approved, pending spike verification
**Goal:** Move the 8 hardcoded articles in `src/lib/content.ts` to authored MDX files, flesh each into a fuller SEO article, without breaking any consumer (sitemap, search, both `topics` routes, per-article OG images).

## Decision (evidence-backed)

A deep-research pass (25/25 claims confirmed, primary sources) drove these choices:

### Part 1 — content architecture: **Content Collections** (`@content-collections`)
- ❌ `next-mdx-remote` — **archived by HashiCorp 2026-04-09** (read-only). Rejected.
- ❌ Contentlayer — unmaintained since ~2024, App Router breakage. Rejected.
- ✅ **Content Collections** — first-party Next.js App Router adapter, actively maintained (0.15.2, Jun 2026), **Zod type-safe frontmatter validated at build**, emits static typed data consumed via normal imports. Used in production by next-forge and Dub.
- Runner-up: Velite (framework-agnostic, same build-time model). Fallback: `@next/mdx` (zero-dep, but manual frontmatter + file-trace caveats).

**Why not just `fs`-read MDX in a loader:** Vercel's Node File Trace (`@vercel/nft`) statically analyzes imports and can't reliably bundle files read via computed/`fs` paths → 404s in production. A build-time content layer sidesteps this entirely by generating static typed data imported normally. This is the decisive reason.

Sources: github.com/sdorra/content-collections, github.com/hashicorp/next-mdx-remote, nextjs.org/docs/app/guides/mdx, vercel.com/kb/guide/how-can-i-use-files-in-serverless-functions.

### Part 2 — YMYL article structure (Google primary docs)
- **Topic clusters, bidirectional hub↔spoke** internal links (hub links to spokes early; spokes link back to hub; siblings link laterally). **Depth over keyword density.**
- **E-E-A-T** (trust is paramount for YMYL): visible byline + **citations to primary sources** (SSA.gov, IRS, Trinity study, Fed data). Author-credential/reviewed-by pages are a separate follow-on track (need real people).
- **Structured data:** keep `Article` + `BreadcrumbList` + `ItemList` (already shipped). **Do NOT add FAQPage** (fully deprecated 2026-05-07) or HowTo (deprecated 2023) — no rich-result benefit. Overrides the calendar's stale "FAQPage when present" line.

Sources: developers.google.com/search/docs/fundamentals/creating-helpful-content, .../structured-data/faqpage, searchengineland.com/guide/topic-clusters.

## Architecture

**Content files:** `content/<pillar>/<slug>.mdx`. `pillar` and `slug` derived from the path. Frontmatter (Zod-validated):
```yaml
title: string
description: string
plainAnswer: string
updated: string (ISO date)
related: { href: string, label: string }[]   # optional
```

**Config:**
- `content-collections.ts` (root) — `articles` collection over `content/**/*.mdx`; Zod schema above; transform compiles MDX (`@content-collections/mdx`) and derives `slug`, `pillar`, `url`.
- `next.config.ts` — wrap export with `withContentCollections(...)` as the **last** wrapper (preserves existing rewrites + security headers).
- `tsconfig.json` — add `content-collections` path alias; include `.content-collections/generated`.
- `.gitignore` — add `.content-collections`.

**Adapter — `src/lib/content.ts`:** thin layer over generated `allArticles`, preserving the exact public API so no consumer changes:
- `articles`, `getArticle(pillar, slug)`, `getArticlesByPillar(pillar)`, `isPillarId`, `searchIndex`, `searchDocs(q)`.
- `Article` type: metadata fields (as today) + compiled `mdx` body (replaces `body: string[]`).

**Rendering — article page:** unchanged shell (h1, plain-answer callout, dates, related links from frontmatter) + `<MDXContent code={article.mdx} components={mdxComponents} />`. `mdx-components.tsx` maps `h2/h3/p/ul/ol/li/a/strong/blockquote` to current Tailwind classes so fleshed articles match today's look. No runtime `fs`.

**Unchanged consumers:** `sitemap.ts`, `search/page.tsx`, `topics/[pillar]/page.tsx`, `topics/[pillar]/[slug]/{page,opengraph-image}.tsx` — all keep importing from `@/lib/content`.

## Content work (8 articles)
Migrate the 8 existing stubs to `.mdx` as-is first (prove the pipeline), then flesh each to ~600–900 words:
- Intro that links to its hub early; 2–4 `##` sections; a "key takeaways" list.
- **Primary-source citations** (links) on every YMYL claim.
- **Bidirectional** links: to hub, ≥1 sibling spoke, and the relevant tool.
- Educational-only caveat retained; `updated` → 2026-07-09.
- No FAQPage schema.

Cluster map (existing slugs): retirement hub → `retirement-isnt-a-date`, `how-much-is-enough`, `4-percent-rule-2026`, `sequence-of-returns`; money-psychology hub → `present-bias`, `decision-freeze`, `couples-and-money`; decision-tools hub → `retirement-age-framework`.

## Testing
One `node --test` content-integrity check: every article has required frontmatter, slugs unique, pillars valid, `searchDocs` returns hits. No new test framework.

## Risks / pitfalls (from research)
- **Verify Content Collections builds on Next 16.2.10 + Turbopack + React 19.2 FIRST** (spike with 1 article). Versions release monthly. If it fails, fall back to `@next/mdx` (native, zero-dep) with `remark-frontmatter`/`gray-matter` + `outputFileTracingIncludes`.
- `withContentCollections` must be the last next.config wrapper.
- Content Collections compiles MDX itself (not via Turbopack's MDX loader), so Turbopack's remark/rehype-serialization caveat does not apply here — an advantage over `@next/mdx`.

## Out of scope (follow-on)
Author/E-E-A-T pages (Person schema, credentials, reviewed-by); authoring net-new articles (R5+); MDX-embedded interactive components.
