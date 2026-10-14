# User story: Document extraction and Policy Documents

As a cyber underwriter, I ingest a broker package and review the extracted policy information on Policy Documents so the package can be confirmed complete before Continue toward Risk Information.

## Persona

The primary reader is a cyber underwriter at an MGA, the primary persona in the forged idea. The secondary actor is Cyber Ops, who owns Policy Documents. Later stages stay with the underwriter: `UwLockedStage` marks Risk Information, Risk Analysis, and Getting Ready to Quote as UW only, and Ops hands a complete package over with Ready for UW.

## Goal

I want to ingest a broker package and review the extracted policy fields, checklist, and completeness on Policy Documents.

## Benefit

So that the package can be confirmed complete before Continue toward Risk Information, without re-keying the application.

## Scope

This story covers two connected surfaces only: New Submission (`CyberNewSubmissionModal`), where the package source tabs are Upload and Mail MCP, and the Policy Documents stage (`PolicyDocumentsStageBody` in `CaseWorkspace`; flow title Policy Documents, subtext Extracted package fields). Ingest package creates the case, and the ready copy points review at Policy Documents. Customer 360 sits above the workflow pane and is outside this story.

## Acceptance criteria

1. **Given** New Submission is open, **when** the reader looks at package source, **then** the tabs are Upload and Mail MCP. The Upload drop zone reads "Drop app, loss runs, or evidence" with helper "PDF, images, email". The helper on the form says: "Upload the broker package. The ingestion agent extracts named insured, broker, sector, limit, and control fields into Policy Documents." Ingest package stays disabled until a package can be submitted.

2. **Given** a package can be submitted, **when** the reader presses Ingest package, **then** the modal title becomes "AI ingestion & extraction" and shows the four thinking steps from `buildIngestionThinkingSteps`: Ingest submission package, Classify documents, Extract structured fields, and Confidence gate. On ready, underwriter copy reads "{case id} is in the decision queue. Review Policy Documents, then Risk Information, Risk Analysis, and Getting Ready to Quote." Ops-package copy (named insured Meridian Logistics, or Mail MCP thread `mail-meridian-ops`) reads "{case id} is in the Ops queue. Extracted fields are in Policy Documents. Complete intake, then Ready for UW."

3. **Given** the case is open on Policy Documents, **when** the reader looks at the meta grid, **then** the labels are Proposed start date, Proposed end date, Completeness (shown as a percent), and Requested limit.

4. **Given** Policy Documents is showing the required document checklist, **when** the reader reads the rows, **then** the rows are Architecture, SOC report, Incident Response Plan, Disaster Recovery Drill report, ISO report, and Compliance certifications, and each row is marked Present or Missing.

5. **Given** Policy Documents is showing package documents, **when** the reader looks at the table, **then** the columns are Document, Type of doc, and View. Type of doc is an editable select. An empty package reads "No documents attached." Kind options include Application plus the six checklist types, and also SOC2, Attestation, Loss runs, Attachment, and Document.

6. **Given** Policy Documents is showing extracted fields, **when** the reader opens Extracted fields, **then** it is an accordion collapsed by default. Section titles come from the application sections: Data Inventory, Privacy Controls, Network Security Controls, PCI-DSS, Business Continuity / Disaster Recovery / Incident Response, Vendor Controls, Outsourced Services, Loss Information, Requested Insurance Terms, Requested Terms, and Current Coverage. Content Liability Controls appears only when the sector matches media, publish, or advertising. Each heading shows a field count. The pencil toggles edit for that section. While editing, field values are inputs saved through the answer override. The displayed value is the attested answer when present, otherwise the extracted value.

7. **Given** the package is not already signed off, **when** the reader looks at Documents Complete, **then** the button is disabled until missing required docs are empty and completeness is at least 80 percent. Pressing it opens the Documents Complete? modal. The body says confirming the ingested package unlocks Continue to Risk Information and Risk Analysis, and that extracted answers can still be edited after. Confirm Documents Complete records package sign-off. The signed state reads "Documents complete", plus the signer and the date when those values exist.

8. **Given** the package is not ready to sign off, **when** missing docs remain, **then** Policy Documents shows the Missing documents list plus Run ingest again and Escalate to Broker. **When** completeness is under 80 percent and that list is not shown, **then** the stage shows "Package is incomplete ({percent}%). Run ingest again or escalate the chase to the broker." and the same two actions. Run ingest again shows "Scanning…" while a scan is in progress. Escalate to Broker opens a discussion referral for the missing or incomplete package.

9. **Given** the signed-in role is Ops, **when** the workflow pane renders, **then** Ops sees Policy Documents only, and Risk Information, Risk Analysis, and Getting Ready to Quote render as UW only. **When** completeness is at least 80 percent, the decision is still pending, and handoff has not happened, **then** Ops can press Ready for UW. The underwriter reviews Policy Documents and continues only after the Documents Complete gate.

## Out of scope

This story does not cover Risk Information triage, Risk Analysis evidence, Getting Ready to Quote, financial sign-off, quote or decline, or policy-admin sync. Cite-back, bookmark, and re-verify are not controls on Policy Documents. Extraction in this story is the ingestion modal and the fields that land on Policy Documents; the product does not add a document-scanning capability beyond the four thinking steps (Ingest submission package, Classify documents, Extract structured fields, Confidence gate). The product does not bind premium or take insurance risk.

## Evidence

| # | What the criterion claims | Source |
| --- | --- | --- |
| 1 | Upload and Mail MCP tabs, drop-zone copy, extraction helper, Ingest package disabled until submit | `CyberNewSubmissionModal.tsx` |
| 2 | Title "AI ingestion & extraction", four thinking steps, decision-queue and Ops-package ready copy | `CyberNewSubmissionModal.tsx`, `agentThinkingUtils.ts` (`buildIngestionThinkingSteps`) |
| 3 | Meta grid: Proposed start date, Proposed end date, Completeness, Requested limit | `CaseWorkspace.tsx` (`PolicyDocumentsStageBody`) |
| 4 | Six checklist rows, each Present or Missing | `requiredPackageDocs.ts`, `CaseWorkspace.tsx` |
| 5 | Package table columns, editable Type of doc, empty copy, kind options | `CaseWorkspace.tsx`, `dossierPackage.ts` (`PACKAGE_DOC_KINDS`) |
| 6 | Extracted fields accordion, section titles, sector gate, pencil edit, attested-or-extracted value | `CaseWorkspace.tsx`, `QuestionFields.tsx` (`IngestQuestionGrid`), `cyberTriageRules.ts` (`APP_SECTIONS`, `sectionReportsForCase`) |
| 7 | Documents Complete gate, modal copy, Confirm records sign-off, signed line | `CaseWorkspace.tsx`, `DocumentsCompleteModal.tsx`, `cyberFlow.ts` (`canLeavePolicyDocuments`) |
| 8 | Missing documents list, incomplete-package sentence, Run ingest again, Scanning…, Escalate to Broker | `CaseWorkspace.tsx`, `missingDocs.ts` (`missingDocsForCase`) |
| 9 | Ops sees Policy Documents only; later stages are UW only; Ready for UW; underwriter continues after the Documents Complete gate | `CaseWorkspace.tsx` (`UwLockedStage`), `cyberFlow.ts` (`canOpsMarkReadyForUw`, `canLeavePolicyDocuments`), `FloatingWorkflowBar.tsx` |

## Source check

- PASS — 1: `CyberNewSubmissionModal` package-source tabs Upload and Mail MCP, drop zone "Drop app, loss runs, or evidence", helper "PDF, images, email", extraction helper, and Ingest package `isDisabled={!canSubmit}`.
- PASS — 2: `buildIngestionThinkingSteps` titles Ingest submission package, Classify documents, Extract structured fields, and Confidence gate; ready copy in `CyberNewSubmissionModal` for the decision queue and the Ops package (`isOpsPackage`).
- PASS — 3: `PolicyDocumentsStageBody` meta grid labels Proposed start date, Proposed end date, Completeness, and Requested limit.
- PASS — 4: `REQUIRED_PACKAGE_DOCS` rows rendered by `PolicyDocumentsStageBody` as Present or Missing.
- PASS — 5: `PolicyDocumentsStageBody` package table columns Document, Type of doc, and View; empty copy "No documents attached."; kind options from `PACKAGE_DOC_KINDS`.
- PASS — 6: `PolicyDocumentsStageBody` Extracted fields accordion (`defaultExpandedKeys={[]}`), section titles and the media/publish/advertising gate from `sectionReportsForCase`, pencil edit toggle, and `IngestQuestionGrid` displaying `attested ?? value` via `setAnswerOverride`.
- PASS — 7: `PolicyDocumentsStageBody` `canComplete` gate, `DocumentsCompleteModal` body and Confirm Documents Complete, `signOffPackage` from the confirm handler, signed line "Documents complete", and `canLeavePolicyDocuments`.
- PASS — 8: `PolicyDocumentsStageBody` Missing documents branch and incomplete-package sentence, Run ingest again / "Scanning…" while `signalStatus === 'scanning'`, and Escalate to Broker opening the discussion referral.
- PASS — 9: `UwLockedStage` for Risk Information, Risk Analysis, and Getting Ready to Quote when the role is Ops; `canOpsMarkReadyForUw` and the Ready for UW control in `FloatingWorkflowBar`; underwriter Continue only after `canLeavePolicyDocuments`.
