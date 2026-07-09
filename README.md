# Know Plain (`knowplain.com`)

Canonical app location: **`~/Desktop/knowplain`**

Next.js 15 + Tailwind + TypeScript. Supabase-ready for auth/forum.

## Quick start

```bash
cd ~/Desktop/knowplain
cp .env.example .env.local
npm install
npm run dev
# http://localhost:3000
```

## Routes

| Path | Role |
|------|------|
| `/` | Search-first home |
| `/topics/[pillar]` | Pillar hubs |
| `/topics/[pillar]/[slug]` | Explainers |
| `/tools` | Roadmap + affiliates |
| `/watch` | Video + chapters |
| `/forum` | Phase 2 preview |
| `/search` | Demo search (noindex) |
| `/about` | Entity home |

## Folders

| Path | What |
|------|------|
| `src/` | Next.js app |
| `legacy-static/` | Previous static funnel (roadmap calculator, packs) |
| `docs/seo/` | 90-day calendar + schema checklist |
| `docs/samples/` | A/B HTML samples |
| `docs/static-v2-shell/` | Earlier static shell prototype |

## Deploy

Vercel should build from this repo root (`next build`). Keep `legacy-static/` out of the Next output.
