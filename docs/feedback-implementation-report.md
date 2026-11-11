# Client feedback implementation report

Branch: `feat/client-feedback-demo`  
Base: `source` (not `main` — `main` remains the live GitHub Pages bundle)  
Demo case for consistency: **CYB-2401 Northline Stays**  
Preview gallery: [`docs/feedback-preview/index.html`](./feedback-preview/index.html)

## Traceability

| # | Feedback item | Where it lives | Change | Test |
|---|---|---|---|---|
| S1 | Persistent case header: Insured \| Industry \| Revenue \| Requested Limit \| Cyber Risk \| Appetite \| Completeness | `CaseContextHeader.tsx` via `CyberUwShell` `WorkbenchPageHeader.subtitle` | Extended existing header slot; no nav redesign | **Pass** (Playwright desktop + laptop) |
| I1 | Cyber documents list (Application, InfoSec, IRP, Loss Runs, Broker Correspondence) | `SubmissionIntakePanel.tsx` on New Submission | Added panel above existing documents UI | **Pass** |
| I2 | Document statuses Received \| Classified \| Extracted \| Missing \| Review Required | `clientFeedbackDemo.intakeDocumentsForCase` + intake panel | Status chips per doc | **Pass** |
| I3 | Completeness %, missing docs, broker follow-up count | Intake metrics strip | Uses `completenessPct` + doc/gap counts | **Pass** |
| I4 | Insured matched \| Duplicate check completed \| Broker identified | Intake match block | Deterministic demo match results | **Pass** |
| E1 | Evidence Verification screen for MFA, EDR, backups, privileged access, patching, IR | Tracker step **Evidence Verification** → `EvidenceVerificationPanel.tsx` | New step in existing Progress Tracker (Review group) | **Pass** |
| E2 | Declaration \| Document Evidence \| External Observation \| Result \| Confidence | Evidence table columns | Table on new screen | **Pass** |
| E3 | Statuses Verified \| Partially Verified \| Contradicted \| Missing Evidence \| N/A | Result chips | CSS + data | **Pass** |
| E4 | Strong MFA contradiction (all users vs privileged only) | CYB-2401 gap `g1` + evidence row | Mock + evidence copy aligned | **Pass** |
| X1 | Findings categories Attack Surface \| CVEs \| Security Rating \| Exposed Services \| Third-party | `ExternalFindingsPanel.tsx` on External Risk Enrichment | Category tabs above existing vendor panels | **Pass** |
| X2 | Source \| Finding \| Severity \| Observed Date \| Freshness \| Entity Match \| UW Impact | Findings table | Same panel | **Pass** |
| X3 | Security-rating trend (not only latest) | Trend SVG from `securityRatingForCase().trend` | Added trend band | **Pass** |
| X4 | Highlight conflicts with declarations | Conflict banner + row styling | Driven by same MFA/EDR gaps | **Pass** |
| X5 | Label BitSight (and peers) Simulated | Vendor tab labels + BitSight panel kicker + finding `Simulated` chips | No live API claimed | **Pass** |
| R1 | Five measures: Cyber Risk, Control Effectiveness, Evidence Confidence, Completeness, Appetite Result | `RiskAnalysisDesk.tsx` + `riskMeasuresForCase` | Replaces reliance on single composite; legacy composite kept labelled | **Pass** |
| R2 | “Why this result?” with evidence + rules | Expandable control on each measure | | **Pass** |
| R3 | Appetite Within Appetite \| Refer \| Decline | Appetite measure value | | **Pass** |
| R4 | Exact referral rule (e.g. MFA coverage below minimum threshold) | Appetite why + HITL referral rule line | CYB-2401 `CTRL-MFA-01` detail | **Pass** |
| H1 | AI recommendation Approve \| Refer \| Request Information \| Decline | `HitlDecisionPanel.tsx` | Maps to store `quote`/`refer`/`decline` + info modal | **Pass** |
| H2 | Top 3 reasons with evidence links | HITL reasons list (`#evidence-mfa`, `#appetite-rule`, `#enrichment-rating`) | | **Pass** |
| H3 | Prominent human controls same four labels | HITL action buttons | | **Pass** |
| H4 | Mandatory rationale for overrides / material exceptions | HITL textarea + disabled submit; also `DecisionConfirmModal` | Blocks empty override | **Pass** |
| H5 | Approval authority / referral owner when over authority | HITL authority card | Limit/tier/critical gaps | **Pass** |

## Deliberately unchanged (protect UX)

- Sidebar navigation, Cases home KPIs/table, Reports tabs chrome, Birlasoft branding, login
- Store decision enums remain `quote | refer | decline` (HITL labels are presentation)
- Existing vendor panels (BitSight / Cyence / Cytora) still mount after enrichment consent
- Floating workflow bar still unmounted (HITL placed on Sync stage to avoid floating redesign)
- GitHub Pages `main` branch not updated by this PR

## Assumptions

- “Approve” = store `quote`; “Refer” = store `refer`; “Request Information” opens existing Info Required modal
- Evidence Verification shares workflow stage 1 with Triage (tracker step 2) to avoid a fifth workflow-stage rewrite
- Approve with critical gaps auto-records manager co-sign financial stub so the demo can complete HITL without a separate finance form redesign
- All third-party enrichment is Simulated in this demo

## Test evidence

- Command: `npx playwright test`
- Projects: `desktop` (1440×900), `laptop` (1280×800)
- Result: **2 passed**
- Screenshots: `docs/feedback-preview/screenshots/`
- Console / page errors: none asserted in walkthrough

## Preview

Open `docs/feedback-preview/index.html` locally (or via the PR file browser) for a screen-by-screen gallery of every new/changed surface.
