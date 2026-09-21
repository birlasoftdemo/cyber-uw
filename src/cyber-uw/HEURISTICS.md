# Cyber UW — heuristics + workbench inheritance

Persona: **James** (cyber UW). Layout mirrors **Case Detail Drawer**: left progress rail, horizontal pill tabs, scrollable stage cards.

## Research → UI

See `DEV-PLAN.md` and `constants/cyberFlow.ts` — five stages: **Intake → Verify → Tier → Book → Decide**.

## Retained workbench DNA

| Element | Use in Cyber UW |
|---------|-----------------|
| CaseDetailDrawer body | Left rail + scrollable main |
| CaseProgressStepper | `CyberDecisionJourney` (vertical only) |
| `wb-stage-card` / Workflow tab | Research-mapped stage sections |
| `case-drawer-tabs` | Horizontal pill tabs only |
| BindConfirmModal | DecisionConfirmModal |
| AiBadge / ai-panel | AI recommend vs UW Chip |

## Layout rules

1. **Work surface owns height** — tab panels scroll inside `flex-1 overflow-y-auto`; tab list never stretches vertically.  
2. **Stepper once** — left rail only; not in header; not duplicated in Workflow.  
3. **Hierarchy** — `wb-eyebrow` → `font-display` title → body; current stage uses `wb-stage-card--current`.
