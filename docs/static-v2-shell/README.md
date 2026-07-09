# Know Plain v2 — Product shell (Option B)

Static product-shell preview implementing the Sample B architecture.

## Preview

```bash
cd exports/knowplain-v2
python3 -m http.server 8790
# open http://127.0.0.1:8790/
```

## Surfaces

| Path | Role |
|------|------|
| `/` | Search-first home + pillar cards |
| `/topics/*` | Pillar hubs + spoke stubs |
| `/tools/` | Roadmap + affiliates |
| `/watch/` | Video + chapters |
| `/forum/` | Phase-2 preview |
| `/search/` | Demo search (noindex) |
| `/about/` | Entity home |

## Next (production)

1. Superseded — production is the Next.js app in `src/` at the repo root (`~/Desktop/knowplain`)
2. Keep `legacy-static` funnel (`/retirement-roadmap/`) until tools are migrated
3. Execute `exports/knowplain-seo/90-day-calendar.md`
