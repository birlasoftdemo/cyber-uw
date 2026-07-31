---
status: planned
quick_id: 260731-qzs
slug: move-stage-stepper-new-closure-inline-ab
---

# PLAN — Stage stepper above Continue CTA

## Goal
Put the New→Closure progress stepper **inline above** the advance Continue CTA (same chrome strip), not as a separate row below it.

## Tasks
1. In `CaseWorkspace.tsx`, nest `CyberProgressStepper` inside `wb-cyber-advance-strip` above `CyberStageAdvanceCard`; remove the separate stepper chrome block below.
2. Tweak CSS so the combined strip reads as one unit (stepper on top, CTA below; no double heavy borders).
3. Keep stepper Workflow-tab only (hide on Dossier).

## Done when
- Workflow header shows: tabs → [stepper + Continue] as one block → canvas.
- Dossier still shows advance strip without stepper.
