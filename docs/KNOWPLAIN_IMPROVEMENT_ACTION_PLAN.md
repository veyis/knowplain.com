# Know Plain — Product Improvement and Implementation Plan

Status: Active  
Created: 2026-07-14  
Owner: Product and engineering  
Scope: `knowplain.com` production application

## 1. Executive direction

Know Plain should become a focused retirement decision product for people roughly 45–62 who feel late, uncertain, or fragmented—not a broad library that asks visitors to assemble their own journey.

The product promise is:

> Know where you stand, understand the tradeoffs, and take the next plain step.

The primary product loop is:

```text
Arrive with a retirement question
  → complete a private five-minute checkup
  → understand one important gap or risk
  → use one recommended calculator
  → read one supporting explanation
  → save, print, or email a non-sensitive action plan
  → return when assumptions change
```

The website already has strong foundations: centralized cited facts, client-side financial calculations, transparent assumptions, structured editorial metadata, tools that cannot be replaced by search summaries, and a coherent retirement focus. The implementation must expose those strengths instead of burying them under a generic content-directory interface.

## 2. Operating principles

Every implementation decision must follow these rules:

1. **One next step beats a directory.** Each important surface recommends one primary action and one optional alternative.
2. **Trust must be visible at the decision point.** Sources, review dates, assumptions, volatility, privacy, and uncertainty belong next to the claim or result they qualify.
3. **Private by architecture.** Household balances, income, debt, and scenario inputs remain in the browser unless a user explicitly saves them.
4. **Ranges before false precision.** Results explain uncertainty and identify the assumptions that move the answer.
5. **Static by default.** Public articles, hubs, tools, and landing pages must be cacheable static output. Authentication is isolated to the smallest possible client surface.
6. **Primary sources are the data layer.** Articles and calculators continue to consume `facts-2026.ts`; no duplicated annual figures.
7. **Accessibility is a release condition.** Keyboard paths, visible focus, readable contrast, useful errors, reduced motion, and touch targets are part of definition of done.
8. **Do not expand topical scope yet.** Retirement remains the focus until reviewer coverage, product usage, traffic, and revenue gates justify expansion.

## 3. Success metrics

### North-star metric

Percentage of visitors who complete a checkup or calculator and continue to the recommended next step.

### Supporting funnel metrics

| Stage | Metric | Initial target |
|---|---|---:|
| Acquisition | Homepage → checkup start | 20% |
| Activation | Checkup start → checkup complete | 65% |
| Value | Checkup complete → recommended tool | 35% |
| Depth | Tool result → supporting explainer | 20% |
| Retention | Result saved, printed, or emailed | 15% |
| Search quality | Searches returning zero useful results | <10% |
| Reliability | Public route error rate | <0.5% |
| Performance | Core Web Vitals passing URLs | >90% |

Targets are hypotheses. Capture a two-week baseline before treating them as commitments.

### Guardrail metrics

- No financial inputs sent to analytics.
- No personal financial values stored without explicit consent.
- No high-risk page published without sources, review state, and an accountable reviewer class.
- No material regression in build time, JavaScript payload, accessibility, or public caching.

## 4. Delivery strategy

Work proceeds in dependency order. Each phase must satisfy its exit criteria before the next phase is considered complete. Small compatible pieces from later phases may be developed earlier, but they cannot obscure an unresolved security or correctness issue.

---

## Phase 0 — Product and design contract

Goal: prevent the redesign from drifting into a generic fintech or content template.

### Actions

- [ ] Create `PRODUCT.md` with confirmed audience, positioning, primary action, proof, brand personality, anti-references, and accessibility target.
- [ ] Create `DESIGN.md` from the existing interface and the approved visual direction.
- [ ] Record the physical usage scene: an anxious pre-retiree using the site at home, often on a phone or laptop, looking for calm clarity rather than entertainment.
- [ ] Define the default product hierarchy: Plan, Learn, Calculate, Decide, Community.
- [ ] Define the voice: candid, calm, exact, non-performative.
- [ ] Define prohibited patterns: anonymous authority, false precision, urgency marketing, generic SaaS cards, investment-advice language, decorative financial imagery.
- [x] Configure visual-review tooling for local browser iteration.

### Exit criteria

- Product purpose and primary CTA can be stated in one sentence.
- Navigation labels have distinct meanings.
- Every new component can be reviewed against documented tokens and interaction rules.
- Product and design decisions no longer live only in source comments or strategy documents.

---

## Phase 1 — Security and data integrity

Goal: close authorization and transactional weaknesses before increasing account or forum usage.

### 1.1 Supabase RLS

- [x] Replace deprecated `auth.role()` policy predicates with explicit `TO authenticated` policies.
- [x] Require `(select auth.uid()) = author_id` for thread and post inserts.
- [x] Require `(select auth.uid()) = user_id` for likes and saved simulations.
- [x] Give profile updates both `USING` and `WITH CHECK` ownership predicates.
- [x] Review all public-schema tables for RLS coverage.
- [x] Explicitly document Data API grants separately from RLS.
- [x] Add policy verification SQL covering anonymous, authenticated owner, and authenticated non-owner behavior.

### 1.2 Atomic forum creation

- [x] Replace two independent thread/post writes with one database transaction exposed through a tightly scoped RPC.
- [x] Put privileged helper functions in a non-exposed schema when practical.
- [x] Revoke default `PUBLIC` execution and grant only the required role.
- [x] Validate authentication and input inside the transaction.
- [x] Remove best-effort application rollback after atomic creation is available.
- [x] Check every Supabase forum mutation error before reporting success.

### 1.3 Abuse and moderation foundation

- [x] Add database length constraints for titles and post bodies.
- [x] Add thread/post status fields suitable for moderation without destructive deletion.
- [x] Add report records with owner-safe RLS.
- [x] Add rate limiting before actively promoting community posting.
- [x] Add content guidelines and a reporting affordance.

### Exit criteria

- A user cannot create or mutate content attributed to another user.
- Thread plus first post is all-or-nothing.
- Policy tests demonstrate expected owner/non-owner behavior.
- Forum actions never silently ignore database errors.

---

## Phase 2 — Static delivery and application boundaries

Goal: preserve static rendering and caching for public content while retaining account awareness.

### Actions

- [x] Remove server-side `cookies()` access from the shared public `AppShell` render path.
- [x] Introduce a static shell containing navigation, search, footer, theme, and anonymous-safe actions.
- [x] Isolate account state in a small client component that initializes from Supabase after hydration.
- [x] Keep authenticated server reads on profile, saved-data, and forum mutation surfaces only.
- [x] Ensure auth-session refresh middleware remains correct without making page rendering dynamic.
- [x] Run `next build` and record route classifications for articles, hubs, tools, decisions, and homepage.
- [x] Add a regression check or documented build audit for static public routes.
- [x] Measure client JavaScript added by the isolated auth control.

### Exit criteria

- Homepage, topic hubs, articles, decision pages, and public tools render statically unless a route has a documented reason not to.
- Signed-in controls appear without blocking or changing public HTML generation.
- Public pages remain usable when Supabase environment variables are absent.
- No hydration warning or account-state flash causes layout shift.

---

## Phase 3 — Information architecture and navigation

Goal: replace overlapping internal taxonomy with user-centered choices.

### Proposed top-level model

| User label | Contains |
|---|---|
| Plan | Checkup, late-starter path, saved plan |
| Learn | Retirement articles, money psychology, videos, glossary |
| Calculate | All interactive calculators |
| Decide | Retirement timing, Social Security, Roth, debt decisions |
| Community | Forum and curated questions |

Pillars remain useful for content taxonomy, URLs, internal linking, sitemap grouping, and editorial management. They do not need equal prominence in the primary navigation.

### Actions

- [x] Replace desktop sidebar groups with the five user-centered destinations.
- [x] Replace the mobile wrapping link cloud with a real disclosure navigation.
- [x] Preserve direct access to search and checkup.
- [x] Provide clear active states and page context.
- [x] Ensure primary navigation tap targets meet WCAG 2.2 minimum sizing or spacing exceptions.
- [x] Keep footer links focused on trust, policy, sources, and secondary navigation.
- [x] Add breadcrumbs only where hierarchy aids orientation.
- [x] Confirm redirects are unnecessary before changing any public URL.

### Exit criteria

- A first-time visitor can distinguish Plan, Calculate, and Decide without explanation.
- Mobile navigation fits at 320px without horizontal overflow or tiny targets.
- Keyboard focus order matches visual order.
- Existing indexed URLs remain stable.

---

## Phase 4 — Homepage and positioning

Goal: make the flagship product journey obvious within ten seconds.

### Homepage narrative

1. Name the visitor's job: find out where retirement stands.
2. Offer the private five-minute checkup.
3. Show what the result contains.
4. Prove the assumptions are sourced and current.
5. Offer question search as the lower-commitment alternative.
6. Route specific needs into Calculate, Decide, or Learn.

### Actions

- [ ] Change the hero from generic search-first messaging to the checkup promise.
- [ ] Use one primary CTA: “Check my retirement plan.”
- [ ] Use one secondary action: “Ask a retirement question.”
- [ ] State near the CTA that personal financial inputs remain in the browser.
- [ ] Show an honest result preview using an illustrative, clearly labeled scenario—not fabricated customer data.
- [ ] Surface “Verified for 2026” with links to methodology and sources.
- [ ] Replace repeated equal-card grids with a varied editorial/product composition.
- [ ] Introduce one recognizable Know Plain visual artifact, such as a range-and-tradeoff diagram.
- [ ] Move videos, forum, and broad topic browsing below the primary product proof.
- [ ] Track hero CTA, secondary search, and downstream completion events.

### Exit criteria

- Five-second test participants can state what the site does and what to click first.
- Hero has one dominant action.
- No unsubstantiated proof, testimonial, rating, or user count appears.
- Homepage remains useful without JavaScript except for interactive search submission enhancement.

---

## Phase 5 — Visible trust layer

Goal: convert the codebase's rigorous sourcing into reader-visible confidence.

### Actions

- [x] Create a reusable `VerificationStamp` component with verified date, source count, and volatility state.
- [x] Put the stamp beside calculator results and article trust details.
- [x] Create an assumptions disclosure that explains units, range methodology, exclusions, and sensitivity.
- [x] Link important numerical outputs to the exact source record or methodology section.
- [x] Show published, materially updated, and reviewed dates with distinct meanings.
- [x] Add visible correction notes to corrected articles.
- [x] Mark volatile ACA or legislative assumptions without using alarmist styling.
- [ ] Add real credentialed human reviewers when available; never invent identity or credentials.
- [x] Make privacy claims specific and technically accurate.

### Human dependency

A named credentialed reviewer with a verifiable public credential is the largest non-code trust improvement. Engineering can support this identity but cannot manufacture it.

### Exit criteria

- Users can answer “where did this number come from?” without leaving the result context.
- Volatile facts are visually distinguishable from annually indexed facts.
- Reviewer claims correspond to real accountable people or honestly labeled organizations.
- Trust UI remains compact enough not to interrupt every paragraph.

---

## Phase 6 — Checkup as the central product loop

Goal: turn a one-time calculator into a guided, private planning session.

### 6.1 Input experience

- [x] Divide questions into coherent steps: timing, savings, retirement spending, income floor, flexibility.
- [x] Add progress, back navigation, and review-before-results.
- [x] Explain why each sensitive value is requested.
- [x] Support unknown values and guide users to estimates rather than forcing false precision.
- [x] Validate on blur and submit with plain corrective messages.
- [x] Persist draft inputs locally with an explicit clear-data action.
- [x] Avoid sending inputs to analytics or server logs.

### 6.2 Results

- [x] Lead with the plain summary and the most decision-relevant gap.
- [x] Explain the projected and target ranges before showing scores.
- [x] Reframe scores so direction is unambiguous; currently some high scores mean good and others mean risk.
- [x] Show the three assumptions that most influence the result.
- [x] Add reversible “What would improve this?” scenario controls for retirement age, spending, contribution, and part-time flexibility.
- [x] Recommend exactly one next calculator and one supporting explainer based on result conditions.
- [x] Explain why each recommendation was selected.

### 6.3 Retention

- [x] Add print-friendly summary output.
- [x] Add validated named local snapshots with created dates and a ten-snapshot cap.
- [x] Let signed-in users explicitly save named scenarios.
- [x] Compare current and previous snapshots without framing changes as investment performance.
- [x] Email only a non-sensitive summary and secure resume link when implemented.
- [x] Provide explicit consent and retention language for any server-side save.

### Exit criteria

- Inputs survive an accidental refresh when local persistence is enabled.
- A user can complete the flow with keyboard only and at 200% zoom.
- Results identify one next action instead of presenting an undifferentiated link list.
- No household financial value appears in analytics events, URLs, email payloads, or unauthenticated storage.

---

## Phase 7 — Calculator system

Goal: make every calculator feel like part of one trustworthy decision system.

### Actions

- [x] Define a common tool anatomy: question, inputs, result, interpretation, assumptions, sensitivity, sources, next step.
- [x] Extract common accessible field, currency, percentage, result-range, and assumption components.
- [x] Standardize empty, invalid, boundary, and non-finite states.
- [x] Add URL-free local scenario persistence where useful.
- [x] Add print styles for result summaries.
- [x] Ensure high-risk outputs show uncertainty and relevant omitted factors.
- [x] Review and enforce analytics payloads so they contain allowlisted tool names and actions, never entered amounts.
- [x] Add cross-tool recommendations driven by explicit rules.
- [x] Add tests for legal thresholds, boundaries, Infinity/NaN, and annual fact drift.

### Exit criteria

- All tools share recognizable interaction and disclosure patterns.
- Clearing or exceeding an input cannot produce misleading output.
- Each tool communicates what decision it can and cannot support.
- Pure financial logic remains independently testable outside React.

---

## Phase 8 — Search and content discovery

Goal: answer natural retirement questions and expose product actions, not just substring matches.

### 8.1 Search document model

- [x] Add aliases, common questions, keywords, and intent to content metadata.
- [x] Index article body text, FAQs, glossary entries, decisions, tools, and videos.
- [x] Preserve content type and pillar facets.
- [x] Add a defined deterministic ranking model for title, alias/question, topic, and summary fields.
- [x] Add typo tolerance or prefix behavior where it improves recall.

### 8.2 Results experience

- [x] Group or badge best answer, calculator, decision guide, and supporting reading.
- [x] Show why a result matched where helpful.
- [x] Provide useful no-result suggestions and a path to browse nearby topics.
- [x] Log normalized zero-result query categories without storing sensitive free text unnecessarily.
- [ ] Add popular question shortcuts based on real aggregate behavior.

### 8.3 Implementation sequence

1. Improve the deterministic in-memory ranker and metadata.
2. Sync the same documents into Postgres full-text search.
3. Move server search to Postgres when relevance and operational checks pass.
4. Consider semantic retrieval only after deterministic search has measured gaps.

### Exit criteria

- Natural questions return a relevant article or tool in the first three results.
- Search can distinguish informational, calculation, and decision intent.
- Zero-result behavior is actionable rather than blank.
- Search relevance has a repeatable evaluation set.

---

## Phase 9 — Visual identity and design system

Goal: replace generic developer-tool styling with a recognizable, calm decision brand.

### Direction

The brand should feel like a precise planning instrument used at a kitchen table: approachable enough for an anxious beginner, exact enough to trust with consequential questions, and visually unlike a brokerage dashboard or SaaS template.

### Actions

- [ ] Design a real wordmark and compact mark; replace the generic black “K” tile.
- [ ] Select a committed brand color and supporting semantic palette in OKLCH.
- [x] Verify light and dark contrast programmatically.
- [ ] Establish typography for calm reading, numerical comparison, labels, and display moments.
- [x] Use tabular numerals for financial comparisons.
- [ ] Define spacing, measure, radii, borders, focus, shadows, and motion tokens in `DESIGN.md`.
- [ ] Reduce identical icon-card grids and use structure appropriate to the information.
- [ ] Create branded explanatory visuals: ranges, timelines, cliffs, tradeoff maps, and scenario comparisons.
- [ ] Add purposeful motion only when it clarifies progression or changing results.
- [x] Respect `prefers-reduced-motion` for every non-essential transition.

### Exit criteria

- Screenshots are recognizable as Know Plain without the logo.
- Financial data remains readable at small sizes and in dark mode.
- Brand treatments do not imitate brokerage urgency, luxury wealth branding, or generic Vercel/shadcn defaults.
- Visual additions convey information rather than decorate empty space.

---

## Phase 10 — Accessibility and responsive hardening

Goal: meet WCAG 2.2 AA across primary journeys.

### Actions

- [x] Audit landmarks, headings, labels, descriptions, errors, live regions, and table semantics.
- [x] Verify visible keyboard focus on every interactive element.
- [x] Verify target size and spacing on mobile.
- [x] Test at 320px width, 200% browser zoom, and large default font settings.
- [x] Ensure tables scroll with contextual labeling and do not trap keyboard users.
- [x] Verify text and non-text contrast in both themes.
- [x] Test dialogs, command menu, mobile navigation, and tool fields with keyboard and screen-reader semantics.
- [x] Ensure result changes are announced appropriately without excessive verbosity.
- [x] Provide skip navigation and preserve logical focus after navigation or dialog close.
- [x] Audit print output for clipping and lost meaning.

### Exit criteria

- Automated checks have no serious or critical findings on primary routes.
- Manual keyboard flow completes homepage → checkup → result → tool.
- No essential meaning relies on color alone.
- Layout is usable at 320px and 200% zoom without two-dimensional scrolling except data tables.

---

## Phase 11 — Analytics, experiments, and operations

Goal: learn which experiences create useful progress without surveilling financial behavior.

### Event taxonomy

- `checkup_started`
- `checkup_step_completed` with step name only
- `checkup_completed` with coarse recommendation category only
- `recommended_action_opened`
- `tool_started`
- `tool_result_viewed`
- `assumptions_opened`
- `result_printed`
- `result_saved_local`
- `lead_submitted`
- `search_submitted`
- `search_zero_result` with privacy-safe category or one-way normalized representation

### Actions

- [x] Encode allowed and prohibited analytics properties in a deny-by-default policy with tests.
- [x] Add funnel dashboards for acquisition, activation, value, and retention.
- [ ] Establish baseline metrics before major homepage rollout.
- [x] Use feature flags or small reversible releases for material journey changes.
- [x] Add error monitoring that excludes form values and sensitive context.
- [x] Create weekly review for volatile facts and monthly product-quality review.
- [x] Keep a visible decision log linking changes to measured evidence.

### Exit criteria

- Product funnel is measurable end to end.
- Analytics inspection confirms no entered financial values are transmitted.
- Experiments have a hypothesis, primary metric, guardrails, and stop condition.
- Fact verification and corrections have named operational owners.

---

## Phase 12 — Content and original assets

Goal: publish fewer, more useful pages that produce an artifact or decision.

### Flagship assets

- [x] 60–64 retirement income-management planner.
- [x] ACA subsidy-cliff scenario map with explicit volatility state.
- [x] Roth conversion calendar tied to ACA and Medicare considerations.
- [x] Social Security survivor-benefit comparison.
- [x] Retirement-age decision worksheet.
- [x] RMD timeline by birth year.
- [x] Starting-at-45, starting-at-50, and starting-at-55 action paths.
- [x] Annual “What changed this year?” retirement rules changelog.

### Article standard

Every consequential article answers:

1. What is the plain answer?
2. What changes the answer?
3. What mistake is expensive?
4. What should the reader calculate?
5. What should the reader do next?

### Exit criteria

- Each flagship article produces a worksheet, calculator, scenario, or reusable decision artifact.
- High-risk claims have current primary sources and reviewer state.
- Content updates change dates only when the substance changes.
- New pages strengthen the retirement decision system rather than broaden topical scope.

---

## Phase 13 — Community readiness

Goal: promote community only when it adds credible lived context and can be moderated safely.

### Actions

- [x] Separate curated staff answers from open community discussions.
- [x] Add moderation states, reports, rate limits, and clear rules.
- [x] Add empty-state content that does not pretend a community exists before it does.
- [x] Seed only transparent editorial prompts; never fabricate users or engagement.
- [ ] Add expert-response labeling only for verified people.
- [x] Noindex thin or unmoderated thread surfaces where appropriate.
- [x] Define launch gate based on moderation capacity and meaningful active participation.

### Exit criteria

- Abuse reports have an operational destination and response process.
- Empty community surfaces do not undermine trust.
- User-generated claims are visually distinct from reviewed editorial guidance.
- Community growth does not become a dependency for the core checkup journey.

---

## Phase 14 — Verification and release

### Automated verification

- [x] `pnpm test`
- [x] `pnpm lint`
- [x] `pnpm build`
- [x] Content collection validation
- [x] Financial boundary and drift tests
- [x] Supabase policy tests
- [x] Accessibility scan on primary routes
- [x] Link and metadata checks

### Browser verification matrix

| Surface | Mobile | Tablet | Desktop | Keyboard | Dark mode | No Supabase |
|---|---:|---:|---:|---:|---:|---:|
| Homepage | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Checkup | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tool | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Article | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Search | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Forum | ✓ | ✓ | ✓ | ✓ | ✓ | n/a |

### Rollout

1. Ship security and static-boundary fixes independently.
2. Capture baseline funnel and performance data.
3. Release navigation and homepage together so labels and promise agree.
4. Release the guided checkup behind a reversible flag if migration risk is meaningful.
5. Expand to tools and search after the core journey stabilizes.
6. Perform a two-week post-release review before beginning broad content production.

### Release exit criteria

- No P0/P1 correctness, security, accessibility, or privacy defect remains.
- Public build classifications and caching behavior are documented.
- Primary funnel works with JavaScript constraints appropriate to each interaction.
- Rollback procedure is known for every material release.

## 5. Human-only dependencies

These cannot be solved honestly by code:

- Recruit and contract a named credentialed retirement reviewer.
- Apply database migrations to the live Supabase project.
- Configure production email identity, physical mailing address, and Resend credentials.
- Enable and inspect production analytics in Vercel.
- Establish moderation ownership and response times.
- Approve the final product positioning, identity direction, and any legal/compliance language.

## 6. Immediate implementation queue

The first implementation sequence is:

1. Confirm and write `PRODUCT.md` and `DESIGN.md`.
2. Add a Supabase security migration and policy verification script.
3. Make thread creation atomic.
4. Isolate account state from the static public shell.
5. Verify route rendering classifications with a production build.
6. Rebuild navigation.
7. Rebuild the homepage around the checkup.
8. Add the visible verification and assumption system.
9. Rework the checkup flow and persistence.
10. Upgrade deterministic search and add a relevance test set.
11. Run accessibility, responsive, and browser verification.

## 7. Definition of done

The program is complete when Know Plain behaves as a coherent retirement decision product: a visitor can understand the promise, privately assess their situation, interpret uncertainty, take one useful next action, verify the source of important claims, and return to update a saved plan—while public content remains fast and static, authenticated data remains ownership-safe, and the interface meets the documented accessibility and design standards.
