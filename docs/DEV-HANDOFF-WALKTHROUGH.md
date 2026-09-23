# Dev handoff walkthrough — Cyber UW

**Audience:** Engineering taking over the UW workbench  
**Primary artifact:** Remotion MP4 — `video/out/dev-handoff-walkthrough.mp4`  
**Composition:** `DevHandoffWalkthrough`  
**Case narrative:** Brightcare Digital Health (`demoPackage: 'uw'`)

Each on-screen beat pairs a **user action** with a **Dev · understand** line (store gates, files, role rules).

## How to watch / re-render

```bash
# 1. Run the app (repo root)
npm run dev

# 2. Capture current UI screens (video/)
cd video
npm run capture:handoff

# 3. Render shareable MP4 (~2 min)
npm run render:handoff
# → out/dev-handoff-walkthrough.mp4
```

Preview: `cd video && npm run dev` → **DevHandoffWalkthrough**.  
Override URL: `CYBER_UW_URL=http://127.0.0.1:5173 npm run capture:handoff`.

## Demo credentials

| Role | Email | Password | Landing |
|------|-------|----------|---------|
| Underwriter | `uw@cyber.internal` | `uw123` | Open cases |
| Ops | `ops@cyber.internal` | `ops123` | Open cases (+ Manage Submissions) |

SSO always signs in as UW. Session: `sessionStorage` key `cyber-uw-auth-session`.

## Beat map — what developers need to understand

| Beat | Screen | Understand |
|------|--------|------------|
| Login | `01-login.png` | `App.tsx` auth gate; `authStore`; no React Router for shell |
| Open cases | `02-open-cases.png` | `selectedId == null` → `CyberCasesListPage`; filters in store |
| New Submission | `03-new-submission.png` | Modal → `createSubmission` / `demoIngest.ts` Brightcare |
| Customer 360 | `04-customer-360.png` | `Customer360Panel`; `customer360Dismissed` |
| Float C360 | `05-float-c360.png` | `FloatingWorkflowBar` `surface='c360'` → dismiss |
| Float Docs Complete | `05b-float-docs-complete.png` | `canLeavePolicyDocuments` → `signOffPackage` |
| Policy Documents | `06-policy-documents.png` | `CYBER_FLOW_STAGES[0]`; `workflowStage` |
| Risk Information | `07-risk-information.png` | `triageFindingsForCase` + `riskJudgments` |
| Float Continue | `07b-float-continue-risk.png` | `advanceWorkflowStage` + scroll gate |
| Risk Analysis | `08-risk-analysis.png` | Rating / ALE panels; stage 2 |
| Getting Ready to Quote | `09-getting-ready-quote.png` | `saveFinancialSignOff`; authority helpers |
| Confirm | `09b-decision-confirm.png` | `DecisionConfirmModal` (no separate bind) |
| Locked | `10-decision-locked.png` | `applyDecision` → `pasStatus: synced` |

## Key files

| Area | Path |
|------|------|
| Shell / list | `src/cyber-uw/CyberUwShell.tsx`, `components/CyberWorkbenchDesk.tsx` |
| Auth | `pages/LoginPage.tsx`, `store/authStore.ts` |
| Intake | `components/CyberNewSubmissionModal.tsx`, `data/demoIngest.ts` |
| Case chrome | `components/CaseWorkspace.tsx`, `FloatingWorkflowBar.tsx` |
| C360 | `components/Customer360Panel.tsx`, `utils/c360AiSummary.ts` |
| Gates | `constants/cyberFlow.ts`, `store/cyberUwStore.ts` |
| Confirm | `components/DecisionConfirmModal.tsx`, `DocumentsCompleteModal.tsx` |

## Stages (product)

1. **Policy Documents** — package checklist; Documents Complete  
2. **Risk Information** — required triage + float scroll gate  
3. **Risk Analysis** — security rating + ALE / exposure  
4. **Getting Ready to Quote** — financial sign-off → Quote / Escalate / Decline  

## Related films

| Film | Use when |
|------|----------|
| `DevHandoffWalkthrough` | Current UW UI + developer takeaways (this doc) |
| `CyberUwWorkflow` | Ops shipping → legacy Northwind labels |
| `AgentsAssistLaunch` | Keynote-style launch with VO |
