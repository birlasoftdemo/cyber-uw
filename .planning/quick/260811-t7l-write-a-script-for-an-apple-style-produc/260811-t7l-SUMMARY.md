---
phase: 260811-t7l-write-a-script-for-an-apple-style-produc
plan: 01
subsystem: docs
tags: [marketing, launch-script, apple-keynote, cyber-uw, remotion-handoff]

requires:
  - phase: forged-idea / journey one-pager
    provides: Positioning locks, demo spine, journey stages, locked tagline
provides:
  - Apple-keynote-style product launch VO script with timed AI-forward chapters
  - Remotion scene→beat mapping notes for a later video pass
affects: [video-remotion-pass, marketing-demo]

tech-stack:
  added: []
  patterns: [sparse Apple-keynote VO beats with Timecode/Visual/On-screen/VO/AI-proof]

key-files:
  created:
    - docs/planning/APPLE-STYLE-LAUNCH-SCRIPT.md
  modified: []

key-decisions:
  - "Script-only deliverable; no Remotion edits or MP4 render"
  - "Eleven evocative chapters following demo spine with one AI surface per AI beat"
  - "Closer uses locked tagline verbatim; HITL owns bind; tier is guidance only"

patterns-established:
  - "Launch scripts live under docs/planning/ with Meta → locks → chapters → Full VO → Audit → Remotion handoff"

requirements-completed: [QUICK-T7L]

coverage:
  - id: D1
    description: Apple-style launch script with Meta, positioning locks, 11 timed chapters, Full VO, Audit PASS checklist, and Remotion handoff
    requirement: QUICK-T7L
    verification:
      - kind: other
        ref: "test -f docs/planning/APPLE-STYLE-LAUNCH-SCRIPT.md && rg -q 'Agents assist · underwriter binds · every override is explainable' docs/planning/APPLE-STYLE-LAUNCH-SCRIPT.md && rg -c '^- PASS —' docs/planning/APPLE-STYLE-LAUNCH-SCRIPT.md"
        status: pass
    human_judgment: true
    rationale: Marketing tone and visual beat quality need human read-through before Remotion production

# Metrics
duration: 12min
completed: 2026-08-11
status: complete
---

# Phase 260811-t7l Plan 01: Apple-style launch script Summary

**Canonical ~84s Apple-keynote Cyber UW launch script marketing seven AI assists along the locked demo spine, closing on the explainable-override tagline**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-08-11T15:43:16Z
- **Completed:** 2026-08-11T15:55:00Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Created `docs/planning/APPLE-STYLE-LAUNCH-SCRIPT.md` with Meta, positioning locks, 11 timed chapters, contiguous Full VO (~110 words), Audit checklist (7 PASS rows), and Remotion handoff
- Showcased all seven AI value props as distinct beats before HITL lock and PAS sync
- Kept positioning clean: Birlasoft IP accelerator, MGA buyer, guidance-only tier, product never takes insurance risk

## Task Commits

Each task was committed atomically:

1. **Task 1: Draft Apple-keynote launch script with AI-forward beats** - `05db693` (docs)
2. **Task 2: Self-audit script against product locks** - `e205740` (docs)
3. **VO band tune** - `54e84d5` (docs) — spoken word count into ~110 band

**Plan metadata:** (pending final docs commit)

## Files Created/Modified

- `docs/planning/APPLE-STYLE-LAUNCH-SCRIPT.md` — production-ready Apple-style launch VO script + Remotion mapping notes

## Decisions Made

- Script only — no Remotion source or render changes
- Chapter names evocative (not feature dump); AI proof column maps to existing UI surfaces only
- Audit section uses `- PASS —` rows for automated verification

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added Full VO read section**
- **Found during:** Task 1 (user goal required contiguous Full VO H2)
- **Issue:** Plan Task 1 listed Meta / locks / chapters / Remotion; user goal also required Full VO + ordered Self-audit before Remotion
- **Fix:** Included `## Full VO read` and ordered Audit before Remotion handoff
- **Files modified:** docs/planning/APPLE-STYLE-LAUNCH-SCRIPT.md
- **Verification:** H2 sections present in Meta → locks → Chapters → Full VO → Audit → Remotion order
- **Committed in:** 05db693 / e205740

**2. [Rule 1 - Bug] Tuned spoken VO into 110–160 band**
- **Found during:** Task 2 self-audit
- **Issue:** Initial VO draft counted under ~110 spoken words
- **Fix:** Sparse fragment expansions (inbox only, HITL cue, ingest phrasing) to ~110 words without new claims
- **Files modified:** docs/planning/APPLE-STYLE-LAUNCH-SCRIPT.md
- **Verification:** python token count = 110; Audit PASS row updated
- **Committed in:** 54e84d5

---

**Total deviations:** 2 auto-fixed (1 missing critical, 1 bug)
**Impact on plan:** Strengthened deliverable against user H2 contract and word-count lock; no scope creep into Remotion.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Script is ready for marketing VO record and a later Remotion rebuild using handoff NEW CAPTURE flags
- No blockers for Remotion video pass when scheduled

## Known Stubs

None — marketing script intentionally references existing demo UI; Remotion implementation deferred by design.

## Self-Check: PASSED

- FOUND: docs/planning/APPLE-STYLE-LAUNCH-SCRIPT.md
- FOUND: 05db693, e205740, 54e84d5 in git log
- FOUND: ## Audit checklist with ≥6 PASS rows; locked tagline; Remotion handoff; Birlasoft positioning

---
*Phase: 260811-t7l-write-a-script-for-an-apple-style-produc*
*Completed: 2026-08-11*
