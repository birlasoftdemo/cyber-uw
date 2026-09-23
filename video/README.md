# Cyber UW video (Remotion)

## Agents Assist launch (default)

Apple-keynote style ~91s film from `docs/planning/APPLE-STYLE-LAUNCH-SCRIPT.md`:

- Humanized VO (`public/vo/*.m4a`, macOS **Flo** via `npm run vo`)
- Spotlight callouts on product screens so viewers can follow AI beats
- Composition: `AgentsAssistLaunch` · 1920×1080 · 30fps

```bash
cd video
npm run vo       # regenerate chapter VO (macOS only)
npm run dev      # Remotion Studio
npm run render   # → out/agents-assist-launch.mp4
```

## Dev handoff walkthrough (`DevHandoffWalkthrough`)

**Share this film** with engineering. Brightcare case walkthrough — each beat includes a **Dev · understand** line (gates, store, files). ~2 minutes.

```bash
# App must be running (repo root) — default http://localhost:5173
npm run dev

# Refresh screenshots
cd video
npm run capture:handoff
# or: CYBER_UW_URL=http://127.0.0.1:5173 npm run capture:handoff

npm run render:handoff   # → out/dev-handoff-walkthrough.mp4
```

Screenshots: `public/handoff/`. Full share kit: [`docs/DEV-HANDOFF-WALKTHROUGH.md`](../docs/DEV-HANDOFF-WALKTHROUGH.md).

### Demo credentials

| Role | Email | Password |
|------|-------|----------|
| Underwriter | `uw@cyber.internal` | `uw123` |
| Ops | `ops@cyber.internal` | `ops123` |

SSO buttons sign in as the underwriter. Capture uses **Brightcare Digital Health** (`demoPackage: 'uw'`).

### Scene order

| Beat | Screen | Dev · understand (summary) |
|------|--------|----------------------------|
| Title | (motion) | Brightcare · login to lock |
| 1. Login | `01-login.png` | Auth gate; no case URLs |
| 2. Open cases | `02-open-cases.png` | `selectedId`; list filters |
| 3. New Submission | `03-new-submission.png` | `createSubmission` / demo ingest |
| 4. Customer 360 | `04-customer-360.png` | `customer360Dismissed` |
| 5. Float C360 | `05-float-c360.png` | `surface='c360'` → dismiss |
| 6a. Float Docs Complete | `05b-float-docs-complete.png` | `canLeavePolicyDocuments` |
| 6b. Policy Documents | `06-policy-documents.png` | Stage 0 / `workflowStage` |
| 6c. Risk Information | `07-risk-information.png` | Triage + `riskJudgments` |
| 6d. Float Continue | `07b-float-continue-risk.png` | `advanceWorkflowStage` + scroll |
| 6e. Risk Analysis | `08-risk-analysis.png` | Rating / ALE panels |
| 6f. Getting Ready to Quote | `09-getting-ready-quote.png` | `saveFinancialSignOff` |
| 6g. Confirm | `09b-decision-confirm.png` | `DecisionConfirmModal` |
| 6h. Locked | `10-decision-locked.png` | `applyDecision` · PAS synced |
| Closer | mosaic | Code map reminder |

---

## Product demo walkthrough (`CyberUwWorkflow`)

Ops shipping → UW Northwind stage arc (no VO). **Legacy stage labels** (Feedback / Review Risk / Closure) — prefer `DevHandoffWalkthrough` for current UI handoff.

```bash
# App must be running (repo root)
npm run dev -- --host 127.0.0.1 --port 5174

# Refresh screenshots (requires Playwright chromium once)
cd video
node scripts/capture-walkthrough.mjs

npm run render:workflow   # → out/cyber-uw-workflow.mp4
```

Screenshots: `public/walkthrough/`.

### Scene order

| Beat | Screen | Persona |
|------|--------|---------|
| Login | `01-login.png` | shared |
| Manage Submissions (Shared) | `03-manage-submissions.png` | Ops |
| Select modules / ship | `11-ops-module-builder.png` | Ops |
| Returned outtakes | `12-ops-returned-and-ship.png` | Ops |
| Proceed → Feedback desk | `13-ops-proceed-closure-desk.png` | Ops |
| Ready for UW | `14-ops-uw-handoff.png` | Ops |
| Referral Inbox | `05-referral-inbox.png` | Ops |
| Handoff card | (motion) | — |
| UW Insights | `15-uw-insights.png` | Cyber UW |
| Gap-blocked backlog drill | `16-uw-gap-backlog-drill.png` | Cyber UW |
| Northwind desk (New done) | `07-uw-decision-desk.png` | Cyber UW · **CYB-2401** |
| Feedback Ideal vs Detected | `08-uw-feedback-ideal-detected.png` | Cyber UW |
| Review Risk sign-offs | `17-uw-review-risk.png` | Cyber UW |
| Review Platform signed | `18b-uw-review-platform-signed.png` | Cyber UW |
| Closure financial sign-off | `09-uw-closure.png` | Cyber UW |
| UW Referrals | `10-uw-referrals.png` | Cyber UW |
| Closer | mosaic | — |

### Stage / sign-off validation (Northwind)

| Stage | Visual proof | Capture |
|-------|----------------|---------|
| **New** | Stepper checkmark · Completed | `07`, `08`, `17`, `09` |
| **Feedback** | Ideal vs Detected · Resolve/Refer · EDR Referred | `08` |
| **Review Risk** | Active after gaps cleared · Accept judgments | `17` |
| **Review Platform** | Cards signed Watch | `18b` |
| **Closure** | Financial sign-off recorded · manager cosign | `09` |

Demo case for Cyber UW remains **Northwind Health Systems (`CYB-2401`)**. Ops shipping path uses Meridian Logistics for Ready-for-UW handoff.
