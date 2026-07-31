---
id: 260731-mfh
slug: beautify-gap-board-fix-advance-strip-hie
status: planned
---

# Quick: Beautify Gap board advance strip hierarchy

## Goal
Fix messy Gap board chrome: redundant "Review focused gaps" CTA when already on Gap board, weak visual hierarchy, cramped header.

## Tasks
1. Pass `activeTab` into `CyberStageAdvanceCard`; when on `gaps` with open material gaps, show status-only strip (no redundant CTA). On Workflow (and other tabs), make Review CTA primary/prominent.
2. Restyle advance strip CSS for clearer hierarchy (status chip + stronger CTA when present).
3. Clean GapsTab header spacing and remove competing shoulder copy.

## Done when
- On Gap board: no "Review focused gaps" button; clear "sign off here" status.
- On Workflow with open gaps: prominent Review CTA.
- Gap board content has clearer title hierarchy and breathing room.
