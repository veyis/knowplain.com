# Know Plain — The Plain-English Decision Layer
### 2026 Strategy & Build Guide (research-backed)

> **One-sentence thesis:** Know Plain's opportunity is *not* "more articles." It is to become the **plain-English decision layer** between a scary retirement question and a practical next step — powered by a personalized snapshot, a moat of owned calculators, visible expert trust, and original data. This guide takes the original 10-point analysis, **corrects what is now factually outdated**, deepens each idea with current (2026) primary-source research, and translates every recommendation into concrete work on the actual Know Plain stack (Next.js 16 App Router, Content Collections MDX, Supabase, shadcn/ui).

> **How to read this:** §2 is mandatory (three assumptions in the original analysis are now wrong and will waste effort). §3–§12 are the deepened build areas. §13 is technical SEO. §14 is the sequenced roadmap. Appendix A is a cited 2026 facts cheat-sheet your calculators and articles should pull from. Appendix C lists sources.

---

## 0. Where Know Plain actually is today (verified against the codebase)

Being precise about the starting line so we don't re-build what exists or mis-state gaps.

| Area | Present today | Gap |
|---|---|---|
| Shell / UX | Search-first shell, sidebar, shadcn/ui, light/dark, ⌘K command palette, glossary (15 terms) | It's still a **library**, not a decision tool |
| Schema | `Organization`, `WebSite` (+SearchAction), `Article`, `BreadcrumbList`, `ItemList` JSON-LD in `src/lib/schema.ts` | **No** `Person`, `ProfilePage`, `VideoObject`, `QAPage`, `DiscussionForumPosting` |
| Authorship | `articleJsonLd` sets `author: { "@type": "Organization", name: "Know Plain Editorial" }` | **No per-article human author or reviewer; no author bio pages** |
| Dates | Article renders a visible "Updated {updated}" and sets schema `datePublished` **and** `dateModified` both to the single `updated` frontmatter field | **No true `datePublished`**; bumping `updated` fakes freshness (a trust risk — see §13) |
| Content model | `content-collections.ts` schema = `title, description, plainAnswer, updated, related` | **No** `author`, `reviewer`, `published`, `sources[]` fields |
| Tools | Roadmap pack (affiliate), withdrawal simulator, Boldin/Empower affiliate links | **No owned, inputs-driven calculators; no personalized flow** |
| Forum | Supabase-backed threads, upvotes | No moderation, seeded expert answers, disclaimers, accepted answers, or schema |
| Video | `/watch` reads Supabase, YouTube-synced | Can render empty; no transcripts, takeaways, or `VideoObject` |
| Build | Next 16 + Turbopack, builds clean | Warns: **`middleware` file convention deprecated → migrate to `proxy`** |

The original analysis is directionally excellent. What follows sharpens it and makes it current.

---

## 1. Sharpened diagnosis

Know Plain competes in a **YMYL** ("Your Money or Your Life") category. Google's own guidance says pages that could affect a person's *financial stability* are held to the **highest** trust bar; its raters give the **lowest** rating to money content with weak trust, no author information, or a poor site reputation ([Google, *Creating helpful content*](https://developers.google.com/search/docs/fundamentals/creating-helpful-content); [Search Quality Rater Guidelines, Jan 2025](https://guidelines.raterhub.com/searchqualityevaluatorguidelines.pdf)). Against NerdWallet / Bankrate / Investopedia, "explaining the concept well" is table stakes. The durable moats are:

1. **Trust made visible** — real named authors + credentialed reviewers, primary-source citations, honest dates.
2. **Decisions, not definitions** — a user arrives with *"retire now or wait?"*, not *"what is sequence risk?"*. Own the decision.
3. **Personalization** — a 5-minute snapshot that turns a generic topic into *your* number and *your* next step.
4. **Original data** — small studies competitors can't copy, which earn the editorial backlinks that actually move rankings.

The emotional wedge is real and timely: EBRI's **2026** Retirement Confidence Survey found Americans **less confident**, with growing worry about Social Security, Medicare, and rising costs ([EBRI 2026 RCS](https://www.ebri.org/content/2026-retirement-confidence-survey-finds-americans-less-confident-about-retirement-as-worries-grow-over-social-security--medicare-and-rising-costs)). Know Plain should own **"late, anxious, confused — but fixable."**

---

## 2. Three corrections before you build anything (the source analysis is now outdated here)

These are not nitpicks — following the original advice literally will waste real engineering time.

### 2.1 ❌ Stop chasing FAQ (and HowTo) rich results — they no longer exist
The original list (point 10) says "add FAQPage." **Google fully deprecated FAQ rich results on May 7, 2026** — for *all* sites, not just non-government ones (the earlier "gov/health only" restriction from Aug 2023 is itself obsolete). **HowTo** rich results were deprecated Sept 2023 ([Search Engine Land](https://searchengineland.com/google-to-no-longer-support-faq-rich-results-476957); [Google Search status/updates](https://developers.google.com/search/updates)).

**Corrected best practice:** FAQ/HowTo markup now yields **zero** rich results. The *only* remaining reason to keep a Q&A block structured is **machine/LLM parseability** for AI Overviews and third-party LLMs. So: keep a clean, visible "Common questions" section on decision pages for humans + AI extraction, but **do not spend a sprint** wiring `FAQPage` schema for SERP features. Spend it on the schema that *is* still live (§13): `Article`, `BreadcrumbList`, `VideoObject`, `ProfilePage`, `DiscussionForumPosting`, `QAPage`.

### 2.2 ⚠️ The ACA "bridge before Medicare" just became a top-tier tool, not a minor one
The original lists an "ACA bridge before Medicare" calculator as one item among nine. **Reprioritize it to the front.** The ARPA/IRA **enhanced premium tax credits expired December 31, 2025**, and the **400%-of-FPL "subsidy cliff" returned for plan-year 2026** ([KFF, 2026 marketplace](https://www.kff.org/affordable-care-act/what-we-know-so-far-about-2026-aca-marketplace-enrollment-premiums-and-deductibles/); [KFF, subsidy cliff](https://www.kff.org/quick-insights/a-steep-subsidy-cliff-looms-for-older-middle-income-enrollees-if-aca-enhanced-tax-credits-expire/)). A household **$1 over 400% FPL** now gets **zero** subsidy and pays the full unsubsidized premium; KFF projects average out-of-pocket premium payments **rise ~114%**.

**Why this changes strategy:** for a 55–64 early retiree, *managing MAGI to stay under the cliff* can now be worth **thousands of dollars a year** — and it directly ties Roth-vs-Traditional, capital-gains harvesting, and withdrawal-sequencing decisions together. This is exactly the "plain-English decision" wedge, made urgent by 2026 law. **Caveat to bake into the tool and copy:** as of early 2026 an extension was live in Congress (House-passed, Senate pending) and could be restored, possibly retroactively — so the calculator must show *both* scenarios and cite current statute ([healthinsurance.org](https://www.healthinsurance.org/blog/marketplace-enrollees-face-return-of-the-subsidy-cliff/)).

### 2.3 ℹ️ "Helpful Content" is no longer a separate penalty to recover from
The original frames helpfulness as a discrete system. Since the **March 2024 core update**, Google folded the helpful-content classifier **into the core ranking system** — it's now a continuous, site-wide signal, not an on/off penalty with a "recovery button" ([Google core updates](https://developers.google.com/search/updates/core-updates)). Implication: trust and helpfulness are *ongoing site-level* investments, not a one-time checklist. Also note: **structured data and E-E-A-T are not direct ranking boosts** — schema drives *feature eligibility and machine understanding*; E-E-A-T is a *rater framework*, not a computed score. Build them because they earn trust and features, not because they're a rank lever.

---

## 3. The trust & E-E-A-T layer (do this first — highest ROI for YMYL finance)

Google is explicit: **"Trust is the most important member of the E-E-A-T family… untrustworthy pages have low E-E-A-T no matter how Experienced, Expert, or Authoritative they may seem,"** and for YMYL these signals are weighted more heavily ([Creating helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)). Raters apply a **Who / How / Why** test: *Who* made it (self-evident authorship linking to credentials), *How* (transparent method & sourcing), *Why* (to help people, not to rank).

### 3.1 Data model: add the trust fields to Content Collections
Extend `content-collections.ts` so trust is structured, not decorative:

```ts
schema: z.object({
  content: z.string(),
  title: z.string(),
  description: z.string(),
  plainAnswer: z.string(),
  published: z.string(),          // NEW — ISO date, set once, never bumped
  updated: z.string(),            // now means "genuinely revised on"
  author: z.string(),             // NEW — slug -> authors registry
  reviewer: z.string().optional(),// NEW — slug of the CFP/CPA who reviewed
  reviewedOn: z.string().optional(),
  sources: z.array(z.object({     // NEW — primary-source citations (§4)
    label: z.string(), url: z.string(), publisher: z.string().optional(),
  })).optional(),
  related: z.array(z.object({ href: z.string(), label: z.string() })).optional(),
}),
```

Create a typed `src/lib/authors.ts` registry (name, role, credentials, bio, photo, `sameAs` links, `knowsAbout`). Two or three real people is enough to start — a lead writer and one credentialed reviewer (CFP® or CPA) does the heavy lifting for finance trust.

### 3.2 Author & reviewer bio pages (`ProfilePage` + `Person`)
Build `/authors/[slug]` (and, ideally, `/reviewers/[slug]`) rendering a real, indexable bio, marked up as `ProfilePage` whose `mainEntity` is a `Person`. The single most valuable property is **`sameAs`** (LinkedIn, CFP Board / AICPA profile, university page) — it disambiguates the person as a real entity. Include `hasCredential`:

```jsonc
{
  "@context": "https://schema.org", "@type": "ProfilePage",
  "dateModified": "2026-07-10",
  "mainEntity": {
    "@type": "Person",
    "name": "Jane Writer",
    "jobTitle": "Retirement writer",
    "url": "https://knowplain.com/authors/jane",
    "worksFor": { "@type": "Organization", "name": "Know Plain" },
    "knowsAbout": ["retirement planning", "Roth conversions", "Social Security timing"],
    "sameAs": ["https://www.linkedin.com/in/…"],
    "hasCredential": {
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": "Certified Financial Planner (CFP)",
      "recognizedBy": { "@type": "Organization", "name": "CFP Board", "url": "https://www.cfp.net/" }
    }
  }
}
```
([schema.org/Person](https://schema.org/Person); [Google ProfilePage](https://developers.google.com/search/docs/appearance/structured-data/profile-page))

### 3.3 Visible bylines + "Reviewed by" (the part raters actually see)
- Replace the `author: Organization` in `articleJsonLd` with `author: { "@type": "Person", name, url }` pointing at the bio page.
- For finance-sensitive articles add schema `reviewedBy` → `Person` (with `hasCredential`) **and** a visible on-page line: *"Written by Jane Writer · Reviewed by John Smith, CFP® · Updated Jul 10, 2026."* The visible byline matters more than the markup; schema without the visible line is nearly worthless, and the visible line without schema still counts. There is **no rich result** for `reviewedBy` — do it for trust and LLM parsing.

### 3.4 Trust pages (cheap, high rater value)
You have `editorial-policy` and `disclosure`. Add/expand: a **correction policy** (with visible correction notes on updated articles), a **citation/sourcing policy** ("we link claims to primary sources — IRS, SSA, BLS, Federal Reserve, peer-reviewed data"), and clear **About / ownership / contact**. Raters perform off-site reputation research and check exactly these.

---

## 4. Primary-source citations (the biggest YMYL content gap)

Google's helpful-content self-assessment asks directly: *"Does the content present information in a way that makes you want to trust it, such as clear sourcing?"* Right now articles explain concepts without consistently citing the authority behind the number.

**Implementation on this stack:**
- Use the new `sources[]` frontmatter field; render a **"Sources"** block at the foot of each article (an MDX component in `src/components/mdx-components.tsx`) that lists primary sources with `rel="nofollow"`-free outbound links to `.gov` / `.edu` / peer-reviewed originals.
- Add an inline `<Cite>` MDX component so a sentence like *"the 2026 401(k) limit is $24,500"* links to [IRS Notice 2025-67](https://www.irs.gov/pub/irs-drop/n-25-67.pdf).
- Maintain **one canonical facts module** (`src/lib/facts-2026.ts`) so every article and calculator reads the *same* cited numbers (see Appendix A). When the IRS/SSA update figures, you change one file and every page + calculator stays correct and cited.

Prefer primary sources over other blogs: **irs.gov, ssa.gov, medicare.gov / cms.gov, bls.gov, federalreserve.gov, kff.org, morningstar.com**, and named academic papers (Bengen 1994; Trinity Study 1998).

---

## 5. Flagship: the "Retirement Snapshot" (Know Plain Retirement Checkup)

This is the product that converts a reader into a returning user. A **5-minute guided flow** that collects ~10 inputs and returns a **plain-language score, the gaps, the next articles, and the next tools** — a roadmap, not a report.

### 5.1 "Retirement in 10 Numbers" (the inputs)
1. **Age** (and target retire age)
2. **Household** (single / couple; both incomes)
3. **Annual income**
4. **Current retirement savings** (all accounts)
5. **Annual spending** (or % of income)
6. **Debt** (balance + rate — feeds §6.8)
7. **Tax-bucket mix** (pre-tax / Roth / taxable %) — drives Roth strategy & IRMAA/ACA MAGI
8. **Healthcare bridge** (retire before 65? years to cover — feeds §6.5, now urgent per §2.2)
9. **Social Security plan** (claim age intent — feeds §6.3)
10. **Risk comfort & work flexibility** (could you work longer / part-time?)

### 5.2 "Plain Scores" (the output, 0–100 each)
- **Confidence** — savings vs. a benchmark path (e.g., Fidelity's savings-multiple guideline: ~1× salary by 30, 3× by 40, 6× by 50, 8× by 60, ~10× by 67 — *verify current Fidelity figures before shipping*).
- **Flexibility** — buffer + ability to work longer / cut spending.
- **Sequence Risk** — exposure to a bad early-retirement decade (feeds the stress test, §6.6).
- **Healthcare Gap** — pre-65 coverage exposure, now weighted up for 2026's subsidy cliff (§2.2).
- **Tax Complexity** — RMD pressure, bracket risk, Roth opportunity.

### 5.3 Build notes (this stack)
- Multi-step wizard as a client component using shadcn `Card`, `Input`, `Slider`, `RadioGroup`, `Progress`, `Tabs`. Keep it **stateless-first** (compute in the browser; no login required to see a result — reduce friction).
- **Save to plan** and **email me my roadmap** require Supabase auth (already present) — gate *saving*, not *seeing*.
- Emit `SoftwareApplication` schema on the tool's landing page (note: no star rich result without genuine `aggregateRating` + `offers`, so this is for understanding, not SERP stars — [Google SoftwareApplication](https://developers.google.com/search/docs/appearance/structured-data/software-app)).
- The Snapshot result page is the **conversion hub**: each low score deep-links to the matching calculator (§6) and the matching decision page (§8).

---

## 6. The tool moat — owned, inputs-driven calculators

Each calculator below lists the **researched formula/number to build against** (cited, 2026). Reuse `src/lib/facts-2026.ts` and render with shadcn form primitives. Ship them as `/tools/<name>` and embed the relevant one inside its decision page (§8).

| # | Calculator | Core logic & the cited 2026 anchor |
|---|---|---|
| 1 | **Am I on track?** | Compare savings to a benchmark path (Fidelity salary-multiples, *verify*). Output = the Confidence score + the gap in dollars/years. |
| 2 | **Retirement-age tradeoff** | Each extra working year adds contributions, removes a drawdown year, and raises the Social Security base. Show the curve of "safe spending" vs. retire-age. |
| 3 | **Social Security break-even** | Monthly benefit: claim at 62 = **70% of PIA** (30% cut at FRA 67); 67 = 100%; 70 = **~124%** (delayed credits +8%/yr). Break-even ≈ **age 78–79 (62 vs 67)**, **~82–83 (67 vs 70)**. Adding COLA/survivor value tilts toward delaying. ([SSA reduction](https://www.ssa.gov/benefits/retirement/planner/agereduction.html); [SSA delayed credits](https://www.ssa.gov/benefits/retirement/planner/delayret.html)) |
| 4 | **Roth vs. Traditional** | Marginal-rate arbitrage: Roth if today's rate < expected retirement rate; Traditional if higher. Secondary tilts to Roth: no lifetime RMDs, tax-free heirs, and **MAGI control that now affects ACA subsidies (§2.2) and Medicare IRMAA.** |
| 5 | **ACA bridge before Medicare** ⭐ | *Elevated per §2.2.* Model MAGI vs. **400% FPL cliff (back for 2026)**; show subsidized vs. unsubsidized benchmark-plan cost and the value of staying under the cliff. Show both "cliff" and "extended-subsidy" scenarios; cite current statute. ([KFF](https://www.kff.org/affordable-care-act/what-we-know-so-far-about-2026-aca-marketplace-enrollment-premiums-and-deductibles/)) |
| 6 | **Sequence-risk stress test** | Extend the existing withdrawal simulator: run the *same* average return in good-first vs. bad-first order (and/or a historical/Monte-Carlo pass). Default safe starting rate to a **cited** figure — **Morningstar 3.9% (2026)** for fixed real spending, with Bengen's ~4.7% and the classic 4% shown for context. ([Morningstar 2026 SWR](https://www.morningstar.com/retirement/whats-safe-retirement-withdrawal-rate-2026)) |
| 7 | **Inflation-adjusted spending planner** | Project spending with a cited inflation anchor; contextualize with the **2026 Social Security COLA of +2.8%**. ([SSA 2026 COLA](https://www.ssa.gov/news/en/cola/factsheets/2026.html)) |
| 8 | **Debt payoff vs. investing** | Compare the debt's guaranteed after-tax rate to a conservative expected market return; feed from the Snapshot's debt input. |
| 9 | **Catch-up planner (45+)** | 2026: standard catch-up **$8,000** (50+); **super catch-up $11,250** (ages **60–63**); and the **mandatory-Roth catch-up for high earners** (prior-year FICA wages > **$150,000**), effective **Jan 1 2026**. ([IRS 2026 limits](https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500); [IRS final regs](https://www.irs.gov/newsroom/treasury-irs-issue-final-regulations-on-new-roth-catch-up-rule-other-secure-2point0-act-provisions)) |

**Sequencing:** build **#5 (ACA bridge)** and **#6 (sequence-risk, extends what you have)** first — highest 2026 relevance and lowest incremental cost — then #3 and #4.

---

## 7. The "Late Starter" vertical (ages 40–60) — your least-commoditized wedge

Generic "retirement" is saturated. **"Late, anxious, fixable"** is emotionally sharper and under-served — and the data backs the market size:

- **~31%** of Americans in their **30s** have no retirement account (Investopedia / Fed SHED, 2024).
- **~28%** ("nearly 3 in 10") of Americans in their **50s** lack a retirement account or pension (Investopedia, 2024).
- Median retirement-account balances are modest even among savers: **~$115K (45–54)** and **~$185K (55–64)** (Federal Reserve SCF 2022).
- Workers **expect** to retire at a median **~65** but retirees **actually** retired at **~62** — the plan-vs-reality gap that fuels anxiety (EBRI RCS).
- Confidence is **falling** into 2026 amid Social Security/Medicare/cost worries (EBRI 2026 RCS).

*(Audience figures above were gathered via a fast web model; re-verify the current edition/number before publishing each one — Appendix C flags this.)*

**Build:** a `/late-starter` hub with its own nav entry, decision pages tuned to 40–60 (catch-up strategy §6.9, "is it too late?", working-longer math §6.2, delaying Social Security §6.3), and a Snapshot variant that leads with catch-up and healthcare-bridge scoring. This is also where original research (§12) lands hardest.

---

## 8. The Decision Library (turn every article into a decision page)

Reorganize navigation around **decisions**, not just topics:
*"Retire now or wait?"* · *"Claim Social Security now or later?"* · *"Roth or Traditional?"* · *"Pay the mortgage or invest?"* · *"Can I afford to retire before 65?"* (the ACA bridge).

**The decision-page template** (one MDX layout, reused): **Plain answer** (you already capture `plainAnswer`) → **the explanation** → **embedded calculator** (§6) → **checklist** → **common questions** (visible, for humans + AI; no FAQ schema needed, §2.1) → **Sources** (§4) → **"What to do next"** (deep-links to Snapshot + related decisions). Each decision page carries `Article` schema with a real `author`/`reviewedBy` and honest dates.

This is the structural change that makes Know Plain a *decision layer*: the calculator, the checklist, and the next step live **on the page that answers the question.**

---

## 9. Forum quality & safety (earn the schema, don't lead with it)

Add `DiscussionForumPosting` / `QAPage` schema **only after quality is real** — Google's "Discussions and forums" feature and `QAPage` are live, but marking up a thin, unmoderated forum invites more risk than reward ([Google QAPage](https://developers.google.com/search/docs/appearance/structured-data/qapage); [DiscussionForumPosting](https://developers.google.com/search/docs/appearance/structured-data/discussion-forum)).

**Order of operations:** (1) invite-only / approval at first; (2) **seed 10 high-quality Q&A pages** with credentialed answers, linked from the matching decision pages so they become indexable answer hubs; (3) moderation, spam controls, accepted answers, and a persistent **"Educational only, not financial advice"** boundary; (4) *then* add `QAPage` (genuine one-question-plus-community-answers) or `DiscussionForumPosting` markup. Never use `QAPage` for editorial FAQs.

---

## 10. Video SEO depth (`/watch`)

`/watch` can render empty (Supabase-dependent). Fixes, in order:
1. **Fallback content** so pages are never empty.
2. **Transcript pages** + **chapter summaries** + **key takeaways** per video — this is the indexable SEO body; the embed alone isn't.
3. **`VideoObject` schema** (live rich result): required `name`, `thumbnailUrl`, `uploadDate`; recommended `description`, `embedUrl`, `duration` (ISO 8601), and **key moments** (`Clip`/`SeekToAction`) tied to your chapters ([Google VideoObject](https://developers.google.com/search/docs/appearance/structured-data/video)).
4. **Embed the matching calculator** (§6) beside each video — the same decision-layer move as §8.

---

## 11. The conversion loop (what happens after the read)

Today an article ends. Add an explicit journey — a shared MDX "Next steps" component:
- **"Save this to my plan"** (Supabase) — anchors a returning-user habit.
- **"Run the calculator for this article"** (embedded, §6).
- **"Email me the checklist / my roadmap"** — the email-capture moment, placed on **Snapshot results** and decision-page checklists (highest intent), not as a sitewide popup.
- **"Ask a follow-up"** → seeded forum Q&A (§9).
- **"Compare my answer to common cases"** — benchmark the user's number against typical profiles (great use of your own aggregate data, §12).

Email capture belongs around **personalized results**, where the value exchange is obvious.

---

## 12. Original research (your best backlink & citation magnet)

Google explicitly rewards *"original information, reporting, research, or analysis."* Original **data** is the most citable form — it earns editorial links and gets quoted by press and LLMs. You don't need a Harris Poll budget (how NerdWallet's [Financial Resilience Index](https://www.nerdwallet.com/studies) and Bankrate's [Emergency Savings Report](https://www.bankrate.com/banking/savings/emergency-savings-report/) work) — you need **primary data + transparent methodology**.

Start with what only Know Plain has — **your own tools' aggregate, anonymized usage**:
- *"What withdrawal rate do real people actually model?"* (from the simulator).
- *"The retirement age our Snapshot users target vs. what their numbers support."*
- *"How much a pre-65 retirement date changes the healthcare bill"* (built from §6.5 + KFF benchmark premiums — especially newsworthy given the 2026 subsidy cliff).
- *"The hidden cost of claiming Social Security at 62"* (from §6.3 math).

Each becomes an annual, updatable, linkable page with a stated method (sample, dates, assumptions) — the "How" of Who/How/Why.

---

## 13. Technical SEO polish (concrete, on this codebase)

**Schema work** (extend `src/lib/schema.ts`):
- `articleJsonLd`: switch `author` to `Person` (→ bio page); add `reviewedBy`; take **distinct** `datePublished` and `dateModified`.
- Add helpers: `profilePageJsonLd(person)`, `videoObjectJsonLd(video)`, `qaPageJsonLd(thread)` / `discussionForumPostingJsonLd(thread)`, `softwareApplicationJsonLd(tool)`.
- **Skip** `FAQPage`/`HowTo` for rich results (§2.1). Keep an optional visible "Common questions" block for humans + AI.

**Dates (real bug):** article schema currently sets both `datePublished` and `dateModified` to the single `updated` field. Add a distinct `published` frontmatter field; use ISO 8601 **with timezone** (`2026-07-10T09:00:00-04:00`); bump `dateModified` **only on genuine substantive edits**, and keep the visible date in sync — Google can distrust manipulated freshness ([Article dates](https://developers.google.com/search/docs/appearance/structured-data/article)).

**Housekeeping:**
- **Migrate `middleware` → `proxy`** (Next 16 deprecation warning in the build). ([Next.js middleware→proxy](https://nextjs.org/docs/messages/middleware-to-proxy))
- Verify OG/Twitter cards on all templates; register **Google Search Console + Bing Webmaster**; confirm `sitemap.xml`/`robots.txt` include new tool/author routes.
- Keep third-party/sponsored/affiliate content clearly separated from core editorial paths — Google's **site-reputation-abuse** policy (enforced 2024) targets borrowed authority even with editorial oversight ([spam policies](https://developers.google.com/search/docs/essentials/spam-policies#site-reputation)).
- **AI Overviews / LLM citation:** there is *no* special schema to opt in — it uses the same index and fundamentals. What helps is clean semantic HTML, clear question→answer structure, explicit sourcing, and unambiguous `Person` + `sameAs` author data ([Google AI features](https://developers.google.com/search/docs/appearance/ai-features)).

---

## 14. Prioritized 90-day roadmap

Ordered by **trust → flagship → decisions → community → capture → video**, matching Google's YMYL weighting and the 2026 news cycle.

**Phase 1 — Trust foundation (Weeks 1–3)**
1. Add trust fields to the content schema (`author`, `reviewer`, `published`, `sources[]`) and the `authors.ts` registry.
2. Build `/authors/[slug]` bio pages with `ProfilePage`/`Person` + `hasCredential` + `sameAs`.
3. Switch `articleJsonLd` to `Person` author + `reviewedBy`; fix `datePublished` vs `dateModified`; add visible "Written by / Reviewed by / Updated" bylines.
4. Add **Sources** + inline `<Cite>` MDX components; stand up `src/lib/facts-2026.ts` (Appendix A). Publish correction + sourcing policy pages.

**Phase 2 — Flagship tool (Weeks 3–6)**
5. Build the **Retirement Snapshot** (10 numbers → Plain Scores → next steps), no-login-to-view, save/email gated on Supabase.

**Phase 3 — Decisions + calculators (Weeks 5–9)**
6. Ship the decision-page template; convert the **top 8 retirement articles** into decision pages.
7. Build **ACA-bridge (⭐)** and **sequence-risk stress test** first, then **SS break-even** and **Roth vs Traditional**; embed each in its decision page.
8. Launch the **Late Starter** hub (§7).

**Phase 4 — Community + capture (Weeks 8–11)**
9. Seed **10 moderated Q&A pages**, linked from decision pages; add disclaimers/accepted answers; then add `QAPage`/`DiscussionForumPosting` schema.
10. Wire the conversion loop + email capture around Snapshot results and checklists.

**Phase 5 — Video + original data (Weeks 10–13)**
11. Add video fallback content, transcripts, takeaways, `VideoObject` schema, and embedded calculators.
12. Publish the **first original-research piece** from your own aggregate usage data.

**Always-on:** keep `facts-2026.ts` current at each IRS/SSA/CMS release; monitor the **ACA subsidy legislation** (§2.2) and update the bridge calculator + copy the moment statute changes.

---

## Appendix A — 2026 facts cheat-sheet (cited; source of truth for `facts-2026.ts`)

**IRS 2026 contribution limits** ([IRS Notice 2025-67](https://www.irs.gov/pub/irs-drop/n-25-67.pdf); [IRS newsroom](https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500))
- 401(k)/403(b)/457/TSP elective deferral: **$24,500** · standard catch-up (50+): **$8,000** · super catch-up (ages 60–63): **$11,250** · IRA: **$7,500** · IRA catch-up (50+): **$1,100**.
- Combined employee ceiling: **$32,500** (50–59 / 64+); **$35,750** (60–63).
- Roth IRA phase-out (MAGI): single **$153k–$168k**; MFJ **$242k–$252k**.
- SECURE 2.0 **mandatory-Roth catch-up** for high earners (prior-year FICA wages > **$150,000**): effective **Jan 1, 2026**.

**RMDs** ([IRS RMD FAQs](https://www.irs.gov/retirement-plans/retirement-plan-and-ira-required-minimum-distributions-faqs)) — start age **73** (born 1951–1959), **75** (born 1960+); Roth 401(k) **no lifetime RMDs** since 2024.

**Social Security 2026** ([SSA 2026 COLA fact sheet](https://www.ssa.gov/news/en/cola/factsheets/2026.html))
- COLA **+2.8%** · max taxable earnings **$184,500** · FRA **67** (born 1960+) · claim at 62 = **70% of PIA** · delay to 70 = **~124%** · earnings-test exempt **$24,480/yr** (under FRA), **$65,160** (FRA year).
- **Social Security Fairness Act** (signed Jan 5, 2025): **WEP & GPO repealed**, retroactive to Jan 2024 — affects ~3.2M (teachers, police, firefighters, CSRS) ([SSA](https://www.ssa.gov/benefits/retirement/social-security-fairness-act.html)).

**Medicare 2026** ([CMS 2026 Part B](https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles)) — eligibility **65** · standard Part B **$202.90/mo** · deductible **$283** · IRMAA uses MAGI from **2 years prior** (2026 → 2024 return), first tier > **$109k single / $218k MFJ**.

**ACA / early-retiree bridge** ([KFF](https://www.kff.org/affordable-care-act/what-we-know-so-far-about-2026-aca-marketplace-enrollment-premiums-and-deductibles/)) — enhanced premium tax credits **expired Dec 31, 2025**; **400% FPL subsidy cliff returned for 2026**; avg out-of-pocket premiums projected **+~114%**. ⚠️ Extension pending in Congress — re-verify statute.

**Safe withdrawal rate** — Bengen 1994 (~**4.15%** worst-case → "4% rule"); Bengen later ~**4.7%**; **Morningstar 2026: 3.9%** starting rate for fixed real spending ([Morningstar](https://www.morningstar.com/retirement/whats-safe-retirement-withdrawal-rate-2026)).

---

## Appendix B — schema helpers to add (sketch)

```ts
// src/lib/schema.ts — additions
export function profilePageJsonLd(p: Author) { /* ProfilePage + Person + hasCredential + sameAs */ }
export function videoObjectJsonLd(v: Video) { /* name, thumbnailUrl, uploadDate, embedUrl, duration */ }
export function qaPageJsonLd(t: Thread)     { /* Question + acceptedAnswer/suggestedAnswer */ }
export function softwareApplicationJsonLd(tool: Tool) { /* name, applicationCategory, offers */ }
// articleJsonLd: author -> Person(url), add reviewedBy: Person, split datePublished/dateModified
```
Requirements per type: [Article](https://developers.google.com/search/docs/appearance/structured-data/article) · [ProfilePage](https://developers.google.com/search/docs/appearance/structured-data/profile-page) · [VideoObject](https://developers.google.com/search/docs/appearance/structured-data/video) · [QAPage](https://developers.google.com/search/docs/appearance/structured-data/qapage) · [DiscussionForumPosting](https://developers.google.com/search/docs/appearance/structured-data/discussion-forum) · [SoftwareApplication](https://developers.google.com/search/docs/appearance/structured-data/software-app) · [Breadcrumb](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb).

---

## Appendix C — sources & confidence notes

**Google / SEO (high confidence):** [Creating helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) · [Search Quality Rater Guidelines, Jan 2025](https://guidelines.raterhub.com/searchqualityevaluatorguidelines.pdf) · [Structured data gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery) · [FAQ deprecation](https://searchengineland.com/google-to-no-longer-support-faq-rich-results-476957) · [Core updates](https://developers.google.com/search/updates/core-updates) · [Spam / site-reputation](https://developers.google.com/search/docs/essentials/spam-policies) · [AI features](https://developers.google.com/search/docs/appearance/ai-features) · [schema.org/Person](https://schema.org/Person).

**Finance facts (high confidence — primary sources):** IRS Notice 2025-67, SSA 2026 COLA fact sheet, CMS 2026 Part B fact sheet, SSA Fairness Act page, Morningstar 2026 SWR, KFF ACA analyses (all linked in Appendix A). ⚠️ **ACA enhanced-subsidy status is legislatively volatile — re-verify before relying on it.**

**Audience statistics (medium confidence — verify current edition before publishing):** EBRI RCS 2025/2026 ([2026 release](https://www.ebri.org/content/2026-retirement-confidence-survey-finds-americans-less-confident-about-retirement-as-worries-grow-over-social-security--medicare-and-rising-costs)); Investopedia 30s/50s retirement-gap articles; Federal Reserve SCF 2022; Fidelity Retiree Health Care Cost Estimate (~$157.5K–$165K, 2023–2024 — confirm latest); Gallup Social Security importance (~58%). These came from a fast web model — treat as leads and confirm the exact current figure at publish time.

*Compiled July 2026. Numbers marked ⚠️ change with tax year or legislation — treat `src/lib/facts-2026.ts` as the single source of truth and update it at each official release.*
