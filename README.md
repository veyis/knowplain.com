# Know Plain

Static funnel site for **Know Plain** (`knowplain.com`) — the consumer / email / affiliate hub for the Explain Studio YouTube channel.

| Path | Job |
|------|-----|
| `/` | Brand + route |
| `/retirement-roadmap/` | Lead magnet + calculator + downloads |
| `/tools/` | Affiliate hub (Empower first) |
| `/books/` | Amazon reading list |
| `/disclosure/` · `/privacy/` | Compliance |
| `/pack/*` | Print/PDF worksheets + CSV template |

## Stack

- Static HTML/CSS/JS (no build step)
- Hosted on **Vercel** (project: `site`)
- Domain on **Cloudflare** (DNS only → Vercel; grey-cloud proxy)

## Local preview

```bash
python3 -m http.server 8787
# open http://127.0.0.1:8787/
```

## Deploy

```bash
vercel --prod
```

Production: https://knowplain.com

## Config

Edit affiliate / newsletter URLs in `assets/config.js`.

## Brand split

| Surface | Brand |
|---------|--------|
| Website / email / affiliates | **Know Plain** |
| YouTube channel | Explain Studio (`@explainstudio9`) |

## Spoken CTA

> Free Retirement Roadmap — knowplain.com
