# Client feedback implementation report

Verified on 11 Nov 2026 against a local Vite build (`http://127.0.0.1:5173`) with Playwright Chromium. The walkthrough is `scripts/feedback-walkthrough.mjs`. Result: **45/45 checks passed**. No page errors, no console errors, and no failed asset requests. Desktop (1440×900) and laptop (1280×800) had no horizontal page overflow.

The story case is **Airbnb, CYB-2401**. The same facts are used on every screen for that case:

- Revenue $11B, requested limit $25M, industry Travel / Hospitality Marketplace, completeness 92%.
- Applicant says MFA applies to all users. Document evidence and the simulated external scan show privileged users only. Verification result: **Contradicted**, confidence High.
- Simulated BitSight rating **593** against a carrier floor of **700** for limits of $10M or more.
- Appetite **Refer**, triggered by **MFA coverage below minimum threshold**, with **Security rating below carrier appetite level** also triggered.
- AI recommendation **Refer**, with three reasons that link to the MFA row, the appetite rule, and the security-rating finding.
- The file exceeds James Park’s delegated authority. Referral owner: **Priya Nair — Cyber specialist**.

LumenForge stays a clean Approve / Within Appetite file. Harbor stays Decline. Cascade stays Refer for a different MFA gap (legacy email), so the all-users contradiction is not copied onto every account.

Nothing here calls a live BitSight, Cyence, Cytora, or exposure API. Those names are marked **Simulated**.

## Traceability

| Feedback item | What changed | Where | Test |
| --- | --- | --- | --- |
| Persistent case header: Insured, Industry, Revenue, Requested Limit, Cyber Risk, Appetite, Completeness | Sticky case header on the case file, and the same header on Insights, Escalations, and Manage Submissions while a case stays selected | `src/cyber-uw/components/CaseContextHeader.tsx`, `CaseWorkspace.tsx`, `CyberUwShell.tsx` | Pass. `header-Airbnb`, `header-LumenForge Software`, `header-Harbor Retail Group`, `header-Cascade Logistics`, `header-persists-insights`, `layout-desktop`, `layout-laptop` |
| Show Cyber Application, InfoSec Questionnaire, Incident Response Plan, Loss Runs, Broker Correspondence | Submission intake register added at the top of Policy Documents. Existing checklist, package table, and extracted fields stay | `SubmissionIntakePanel.tsx`, `data/caseNarrative.ts`, `CaseWorkspace.tsx` | Pass. `intake-documents` |
| Document status: Received, Classified, Extracted, Missing, Review Required | Each register row has one of those statuses. Airbnb uses Classified, Extracted, Missing, and Review Required. Harbor broker correspondence is Received | Same intake panel | Pass. `intake-documents`, `intake-received-status` |
| Completeness %, missing documents, broker follow-up count | Three stats on the intake panel. Airbnb is 92%, 1 missing (Loss Runs), 2 follow-up questions. The 92% is the existing package score | Same intake panel | Pass. `intake-counts`, `intake-missing-count`, `intake-followup-count` |
| Insured matched, Duplicate check completed, Broker identified | Three match lines with the insured and broker from the case | Same intake panel | Pass. `entity-match` |
| Evidence Verification screen for MFA, EDR, backups, privileged access, patching, incident response | New workflow stage between Policy Documents and Risk Information. Cases that were already on Risk Information still open there | `constants/cyberFlow.ts`, `EvidenceVerificationPanel.tsx`, `CaseWorkspace.tsx`, `cyberUwStore.ts` | Pass. `evidence-controls`. Ops still sees the stage locked: `ops-evidence-locked` |
| Each control shows Applicant Declaration, Document Evidence, External Observation, Verification Result, Confidence | Those six columns on the evidence table | `EvidenceVerificationPanel.tsx` | Pass. `evidence-controls` |
| Statuses Verified, Partially Verified, Contradicted, Missing Evidence, Not Applicable | Airbnb shows the first four. Harbor privileged access is Not Applicable | `data/caseNarrative.ts` | Pass. `evidence-statuses`, `not-applicable-status` |
| Strong contradiction: MFA for all users vs privileged users only | Airbnb MFA row, gap, form signal, external conflict, referral rule, and AI reason all use that sentence | `mockCases.ts`, `caseNarrative.ts` | Pass. `mfa-contradiction`, `external-conflict`, `reason-links` |
| External findings by Attack Surface, Vulnerabilities/CVEs, Security Rating, Exposed Services, Third-party Dependencies | New section at the top of Risk Analysis. Existing BitSight, Cyence, Cytora, and desk-model panels remain below, still behind enrichment consent | `ExternalFindingsPanel.tsx`, `CaseWorkspace.tsx` | Pass. `external-categories` |
| Each finding shows Source, Finding, Severity, Observed Date, Freshness, Entity Match, Underwriting Impact | Those columns on every category table | `ExternalFindingsPanel.tsx` | Pass. `external-categories` |
| Security-rating trend, not only the latest score | 12-month trend chart on the Security Rating category, and the existing BitSight chart retitled as a 12-month trend. Airbnb latest is 593, same number in the why-panel | `ExternalFindingsPanel.tsx`, `SecurityRatingPanel.tsx`, `securityRatingDemo.ts` (unchanged formula) | Pass. `rating-trend`, `rating-number`, `why-opens` |
| Highlight conflicts between external signals and applicant declarations | Red callout above the external tables. Airbnb callout is the MFA contradiction | `ExternalFindingsPanel.tsx` | Pass. `external-conflict` |
| Label providers such as BitSight Simulated when there is no live API | Source column says `BitSight (Simulated)`. Vendor tabs and the BitSight, Cyence, and Cytora report headers say Simulated | `ExternalFindingsPanel.tsx`, `CaseWorkspace.tsx`, `SecurityRatingPanel.tsx`, `CyencePanel.tsx`, `CytoraPanel.tsx` | Pass. `external-simulated` |
| Replace one composite score with Cyber Risk, Control Effectiveness, Evidence Confidence, Submission Completeness, Appetite Result | Five separate measures at the top of Risk Analysis. Cyber risk is not an average of the others. Airbnb is High / Partial 50% / Moderate 63% / 92% / Refer | `UnderwritingMeasures.tsx` | Pass. `separate-measures` |
| Why this result? beside every score, with evidence and rules | One control per measure. Opening Cyber Risk cites rating 593 and the MFA contradiction | `WhyThisResult.tsx`, `UnderwritingMeasures.tsx` | Pass. `why-count`, `why-opens` |
| Appetite result Within Appetite, Refer, or Decline | Header and measures use those three words. LumenForge is Within Appetite, Airbnb and Cascade are Refer, Harbor is Decline | `caseNarrative.ts`, `CaseContextHeader.tsx` | Pass. The four `header-*` checks |
| Show the exact rule that triggered a referral | Airbnb shows **MFA coverage below minimum threshold** as the triggered rule, and **Security rating below carrier appetite level** as the second triggered rule | `mockCases.ts`, `UnderwritingMeasures.tsx` | Pass. `referral-rules` |
| AI recommendation Approve, Refer, Request Information, or Decline | Decision panel states the AI recommendation in those words. Airbnb is Refer. LumenForge is Approve. Harbor remains Decline. Queue and chart labels use the same words | `UnderwriterDecisionPanel.tsx`, `CyberPrimitives.tsx`, `InsightCharts.tsx` | Pass. `ai-recommendation`, `lumen-within-authority` |
| Top three reasons, each linked to evidence | Three reasons. Links go to `#evidence-control-mfa`, `#appetite-rule-CTRL-MFA-MIN`, and `#external-finding-security-rating`. The confirm dialog can jump to the same anchors | `UnderwriterDecisionPanel.tsx`, `DecisionConfirmModal.tsx` | Pass. `ai-reasons`, `reason-links`, `reason-navigates` |
| Prominent human controls: Approve, Refer, Request Information, Decline | Those four buttons on Getting Ready to Quote and in the workflow bar. Approve stays disabled until financial sign off, which is the existing quote gate | `UnderwriterDecisionPanel.tsx`, `FloatingWorkflowBar.tsx`, `CyberWorkbenchDesk.tsx` | Pass. `human-controls`, `approve-gated` |
| Mandatory rationale for overrides and material exceptions | Confirm stays disabled until the rationale is non-empty when the human choice differs from the AI recommendation, and when Approve is used outside appetite or over a critical gap. A matching Refer can confirm without a note. Empty override text does not close the dialog | `DecisionConfirmModal.tsx` | Pass. `matching-decision-open`, `override-rationale-blocks` |
| Approval authority or referral owner when the case exceeds delegated authority | Airbnb ($25M, Tier 4, open critical MFA gap) shows Priya Nair as referral owner. LumenForge ($5M, Tier 2) stays inside James Park’s authority | `caseNarrative.ts`, `UnderwriterDecisionPanel.tsx` | Pass. `authority-owner`, `lumen-within-authority` |

## Kept as it is

These stayed so the current demo does not get a redesign:

- Birlasoft logo, navy workbench, login (UW and Ops), sidebar, and Open cases table.
- Customer Insights, including the existing case tabs.
- Policy Documents checklist, package document table, extracted-field tabs, and Documents Complete.
- Risk Information triage queue, including required findings and enrichment consent before the vendor reports.
- BitSight, Cyence, Cytora, and desk-model loss charts, including ALE. The new measures sit above them. They do not replace the loss model.
- Financial sign off, manager approval, and the floating workflow bar’s continue path.
- Broker form at `/broker`, Escalations, and Manage Submissions.
- Ops still cannot edit underwriter stages.

## Assumptions and open questions

- This pull request targets `source`. `main` is the live GitHub Pages site and was not updated.
- Approve records the existing `quote` decision. Request Information is a new decision. It is stored on the case and is not synced to policy admin.
- The 700 rating floor applies when the requested limit is $10M or more. At $5M the floor is 640. Both numbers are demo rules so Airbnb trips the two example phrases in the feedback.
- Completeness stays the existing package percentage. The new “missing documents” count is the submission register (Loss Runs on Airbnb), not a second copy of the architecture / SOC checklist. At 92% that older checklist is already clear.
- A rationale is required for an override and for Approve as a material exception. Accepting the AI recommendation does not require one.
- Open question: should Request Information leave the case pending for the same underwriter, instead of locking the decision the way Approve, Refer, and Decline do?

## Screenshots

| Screen | File |
| --- | --- |
| Open cases | `docs/feedback-screenshots/open-cases.png` |
| Case header, desktop | `docs/feedback-screenshots/layout-desktop-header.png` |
| Case header, laptop width | `docs/feedback-screenshots/layout-laptop-header.png` |
| Header on Customer Insights | `docs/feedback-screenshots/customer-insights-with-header.png` |
| Airbnb submission intake | `docs/feedback-screenshots/airbnb-submission-intake.png` |
| Airbnb evidence verification | `docs/feedback-screenshots/airbnb-evidence-verification.png` |
| Airbnb external findings | `docs/feedback-screenshots/airbnb-external-findings.png` |
| Declaration conflict | `docs/feedback-screenshots/airbnb-declaration-conflict.png` |
| Security rating trend | `docs/feedback-screenshots/airbnb-rating-trend.png` |
| Underwriting measures | `docs/feedback-screenshots/airbnb-underwriting-measures.png` |
| Underwriter decision | `docs/feedback-screenshots/airbnb-underwriter-decision.png` |
| Rationale required on an override | `docs/feedback-screenshots/airbnb-rationale-required.png` |
| Decision recorded | `docs/feedback-screenshots/airbnb-decision-recorded.png` |
| LumenForge decision (within authority) | `docs/feedback-screenshots/lumenforge-decision.png` |
| Harbor intake, including Received | `docs/feedback-screenshots/harbor-submission-intake.png` |
| Harbor evidence, including Not Applicable | `docs/feedback-screenshots/harbor-evidence.png` |
| Cascade measures | `docs/feedback-screenshots/cascade-measures.png` |
| Insights | `docs/feedback-screenshots/insights.png` |
| Escalations | `docs/feedback-screenshots/escalations.png` |
| Manage Submissions (Ops) | `docs/feedback-screenshots/manage-submissions.png` |
| Ops case, evidence locked | `docs/feedback-screenshots/ops-case.png` |
| New submission modal | `docs/feedback-screenshots/new-submission-modal.png` |
| Broker form | `docs/feedback-screenshots/broker-form.png` |
