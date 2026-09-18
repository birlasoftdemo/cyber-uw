---
phase: 260918-oa9
plan: 01
subsystem: ui
tags: [risk-analysis, contrast, layout, css, security-rating, capacity-ledger]

requires:
  - phase: 260917-p0f
    provides: Risk Analysis dual-region evidence (market + capacity) + shared cite panel
provides:
  - Market column stretch with taller chart and roomier Detailed Ratings
  - High-contrast Detailed Ratings / multiplier tiles
  - Scoped capacity ledger + FinancialSignOff field-tile contrast
affects: [risk-analysis-desk, quote-ready-signoff]

tech-stack:
  added: []
  patterns:
    - "Scope contrast under region wrappers (.wb-capacity-ledger, .wb-fin-signoff) to avoid global .cuw-panel / .wb-q-cell bleed"
    - "Redistribute leftover column height via flex grow on .wb-rating / .wb-rating__body rather than inventing filler content"

key-files:
  created: []
  modified:
    - src/cyber-uw/components/SecurityRatingPanel.tsx
    - src/cyber-uw/components/CaseWorkspace.tsx
    - src/styles/workbench-surface.css

key-decisions:
  - "Chart height set to 190px; split uses align-items:stretch so market fills against capacity"
  - "Left typography.css untouched — capacity contrast scoped under .wb-capacity-ledger in workbench-surface.css"
  - "FinancialSignOff uses wb-fin-signoff wrapper so Policy Documents wb-q-cell tiles stay unchanged"

patterns-established:
  - "Region-scoped visibility bumps for desk tiles (border → --cuw-hairline, labels → --cuw-ink-secondary)"

requirements-completed: [D-01, D-02, D-03, D-04, D-05]

coverage:
  - id: D1
    description: "Risk Analysis market column stretches; taller trend chart; Detailed Ratings has more vertical room"
    requirement: D-01
    verification:
      - kind: other
        ref: "rg align-items:stretch + ResponsiveContainer height=190 + npm run build"
        status: pass
    human_judgment: false
  - id: D2
    description: "User-facing caption reads Detailed Ratings; wb-rating__vectors class retained"
    requirement: D-02
    verification:
      - kind: other
        ref: "rg 'Detailed Ratings' SecurityRatingPanel.tsx"
        status: pass
    human_judgment: false
  - id: D3
    description: "Detailed Ratings and multiplier tiles use darker ink, solid borders, stronger grade badges"
    requirement: D-03
    verification:
      - kind: other
        ref: "workbench-surface.css .wb-rating__vectors / .wb-rating__multipliers / .wb-rating__grade"
        status: pass
    human_judgment: true
    rationale: "Visual contrast on light surfaces needs desk eyeball confirmation"
  - id: D4
    description: "Capacity ledger/panels and FinancialSignOff field tiles use higher-contrast borders/ink, scoped"
    requirement: D-04
    verification:
      - kind: other
        ref: "rg wb-capacity-ledger|wb-fin-signoff + npm run build"
        status: pass
    human_judgment: true
    rationale: "Scoped contrast readability needs visual check on Risk Analysis + Quote Ready"
  - id: D5
    description: "No Proceed/HITL/cite redesign; no new packages"
    requirement: D-05
    verification:
      - kind: other
        ref: "task commits touch only SecurityRatingPanel, CaseWorkspace signoff hooks, workbench-surface.css"
        status: pass
    human_judgment: false

duration: 5min
completed: 2026-09-18
status: complete
---

# Phase 260918-oa9 Plan 01: Risk Analysis whitespace + contrast Summary

**Redistributed left-column void into a taller security-rating chart and roomier Detailed Ratings, and raised objective contrast on market tiles, capacity ledger figures, and Getting Ready to Quote financial signoff fields.**

## Performance

- **Duration:** 5 min
- **Started:** 2026-09-18T12:03:33Z
- **Completed:** 2026-09-18T12:08:35Z
- **Tasks:** 2/2
- **Files modified:** 3

## Accomplishments

- Market | capacity split stretches; `.wb-rating` fills the market column with flex growth on body/chart/vectors
- Caption renamed to **Detailed Ratings**; trend chart height raised to 190px
- Vector/multiplier tiles and grade badges use solid hairline borders and darker secondary ink
- Capacity ledger table/formula/panel heads and `wb-fin-signoff` field tiles share the same high-visibility vocabulary without global bleed

## Task Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | `761317d` | Stretch market column + Detailed Ratings rename + rating-tile contrast |
| 2 | `49ed42d` | Capacity ledger + FinancialSignOff scoped contrast |

## Deviations from Plan

### Auto-fixed Issues

None - plan executed exactly as written.

**Noted scope choice:** `typography.css` left untouched (plan allowed). Capacity panel contrast is scoped under `.wb-capacity-ledger` in `workbench-surface.css` to satisfy T-oa9-02 (no global `.cuw-panel` restyle).

## Auth Gates

None.

## Known Stubs

None.

## Threat Flags

None beyond plan register (presentation-only; signoff/capacity contrast scoped).

## Self-Check: PASSED

- FOUND: `src/cyber-uw/components/SecurityRatingPanel.tsx`
- FOUND: `src/cyber-uw/components/CaseWorkspace.tsx`
- FOUND: `src/styles/workbench-surface.css`
- FOUND: commit `761317d`
- FOUND: commit `49ed42d`
- Verify: caption Detailed Ratings; `align-items: stretch`; `wb-fin-signoff`; `npm run build` passed for both tasks
