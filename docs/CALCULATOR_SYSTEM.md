# Know Plain calculator system

Every calculator must answer a decision question without pretending to make the decision for the reader. The common anatomy is:

1. **Question** — the page title and description name the decision the tool can support.
2. **Inputs** — a labelled fieldset uses bounded fields, units, and short estimation guidance.
3. **Result** — one polite live region states the primary answer before supporting metrics.
4. **Interpretation** — plain language explains what moved the result and what it means.
5. **Assumptions and limits** — units, timing, exclusions, uncertainty, and non-finite states are explicit.
6. **Sensitivity** — high-impact tools expose at least one threshold, range, timeline, or reversible scenario.
7. **Sources** — the page links primary records and shows the assumptions review date.
8. **Next step** — a rule-based recommendation points to a relevant tool or explanation, never an undifferentiated link wall.

Shared implementation primitives live in `src/components/tools/ToolField.tsx` and `ToolPrimitives.tsx`. Financial arithmetic stays in pure modules under `src/lib` so legal thresholds and boundary behavior can be tested without React.

## State contract

- Empty or unknown is not silently described as zero. If a tool cannot accept an unknown yet, its hint must tell the reader how to obtain a rough estimate.
- Typed values are clamped in state as well as bounded in HTML.
- A boundary produces a named state such as “none,” “already over,” or “not calculable,” not an empty card.
- `Infinity` and `NaN` never render as money or as `$0`; they render as “not calculable” with an explanation.
- Ranges use ordered endpoints and tabular numerals.
- Volatile legal thresholds identify their year and tell the reader to verify again before acting.

## Disclosure contract

High-risk results identify material omissions close to the output. Common omissions include taxes, fees, return order, county-specific insurance prices, state rules, survivor rules, and account sustainability. Sources at the bottom of the page are supporting evidence, not a substitute for disclosing those limits next to the result.

## Print contract

Print media removes navigation, editing controls, account actions, and cross-tool calls to action. It preserves the calculator title, modeled answer, interpretation, assumptions, sources, and educational-use warning. Wide tables must reflow to the page rather than clipping or creating a second horizontal page.
