# Cyber UW — implementation plan (research → stages)

Persona: **James** (cyber UW at MGA). Chrome: Submission Workbench case-detail pattern.

## Research → stage map

| Stage | Secondary pain (laundry) | UW job | MVP features |
|-------|--------------------------|--------|--------------|
| 1 Intake | P2.1, P2.6, P2.7 | See package completeness without hunting email/PDF | M1–M4 |
| 2 Verify | P1.2, P1.4, P1.10 | Catch attestation fiction vs mock signal; draft RFIs | M5–M8 |
| 3 Tier | P2.11, P3.4, P3.5, P3.7 | Defend Quote/Refer/Decline + tier assist (not premium) | M9–M12, M15 |
| 4 Book | P4.1, P4.3, P4.5 | Spot shared-vendor concentration before bind | M16 |
| 5 Decide | P2.4, P2.5, P2.12 | Dossier + HITL confirm + mock PAS (approve-before-send) | M13–M14, M17 |

## UI migration from submission workbench

| Workbench | Cyber UW |
|-----------|----------|
| CaseDetailDrawer header | Case header (insured, `wb-ref-pill`, AiBadge, UW chip) |
| Left `CaseProgressStepper` | Left `CyberDecisionJourney` (5 research stages) |
| Advance action card | Next-step CTA on current stage |
| Tabs: Workflow / Policy / … | Tabs: **Workflow** / Gap board / Dossier / PAS |
| `wb-stage-card` sections | Workflow stage cards with research eyebrow |
| BindConfirmModal | DecisionConfirmModal |

## Layout rules (fix)

1. Horizontal `case-drawer-tabs` only — never stretch tab list vertically.  
2. Scrollable content column (`flex-1 overflow-y-auto`) owns the work surface.  
3. Stepper lives **only** in the left rail — not in header, not duplicated in Workflow.  
4. Visual hierarchy: `wb-eyebrow` → `font-display` title → body; stage cards use `wb-stage-card--current`.

## Out of POC (moon / partner)

Continuous monitoring, cat models, IR learning loop, live BitSight/PAS — see FEATURE-LISTS-MVP-MOON.md X*.
