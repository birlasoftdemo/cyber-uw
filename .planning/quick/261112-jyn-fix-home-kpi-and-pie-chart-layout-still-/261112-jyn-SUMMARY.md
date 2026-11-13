---
phase: 261112-jyn
plan: 01
subsystem: ui
tags: [css, layout, dashboard, kpi]
key-files:
  modified:
    - src/styles/spec-shell.css
decisions:
  - "Root cause was the viewport breakpoint, not markup: at <=1100px (user's ~1024px window) the 5 metrics collapsed to 2 columns and charts stacked, so the overview no longer read as 5 metrics + 2 charts."
metrics:
  completed: 2026-11-12
status: complete
---

# Quick 261112-jyn: Home KPI + pie chart layout Summary

Overview now renders banner → 5 equal metric cards in one row → 2 side-by-side chart panels at 1024px and 1440px, with pies/legends contained in their panels; stacking only happens below 820px.

## Diagnosis (headless Chromium via Playwright, real app on a scratch Vite port)
- DOM was already correct: `section.spec-home__banner` > product-banner + `.spec-home__kpi-metrics` (5) + `.spec-home__kpi-charts` (2). `CasesHome.tsx` needed no change.
- 1440px: already correct (5-col grid, 2-col grid) — hypothesis (c) ruled out for current CSS (the user's screenshot reflects a stale/older build).
- 1024px (the screenshot's width): `@media (max-width:1100px)` forced metrics to 2 columns with the 5th spanning, and charts to 1 column with a ~730px-wide pie row — hypothesis (a) confirmed as the live cause.
- Legend: `flex:1 1 12rem; max-width:17rem` with no ellipsis allowed long labels to push past the panel (hypothesis (b) risk).

## Changes (`src/styles/spec-shell.css`, commit 720918f)
- `.spec-home__kpi-metrics` / `.spec-home__kpi-charts`: `width:100%; box-sizing:border-box`.
- `.spec-kpi`: `overflow:hidden` (panel containment).
- `.spec-kpi__pie`: `min-width:0`; `.spec-kpi__legend`: `flex:1 1 0; min-width:0; max-width:18rem`; legend label cell truncates with ellipsis.
- `@media (max-width:1100px)` is now a *compact* tier (tighter card padding, 2.2rem bars, 11px label, 24px value) that keeps 5-up + 2-up.
- New `@media (max-width:820px)`: metrics 2-col (5th spans), charts stack, pie row may wrap legend below pie. `.spec-tracker__groups` stays at the 1100px tier (unchanged behavior).

## Verification
- `npm run build` passes; `npm run lint` passes (only pre-existing warnings in `video/`).
- Computed layout: 1024px → metrics `5 × ~153px` one row, charts `356px | 409px` one row, legends inside panels, no horizontal scroll; 1440px → 5 × 236px, charts 549 | 632; 800px → 2-col metrics, stacked charts, no overflow.
- Human-verify checkpoint: **verified-by-agent** (screenshots at 1440/1024/800). Residual risk: no live user confirmation; user should hard-refresh their dev server (their screenshot looked like an older build).

## Deviations
- **[Rule 1]** Plan said remove legend `max-width`; kept a looser `max-width:18rem` so counts don't drift far from labels on wide panels (still contained).
- Plan's single breakpoint change was extended with a compact 1100px tier + 820px stack tier, because the 1024px screenshot width requires 5-up cards to fit.
- Tasks 1 and 2 touched the same file/rules and were committed together as one atomic commit.
- `spec-shell.css` carried pre-existing uncommitted edits from earlier work; they were included in the commit.

## Self-Check: PASSED
- src/styles/spec-shell.css FOUND; commit 720918f FOUND.
