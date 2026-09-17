---
phase: 260917-ptj
plan: 01
subsystem: ui
tags: [typography, kpi-labels, fontsource, source-sans-3, source-serif-4, policy-documents]

requires: []
provides:
  - Policy Documents period KPIs labeled Proposed start/end date
  - Page-wide Source Sans 3 (UI/titles) + Source Serif 4 (supporting type) stack
affects: [cyber-uw desk type system, Policy Documents meta grid]

tech-stack:
  added: ["@fontsource/source-sans-3", "@fontsource/source-serif-4"]
  patterns: ["--font-ui/--font-display for sans UI; --font-serif for supporting classes"]

key-files:
  created: []
  modified:
    - src/cyber-uw/components/CaseWorkspace.tsx
    - src/main.tsx
    - src/styles/typography.css
    - package.json
    - package-lock.json

key-decisions:
  - "D-01: Policy period KPIs use Proposed start date / Proposed end date labels only"
  - "D-02: Source Sans 3 + Source Serif 4 via @fontsource; Geist/Inter removed"
  - "D-03: No Risk Analysis redesign or button chrome changes"

patterns-established:
  - "Supporting type classes (.cuw-type-kicker/caption/body/label) bind to --font-serif"
  - "Titles/metrics/UI bind to --font-display / --font-ui (Source Sans 3)"

requirements-completed: [D-01, D-02, D-03]

coverage:
  - id: D1
    description: Policy Documents QuestionMetaGrid shows Proposed start date and Proposed end date
    requirement: D-01
    verification:
      - kind: other
        ref: "rg -n \"Proposed start date|Proposed end date\" src/cyber-uw/components/CaseWorkspace.tsx"
        status: pass
    human_judgment: false
  - id: D2
    description: Page-wide Source Sans 3 UI/titles and Source Serif 4 supporting type; Geist/Inter gone
    requirement: D-02
    verification:
      - kind: other
        ref: "rg source-sans-3/source-serif-4 + npm run build"
        status: pass
    human_judgment: false
  - id: D3
    description: Scope limited to labels + type system (no Risk Analysis / button redesign)
    requirement: D-03
    verification:
      - kind: other
        ref: "diff scoped to CaseWorkspace labels + font packages/CSS/main imports"
        status: pass
    human_judgment: false

duration: 9min
completed: 2026-09-17
status: complete
---

# Phase 260917-ptj Plan 01: KPI labels + Source type system Summary

**Policy Documents period KPIs now read Proposed start/end date, and the desk type stack is Source Sans 3 + Source Serif 4 page-wide.**

## Performance

- **Duration:** 9 min
- **Started:** 2026-09-17T13:12:16Z
- **Completed:** 2026-09-17T13:21:34Z
- **Tasks:** 2/2
- **Files modified:** 5

## Accomplishments

- Renamed Policy Documents meta labels to **Proposed start date** / **Proposed end date** (values and icons unchanged).
- Installed `@fontsource/source-sans-3` and `@fontsource/source-serif-4`; removed Geist Sans and Inter.
- Wired `main.tsx` font imports and `typography.css` variables/classes so UI/titles use Source Sans 3 and kicker/caption/body/label use Source Serif 4.
- `npm run build` succeeded with the new font assets in the bundle.

## Task Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | b7d6b56 | Proposed start/end date KPI labels |
| 2 | 6f2791a | Source Sans 3 + Source Serif 4 type system |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Isolated Task 1 commit from unrelated CaseWorkspace WIP**
- **Found during:** Task 1 commit
- **Issue:** First commit included pre-existing WIP (Quote Ready copy / stage title string edits) staged with the label change.
- **Fix:** Soft-reset, re-applied only D-01 label strings, recommitted as b7d6b56; restored WIP in working tree.
- **Files modified:** `src/cyber-uw/components/CaseWorkspace.tsx`
- **Commit:** b7d6b56

**2. [Rule 3 - Blocking] Build verify isolated from WIP TS6133**
- **Found during:** Task 2 verify (`npm run build`)
- **Issue:** Uncommitted CaseWorkspace WIP left `decisionLabel` unused → `tsc` failed.
- **Fix:** Temporarily checked out HEAD CaseWorkspace for build; restored WIP after green build. Out of Task 2 scope — not committed.
- **Files modified:** none (verify-only)
- **Commit:** n/a

**3. [Rule 2 - Scope] index.css unchanged**
- **Found during:** Task 2
- **Issue:** Plan listed `src/index.css`, but body already uses `font-family: var(--font-ui)`.
- **Fix:** No edit needed; Source Sans 3 resolves via `--font-ui` update in typography.css.
- **Files modified:** none
- **Commit:** n/a

## Known Stubs

None.

## Threat Flags

None — only user-locked `@fontsource` packages; family names verified against package CSS (`'Source Sans 3'`, `'Source Serif 4'`).

## Self-Check: PASSED

- FOUND: src/cyber-uw/components/CaseWorkspace.tsx
- FOUND: src/main.tsx
- FOUND: src/styles/typography.css
- FOUND: package.json
- FOUND: b7d6b56
- FOUND: 6f2791a
