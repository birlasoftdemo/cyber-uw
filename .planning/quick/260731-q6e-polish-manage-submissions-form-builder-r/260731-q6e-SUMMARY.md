---
phase: 260731-q6e-polish-manage-submissions-form-builder-r
plan: 01
subsystem: cyber-uw
tags: [ui-polish, form-builder, broker-preview]
status: complete
dependency-graph:
  requires: []
  provides:
    - Single-action Manage Submissions header
    - Black-pill Shared/Templates tab selection
    - Empty-start dispatch form builder
    - Minimal broker preview chrome
  affects:
    - src/cyber-uw/components/FormShippingCenter.tsx
    - src/cyber-uw/CyberUwShell.tsx
    - src/cyber-uw/components/DispatchFormBuilder.tsx
    - src/cyber-uw/components/broker-form/BrokerFormShell.tsx
    - src/cyber-uw/components/broker-form/BrokerFormFlow.tsx
    - src/styles/cuw-broker-form.css
tech-stack:
  added: []
  patterns:
    - "case-drawer-tabs class reused on Tabs root to inherit slate-900 selected-pill styling from workbench-surface.css"
key-files:
  created: []
  modified:
    - src/cyber-uw/components/FormShippingCenter.tsx
    - src/cyber-uw/CyberUwShell.tsx
    - src/cyber-uw/components/DispatchFormBuilder.tsx
    - src/cyber-uw/components/broker-form/BrokerFormShell.tsx
    - src/cyber-uw/components/broker-form/BrokerFormFlow.tsx
    - src/styles/cuw-broker-form.css
decisions: []
metrics:
  duration: "~20m"
  completed: 2026-07-31
---

# Phase 260731-q6e Plan 01: Manage Submissions + form builder polish Summary

Four presentational fixes: Manage Submissions header now carries a single Dispatch New Form action, the Shared/Templates tabs use the same black selected-pill styling as the case drawer, the dispatch form builder opens with zero modules selected, and the broker preview chrome is stripped of dead bookmark/share controls.

## What Changed

**Task 1 — Single-action header + black selected tab pill**
- `FormShippingCenter.tsx`: removed the secondary "New Submission" button, its `FilePlus2` import, and the `onNewSubmission` prop (Props interface + destructure). Added `className="case-drawer-tabs"` to the `Tabs` wrapping Shared/Templates so the selected tab renders as a slate-900 pill with white text, matching `CaseWorkspace.tsx` / `CyberNewSubmissionModal.tsx`.
- `CyberUwShell.tsx`: removed the now-invalid `onNewSubmission` prop from the `FormShippingCenter` call site. The Decision Workbench header's own intake CTA (`openNewSubmission` via `WorkbenchPageHeader` meta slot, gated to `shellView === 'workbench'`) is untouched and remains the surviving intake entry point.

**Task 2 — Form builder starts empty**
- `DispatchFormBuilder.tsx`: `moduleIds` state now initializes to `[]` instead of `defaultModuleIds()`; dropped the now-unused `defaultModuleIds` import (`CYBER_FORM_MODULES` still imported). `formModules.ts` and `FormShippingCenter`'s use of the helper for demo outtakes are unchanged. `canSend`'s `moduleIds.length > 0` guard and the preview's existing empty-path handling (select-modules heading, 0% progress, em-dash counter) required no further changes.

**Task 3 — Minimal broker preview chrome**
- `BrokerFormShell.tsx`: deleted the Bookmark and Share2 icon buttons and the now-empty `lucide-react` import; removed the `toolsEnabled` prop from the interface, destructure, and default. `cuw-broker__tools` wrapper, `cuw-broker__login*` identity card, progress row, stage, and footer slots are all preserved.
- `BrokerFormFlow.tsx`: removed the `toolsEnabled={path.length > 0}` pass-through to `BrokerFormShell`. Progress, counter, footer hint, and Back/Continue/Review/Submitted affordances untouched.
- `cuw-broker-form.css`: deleted the three dead `.cuw-broker__nav-icon` rule blocks (base, hover, disabled); `.cuw-broker__tools` and `.cuw-broker__login*` rules kept.

## Deviations from Plan

None — plan executed exactly as written.

## Verification

- `npx tsc -p tsconfig.app.json --noEmit` — clean.
- `npx oxlint src/cyber-uw` — clean (only pre-existing warnings in unrelated files: `CyberPrimitives.tsx` fast-refresh warnings, one pre-existing `exhaustive-deps` warning in `BrokerFormFlow.tsx` that predates this change).
- All plan-specified `rg`-based automated verify commands passed for all three tasks.

## Self-Check: PASSED

- FOUND: src/cyber-uw/components/FormShippingCenter.tsx (case-drawer-tabs, no FilePlus2/onNewSubmission)
- FOUND: src/cyber-uw/CyberUwShell.tsx (openNewSubmission retained, prop removed)
- FOUND: src/cyber-uw/components/DispatchFormBuilder.tsx (useState<string[]>([]))
- FOUND: src/cyber-uw/components/broker-form/BrokerFormShell.tsx (no Bookmark/Share2/toolsEnabled/nav-icon)
- FOUND: src/cyber-uw/components/broker-form/BrokerFormFlow.tsx (no toolsEnabled)
- FOUND: src/styles/cuw-broker-form.css (no nav-icon rules)
- Commits verified in `git log --oneline`: 45f0c50, e909cf9, d7ecddb
