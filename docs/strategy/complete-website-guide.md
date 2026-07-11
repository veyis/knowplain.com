# Know Plain — Complete Website Guide

**Revision 2 · Verified 2026-07-11 · Supersedes the earlier 2026-07-11 draft**

This revision fact-checked the previous draft against primary sources (IRS, SSA, CMS, KFF, Google Search Central, the Federal Register, and the case law), and audited it against the actual codebase. The previous draft was wrong or stale in eleven places, four of which would have caused material product or trust risk — a calculator that misprices an early retiree's healthcare by five figures a year, a compliance rule it never mentioned, and engineering work on schema that no longer has practical value.

It was also behind its own repo. Most of what it listed as "missing" is built.

---

## Executive decision

Build **Money Made Simple** as the only active vertical until it is trusted, instrumented, and monetized. Keep the 10-channel Plain Network as an architectural option, not a launch roadmap.

The current strategic sequence:

1. Close the P0 trust and product defects in §2.
2. Make the **ACA Bridge / Cliff Warner** the 2026 flagship.
3. Make tools, checkup, email capture, YouTube, and original research the business.
4. Treat articles as necessary support, not the moat.
5. Open a second vertical only after the gate in §14 is met.

The core bet:

> A language model can summarize an article. It cannot safely run a user's retirement numbers, preserve their privacy, monitor volatile tax/ACA facts, and stand behind the answer with named reviewers.

---

## 0. How to read this

**Status legend — used throughout. Respect it.**

| Tag | Meaning |
|---|---|
| ✅ **VERIFIED** | Confirmed against a primary source, cited inline. Safe to publish. |
| ⚠️ **VOLATILE** | Verified today, but changes with legislation or the tax year. Must carry a "last verified" date and a monitoring owner. |
| 🚫 **DO NOT PUBLISH** | Widely repeated, could not be confirmed against a primary source. Listed in Appendix B. Do not put these on the site. |
| 💭 **JUDGMENT** | My analysis, not a sourced fact. Argue with it. |

Two rules that govern everything below:

1. **No number reaches a user without a source.** The site's entire competitive claim is source discipline. A single confidently wrong figure on a retirement page costs more trust than ten articles earn.
2. **Where the research and the plan disagree, the research wins.** Several of my own recommendations below contradict the previous draft's. That is the point.

---

## 1. Correction log — what this revision changed

The eleven fixes. Severity is about **harm to the user or wasted engineering**, not about tone.

| # | Previous draft said | Verdict | What's actually true | Severity |
|---|---|---|---|---|
| 1 | An "ACA Bridge Before Medicare" tool, listed 5th of 9, with no mention of subsidy rules | 🔴 **DANGEROUS OMISSION** | **The ARPA/IRA enhanced premium tax credits expired 2025-12-31 and were not extended. The 400%-of-FPL subsidy cliff is back for plan-year 2026.** A 60-year-old at $65,000 income now pays **$10,389/yr more** than in 2025. ([KFF](https://www.kff.org/affordable-care-act/how-will-the-loss-of-enhanced-premium-tax-credits-affect-older-adults/)) | **CRITICAL** |
| 2 | Catch-up planner citing only the $8,000 / $11,250 limits | 🔴 **INCOMPLETE — compliance** | **The SECURE 2.0 mandatory Roth catch-up is live for 2026.** If 2025 FICA wages from the plan sponsor exceeded **$150,000** (not the widely-quoted $145,000), catch-up contributions **must** be Roth. ([IRS Notice 2025-67](https://www.irs.gov/pub/irs-drop/n-25-67.pdf); [final regs, 2025-09-16](https://www.federalregister.gov/documents/2025/09/16/2025-17865/catch-up-contributions)) | **HIGH** |
| 3 | "Add FAQPage schema when a visible FAQ exists" (in 4 places) | 🔴 **DEAD** | FAQPage is no longer listed in Google's supported structured-data gallery. Treat `faqJsonLd()` as inert markup unless Google restores support. Keep visible FAQs for humans; do not maintain FAQ schema as an SEO project. | **HIGH** (wasted work) |
| 4 | "Home: Organization, WebSite, SearchAction" | 🟠 **STALE** | Google killed the **sitelinks search box on 2024-11-21**. `SearchAction` is inert. Keep `Organization`; keep `WebSite` **only** for the site-name feature. ([Google](https://developers.google.com/search/blog/2024/10/sitelinks-search-box)) | MEDIUM |
| 5 | "Every tool has schema as SoftwareApplication or WebApplication" | 🟠 **CARGO CULT** | The software-app rich result requires `offers.price` **and** `aggregateRating`/`review`. A free calculator with no genuine ratings gets nothing from this rich-result type. Satisfying it by inventing ratings is a spam violation. Emit it only if the tool genuinely behaves like a software app and has real review/rating data. | MEDIUM |
| 6 | "Add `reviewedBy` as a schema.org property" implying Google value | 🟠 **OVERSTATED** | `reviewedBy` appears **nowhere** in Google's Article docs. Keep it — for humans and LLM parsing — but it buys zero from Google. The **visible** "Reviewed by" line is what raters see and is worth more than the markup. | LOW |
| 7 | Cites "Google's helpful content system" as a live system | 🟠 **STALE** | Folded into core ranking in the **March 2024** core update; Google lists it under **"Retired systems."** There is no standalone classifier and no "recovery." Also: **E-E-A-T is not a ranking factor** — Google says so explicitly. Current Quality Rater Guidelines: **2025-09-11**. | MEDIUM |
| 8 | Portfolio target "using 3.5%–4.5% planning withdrawal rates" | 🟡 **UNDER-SPECIFIED** | Defensible as a band, indefensible as a bare number. The two credible anchors measure **different things**: Morningstar **3.9%** (2025 edition — *forward-looking*, 30yr, 90% success, 30–50% equity) vs. Bengen **4.7%** (*historical worst case*, 7-asset-class portfolio). You cannot average them. Label the method or don't show the number. | MEDIUM |
| 9 | Plans `/sources/scf-retirement-savings` | 🟡 **WOULD CITE A NONEXISTENT SOURCE** | **The 2022 SCF is still the latest wave** as of today. The 2025 wave has no announced release date. Also: SCF balances are **conditional on having an account** — only **54.3%** of families do. Publishing "median 55–64 = $185,000" without that caveat is the signature deception of this genre. | HIGH |
| 10 | "Build warns that Next.js `middleware` is deprecated → migrate to `proxy`" | ⚪ **ALREADY DONE** | `src/proxy.ts` exists; `src/middleware.ts` does not. Along with ~15 other "gaps" in §Idea 10 that are built. See §2. | (stale) |
| 11 | Missing entirely | 🟡 **GAPS** | **OBBBA senior deduction** ($6,000/person 65+, 2025–2028); **inherited-IRA annual RMDs now enforced** (waivers ended 2025); **Part D $2,100 cap**; **IRA catch-up $1,100**; **415(c) $72,000**; **Saver's Match (2027)**; **WEP/GPO repeal**. All directly relevant to the target audience. | MEDIUM |

**Two claims the previous draft got right and should keep, now with evidence:**

- ✅ **"Confidence is falling."** True. EBRI's **2026** Retirement Confidence Survey (fielded Jan 2026, n=2,544, released 2026-04-21): worker confidence **67% → 61%**; retiree confidence **78% → 73%**. Workers *expect* to retire at a median of **65**; retirees actually retired at **62**, and nearly half retired **earlier than planned**. That last gap is the single most publishable statistic in the entire survey and it is the emotional core of the brand.
- ✅ **"Late, anxious, confused, but fixable."** Keep the phrase. It is the correct wedge and the data supports it.

---

## 2. Where the site actually is today

Audited against the working tree, 2026-07-10. **The previous draft's "current known gaps" section is obsolete and has been deleted.** Do not re-plan work that is done.

**Already built** (the draft listed most of these as missing):

`/checkup` (with a real scoring engine in `src/lib/checkup.ts`) · `/decisions` + 4 decision pages · `/late-starters` · `/authors/[slug]` and `/reviewers/[slug]` with `ProfilePage` schema · `/methodology` · `/corrections` · `/editorial-policy` · `/tools/[slug]` with **6 working calculators** · `/glossary` (15 terms) · `/forum` + 9 seeded Q&A pages · `/watch` with static fallbacks and transcripts · `Article`, `BreadcrumbList`, `ProfilePage`, `VideoObject`, `QAPage`, `WebApplication`, `ItemList` JSON-LD · the **full trust frontmatter schema** (published/updated/reviewed/author/reviewer/sources/faqs/riskLevel/relatedTools) · `ArticleTrust`, `SourceList`, `FAQBlock`, `DecisionCta` · the `middleware`→`proxy` migration · affiliate links with per-link labels and a `/disclosure` page · **and `src/lib/facts-2026.ts`**, which is a genuinely good single-source-of-truth module that already has the $1,100 IRA catch-up, the $150,000 Roth threshold, the ACA cliff math, and Morningstar's 3.9%.

**The real gaps — this is the actual backlog.** Items marked ✅ were closed on 2026-07-11; the rest are open.

| # | Gap | Why it matters | Status |
|---|---|---|---|
| 1 | **`captureCheckupLead` silently lied.** It inserted into `knowplain_leads` — a table that **did not exist** in `supabase/schema.sql` — inside a `try/catch` that swallowed the failure and returned `{ ok: true }`. | Every user who asked for their results by email was told it worked. Nothing was stored, nothing was sent. On a site whose only asset is trust, this was the worst bug in the repo. | ✅ **FIXED** — table created (insert-only RLS, not publicly readable), errors surfaced, UI no longer claims an email was sent. **Still open: no ESP is wired** (needs a provider decision). |
| 2 | **13 of 21 articles had bare frontmatter** — no author, reviewer, sources, or dates. | The actual YMYL trust hole. The schema and components existed; the content didn't use them. | ✅ **FIXED** — **21/21** now carry the trust stack. Sources attached only where the article makes a checkable claim (DOIs for the behavioural studies already named in prose; `.gov` primaries for the finance pages). |
| 3 | **`health-care-before-medicare.mdx` was materially wrong.** It said ACA subsidies "key off **taxable income**" (they key off ACA MAGI, which adds back *all* Social Security and tax-exempt interest) and never mentioned the cliff. | This is Correction #1 showing up in live content — the exact page an early retiree would trust. | ✅ **FIXED** — rewritten with the cliff, the MAGI definition, the $10,389/yr figure, and a "last verified" date. |
| 4 | **No analytics of any kind**, and the CSP (`connect-src 'self'`) would have silently dropped any that were added. | Every metric in §15 was unmeasurable. | ✅ **FIXED** — Vercel Analytics + Speed Insights, with the CSP allow-listed so they actually report. Cookieless, no consent banner needed, and suppressed entirely under Global Privacy Control. |
| 5 | `/profile` and `/login` were crawlable. `/forum/[id]` threads neither in the sitemap nor noindexed. | Thin/auth pages in the index drag site-wide quality. | ✅ **FIXED** — all three now `noindex`; `/profile`, `/login`, `/auth/` also disallowed in robots.txt. Curated `/forum/questions/*` stay indexed. |
| 6 | **Dead schema shipping.** `faqJsonLd()` (FAQ rich result removed 2026-05-07), `SearchAction` (removed 2024-11-21), `webApplicationJsonLd()` (earns nothing without ratings), and `QAPage` **misapplied** to staff-answered pages that cannot satisfy its "users must be able to submit answers" requirement. | Maintaining markup that does nothing, plus one genuine misapplication. | ✅ **FIXED** — all four removed; `WebSite` kept for the site-name feature only. Verified against the rendered HTML, not just the source. |
| 7 | **`checkup.ts` hardcoded `0.035`/`0.045`** instead of reading `facts-2026.ts`, i.e. the exact uncited band Correction #8 says to stop publishing. | Broke the single-source-of-truth rule inside the flagship tool. | ✅ **FIXED** — now derives the range from the two cited SWR anchors and labels the method on-screen. Guarded by `test/checkup.test.mjs`. |
| 8 | **Two tools lied about their own function.** The "Sequence-Risk Stress Test" did **no sequencing** — it multiplied a balance by a rate. The catch-up planner was blind to age and wages, so it would suggest a **pre-tax catch-up the law no longer permits**. | A calculator that misstates its own method is worse than no calculator: it launders a guess as a computation. | ✅ **FIXED** — both rebuilt, with tests that fail if the behaviour regresses. See §8. |
| 9 | **YouTube embeds were blocked in production.** The CSP had no `frame-src`, so `/watch/[slug]` iframes fell back to `default-src 'self'`. | Invisible only because the fallback videos use non-YouTube ids. Every video page would have gone blank the moment `sync:youtube` wrote real ids. | ✅ **FIXED** — `frame-src` added, and switched to `youtube-nocookie` (no tracking cookies until the user presses play). |
| 10 | No `/research`, no `/sources` hub. | §10.4 — the only durable backlink asset. | 🟡 **OPEN (P2)** |
| 11 | **No credentialed human reviewer.** `editorial.ts` holds two *entities*, not two *people*; Article schema emits `author`/`reviewedBy` as `Organization`. | 🔴 **The largest remaining trust gap, and the only one code cannot close.** One named CFP® with a `sameAs` link is worth more than every schema change in this branch combined. | 🔴 **OPEN — needs a human, longest lead time.** |

💭 **Two things the audit got wrong, corrected by implementation:**

- **The Checkup was already fully client-side.** `runRetirementCheckup` runs in a `useMemo`; ages, balances, and debts never leave the browser. Only the email and a generic verdict sentence are ever sent. §9.2's hardening was therefore *already true* — the privacy exposure was much smaller than the audit assumed.
- **The Checkup already respected the advice line.** No asset allocation, no named securities; every "next step" is an internal tool link. §9.3 was already satisfied. It is now *enforced* by a test that fails if anyone adds allocation language.

⚠️ **Three things still require a human and cannot be coded:** run `supabase/migrations/2026-07-11_leads.sql` on the live project; set the four Resend env vars (the sender **refuses to fire** without a postal address, because sending without one is unlawful); enable Analytics + Speed Insights in the Vercel dashboard.

---

## 3. The network plan: the honest argument against it

The previous draft opens by declaring Know Plain should become a **ten-channel decision-media network** — money, AI, psychology, tax, security, insurance, legal, longevity, trends — with a 12-month roadmap launching seven of them.

💭 **I think this is the single biggest risk in the document, and I want to make the case against it properly rather than on taste.**

**First, kill a bad argument.** It is tempting to say "Google penalizes unfocused sites." **It does not.** There is no topical-authority ranking factor; Google's "topic authority" system is news-specific, and Mueller has said plainly there is no site-wide authority score. And **site reputation abuse — which people reach for here — is about hosting *third-party* content on your domain**, not about a publisher expanding its own coverage. If you argue against the network on those grounds you will be arguing from a myth, and you will lose the argument to the next person who checks.

**Now the argument that actually holds.** Four things, in order of force:

**3.1 The compliance surface multiplies, and it is not shared.** The plan's own risk table rates Tax Plain, Coverage Lab, Legal Lens, and Longevity Lab as **"Very High"** risk. That is correct, and it is disqualifying at current capacity. Each of those verticals needs its *own* credentialed reviewer — a CPA will not review a Medicare page, a CFP will not review a will, and nobody sane reviews longevity claims without a physician. The plan's "shared trust infrastructure" moat is real for *templates* and *schema*. It is worth **zero** for *review capacity*, which is the binding constraint. You cannot amortize a CPA across a cybersecurity article.

**3.2 A single editorial entity claiming expertise in nine unrelated YMYL fields is a negative trust signal.** Retirement content is **"YMYL Financial Security"** in the Quality Rater Guidelines and gets "the most scrutiny for Page Quality rating." Raters do off-site reputation research and apply a Who/How/Why test. "Know Plain Editorial," author of both *Roth conversion strategy* and *how to spot phishing* and *which longevity claims are real*, does not survive that test — not because of a topic rule, but because **no reader believes it, and raters are instructed to model readers.** Today you have **two** editorial entities (`know-plain-editorial`, `retirement-review-board`) covering **one** vertical — and they are *entities*, not credentialed people. Every article now cites them, but "Know Plain Editorial" is not a person a rater can look up. Breadth is not the problem to solve; **a name is.**

**3.3 The real Google policy risk is *scaled content abuse*, and the plan walks into it.** Google's spam policy defines this as generating many pages "primarily to manipulate rankings and not help users," explicitly including AI-assisted mass production. A solo operator publishing **100 evergreen assets across 7 verticals in 12 months**, each requiring a source pack and a reviewer, will either miss the deadline or hit it by producing exactly the kind of thin, unreviewed, AI-assisted corpus the policy names. The plan's own quality bar and its own volume target are in direct conflict, and volume usually wins.

**3.4 It contradicts the strongest finding in the research.** Post-AI-Overviews, **the article corpus is the cost center and the tools are the asset** (§4, §12). The network plan is a plan to build *nine more article corpora*. It scales the thing that is depreciating and dilutes the thing that isn't.

**What I recommend instead:**

> **Take Money Made Simple to a proven, monetized, trusted state on one vertical before opening a second. Keep the network as an *option*, not a *roadmap*.**

The Phase-0 shared foundation is genuinely good architecture — build it, because it costs almost nothing extra and it makes channel #2 cheap *if it is ever justified*. The `ChannelId` union type, the shared schema helpers, and the taxonomy are all fine. **Just don't launch on them.** The gate for opening a second vertical should be explicit and numeric:

**Open channel #2 only when Money Made Simple has:** (a) a credentialed reviewer on every high-risk page, (b) ≥$3,000/mo in revenue, (c) ≥25k pageviews/mo, and (d) the P0 list in §2 closed. If those four are not true, a second channel does not make the first one better — it makes it later.

The one exception worth arguing about: **Tax Plain has genuine synergy** with retirement (brackets, RMDs, Roth, IRMAA, the senior deduction) and shares a reviewer type (CPA/EA). If any channel goes second, it's that one — and even then, only after the gate.

If you keep the full network plan anyway, that's a legitimate call and I'll build to it — but make it with §3.1 and §3.3 in front of you, not around them.

**3.5 Do not build yet.** These are explicit guardrails, not vague preferences:

| Do not build | Until |
|---|---|
| Tax Plain as a standalone vertical | Money Made Simple P0s are closed and a CPA/EA reviewer is available |
| Coverage Lab lead generation | Privacy, consent, partner-quality, and compliance review are complete |
| Legal Lens | A legal reviewer and jurisdiction policy exist |
| Longevity Lab | Medical review and evidence-grading policy exist |
| Advisor matching / advisor lead-gen | A lawyer designs the promoter, privacy, Safeguards Rule, and ranking-disclosure workflow |
| Broad article sprint across channels | Analytics, source workflow, and reviewer workflow are proven in Money Made Simple |
| "Best tools" rankings involving owned products | Ownership and compensation disclosure components are built and visible |

---

## 4. The 2026 operating environment

This section did not exist in the previous draft and it should determine everything downstream.

**4.1 The click-through bet has partly failed, precisely for this content.** ✅ Pew Research (published 2025-07-22; 900 US adults, 68,879 real Google searches collected March 2025):

- Users clicked a traditional result on **8%** of searches with an AI summary vs **15%** without.
- They clicked a link *inside* the AI summary **1%** of the time.
- They **ended the session entirely** 26% of the time with an AI summary, vs 16% without.
- AI summaries appeared on 18% of all searches — **but on 60% of question-formatted searches.**

💭 That last line is the one that should change your plan. *"How much do I need to retire?"* and *"When should I claim Social Security?"* are question-formatted informational queries. **Your entire article corpus lives in the 60% bucket.** Corroborating: Ahrefs finds position-1 CTR down 34.5% on AIO queries (rising to 58% by Dec 2025); Seer finds informational CTR down ~61%.

**4.2 What Google actually says about getting cited by AI.** ✅ Google shipped a dedicated doc in May 2026 ([AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)). It is unusually blunt, and it demolishes most of the advice being sold right now:

> "You don't need to create new machine readable files, AI text files, markup, or Markdown to appear in Google Search (including its generative AI capabilities), as Google Search itself doesn't use them."

On **llms.txt**: creating one "will neither harm nor help your site's visibility or rankings in Google Search, as Google Search ignores them." On **schema**: "Structured data isn't required for generative AI search, and there's no special schema.org markup you need to add." On **chunking**: "There's no requirement to break your content into tiny pieces."

Google's own myth list: llms.txt, chunking, rewriting for AI, seeking inauthentic mentions, and **overfocusing on structured data**. The only stated eligibility bar is: **indexed and snippet-eligible**.

The best available evidence agrees. ✅ Ahrefs ran the only quasi-causal study in the corpus (1,885 pages adding JSON-LD vs 4,000 matched controls, difference-in-differences, Aug 2025–Mar 2026): **AI Overview citations −4.6%, AI Mode +2.4%, ChatGPT +2.2%.** Schema had **no clear positive effect on AI citation.** Meanwhile ~99% of AI Overview citations come from URLs already in the organic top 10 (seoClarity), and 87% of ChatGPT citations match Bing's top results (Seer).

💭 **Translation: there is no AEO/GEO trick. Rank, and be worth citing.** Every hour spent on "AI optimization" schema is an hour not spent on the thing that actually gets cited.

**4.3 What survives.** An AI Overview can summarize your explanation of the 4% rule. It **cannot run your simulator on the user's numbers.** Three things a summarizer structurally cannot replace:

1. **Interactive artifacts** — calculators, the checkup, the simulator.
2. **Proprietary data** — original research, your own aggregate usage data.
3. **Community and identity** — the forum, the email list, the YouTube audience.

**This is the strategic core of the whole document.** Everything in §8–§10 is ordered by it.

---

## 5. Positioning

Unchanged from the previous draft, because it was right. Restated tightly:

> **Know where you stand, understand the tradeoffs, and take the next plain step.**

**Primary audience:** 45–62, feels behind, has partial savings and no coherent plan, searches specific fearful questions. **Emotional wedge:** *"Late, anxious, confused — but fixable."*

**The 2026-specific wedge, which is new and urgent:** ⚠️ **the 60–64 income-management years.** Because the ACA subsidy cliff came back (§1.1), a household one dollar over 400% FPL loses *all* premium tax credit. For a 60-year-old that is worth **$10,389/year**. This single fact ties together Roth conversions, capital-gains harvesting, withdrawal sequencing, and retirement timing — and it makes *"should I do a Roth conversion this year?"* a question that can cost five figures if answered casually.

💭 Nobody plain-English owns this yet, it is the most consequential retirement decision of 2026, and it is exactly the kind of question an AI Overview answers badly because the answer depends entirely on the user's own numbers. **This is the flagship.**

**Still avoid:** the "best credit cards" affiliate treadmill · head-term investing encyclopedia · generic FIRE · political Social Security speculation · anything resembling personalized investment advice (§11).

---

## 6. The trust layer

The bar, stated correctly (the previous draft's framing of this was stale — see §1.7):

✅ Google's guidance: **"Trust is the most important member of the E-E-A-T family… untrustworthy pages have low E-E-A-T no matter how Experienced, Expert, or Authoritative they may seem."** But **E-E-A-T is not a ranking factor** — it is a rater framework. Build for it because it earns human trust and raters model humans, **not** because it is a lever. Current Quality Rater Guidelines: **2025-09-11**. Retirement content is **YMYL Financial Security** — highest scrutiny tier.

**6.1 The work that matters, in order.**

1. ✅ **Close the frontmatter gap.** DONE — **21/21** articles now carry author, sources, dates and risk level.
2. 🔴 **Get one real credentialed reviewer. This is now the only thing left, and it is the whole ballgame.** `src/lib/editorial.ts` has two *entities* — `know-plain-editorial` and `retirement-review-board` — not two *people*. Article schema therefore emits `author` and `reviewedBy` as `Organization`. For YMYL finance, **a named human with a verifiable credential and a `sameAs` link to a CFP Board / AICPA profile is worth more than every schema change in this document combined.** One CFP® reviewing the high-risk pages does the heavy lifting. Everything else in this guide is now built; this is not.
3. **Visible byline > markup.** "Written by X · Reviewed by Y, CFP® · Updated Jul 10, 2026" on the page. `reviewedBy` in JSON-LD is fine to keep, but it does nothing for Google (§1.6). Note this cannot be honestly written until item 2 is done — inventing a byline would be worse than having none.
4. **Honest dates.** `published` set once and never bumped; `dateModified` moved **only** on substantive revision. Faking freshness is a trust risk, and it's the one form of SEO manipulation that a corrections-policy site cannot survive being caught doing.
5. **Corrections that are visible.** `/corrections` exists. Use it — a visible correction note on a revised article is a stronger trust signal than any badge.

**6.2 What to stop doing.** Delete `faqJsonLd()` (dead, §1.3). Drop `SearchAction` (dead, §1.4). Drop `webApplicationJsonLd()` from tool pages (earns nothing, §1.5). `DefinedTermSet` on the glossary produces no rich result — harmless, low priority to remove.

---

## 7. `facts-2026.ts` — the single source of truth

✅ **This module is the best thing in the repo.** Keep the discipline absolutely: every number on the site and in every calculator reads from here, cited once, updated once per tax year.

**What to add** (all verified — see Appendix A for sources):

```ts
// Missing from the current module:
TAX_2026 = {
  standardDeduction: { single: 16_100, mfj: 32_200, hoh: 24_150 },
  additionalAge65: { married: 1_650, unmarried: 2_050 },
  // OBBBA senior deduction — ⚠️ EXPIRES after 2028
  seniorDeduction: {
    perPerson65Plus: 6_000,
    phaseOutStart: { single: 75_000, mfj: 150_000 },
    phaseOutRate: 0.06,          // 6% of MAGI over the threshold
    fullyPhasedOut: { single: 175_000, mfj: 250_000 },
    yearsApplicable: [2025, 2026, 2027, 2028],
  },
  ltcgZeroBracket: { single: 49_450, mfj: 98_900, hoh: 66_200 },
  // brackets: see Appendix A
}
CONTRIBUTION_2026.total415c = 72_000        // mega-backdoor headroom
CONTRIBUTION_2026.rothIraPhaseOut = { single: [153_000, 168_000], mfj: [242_000, 252_000] }
CONTRIBUTION_2026.qcdLimit = 111_000
MEDICARE_2026.partADeductible = 1_736
MEDICARE_2026.partDOopCap = 2_100           // changed from $2,000
MEDICARE_2026.partDMaxDeductible = 615
SOCIAL_SECURITY_2026.benefitTaxThresholds = { single: 25_000, joint: 32_000 }  // ✅ NOT indexed — unchanged since 1984/1993
```

**Three notes on the existing module:**

- `SWR.morningstar2026` is mislabeled. The figure (3.9%) is from the **2025 Edition**, published 2025-12-03, and it applies *to* retirements starting in 2026. Rename to make the report edition explicit — on a source-discipline site, the label *is* the product.
- `FPL_2025` is correct ($15,650 + $5,500/person, 48 states), and `acaSubsidyCliffMagi()` correctly yields **$62,600** for a single — matching KFF's published figure. Good.
- ⚠️ Add an **`ACA_2026.lastVerified` date and a named owner.** This is the one constant in the codebase that can change by act of Congress, retroactively, and silently make the flagship calculator wrong.

**7.1 Source-volatility register.** Put this table in the project tracker and assign real owners before launch.

| Fact area | Why volatile | Cadence | Owner | Next check |
|---|---|---:|---|---|
| ACA enhanced subsidy / 400% FPL cliff | Congress can extend or modify subsidies mid-cycle | Weekly until resolved, then monthly | Editorial lead | Every Monday |
| HHS poverty guidelines | Annual update affects ACA FPL math | Annual + before ACA publish | Editorial lead | January release |
| IRS annual limits | Contribution limits, brackets, standard deduction, phaseouts change yearly | Annual + before tax article publish | Tax reviewer | IRS fall release |
| SECURE 2.0 catch-up implementation | Regulatory mechanics and transition relief can change | Quarterly in 2026 | Tax reviewer | Calendar quarter |
| SSA COLA, wage base, earnings test | Annual SSA release | Annual | Editorial lead | October release |
| Medicare premiums, deductibles, IRMAA | Annual CMS release; high impact on retirees | Annual + before Medicare publish | Coverage reviewer | CMS fall release |
| FTC civil penalties / endorsement guidance | Penalties adjust and enforcement examples evolve | Semiannual | Compliance owner | Jan / Jul |
| Google structured-data support | Supported rich-result types change | Quarterly | SEO owner | Calendar quarter |
| Search/AI click-through studies | Vendor/institutional data changes quickly | Quarterly | Growth owner | Calendar quarter |

---

## 8. The tools — this is the product

💭 §4.3 says the tools are the asset and the ACA cliff (§5) is the 2026 wedge, so the four highest-value tools were built first. **All four Tier-1 tools now ship.** Status as of 2026-07-11:

| Tool | Status | What it does that competitors don't |
|---|---|---|
| **⭐ ACA Bridge / Cliff Warner** | ✅ **SHIPPED** `/tools/aca-bridge` | Shows **dollars of MAGI headroom to the 400% cliff** and both scenarios (current law vs restored credits), with a visible "verified on" date. ✅ **ACA MAGI includes ALL Social Security benefits** (not just the taxable part), traditional withdrawals, **Roth conversions**, capital gains, pensions, tax-exempt interest. **Roth withdrawals do not count** — getting this definition wrong is the whole ballgame. |
| **Roth Conversion Cost Checker** | ✅ **SHIPPED** `/tools/roth-vs-traditional` | **The one nobody else has built.** Every Roth calculator stops at the income tax; before 65 that is the *smaller* number. Prices the tax, the ACA cliff, and IRMAA together. A 61-year-old on $55k converting $15k pays $2,150 in tax — and burns $7,600 of cliff headroom. Names the largest conversion that stays under. |
| **Sequence-risk stress test** | ✅ **REBUILT** `/tools/sequence-risk` | Was a lie: it multiplied a balance by a rate and did **no sequencing at all**. Now runs one multiset of returns in two orders. Same average, one retiree broke in year 18, the other with $909,828. Falsifiable on the page: set withdrawals to 0 and both orders land on the same number. |
| **Social Security break-even** | ✅ SHIPPED | Math verified: claim at 62 with FRA 67 = **70% of PIA**; 70 = **124%**. Break-even ≈ **78–79** (62 vs FRA) and **~82–83** (FRA vs 70). The page says plainly that break-even is an **incomplete frame** — health, survivor benefits, taxes and cash-flow need dominate it. |
| **Catch-up planner** | ✅ **REBUILT** `/tools/catch-up-contributions` | Was giving **illegal advice**: blind to age and wages, so it never showed the 60–63 super catch-up and would suggest a pre-tax catch-up the law no longer permits. Now models the **$150,000 mandatory-Roth rule** and the age-64 drop back. |
| Am I On Track · Retirement Age Tradeoff | ✅ shipped | Honest, but thin — they lean on the checkup engine rather than doing anything of their own. |
| **Inflation-adjusted spending** | 🟡 **TOY** | Two boxes, one multiplication. It does not lie — it does exactly what it says — so it is low priority. But it is not a moat. |
| Debt vs Investing | 🔴 not built | The last Tier-2 gap. |

💭 **The rule this list enforces:** a tool may be simple, but it must never promise more than it does. Two of the eight were quietly lying about their own function; both are now rebuilt with tests that fail if the behaviour regresses.

**8.1 The withdrawal-rate problem — get this right or don't ship the number.**

The previous draft said "3.5%–4.5%." Defensible as a band; indefensible as a bare number, because the two credible anchors **answer different questions**:

| Anchor | Number | What it actually asks |
|---|---|---|
| **Morningstar, 2025 Edition** (pub. 2025-12-03) | **3.9%** | *Forward-looking.* Given today's yields and valuations, what starting rate survives **90% of simulated 30-year futures** with a 30–50% equity portfolio and rigid inflation-adjusted spending? |
| **Bengen, *A Richer Retirement*** (Wiley, Aug 2025) | **4.7%** | *Backward-looking.* What is the highest rate that survived the **single worst 30-year start in US history**, for a 7-asset-class portfolio with a small/micro-cap tilt? A **floor**, not a target. |

They are not in conflict and **cannot be averaged.** History: 2021 3.3% → 2022 3.8% → 2023 4.0% → 2024 3.7% → **2025 3.9%**.

**Required copy** (this is the kind of honesty that is the entire brand):

> *"There is no single safe withdrawal rate. Morningstar's forward-looking research says 3.9% for a rigid, inflation-adjusted paycheck at 90% confidence over 30 years. Bengen's historical worst case, with a more aggressive portfolio, says 4.7%. Both are defensible. The gap is the method, not a disagreement about arithmetic."*

And name the real lever: **flexibility**. ✅ Morningstar's own variants score far higher when spending can flex (an RMD-style recalculated withdrawal reached ~4.7% in the 2024 edition; retirees tolerating real fluctuation can start near 6%). ✅ Guyton–Klinger (JFP, 2006) supported **5.2%–5.6%** initial rates with decision rules — though ⚠️ **Kitces argues those guardrails are riskier than advertised**; say so rather than selling them. **Frame the static rate as the price of refusing to be flexible.**

**8.2 Tool acceptance criteria** (revised): every tool shows assumptions **before** results · states its method and limits (§11.1) · has a companion explainer · ends with a next step · reads every constant from `facts-2026.ts` · **and emits no `SoftwareApplication` schema** (§1.5).

---

## 9. The Retirement Checkup

Keep the design in the previous draft — the flow, the ten numbers, the Plain Scores, the "ranges not false precision" rule are all good, and `src/lib/checkup.ts` already implements a version of it. **Three changes:**

**9.1 Fix the lead capture (P0).** `captureCheckupLead` writes to a table that doesn't exist, swallows the error, and returns `{ ok: true }`. Users are told their results were emailed. They weren't. **Either create `knowplain_leads` + wire an ESP, or remove the promise from the UI.** Shipping a trust site with a lying success message is not a tradeoff, it's a defect.

**9.2 Compute client-side; do not persist the financial inputs (P1).** 💭 This is the highest-leverage, zero-cost decision in the entire document. If age, income, savings, and debt never reach a server, most of §11.3 evaporates. Gate *saving*, not *seeing*. If you must persist: minimize, encrypt, short TTL, and don't join to email identity unless the user explicitly asks.

**9.3 Constrain the output (P0 — legal).** See §11.1. The Checkup must **never** emit an asset allocation, a named fund or security, or a model portfolio. "Top 3 next steps" must stay on non-securities levers: savings rate, spending, debt order, emergency fund, claiming age, Medicare/IRMAA timing, HSA, and tax-wrapper choice. **This is the bright line that keeps the entire site outside the Investment Advisers Act.**

---

## 10. Content system

**10.1 Decision pages.** Template unchanged from the previous draft (it's good) with **one deletion: no FAQPage schema** (§1.3). Keep the visible "Common questions" block — for humans, and because it's plainly what LLMs extract. Just don't wire markup for a rich result that no longer exists.

**10.2 Forum.** Invite-only first, moderation before schema. ✅ Two corrections to the schema plan:
- **`DiscussionForumPosting` is for user-generated posts only.** Never apply it to your own editorial content.
- **`QAPage` requires that users can actually submit answers.** Your 9 seeded, staff-answered `/forum/questions/*` pages **do not qualify** and currently emit `qaPageJsonLd`. Either open them to user answers or drop the markup. This is a real misapplication shipping today.

**10.3 Video.** ✅ `VideoObject` is one of the few schema types here that still earns a live rich result (required: `name`, `thumbnailUrl`, `uploadDate`). Fallbacks and transcripts already exist. 💭 And per §4.3, **retirement YouTube is a large, high-CPM audience Google has not disintermediated** — it deserves more weight than the previous draft gave it.

**10.4 Original research.** The only durable backlink asset. Start with **what only you have: your own tools' aggregate, anonymized usage.** *"What withdrawal rate do people actually model?"* / *"What retirement age do our users target vs. what their numbers support?"* Publish method before conclusions.

⚠️ **Do not build `/sources/scf-retirement-savings` as specified.** The 2022 SCF is still the latest wave (no 2025 release date announced), and the age-band balance table everyone quotes traces to secondary aggregators, not Fed primary docs. If you publish SCF data, pull it from the Fed's own interactive table and **state that balances are conditional on having an account — only 54.3% of families do.** The unconditional median in several age bands is likely **$0**. Saying so, when nobody else does, *is* the brand.

---

## 11. Compliance and risk

This chapter did not exist in the previous draft. It is the one most likely to save you.

**11.1 The securities line — and a correction to how people usually frame it.**

The instinct is to lean on the **publisher's exclusion** (Advisers Act §202(a)(11)(D); *Lowe v. SEC*, 472 U.S. 181 (1985)). 💭 **For the Checkup, that's the wrong shield** — an individualized output is not a "publication of general and regular circulation," so the exclusion doesn't cover it.

**But that doesn't make you an adviser.** The definition requires three elements: **(a) advice about securities, (b) for compensation, (c) as a business.** Your defense is that **element (a) never attaches.** Retirement readiness, savings gaps, spending, debt, and Social Security claiming are not advice about the value or advisability of securities. Keep it that way and the Act never reaches you.

✅ **The bright lines** (SEC Release IA-1092 treats asset-allocation advice as securities advice, because it necessarily directs the user into securities):

| Rule | Status |
|---|---|
| **No asset allocation output.** Not "60/40," not "increase equity exposure," not risk-tolerance-driven mixes. | **The brightest line. Never cross it.** |
| **No named securities, funds, ETFs, or model portfolios** anywhere. | Hard rule |
| **No compensation tied to a securities outcome** (see 11.2) | Hard rule |
| Frame as "educational estimate" — never "plan," "recommendation," "advice," or "advisor" | Hard rule |
| Adopt **FINRA Rule 2214**-style disclosure voluntarily: criteria, methodology, **key assumptions and limitations**, results vary, projections are **hypothetical, not guarantees** | Not binding on you — but it is the only regulator-blessed template for exactly this artifact, and it's the standard you'd be measured against |

**Disclaimers that work vs. theater.** ✅ *Work* (because they describe reality or defeat an element): methodology + assumptions + limitations; "hypothetical, not a guarantee"; material-connection disclosure; "we recommend no securities and take no compensation from any securities issuer or adviser" — **if true**. 🚫 *Theater*: "this is not investment advice" pasted under content that **is** individualized securities advice. Substance governs form (*SEC v. Park*; *SEC v. Wall Street Publishing*). A disclaimer that contradicts the conduct is evidence, not a defense.

**Never use the words** "financial planner," "financial advisor," "advisory," or "personalized plan" in a product name, page title, or meta description. Title risk is self-inflicted and free to avoid.

**11.1.1 Implementation rules we can act on.**

These rules are the product spec. If a proposed feature violates them, it does not ship without legal review.

| Rule | Product implication |
|---|---|
| No asset allocation output | Tools may show savings gaps, withdrawal pressure, MAGI headroom, claiming-age tradeoffs, and cash-flow ranges; they may not output "60/40," "more stocks," "less bonds," or risk-based model mixes |
| No named securities, funds, ETFs, or model portfolios | Content can explain account types and concepts; it cannot recommend ticker symbols, funds, portfolios, or broker-specific allocations |
| No advisor matching | The Checkup can say "talk to a qualified professional"; it cannot rank, match, or route users to paid advisers |
| No "personalized plan" language | Use "educational estimate," "snapshot," "worksheet," "scenario," or "next questions" |
| Show assumptions before results | Every calculator result screen must expose return, inflation, tax, health-cost, withdrawal, and date assumptions relevant to that tool |
| Client-side by default | Users can see results without sending age, income, balances, or debt to the server |
| Save only by explicit opt-in | If saving is added, explain exactly what is stored, how long, and how to delete it |
| Disclose monetization beside the endorsement | Affiliate/sponsor language must appear before or at the relevant link, not only in the footer |

**11.2 The lead-gen decision — pick a lane deliberately.**

💭 This is the most consequential strategic choice in the document and it deserves to be made on purpose.

Advisor lead-gen is the **highest revenue per visitor** in this niche (§12) and it is **the one thing that could unmake the entire legal structure.** The moment an RIA pays you per lead from the Checkup:

1. Element **(b) compensation** is satisfied — and it's now tied to a securities advisory outcome.
2. Your tool "recommends" (by selection and ordering) an entity that manages securities. The "no securities advice" claim gets much harder to sustain.
3. You become a **promoter** under **SEC Marketing Rule 206(4)-1** (compliance date 2022-11-04): the endorsement must disclose, *at the time of the endorsement*, that you're compensated and the **material conflicts** arising from it, plus a written agreement and adviser oversight.
4. ⚠️ You likely become a **"finder"** under the FTC's amended **Safeguards Rule (16 CFR 314)** — which would impose a written infosec program, a Qualified Individual, MFA, **encryption at rest and in transit**, and annual reporting, **over a database of consumers' retirement balances.** I could not find an FTC case applying "finder" to an advisor-matching site, so this is uncertain — but the exposure is asymmetric and the downside is a breach of exactly the data you'd least want breached.
5. **LendEDU governs the match page.** ✅ *In re Shop Tutors (LendEDU)*, FTC Docket C-4719 (2020): a financial comparison site marketed rankings as "objective" and "unbiased" while selling placement. **This is your case.** Never write "objective," "unbiased," or "independent rankings" if compensation influences inclusion or ordering.

> **Choose: be a clean publisher (display + affiliate + newsletter + products), or be a lead-gen business and lawyer it properly before launch. The worst available outcome is doing lead-gen casually.**

**11.3 Privacy — cheaper than you think, if you design for it.**

✅ **Good news, twice over.** Income, savings, and debt are **not** "sensitive personal information" under CPRA — §1798.140(ae) enumerates exhaustively and they aren't on the list. And CCPA's 100,000-consumer prong is **"buys, sells, or shares"**, *not* "collects" — so merely collecting from many users doesn't make you a "business."

⚠️ **But:** running Google Ads or a Meta pixel for cross-context behavioral advertising **is "sharing."** Your ad stack, not your calculator, is what drags you into CCPA.

**Do these regardless of thresholds** (all cheap):
1. **Don't sell data. Ever. Say so.**
2. **Compute the Checkup client-side and don't persist financial inputs** (§9.2). This is the whole ballgame.
3. **Honor Global Privacy Control unconditionally.** ✅ Mandatory in ~12 states (CA, CO since 2024-07-01, CT, TX since 2025-01-01, and more). Read `Sec-GPC: 1` and `navigator.globalPrivacyControl`; suppress ad-tech identifiers; log it. ⚠️ Updated California regs effective 2026-01-01 require **visibly indicating the signal was processed** ("Opt-Out Request Honored") — verify the final CPPA text before building the UI.
   - ✅ The cautionary tale is directly on point: **Healthline — $1.55M, CA AG, July 2025**, the largest CCPA settlement, against a **health-adjacent content publisher**, for opt-outs that didn't propagate to ad/analytics partners.
4. **Honor access/delete/correct for everyone, regardless of state.** Cheaper than state-by-state logic.

**11.4 FTC / affiliate disclosure — one concrete fix.**

✅ The 2023 Endorsement Guides require disclosure that is "**difficult to miss… and easily understandable by ordinary consumers**," **unavoidable** on interactive media, and **not contradicted**. Footer-only or a standalone disclosure page is **not sufficient**. The FTC's own FAQ says labeling something merely **"affiliate link" may not be understood** by ordinary consumers; "we may earn a commission if you buy through links on this page" **is** adequate — *if placed at the same time and place as the endorsement*.

**Your `/tools` page is close but not there.** It has a per-link "Affiliate" badge and an "Affiliate links disclosed" line above the first link — better than most. But *"Affiliate links disclosed"* is exactly the kind of jargon the FTC FAQ singles out. **Change it to plain language above the first link:** *"We may earn a commission if you sign up through these links. It costs you nothing extra."* Keep `/disclosure` as a supplement, never a substitute.

✅ Also live: the **Consumer Reviews and Testimonials Rule** (16 CFR 465, effective 2024-10-21) — a binding rule with civil penalties, not a guide. It bans fake reviews, sentiment-conditioned incentives, undisclosed insider reviews, and **company-controlled review sites that misrepresent independence**. 💭 The provision that bites *you*: **the moment you rank your own Checkup or course in a "best tools" roundup, you must disclose ownership.** And once the forum hosts user comments on tools, all of Part 465 attaches.

**11.5 Email.** ✅ CAN-SPAM: valid physical postal address, working opt-out honored within 10 business days, no deceptive subjects. Penalty up to **$53,088 per email**. 💭 A "here are your results" email leans transactional — but the instant it carries an affiliate link it becomes commercial. Treat every email as commercial; it costs nothing. ✅ Deliverability is functionally binding: Google/Yahoo bulk-sender rules (5,000+/day) require **SPF + DKIM + DMARC**, **RFC 8058 one-click unsubscribe**, and a spam rate **below 0.30%** (target <0.10%).

---

## 12. Monetization — honest numbers

The previous draft listed a revenue ladder with no figures and ranked **Coverage Lab #1**. 💭 That ranking is revenue-per-visitor thinking that ignores compliance cost and time-to-first-dollar. Here is what the research actually supports.

**12.1 Entry thresholds** ✅ Journey by Mediavine: **1,000 sessions/mo**. Mediavine (full): **$5,000+ annual ad revenue** to apply. Raptive: **25,000 pageviews/mo** (lowered Oct 2025).

**12.2 Realistic RPM.** ⚠️ Publisher-reported finance RPMs ($35–48) are self-selected survivors. 💭 **Plan on $15–25 session RPM for a new US retirement site, not $45.** And note the headwind: brands are reported cutting open-web display spend 20–30% in response to AI search. Today's RPM is likely the ceiling, not the floor.

**12.3 What actually pays, ranked for *this* audience** 💭:

1. **Advisor lead-gen** — highest revenue/visitor (publisher side ~**$70/lead**; advisors pay $30–$250+). **And the highest risk — see §11.2.**
2. **Medicare** ($30–140 CPL) — violently seasonal (AEP: Oct 15 – Dec 7).
3. **Tax software** (TurboTax ~15%; H&R Block 3.2–9.6%) — seasonal (Jan–Apr).
4. **Estate planning** (Trust & Will ~20%, ~$80/sale).
5. **Newsletter sponsorship** — finance is a premium vertical at **$50–100+ CPM direct**. 💭 But do the arithmetic: 10,000 subs × 45% open × 4 sends = 18,000 opens/mo ≈ **$720/mo at $40 CPM.** Meaningful only above ~5–10k engaged subscribers, and only with direct sales.
6. **Robo-advisor affiliate — a trap.** Low payout, long funnel, and it is *precisely* the category that endangers your securities posture (§11.1). Skip.

**12.4 The honest timeline** 💭 (derived from the thresholds above):

- **Months 0–6:** ~zero. Indexing and trust; no rankings on anything competitive.
- **Months 6–12:** long-tail trickle; still below the 25k pv/mo display floor.
- **Months 12–18:** *if it goes well* — 25–60k pv/mo, Raptive-eligible, **$400–1,200/mo**.
- **Months 18–30:** *if it goes well* — 100k+ pv/mo, **$2–5k/mo**.
- **Probability-weighted: a material fraction of new YMYL finance sites never clear month 12.** You are competing against NerdWallet, Fidelity, Schwab, and SSA.gov in the most E-E-A-T-gated vertical in Google — and per §4.1, the prize at the end shrank by roughly half.

💭 **None of this says don't build it. It says: the tools, the email list, and YouTube are the business; the article corpus is table stakes. Budget accordingly, and don't set a 12-month revenue expectation that the data says is a coin flip.**

---

## 13. Technical spec

**13.1 Schema map — corrected.**

| Page | Emit | Notes |
|---|---|---|
| Home | `Organization`, `WebSite` | ✅ `WebSite` **for the site-name feature only**. ❌ Drop `SearchAction` (dead 2024-11-21). |
| Article / decision | `Article`, `BreadcrumbList` | ✅ Author as `Person` with `url`/`sameAs`. ❌ **No `FAQPage`** (dead 2026-05-07). Article yields no dedicated rich result — it's a page-understanding signal. |
| Author / reviewer | `ProfilePage` + `Person` | ✅ Live and correct. `sameAs` is the highest-value property. |
| Tool | `BreadcrumbList` only | ❌ Drop `WebApplication` — earns nothing without `offers` + `aggregateRating` (§1.5). |
| Video | `VideoObject` (+ `Clip`) | ✅ Live rich result. Required: `name`, `thumbnailUrl`, `uploadDate`. |
| Forum thread | `DiscussionForumPosting` | ✅ **User-generated posts only.** Never editorial content. |
| Seeded Q&A | *(none, currently wrong)* | ❌ `QAPage` requires users be able to **submit answers**. The 9 staff-answered pages don't qualify but emit it today. Fix. |
| Glossary | `DefinedTermSet` | ⚪ No rich result. Harmless. Low priority. |

**13.2 Indexing.** Index: articles, decisions, tools, glossary, research, curated Q&A. **Noindex: `/search` (done), `/profile` and `/login` (NOT done — fix), unapproved forum threads, and `/forum/[id]` until moderation is real.**

**13.3 Core Web Vitals.** ✅ LCP ≤ **2.5s**, **INP ≤ 200ms** (replaced FID in March 2024), CLS ≤ **0.1**, all at p75.

**13.4 Analytics (P0).** There is none, and the CSP would block it. Nothing in §15 is measurable until this ships. 💭 Pick a first-party or CSP-compatible option; keep GPC honoring (§11.3) wired from day one rather than retrofitted.

---

## 14. Roadmap

Revised: **one vertical, done properly.** The previous draft's 12-month, 7-channel plan is replaced (§3).

**✅ DONE (2026-07-11).** Everything the original Weeks 1–10 plan called for, plus four defects the plan didn't know about:

1. ✅ `captureCheckupLead` no longer lies. Table created, errors surfaced, Resend wired, and `sent` reported separately from `saved` so the UI can only claim what actually happened.
2. ✅ Trust frontmatter on **21/21** articles.
3. ✅ Analytics shipped, with the CSP opened so it actually reports.
4. ✅ Checkup output constrained — and the constraint is now enforced by a test.
5. ✅ Affiliate disclosure made FTC-adequate; `noindex` on `/profile`, `/login`, `/forum/[id]`.
6. ✅ **ACA Bridge** — the flagship, both scenarios, cited, dated.
7. ✅ `facts-2026.ts` extended: OBBBA senior deduction, 2026 brackets, Part D cap, 415(c), Roth phase-outs, QCD, IRMAA tiers.
8. ✅ Checkup was *already* client-side (the audit was wrong).
9. ✅ Dead schema deleted; `QAPage` misapplication fixed.
10. ✅ **Sequence-risk stress test rebuilt** (it did no sequencing) and **catch-up planner rebuilt** (it gave illegal advice).
11. ✅ **Roth Conversion Cost Checker** built — tax + ACA cliff + IRMAA in one place. The tool nobody else has.
12. ✅ Fixed a latent bug the plan missed entirely: **the CSP was blocking every YouTube embed.**

**🔴 NEXT — needs a human, not code.**
13. **Recruit one credentialed reviewer.** ⚠️ This is now the single highest-value item on the list and the longest lead time. Everything else is done; this is the gap. See §2, row 11.
14. Run the leads migration, set the Resend env vars, enable Analytics in Vercel.

**Then — compounding assets.**
15. First original research piece from **your own aggregate usage data** (§10.4). You now have analytics and four real tools generating it.
16. Video depth + embedded calculators. 💭 Give YouTube real weight — it's the channel AI hasn't disintermediated, and the embeds now actually render.
17. `/sources` and `/research` hubs; Debt-vs-Investing tool; upgrade the inflation toy.

**Always on.** Update `facts-2026.ts` at each IRS/SSA/CMS release. ⚠️ **Watch the ACA subsidy legislation and update the flagship calculator the day statute changes.** Assign that to a named human.

**The gate for a second vertical:** credentialed reviewer on every high-risk page · ≥$3,000/mo revenue · ≥25k pv/mo · P0 list closed. Not before.

**14.1 Implementation backlog.** The P0/P1 engineering list is **closed** — see §2 and §8 for what shipped. What remains:

| Priority | Task | Blocked on | Acceptance criteria |
|---|---|---|---|
| 🔴 **P0** | **Recruit one credentialed reviewer** | **A human. Budget/outreach.** | A named person with a verifiable credential and a `sameAs` link appears on every high-risk page, and `articleJsonLd` emits `author`/`reviewedBy` as `Person`, not `Organization`. **This is the last thing standing between the site and a real YMYL trust posture, and no amount of code closes it.** |
| 🔴 P0 | Run `supabase/migrations/2026-07-11_leads.sql`; set the four Resend vars; enable Analytics in Vercel | You | Checkup email says "Sent", not an error |
| P2 | `/sources` hub | None — `facts-2026.ts` already holds the data | One cited page per annual rule, with last-verified dates, linked from every article that uses the number |
| P2 | Debt-vs-Investing tool; upgrade the inflation toy | None | Each shows assumptions first, sources, limits, next step |
| P3 | Original research from aggregate usage | Analytics live + privacy review | Methodology published before conclusions; anonymized |
| P3 | Video depth with embedded calculators | None (embeds now render — the CSP was blocking them) | Transcript, chapters, sources, related calculator per video |

⚠️ **Always on.** Update `facts-2026.ts` at each IRS/SSA/CMS release. **Watch the ACA subsidy legislation** — an extension would change the flagship tool's answer overnight, possibly retroactively. `ACA_2026.lastVerified` and a named owner exist for exactly this reason.

---

## 15. Metrics

💭 The previous draft's metrics were unfalsifiable ("checkup completion rate") with no targets. And none of them are measurable today (§13.4). Targets are honest guesses to be revised against real data.

**Trust (leading — these predict everything else).** 100% of indexable articles with visible author, sources, and honest dates (**today: 8/21**). Credentialed reviewer on 100% of high-risk pages (**today: 0**). Corrections log in use.

**Product (the moat).** Checkup completion rate (target >40% of starts). Tool → email conversion (target >8% at the result screen — the highest-intent moment on the site). Return-visitor rate.

**Search — measure the right thing.** 💭 Given §4.1, **do not set a raw-traffic target for informational queries.** Track instead: (a) **non-brand impressions** (are you *visible*, even when not clicked), (b) **brand search volume** — the only terminal defensible asset, (c) rankings on **tool/decision** queries, which still convert.

**Revenue.** Against §12.4, not against optimism.

---

## Appendix A — Cited 2026 facts

Source of truth for `facts-2026.ts`. Every figure verified 2026-07-10 against the cited primary source.

**IRS 2026** — [Notice 2025-67](https://www.irs.gov/pub/irs-drop/n-25-67.pdf) · [Rev. Proc. 2025-32](https://www.irs.gov/pub/irs-drop/rp-25-32.pdf)
- 401(k)/403(b)/457/TSP deferral **$24,500** · catch-up 50+ **$8,000** · super catch-up 60–63 **$11,250** · IRA **$7,500** · **IRA catch-up $1,100** (first indexed bump; $8,600 total at 50+) · SIMPLE **$17,000** · **415(c) total DC limit $72,000** · QCD **$111,000**
- ⚠️ **Mandatory Roth catch-up: live for 2026.** Threshold = **$150,000** of 2025 FICA wages *from the plan sponsor* (Notice 2025-67 raised it from the $145,000 statutory base). Final regs 2025-09-16; reg mechanics fully apply 2027, **good-faith standard for 2026**; later dates for collectively-bargained and governmental plans.
- Roth IRA phase-out: single **$153k–$168k** · MFJ **$242k–$252k**
- Standard deduction: single **$16,100** · MFJ **$32,200** · HoH **$24,150**; additional 65+/blind **$1,650** (married) / **$2,050** (unmarried)
- 2026 brackets (top of bracket) — **Single:** 10% ≤$12,400 · 12% ≤$50,400 · 22% ≤$105,700 · 24% ≤$201,775 · 32% ≤$256,225 · 35% ≤$640,600 · 37% above. **MFJ:** 10% ≤$24,800 · 12% ≤$100,800 · 22% ≤$211,400 · 24% ≤$403,550 · 32% ≤$512,450 · 35% ≤$768,700 · 37% above
- LTCG 0% bracket: single **≤$49,450** · MFJ **≤$98,900** · HoH **≤$66,200**
- ⚠️ **OBBBA senior deduction: $6,000 per person 65+, tax years 2025–2028**, itemizers and non-itemizers. Phases out at **6% of MAGI over $75,000 / $150,000 MFJ**; gone at **$175,000 / $250,000**. **This is not "no tax on Social Security"** — the $25k/$32k benefit-taxation thresholds are untouched. ([IRS](https://www.irs.gov/newsroom/one-big-beautiful-bill-act-tax-deductions-for-working-americans-and-seniors))
- New for 2026: charitable deduction for **non-itemizers** up to $1,000 ($2,000 MFJ), cash only; **0.5%-of-AGI floor** for itemizers. Changes QCD-vs-cash-gift advice for retirees.
- **Saver's Match** replaces the Saver's Credit for tax years after 2026 (i.e. **2027**): 50% of up to $2,000, **paid into the account**; phase-out $41k–$71k MFJ.

**Social Security 2026** — [SSA 2026 fact sheet](https://www.ssa.gov/news/en/cola/factsheets/2026.html) · [SSA COLA](https://www.ssa.gov/oact/cola/latestCOLA.html)
- COLA **+2.8%** · wage base **$184,500** · FRA **67** (born 1960+) · claim at 62 = **70% of PIA** (30% reduction) · delay to 70 = **124%** (8%/yr) · earnings test **$24,480** (under FRA, $1 per $2) / **$65,160** (FRA year, $1 per $3) · max benefit at FRA **$4,152/mo** · average retired worker **$2,071/mo**
- ✅ Benefit-taxation thresholds **$25,000 / $32,000 — still un-indexed**, unchanged by OBBBA.
- ✅ **Social Security Fairness Act** (signed 2025-01-05): **WEP and GPO repealed**, retroactive to Jan 2024 — affects ~3.2M teachers, police, firefighters, CSRS retirees.
- Note: "124% at 70" is arithmetic from SSA's 8%/yr credit, not a figure SSA prints.

**Medicare 2026** — [CMS 2026 Part B fact sheet](https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles)
- Part B standard **$202.90/mo** (from $185.00) · Part B deductible **$283** · Part A deductible **$1,736**/benefit period
- **Part D out-of-pocket cap $2,100** (from $2,000) · Part D max deductible **$615**
- IRMAA first tier: **>$109,000 single / $218,000 MFJ**, based on **2024 MAGI** (two-year lookback — *this is the planning point*)

**ACA / early-retiree bridge — ⚠️ VOLATILE, THE MOST IMPORTANT SECTION HERE** — [KFF](https://www.kff.org/affordable-care-act/how-will-the-loss-of-enhanced-premium-tax-credits-affect-older-adults/)
- **Enhanced premium tax credits expired 2025-12-31 and were NOT extended.** The **400% FPL subsidy cliff is back** for 2026. The 8.5%-of-income cap is **gone** (max required contribution 9.96%).
- 400% FPL (2026 coverage, 48 states) ≈ **$62,600 single**. Above it: **$0 credit.**
- 60-year-old unsubsidized: **$11,625** bronze / **$15,914** benchmark silver. **At $65,000 income: +$10,389/yr** vs. the expired credits.
- Marketplace-wide: net premiums +58%, deductibles +37% to a record $3,786; enrollment projected 22.3M → ~17.5M.
- **ACA MAGI includes ALL Social Security benefits, traditional withdrawals, Roth conversions, capital gains, pensions, and tax-exempt interest. Roth withdrawals do not count.**
- No extension enacted as of 2026-07-10. **Re-verify before every publish.**

**RMDs & inherited IRAs**
- RMD start age **73** (born 1951–1959) · **75** (born 1960+). Roth 401(k): no lifetime RMDs since 2024.
- ⚠️ **Inherited IRA 10-year rule — the waivers are over.** Final regs (2024-07-19) effective **2025-01-01**: if the owner died **on or after** their required beginning date, a non-eligible designated beneficiary must take **annual RMDs in years 1–9** *and* empty by year 10. Missed-RMD penalty **25%** (10% if timely corrected). ([CRS](https://www.congress.gov/crs-product/IF12750))

**Withdrawal rates** — Morningstar **3.9%** (2025 Edition, pub. 2025-12-03: forward-looking, 30yr, 90% success, 30–50% equity) · Bengen **4.7%** (*A Richer Retirement*, Wiley, Aug 2025: historical worst case, 7 asset classes) · Guyton–Klinger **5.2–5.6%** with decision rules (JFP 2006), ⚠️ contested by Kitces. **See §8.1 — never publish one of these without its method.**

**Savings benchmarks** — Fidelity: **1× salary by 30, 3× by 40, 6× by 50, 8× by 60, 10× by 67** (assumes 15% savings rate, retire at 67, 45% replacement from savings). T. Rowe: 3× by 45, 5× by 50, 7× by 55, ~11× at retirement. 💭 **J.P. Morgan's Guide to Retirement (2026, 14th ed.) is methodologically the best** — its checkpoints vary by **age *and* income** in dollars, because "10× salary" is wrong in both directions (too high for low earners, too low for high earners). If you publish multiples, publish the assumption block beside them.

**Audience** — EBRI **2026** RCS (fielded Jan 2026, n=2,544, released 2026-04-21): worker confidence **67%→61%**, retiree **78%→73%**; **65% of workers say debt is a problem**; **fewer than half of workers *or* retirees have ever calculated what health care will cost them**; workers expect to retire at **65**, retirees actually retired at **62**. · Fidelity Retiree Health Care Cost Estimate: **$172,500** per single 65-year-old (2025 estimate, released 2025-07-30; excludes long-term care).

---

## Appendix B — 🚫 Do not publish

These are widely repeated, could not be confirmed against a primary source, and **must not appear on the site**. On a source-discipline brand these are the numbers that would end you.

| Claim | Why not |
|---|---|
| **Blanchett's "~1% real spending decline per year"** (the spending smile) | The *smile* is real and citable (JFP, May 2014). The **1% figure** could not be confirmed from the paper. Cite the smile, not the number. |
| **Pfau's "77% of the outcome is set by the first 10 years"** | Appears everywhere in secondary sources; no primary paper found. The sequence-risk *mechanism* is solid — the statistic is not. |
| ~~"$84,600" as the 400% FPL cliff for a couple~~ | **Cleared on review — publishable.** It is direct arithmetic from the verified 2025 HHS guidelines: 4 × ($15,650 + $5,500) = $84,600, which is what `federalPovertyLevel(2)` computes and `test/finance.test.mjs` asserts. What was unverifiable was only *attributing* it to a published KFF scenario table. **Derive it, don't source it to KFF.** |
| **The age-band SCF retirement-balance table** (e.g. "$185,000 median, 55–64") | Traces to secondary aggregators, not Fed primary docs. If used, pull from the Fed's interactive table **and** state that balances are conditional on *having an account* — only 54.3% of families do. |
| **Any 2026 Fidelity health-cost estimate** | Not published yet. The 2025 figure ($172,500) is current. |
| **Any 2027 figure** (COLA, IRS limits, Medicare premiums) | Not announced. 2027 COLA lands ~Oct 2026; IRS limits and Medicare ~Nov 2026. |
| **Any claimed traffic loss at NerdWallet / Bankrate / Motley Fool** | Unverified. The *aggregate* CTR studies (§4.1) are solid; company-specific claims are not. |
| **"AI-referred visitors convert 4–9× better"** | Vendor marketing. The referral volume is real; the conversion multiple is not established. |

---

## Appendix C — Sources and confidence

**High confidence (primary):** IRS Notice 2025-67 · IRS Rev. Proc. 2025-32 · Federal Register T.D. 10033 (catch-up final regs) · SSA 2026 COLA fact sheet & OACT tables · CMS 2026 Part B fact sheet · Medicare & You 2026 · HHS 2025 Poverty Guidelines · Google Search Central (structured data gallery, ranking systems guide, spam policies, AI optimization guide) · Search Quality Rater Guidelines (2025-09-11) · *Lowe v. SEC*, 472 U.S. 181 · SEC Release IA-1092 · SEC Rule 206(4)-1 · 16 CFR 255 & 465 · FTC *In re Shop Tutors (LendEDU)*, C-4719.

**High confidence (institutional):** KFF (ACA 2026 analyses) · EBRI 2026 RCS · Morningstar State of Retirement Income (2025 ed.) · Bengen, *A Richer Retirement* (Wiley 2025) · Federal Reserve SCF 2022 · Pew Research (2025-07-22, AI summaries & clicks) · J.P. Morgan Guide to Retirement 2026 · Fidelity (2025 health estimate; savings multiples).

**Medium confidence (vendor/correlational — cite with limits stated):** Ahrefs, Seer, seoClarity, SparkToro on AI-search CTR and citation. 💭 All are SEO vendors with a commercial interest, all are correlational, and none establishes causation. The Ahrefs schema difference-in-differences study is the only quasi-causal work in the corpus and it found **no positive effect of schema on AI citation** — which is the most useful thing in the set, precisely because it cuts against its author's interest.

**⚠️ Volatile — re-verify before every publish:** the ACA enhanced-subsidy statute · anything with a tax year in the name · Medicare premiums · FTC civil-penalty amounts (2026 adjustment not confirmed).

**Source links still to attach before external publication:** Pew AI-summary click study · Ahrefs schema/AI citation study · Seer AI referral/citation study · seoClarity AIO citation analysis · EBRI 2026 RCS report PDF · Mediavine/Raptive threshold pages · Google/Yahoo sender requirements · CAN-SPAM penalty page. The strategy can use them internally now, but any public-facing page should cite the exact URL beside the claim.

---

## Build principles

- Plain language first, precision second, **false certainty never**.
- Every number carries a source. Every tool shows its assumptions **before** its results.
- **The tools are the asset; the article corpus is table stakes.** Budget accordingly.
- Say "talk to a qualified professional" when a decision is genuinely individualized — and **mean it**, which means not being paid for the referral (§11.2).
- Never emit an asset allocation. Never name a security. That line is what keeps the site legal.
- Depth in one vertical beats breadth across ten. **Earn the second channel; don't schedule it.**
- The moat is not quantity. It is **structured decision help with transparent sources** — and, increasingly, the things a language model cannot do for the user: run their numbers, hold their data, and stand behind an answer with a name on it.
