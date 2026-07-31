---
phase: 260731-f4h-simplify-manage-submissions-outtake-acti
plan: 01
subsystem: ui
tags: [react, outtakes, manage-submissions, FormShippingCenter]

requires: []
provides:
  - Simplified outtake ACTIONS column (View form + Proceed to Closure only)
  - Dead revoke/markReturned handler cleanup with copyLink retained for dispatch
affects: []

tech-stack:
  added: []
  patterns:
    - Outtake row actions limited to review (View form) and closure routing (Proceed to Closure when returned)

key-files:
  created: []
  modified:
    - src/cyber-uw/components/FormShippingCenter.tsx

key-decisions:
  - "Removed Link/Mark returned/Revoke from ACTIONS; kept copyLink for handleSend clipboard after dispatch"
  - "Retained OuttakeStatus revoked and statusChip revoked branch for data-model compatibility"

patterns-established:
  - "Manage Submissions outtake ACTIONS: View form always (disabled when revoked); Proceed to Closure only when returned"

requirements-completed: [QUICK-F4H]

coverage:
  - id: D1
    description: Outtake ACTIONS shows only View form and (when returned) Proceed to Closure
    requirement: QUICK-F4H
    verification:
      - kind: other
        ref: "rg -n 'View form|Proceed to Closure|Mark returned|Revoke|copyLink\\(o\\.link\\)' src/cyber-uw/components/FormShippingCenter.tsx"
        status: pass
    human_judgment: false
  - id: D2
    description: revoke/markReturned handlers and Ban/Copy imports removed; copyLink still used by handleSend
    requirement: QUICK-F4H
    verification:
      - kind: other
        ref: "rg -n '\\brevoke\\b|\\bmarkReturned\\b|\\bBan\\b|\\bCopy\\b' src/cyber-uw/components/FormShippingCenter.tsx"
        status: pass
    human_judgment: false

duration: 1min
completed: 2026-07-31
status: complete
---

# Phase 260731-f4h: Simplify Manage Submissions outtake ACTIONS Summary

**Outtake ACTIONS reduced to View form + Proceed to Closure; Link/Mark returned/Revoke and dead handlers removed while dispatch still copies the broker link**

## Performance

- **Duration:** 1 min
- **Started:** 2026-07-31T05:26:03Z
- **Completed:** 2026-07-31T05:27:00Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Slimmed outtakes table ACTIONS to View form and conditional Proceed to Closure
- Removed Link, Mark returned, and Revoke action buttons
- Deleted revoke/markReturned handlers and Ban/Copy imports; preserved copyLink for handleSend

## Task Commits

Each task was committed atomically:

1. **Task 1: Slim outtake ACTIONS to View form + Proceed to Closure** - `ce4bdaf` (feat)
2. **Task 2: Remove dead revoke/markReturned handlers and unused imports** - `e3e6d38` (refactor)

**Plan metadata:** skipped (orchestrator commits docs)

## Files Created/Modified
- `src/cyber-uw/components/FormShippingCenter.tsx` - Simplified ACTIONS UI; removed revoke/markReturned and unused lucide icons

## Decisions Made
- Followed plan: keep copyLink + showInfoToast/showSuccessToast for dispatch clipboard path; keep revoked status in the type/chip model

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
Quick task complete; Manage Submissions outtake ACTIONS matches the two-button set.

## Self-Check: PASSED
- FOUND: src/cyber-uw/components/FormShippingCenter.tsx
- FOUND: ce4bdaf
- FOUND: e3e6d38

---
*Phase: 260731-f4h-simplify-manage-submissions-outtake-acti*
*Completed: 2026-07-31*
