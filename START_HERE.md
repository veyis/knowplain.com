# Know Plain — start here

Independent project folder. Open this directory in Cursor and continue from here.

## Run

```bash
cd ~/Desktop/knowplain
cp .env.example .env.local   # if needed
npm install
npm run dev
# http://localhost:3000
```

## What’s inside

| Path | Purpose |
|------|---------|
| `src/` | Next.js 15 + Tailwind app (production code) |
| `legacy-static/` | Old static funnel (roadmap calculator, packs) |
| `docs/seo/` | 90-day SEO calendar + schema checklist |
| `docs/samples/` | A/B HTML design samples |
| `docs/static-v2-shell/` | Earlier static product-shell prototype |
| `README.md` | Stack + routes |

## Stack

Next.js · Tailwind · TypeScript · Supabase-ready (env vars in `.env.example`)

## Live site note

`knowplain.com` may still be on the old static Vercel deploy until you cut over this Next app.

## Next steps (when you resume)

1. Review UI at localhost:3000  
2. Deploy Vercel from this folder  
3. Write R1–R4 from `docs/seo/90-day-calendar.md`  
4. Phase 2: search (Typesense/Postgres) + Supabase auth/forum  

Git remote (if still linked): `veyis/knowplain.com`
