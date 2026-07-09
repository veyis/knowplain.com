# Know Plain — 90-day SEO calendar (Option C)

**Goal:** Brand #1 + long-tail page-1 wins. Not head-term #1 vs NerdWallet in 90 days.

**Pillars (only):** Retirement · Money psychology · Decision tools  
**Site shell:** `exports/knowplain-v2/` (Option B)

---

## Schema checklist (ship W0–2)

| Page type | Schema |
|-----------|--------|
| Home | `Organization` + `WebSite` + `SearchAction` |
| Pillar hubs | `WebPage` + `BreadcrumbList` |
| Articles | `Article` + `BreadcrumbList` + `FAQPage` (when FAQ present) |
| Tools | `SoftwareApplication` or `WebApplication` |
| Authors | `Person` |
| Forum (later) | `QAPage` / `DiscussionForumPosting` |

Also: `/search/` **noindex**; `robots.txt` disallow `/search/`; XML sitemap by type; GSC + Bing; canonicals; last-updated dates.

### E-E-A-T checklist

- [ ] `/about/` entity home (mission, scope, contact)
- [ ] Author pages with credentials
- [ ] Editorial policy page
- [ ] Visible disclosures (affiliates)
- [ ] Citations to primary sources on YMYL articles
- [ ] Consistent brand name “Know Plain” across YT / site / socials

---

## Weeks 0–2 — Foundations

| Day | Deliverable | Owner note |
|-----|-------------|------------|
| 1–2 | Deploy B shell + Organization/WebSite schema | Technical |
| 3 | GSC + Bing + analytics (search query events) | Technical |
| 4 | `/about/`, `/disclosure/`, `/privacy/`, editorial policy | Content |
| 5 | Author page(s) + Person schema | Content |
| 6–7 | Migrate live roadmap under `/tools/` or keep `/retirement-roadmap/` | Product |
| 8–10 | 3 pillar hubs live (retirement, money-psychology, decision-tools) | Content |
| 11–14 | YouTube handle/name → Know Plain; sameAs links | Brand |

**KPI:** Site indexed; brand query impressions start.

---

## Weeks 3–6 — First spokes (publish 2/week)

### Retirement (priority)

| # | Title | Target query (long-tail) | Type | Links to |
|---|-------|--------------------------|------|----------|
| R1 | Retirement isn’t a date — it’s math | retirement is math not a date | Explainer | Hub, Roadmap, Playbook |
| R2 | How much is enough to retire? | how much is enough to retire simple | Explainer | R1, Roadmap |
| R3 | The 4% rule in 2026 | 4% rule 2026 still valid | Explainer | R2, sequence |
| R4 | Sequence of returns risk, known plain | sequence of returns risk explained simply | Explainer | R1, R3 |
| R5 | Starting retirement savings at 45 | starting retirement savings late 40s | Explainer | R2, Roadmap |
| R6 | Social Security timing, known plain | when to take social security plain english | Explainer | R2 |
| R7 | Inflation: the silent retirement killer | inflation retirement planning explained | Explainer | R2, R3 |
| R8 | Is $1 million enough to retire in 2026? | is 1 million enough to retire 2026 | Explainer | R2, Roadmap |

### Money psychology

| # | Title | Target query | Type |
|---|-------|--------------|------|
| P1 | Present bias & under-saving | present bias saving money | Explainer |
| P2 | Why we freeze on money decisions | money decision paralysis | Explainer |
| P3 | Couples and money conversations | talking about money with spouse | Explainer |
| P4 | Loss aversion in bear markets | loss aversion investing explained | Explainer |

### Decision tools

| # | Title | Target query | Type |
|---|-------|--------------|------|
| T1 | Retirement Roadmap Pack (tool page) | free retirement roadmap spreadsheet | Tool |
| T2 | How to choose a retirement age | how to choose retirement age framework | Explainer |
| T3 | Plain English withdrawal plan | simple retirement withdrawal plan | Explainer |

**Also W3–6:** Video pages for top 3 YT videos (embed + chapters + transcript stub).

**KPI:** 12–16 indexable URLs; first long-tail rankings.

---

## Weeks 7–10 — Deepen clusters (→ 8–12 per pillar)

| Focus | Ship |
|-------|------|
| Retirement | R9 Roth vs Traditional plain; R10 Pension vs 401k; R11 Healthcare before Medicare; R12 Part-time retirement |
| Psychology | P5 Financial shame; P6 Habit loops for auto-invest; P7 FOMO and crypto |
| Glossary | 15 terms: sequence risk, SWR, present bias, glide path, Roth ladder, etc. |
| PR | 3 expert quotes / guest posts / podcast mentions with identical brand bio |
| Optimize | Update stubs from GSC queries; fix thin pages; strengthen internal links |

**KPI:** Cluster density; rising impressions on long-tail; brand Knowledge recognition signals.

---

## Weeks 11–13 — Soft community + polish

| Ship | Detail |
|------|--------|
| Invite-only Q&A | 10 seeded threads linked to explainers |
| Answer hubs | 3 pages synthesizing repeated questions |
| Orphan audit | Every spoke ↔ pillar; no dead ends |
| Refresh | Update R1–R4 with new data / FAQs |
| Forum schema | Only if threads are public and moderated |

**KPI:** Brand #1 stable; multiple long-tail top-10s; roadmap conversions tracked.

---

## Publishing cadence

- **2 explainers / week** (Tue + Thu)
- **1 tool or video page / week**
- **Friday:** internal-link + schema QA pass

## Do not publish yet

- Thin “what is investing” pages
- Science/news pillars (until retirement + psychology are dense)
- Public unmoderated forum
- Indexed `/search/` URLs

---

## Success scorecard (Day 90)

| Metric | Target |
|--------|--------|
| “Know Plain” / brand SERP | #1 |
| Indexable quality URLs | 30+ |
| Long-tail top-10 | 8+ queries |
| Roadmap tool sessions | Tracked baseline |
| Head terms (e.g. “best 401k”) | Not required |

