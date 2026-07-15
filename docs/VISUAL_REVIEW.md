# Know Plain visual review workflow

This workflow captures representative product surfaces without treating pixels as a substitute for judgment. It covers the homepage, guided checkup, a legally volatile calculator, a long-form article, and the operations dashboard in light and dark mode at desktop and mobile widths.

## Run locally

```bash
pnpm review:visual
```

Playwright starts the local site, captures full-page artifacts, and writes an HTML report to `playwright-report/`. Open that report locally to compare the twenty captures. The report and test artifacts are ignored by Git; approved product decisions belong in `DESIGN.md` and the public operations log, not in opaque screenshot churn.

## Review checklist

For every capture, inspect:

1. The primary action and page purpose are clear before scrolling.
2. No text, table, chart, focus ring, or control is clipped or overlaps at either viewport.
3. Financial values align and scan as numbers rather than decorative text.
4. Source, verification, privacy, uncertainty, and high-risk disclosures remain close to the claims they qualify.
5. Light and dark surfaces preserve hierarchy without low-contrast muted text.
6. Repeated cards do not flatten genuinely different information into equal visual weight.
7. Mobile reading order matches the semantic DOM and does not depend on a pointer.
8. Reduced-motion mode loses no meaning.

## Automated companion checks

`test/e2e/accessibility.spec.ts` runs WCAG A/AA Axe checks across the primary site surfaces in both color schemes. `test/e2e/responsive.spec.ts` checks page-level overflow and minimum interaction sizing. Visual review is the manual layer for hierarchy, composition, truncation, and product trust cues that automated rules cannot judge reliably.
