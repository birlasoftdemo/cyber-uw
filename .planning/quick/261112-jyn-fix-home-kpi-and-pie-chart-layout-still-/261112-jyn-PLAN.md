---
phase: 261112-jyn
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/styles/spec-shell.css
  - src/cyber-uw/components/CasesHome.tsx
autonomous: false
requirements:
  - QUICK-261112-jyn
must_haves:
  truths:
    - "Desktop dashboard overview shows the product banner, then exactly ONE horizontal row of 5 equal KPI metric cards, then a SECOND row of 2 chart panels (Queue counters | Submission by status) — never all 7 items flowing as a single multi-column grid"
    - "Each pie chart and its legend stay fully inside their own panel: pie on the left, legend on the right, with zero overflow or spill into the neighboring panel"
    - "Legend rows read as aligned swatch | label | value columns (dot, text, count), not disconnected"
    - "Product banner sits cleanly inside the overview card at the top"
    - "At the narrow breakpoint the overview stacks gracefully with no wrap artifact (no orphaned single card, no legend overflow)"
    - "No new visual language — reuses existing navy/pill/Mulish tokens; no new packages"
  artifacts:
    - path: src/styles/spec-shell.css
      provides: robust `.spec-home__kpi-metrics` (5-col) + `.spec-home__kpi-charts` (2-col) grids, panel containment, and contained `.spec-kpi__pie` / `.spec-kpi__legend`
    - path: src/cyber-uw/components/CasesHome.tsx
      provides: banner/metrics/charts structure (adjust only if the DOM is the cause of the single-grid flow)
  key_links:
    - from: .spec-home__banner (flex column)
      to: .spec-home__kpi-metrics + .spec-home__kpi-charts
      via: each wrapper is a full-width grid block, so the 5 metrics and 2 charts are two independent rows
    - from: .spec-kpi (chart panel)
      to: .spec-kpi__pie / .spec-kpi__legend
      via: min-width:0 + overflow containment keeps pie+legend inside the panel column
---

<objective>
The dashboard overview still renders broken: the 5 KPI metric cards and the 2 chart panels appear to flow together as a single ~4-column grid (metrics + charts intermixed and wrapping), and the pie legends overflow horizontally into neighboring columns. The intended layout is a product banner, then one row of exactly 5 equal metric cards, then a row of 2 chart panels side-by-side, each with a self-contained pie + legend.

Note for the executor: the current `spec-shell.css` already defines `.spec-home__kpi-metrics` as a 5-col grid and `.spec-home__kpi-charts` as a 2-col grid, braces balance, and there are no duplicate/overriding selectors. So the fix starts with in-browser diagnosis to establish why the rules are not producing the intended result (stale asset, computed-style surprise, containment/overflow, or a DOM nesting issue), then applies a robust, token-preserving fix.

Purpose: Make the overview card render the correct two-row layout with contained pies/legends across desktop and narrow widths.
Output: Hardened layout + pie/legend CSS (and minimal CasesHome DOM change only if the markup is the cause).
</objective>

<execution_context>
@$HOME/.cursor/gsd-core/workflows/execute-plan.md
@$HOME/.cursor/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@src/cyber-uw/components/CasesHome.tsx
@src/styles/spec-shell.css
</context>

<tasks>

<task type="auto">
  <name>Task 1: Diagnose in-browser, then harden the banner/metrics/charts rows</name>
  <files>src/styles/spec-shell.css, src/cyber-uw/components/CasesHome.tsx</files>
  <action>
First establish ground truth, then fix. Do NOT guess-edit before observing the rendered result.

Diagnose (grounding):
1. Start the app with `npm run dev` and open the dashboard home (the CasesHome overview) in the browser. Take a screenshot of the current overview card so the real current state is captured (the prior edit may or may not be live).
2. In DevTools, inspect the rendered overview and confirm the DOM is `section.spec-home__banner` > `p.spec-home__product-banner` + `div.spec-home__kpi-metrics` (5 `article.spec-kpi` children) + `div.spec-home__kpi-charts` (2 `article.spec-kpi` children). Read the COMPUTED `display` and `grid-template-columns` of `.spec-home__kpi-metrics` and `.spec-home__kpi-charts`. Record which of these is true: (a) both wrappers are grids filling full width and layout is actually already correct (stale screenshot — then only legend containment in Task 2 remains); (b) a wrapper is not `display:grid` / not full width (its grid is being neutralized); or (c) the two wrappers collapse so all 7 cards share one grid row-flow.

Fix (make it robust regardless of (a)/(b)/(c)):
3. In `spec-shell.css`, keep `.spec-home__kpi-metrics` as `display:grid; grid-template-columns:repeat(5, minmax(0,1fr));` and `.spec-home__kpi-charts` as `display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);`, and ADD `width:100%` plus `box-sizing:border-box` to BOTH wrappers so neither can be squeezed below the banner's content width or inherit an unexpected intrinsic width. This guarantees the 5 metrics are one row and the 2 charts are their own row, independent of each other.
4. Ensure `.spec-kpi` has `min-width:0` (already present) AND add `overflow:hidden` so a panel's contents can never spill into the adjacent panel column.
5. Confirm `.spec-home__banner` stays `display:flex; flex-direction:column;` (default `align-items:stretch`) so each of the three children renders full width stacked. If, and only if, the DevTools diagnosis in step 2 shows the markup itself is causing the single-grid flow (e.g. a wrapper missing or an extra nesting), make the minimal DOM correction in `CasesHome.tsx` to restore banner > product-banner > metrics-wrapper > charts-wrapper; otherwise leave `CasesHome.tsx` untouched.
6. Keep all existing color/border/token values (navy `#1b1564`, `rgba(176,194,216,0.7)` dividers, Mulish). Do not introduce new colors, fonts, shadows, or `!important`.
  </action>
  <verify>
    <automated>rg -n "grid-template-columns:\s*repeat\(5" src/styles/spec-shell.css && rg -n "spec-home__kpi-charts" src/styles/spec-shell.css && npm run build && npm run lint</automated>
  </verify>
  <done>
Computed styles confirm `.spec-home__kpi-metrics` is a full-width 5-col grid and `.spec-home__kpi-charts` is a full-width 2-col grid (the 7 cards never share one grid); `.spec-kpi` clips overflow; banner stacks its three children; build and lint pass; no new tokens/`!important`.
  </done>
</task>

<task type="auto">
  <name>Task 2: Contain pie + legend inside each chart panel</name>
  <files>src/styles/spec-shell.css</files>
  <action>
Make each chart panel's pie and legend self-contained so nothing overflows into the neighbor, and the legend reads as aligned swatch | label | value.

1. `.spec-kpi__pie`: keep `display:flex; align-items:center; gap:1rem;` and ADD `min-width:0` so the flex row can shrink inside a half-width panel instead of overflowing. Keep the SVG (`.spec-kpi__chart`) as `flex-shrink:0` (fixed 88px).
2. `.spec-kpi__legend`: replace the fixed `flex:1 1 12rem; max-width:17rem;` with `flex:1 1 0; min-width:0;` (remove the `max-width` cap) so the legend takes exactly the remaining panel width and shrinks rather than pushing past the panel edge.
3. Legend rows: keep `.spec-kpi__legend li` as `display:grid; grid-template-columns:8px minmax(0,1fr) auto; column-gap:0.4rem; align-items:center;`. Ensure the label cell (`.spec-kpi__legend li > span`) gets `min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;` so a long status label truncates inside its column instead of wrapping/overflowing. Keep `.spec-kpi__legend strong` right-aligned with tabular numerals.
4. Narrow behavior: in the existing `@media (max-width:1100px)` block (where `.spec-home__kpi-charts` already becomes 1 column), confirm the pie row still fits; if the legend is cramped at the smallest widths, allow `.spec-kpi__pie` to wrap (`flex-wrap:wrap`) so the legend drops BELOW the pie within the same panel — never sideways out of it. Add this only inside the media query so desktop stays pie-left / legend-right.
5. No new colors/tokens; reuse the existing swatch dots and `STATUS_COLORS` / `COUNTER_COLORS` already passed in from `CasesHome.tsx`.
  </action>
  <verify>
    <automated>rg -n "spec-kpi__pie|spec-kpi__legend" src/styles/spec-shell.css && npm run build && npm run lint</automated>
  </verify>
  <done>
Each pie + legend stays inside its panel (no horizontal spill into the neighbor); legend rows align as swatch | label | value with long labels truncating; narrow widths stack the legend below the pie within the panel; build and lint pass.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Reworked the dashboard overview card layout: product banner, one row of 5 equal KPI metric cards, a second row of 2 chart panels (Queue counters | Submission by status), with each pie + legend contained inside its panel.</what-built>
  <how-to-verify>
1. Run `npm run dev` and open the dashboard home (CasesHome overview).
2. At a desktop width, confirm: product banner at the top of the overview card; then EXACTLY 5 metric cards in one horizontal row; then 2 chart panels side-by-side beneath. There must be NO intermixed 4-column grid of metrics + charts.
3. Confirm each pie sits on the left of its panel with the legend on the right, and NO legend/color-dot/count spills into the neighboring panel. Legend rows should align as dot, label, count.
4. Narrow the window to below ~1100px and confirm it stacks gracefully — metrics reflow and charts stack vertically with no orphaned single card and no legend overflow.
5. Confirm the look still uses the existing navy / pill / Mulish styling (no new visual language).
  </how-to-verify>
  <resume-signal>Type "approved" if the two-row layout and contained legends look correct, or describe what is still off (with a screenshot if possible).</resume-signal>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Browser → CSS/DOM | Presentation-only changes; no new data paths, auth, or inputs |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-jyn-01 | Tampering | `.spec-kpi` / legend selector reuse across other screens | medium | mitigate | Keep edits scoped to `.spec-home__*` and `.spec-kpi__pie/__legend`; verify no unrelated screen regresses in the human-verify step |
| T-jyn-02 | Denial of service | Layout change hides/clips KPI content | low | mitigate | `overflow:hidden` applied only at panel boundary; human-verify confirms all 5 metrics + both charts remain visible |
| T-jyn-SC | Tampering | npm/pip/cargo installs | low | accept | No new packages introduced in this plan |
</threat_model>

<verification>
- Computed `.spec-home__kpi-metrics` = full-width 5-col grid; `.spec-home__kpi-charts` = full-width 2-col grid.
- Metrics (5) and charts (2) render as two independent rows, never one shared grid flow.
- Pie + legend contained within each panel; legend rows aligned swatch | label | value.
- Narrow breakpoint stacks cleanly with no wrap artifact.
- `npm run build` and `npm run lint` pass; no new tokens/packages/`!important`.
</verification>

<success_criteria>
- Desktop: banner, then 5 metrics in one row, then 2 charts in one row beneath.
- Charts/legends never overlap or spill between panels.
- Product banner sits cleanly inside the overview card.
- Narrow breakpoint stacks gracefully without the current wrap artifact.
- Existing visual tokens reused; no new visual language.
</success_criteria>

<output>
Create `.planning/quick/261112-jyn-fix-home-kpi-and-pie-chart-layout-still-/261112-jyn-SUMMARY.md` when done
</output>
