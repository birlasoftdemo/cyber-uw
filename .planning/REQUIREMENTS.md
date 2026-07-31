# Requirements: Cyber UW

**Defined:** 2026-07-31  
**Core Value:** Client-demo-ready cyber underwriting workbench — guided stages with HITL sign-off, from new submission to PAS-coded.

## v1 Requirements

### Demo spines

- [ ] **DEMO-01**: Client can complete the **Manage Submissions** spine end-to-end: create form → dispatch → returned → Proceed to Closure → staged journey → Quote → mock PAS sync (coded).
- [ ] **DEMO-02**: Client can complete the **Workbench** spine end-to-end: open a queued case → Proceed through stages → Quote → mock PAS sync (coded).
- [ ] **DEMO-03**: Both spines share the same stage chrome, Proceed gating, and HITL sign-off rules.

### Stage UX

- [ ] **STAGE-01**: Each cyber stage (Intake, Verify, Tier, Book, Decide) has one clear UW job, the info needed for that job, and a primary **Proceed** control.
- [ ] **STAGE-02**: Stages never auto-advance; progress requires an explicit Proceed click.
- [ ] **STAGE-03**: HITL sign-off is required where AI ingestion, risk/signal analysis, or Gap board actions apply, before Proceed unlocks (or as part of completing the stage job).
- [ ] **STAGE-04**: Stepper and stage cards are visually polished to a **feel target** matching the insurance/reinsurance submission UW craft — without porting that product’s components verbatim.
- [ ] **STAGE-05**: Verify / Gap board surfaces attest-vs-signal comparisons with resolve/refer sign-off suitable for live demo.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Live BitSight / PAS / IdP | Demo uses mocks |
| Literal component port from submission UW | Feel target only |
| Continuous monitoring / cat models | Moonshot |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DEMO-01 | Phase 1 | Pending |
| DEMO-02 | Phase 1 | Pending |
| DEMO-03 | Phase 1 | Pending |
| STAGE-01 | Phase 1 | Pending |
| STAGE-02 | Phase 1 | Pending |
| STAGE-03 | Phase 1 | Pending |
| STAGE-04 | Phase 1 | Pending |
| STAGE-05 | Phase 1 | Pending |
