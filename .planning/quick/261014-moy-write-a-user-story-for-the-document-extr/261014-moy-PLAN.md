---
phase: 261014-moy
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - .planning/quick/261014-moy-write-a-user-story-for-the-document-extr/USER-STORY-DOCUMENT-EXTRACTION.md
autonomous: true
requirements:
  - QUICK-MOY
must_haves:
  truths:
    - "A cyber underwriter (and Ops as Policy Documents owner) can read one user story that covers uploading or pulling a broker package and reviewing extracted policy information on Policy Documents"
    - "Acceptance criteria match the live screen: ingest modal, meta grid, required-doc checklist, package table, extracted-field accordion, Documents Complete gate, and missing-package chase"
    - "The story does not assign Risk Information, Risk Analysis, quote, or policy-admin sync to this screen"
  artifacts:
    - path: .planning/quick/261014-moy-write-a-user-story-for-the-document-extr/USER-STORY-DOCUMENT-EXTRACTION.md
      provides: Persona, goal, benefit, acceptance criteria, and source evidence for document extraction and Policy Documents
  key_links:
    - from: New Submission ingest modal
      to: Policy Documents stage body
      via: Ingest package creates the case; ready copy points review at Policy Documents
    - from: Documents Complete confirmation
      to: package sign-off
      via: Confirm Documents Complete calls signOffPackage and unlocks Continue toward Risk Information
    - from: User story acceptance criteria
      to: CaseWorkspace PolicyDocumentsStageBody and CyberNewSubmissionModal
      via: Evidence rows naming those sources
---

<objective>
Write one user story for document extraction and the Policy Documents screen, using only behavior the product already shows.

Purpose: Give product and engineering a persona, goal, benefit, and acceptance criteria for the ingest-to-policy-review slice without inventing capabilities.
Output: `.planning/quick/261014-moy-write-a-user-story-for-the-document-extr/USER-STORY-DOCUMENT-EXTRACTION.md` only. Do not edit application code, ROADMAP.md, or other docs.
</objective>

<execution_context>
@$HOME/.cursor/gsd-core/workflows/execute-plan.md
@$HOME/.cursor/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@src/cyber-uw/components/CyberNewSubmissionModal.tsx
@src/shared/utils/agentThinkingUtils.ts
@src/cyber-uw/constants/cyberFlow.ts
@src/cyber-uw/components/CaseWorkspace.tsx
@src/cyber-uw/components/DocumentsCompleteModal.tsx
@src/cyber-uw/components/QuestionFields.tsx
@src/cyber-uw/constants/requiredPackageDocs.ts
@src/cyber-uw/data/dossierPackage.ts
@src/cyber-uw/utils/missingDocs.ts
@src/cyber-uw/components/FloatingWorkflowBar.tsx
@docs/planning/forged-idea.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Write the extraction and Policy Documents user story</name>
  <files>.planning/quick/261014-moy-write-a-user-story-for-the-document-extr/USER-STORY-DOCUMENT-EXTRACTION.md</files>
  <action>
Create only `.planning/quick/261014-moy-write-a-user-story-for-the-document-extr/USER-STORY-DOCUMENT-EXTRACTION.md`. There is no existing user-story directory in the repo; this quick-task file is the deliverable. Do not edit source, ROADMAP.md, or other docs.

Read the context files and describe observable UI. The screen is two connected surfaces, not a route named policy information: New Submission (`CyberNewSubmissionModal`) performs AI ingestion and document extraction, then the case opens on the Policy Documents stage (`PolicyDocumentsStageBody` in `CaseWorkspace`, flow title Policy Documents, subtext Extracted package fields). Customer 360 sits above the workflow pane and is out of this story.

Use these H2 sections in order: Persona, Goal, Benefit, Scope, Acceptance criteria, Out of scope, Evidence.

Persona: primary reader is a cyber underwriter at an MGA (forged-idea primary persona). Secondary actor is Cyber Ops, who owns Policy Documents; later stages stay with the underwriter (`UwLockedStage` copy and Ops Ready for UW).

Goal: one sentence in "I want" form — ingest a broker package and review the extracted policy fields, checklist, and completeness on Policy Documents.

Benefit: one sentence in "so that" form — the package can be confirmed complete before Continue toward Risk Information, without re-keying the application.

Scope: one short paragraph naming New Submission (Upload and Mail MCP) plus the Policy Documents stage only.

Acceptance criteria: nine numbered Given/When/Then items. Use the product's own labels. Cover only these behaviors:

1. Package source tabs are Upload and Mail MCP. Upload drop zone copy is "Drop app, loss runs, or evidence" with helper "PDF, images, email". Helper under the form says the ingestion agent extracts named insured, broker, sector, limit, and control fields into Policy Documents. Ingest package stays disabled until a package can be submitted.
2. After Ingest package, the modal title becomes AI ingestion and extraction and shows the four thinking steps from `buildIngestionThinkingSteps`: Ingest submission package, Classify documents, Extract structured fields, Confidence gate. On ready, UW copy places the case in the decision queue and tells the reader to review Policy Documents before later stages; Ops-package copy places it in the Ops queue and says complete intake, then Ready for UW.
3. Policy Documents meta grid labels are Proposed start date, Proposed end date, Completeness (percent), and Requested limit.
4. Required document checklist rows are Architecture, SOC report, Incident Response Plan, Disaster Recovery Drill report, ISO report, and Compliance certifications, each marked Present or Missing.
5. Package documents table columns are Document, Type of doc, and View. Type of doc is an editable select. Empty package copy is "No documents attached." Kind options include Application plus the six checklist types, and also SOC2, Attestation, Loss runs, Attachment, and Document.
6. Extracted fields is an accordion, collapsed by default. Section titles come from application sections: Data Inventory, Privacy Controls, Network Security Controls, PCI-DSS, Business Continuity / Disaster Recovery / Incident Response, Vendor Controls, Outsourced Services, Loss Information, Requested Insurance Terms, Requested Terms, and Current Coverage. Content Liability Controls appears only when the sector matches media, publish, or advertising. Each heading shows a field count. The pencil toggles edit for that section; while editing, field values are inputs saved through the answer override. Displayed value is the attested answer when present, otherwise the extracted value.
7. Documents Complete is disabled until missing required docs are empty, completeness is at least 80 percent, and the package is not already signed off. Pressing it opens the Documents Complete? modal. Body copy says confirming the package unlocks Continue to Risk Information and Risk Analysis, and that extracted answers can still be edited after. Confirm Documents Complete records package sign-off. The signed state reads Documents complete, plus signer and date when those values exist.
8. When missing docs remain, show the Missing documents list plus Run ingest again and Escalate to Broker. When completeness is under 80 percent without that list, show the incomplete-package sentence and the same two actions. Run ingest again shows Scanning… while a scan is in progress. Escalate to Broker opens a discussion referral for the missing or incomplete package.
9. Ops sees Policy Documents only; Risk Information, Risk Analysis, and Getting Ready to Quote render as UW only. When completeness is at least 80 percent, the decision is still pending, and handoff has not happened, Ops can press Ready for UW. The underwriter reviews Policy Documents and continues only after the Documents Complete gate.

Out of scope: state that this story does not cover Risk Information triage, Risk Analysis evidence, Getting Ready to Quote, financial sign-off, quote or decline, or policy-admin sync. State that cite-back, bookmark, and re-verify are not controls on Policy Documents. Describe extraction as the ingestion modal and the fields that land on Policy Documents; do not add a production document-scanning capability beyond those four thinking steps. Do not claim the product binds premium or takes insurance risk.

Evidence: a table mapping each acceptance-criterion number to the source file that proves it (`CyberNewSubmissionModal.tsx`, `agentThinkingUtils.ts`, `CaseWorkspace.tsx`, `DocumentsCompleteModal.tsx`, `QuestionFields.tsx`, `requiredPackageDocs.ts`, `dossierPackage.ts`, `cyberFlow.ts`, `FloatingWorkflowBar.tsx`).
  </action>
  <verify>
    <automated>test -f .planning/quick/261014-moy-write-a-user-story-for-the-document-extr/USER-STORY-DOCUMENT-EXTRACTION.md &amp;&amp; rg -q '^## Persona' .planning/quick/261014-moy-write-a-user-story-for-the-document-extr/USER-STORY-DOCUMENT-EXTRACTION.md &amp;&amp; rg -q '^## Goal' .planning/quick/261014-moy-write-a-user-story-for-the-document-extr/USER-STORY-DOCUMENT-EXTRACTION.md &amp;&amp; rg -q '^## Benefit' .planning/quick/261014-moy-write-a-user-story-for-the-document-extr/USER-STORY-DOCUMENT-EXTRACTION.md &amp;&amp; rg -q '^## Acceptance criteria' .planning/quick/261014-moy-write-a-user-story-for-the-document-extr/USER-STORY-DOCUMENT-EXTRACTION.md &amp;&amp; rg -q 'Proposed start date' .planning/quick/261014-moy-write-a-user-story-for-the-document-extr/USER-STORY-DOCUMENT-EXTRACTION.md &amp;&amp; rg -q 'Documents Complete' .planning/quick/261014-moy-write-a-user-story-for-the-document-extr/USER-STORY-DOCUMENT-EXTRACTION.md &amp;&amp; rg -q 'Escalate to Broker' .planning/quick/261014-moy-write-a-user-story-for-the-document-extr/USER-STORY-DOCUMENT-EXTRACTION.md &amp;&amp; rg -q 'Mail MCP' .planning/quick/261014-moy-write-a-user-story-for-the-document-extr/USER-STORY-DOCUMENT-EXTRACTION.md &amp;&amp; rg -q 'Ready for UW' .planning/quick/261014-moy-write-a-user-story-for-the-document-extr/USER-STORY-DOCUMENT-EXTRACTION.md &amp;&amp; rg -q '^## Evidence' .planning/quick/261014-moy-write-a-user-story-for-the-document-extr/USER-STORY-DOCUMENT-EXTRACTION.md</automated>
  </verify>
  <done>
The markdown user story exists with persona, goal, benefit, nine acceptance criteria, an out-of-scope boundary, and an evidence table tied to the ingest modal and Policy Documents stage.
  </done>
</task>

<task type="auto">
  <name>Task 2: Source-check the story against the screen</name>
  <files>.planning/quick/261014-moy-write-a-user-story-for-the-document-extr/USER-STORY-DOCUMENT-EXTRACTION.md</files>
  <action>
Re-read the user story against the context sources. Fix any acceptance criterion that names a control, stage, or outcome the cited files do not show. Append an H2 Source check to the same file. Write nine lines, each starting with "- PASS —", one per acceptance criterion, stating the source symbol that proves it (for example PolicyDocumentsStageBody, DocumentsCompleteModal, buildIngestionThinkingSteps, canLeavePolicyDocuments, canOpsMarkReadyForUw). If a line would not pass, edit the criterion first and then mark it PASS. Do not add a second document.
  </action>
  <verify>
    <automated>rg -q '^## Source check' .planning/quick/261014-moy-write-a-user-story-for-the-document-extr/USER-STORY-DOCUMENT-EXTRACTION.md &amp;&amp; test "$(rg -c '^- PASS —' .planning/quick/261014-moy-write-a-user-story-for-the-document-extr/USER-STORY-DOCUMENT-EXTRACTION.md)" -ge 9</automated>
  </verify>
  <done>
Source check lists nine PASS lines, and every acceptance criterion still matches a control that exists on New Submission or Policy Documents.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Product UI copy → user story | Story text can over-claim what ingestion and Policy Documents actually do |
| Story file → later planning | A false acceptance criterion could be treated as a build requirement |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-moy-01 | Spoofing | USER-STORY-DOCUMENT-EXTRACTION.md acceptance criteria | medium | mitigate | Each criterion must use on-screen labels and an Evidence row naming the source file; Task 2 blocks completion until nine source checks pass |
| T-moy-02 | Tampering | Scope of the story | low | mitigate | Out of scope section keeps Risk Information, Risk Analysis, quote, and policy-admin sync off this story |
| T-moy-SC | Tampering | npm/pip/cargo installs | low | accept | Documentation-only plan; no package installs |
</threat_model>

<verification>
- User story file exists under the quick-task directory.
- Headings Persona, Goal, Benefit, Acceptance criteria, and Evidence are present.
- On-screen labels Proposed start date, Documents Complete, Escalate to Broker, Mail MCP, and Ready for UW appear in the story.
- Source check contains at least nine PASS lines.
</verification>

<success_criteria>
- One markdown user story describes document extraction (New Submission ingest) and policy information review (Policy Documents) as implemented.
- Acceptance criteria are traceable to the cited UI sources.
- No application code or roadmap edits.
</success_criteria>

<output>
Create `.planning/quick/261014-moy-write-a-user-story-for-the-document-extr/261014-moy-SUMMARY.md` when done
</output>
