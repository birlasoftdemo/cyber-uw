---
phase: 261014-moy
plan: 01
subsystem: docs
tags: [user-story, document-extraction, policy-documents, cyber-uw]

requires:
  - phase: forged-idea
    provides: Cyber underwriter as the primary MGA persona
  - phase: live Policy Documents screen
    provides: New Submission ingest modal and PolicyDocumentsStageBody
provides:
  - User story for ingesting a broker package and reviewing extracted policy information on Policy Documents
  - Nine source-checked acceptance criteria tied to on-screen labels
affects: [policy-documents, new-submission, product-planning]

tech-stack:
  added: []
  patterns:
    - "User stories for an existing screen quote on-screen labels and cite the component that renders them"

key-files:
  created:
    - .planning/quick/261014-moy-write-a-user-story-for-the-document-extr/USER-STORY-DOCUMENT-EXTRACTION.md
  modified: []

key-decisions:
  - "Story covers New Submission (Upload and Mail MCP) and Policy Documents only"
  - "Ops-package ready copy is the Meridian Logistics / mail-meridian-ops branch, not a role check inside the modal"
  - "Evidence names cyberTriageRules.ts and missingDocs.ts where section titles and the missing-doc list are defined"

patterns-established:
  - "Acceptance criteria use Given/When/Then and the product's own control labels"

requirements-completed: [QUICK-MOY]

coverage:
  - id: D1
    description: "User story for document extraction and Policy Documents with persona, goal, benefit, nine acceptance criteria, out-of-scope boundary, evidence table, and nine source-check PASS lines"
    requirement: QUICK-MOY
    verification:
      - kind: other
        ref: "test -f USER-STORY-DOCUMENT-EXTRACTION.md && rg headings Persona/Goal/Benefit/Acceptance criteria/Evidence/Source check && rg -c '^- PASS —' -ge 9"
        status: pass
    human_judgment: true
    rationale: "A reader should confirm the story against New Submission and Policy Documents before treating any criterion as a build requirement"

duration: 4min
completed: 2026-10-14
status: complete
---

# Phase 261014-moy Plan 01: Document extraction user story Summary

**User story for New Submission ingest and Policy Documents review, with nine acceptance criteria traced to the live screen**

## Performance

- **Duration:** 4 min
- **Started:** 2026-10-14T10:55:00Z
- **Completed:** 2026-10-14T10:58:39Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Wrote one user story whose persona is the cyber underwriter, with Cyber Ops as the Policy Documents owner.
- Acceptance criteria cover Upload and Mail MCP, the four ingestion thinking steps, the Policy Documents meta grid, required-doc checklist, package table, extracted-field accordion, Documents Complete gate, missing-package chase, and the Ops / Ready for UW handoff.
- Source check records nine PASS lines against the components that render those controls.

## Task Commits

Each task was committed atomically:

1. **Task 1: Write the extraction and Policy Documents user story** - `1bcb450` (docs)
2. **Task 2: Source-check the story against the screen** - `649d0e0` (docs)

**Plan metadata:** skipped (orchestrator commits docs)

## Files Created/Modified

- `.planning/quick/261014-moy-write-a-user-story-for-the-document-extr/USER-STORY-DOCUMENT-EXTRACTION.md` — persona, goal, benefit, scope, nine acceptance criteria, out of scope, evidence, and source check

## Decisions Made

- The story stays on New Submission and Policy Documents. Customer 360, Risk Information, Risk Analysis, Getting Ready to Quote, financial sign-off, quote or decline, and policy-admin sync stay out of scope.
- Ready copy after ingest uses the product sentences: decision-queue review for a standard package, Ops-queue intake then Ready for UW for the Meridian Logistics Ops package.
- Evidence rows cite `cyberTriageRules.ts` (`APP_SECTIONS`, `sectionReportsForCase`) and `missingDocs.ts` (`missingDocsForCase`) because those symbols define the section list and the missing-document list.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Product and engineering can read the story as the ingest-to-Policy-Documents slice.
- No application code changed.

## Self-Check: PASSED

- FOUND: `.planning/quick/261014-moy-write-a-user-story-for-the-document-extr/USER-STORY-DOCUMENT-EXTRACTION.md`
- FOUND: `1bcb450`
- FOUND: `649d0e0`

---
*Phase: 261014-moy*
*Completed: 2026-10-14*
