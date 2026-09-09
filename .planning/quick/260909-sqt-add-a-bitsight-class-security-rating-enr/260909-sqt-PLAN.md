---
phase: 260909-sqt
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/cyber-uw/data/securityRatingDemo.ts
  - src/cyber-uw/components/SecurityRatingPanel.tsx
  - src/cyber-uw/components/CaseWorkspace.tsx
  - src/cyber-uw/components/QuestionFields.tsx
  - src/cyber-uw/data/dossierPackage.ts
  - src/cyber-uw/store/cyberUwStore.ts
  - src/cyber-uw/constants/cyberFlow.ts
autonomous: false
requirements: [D-01, D-02, D-03, D-04, D-05, D-06]

must_haves:
  truths:
    - "Opening Risk Analysis for any case shows a partner security-rating panel above the ALE bubble chart, with a 250–900 composite score and a Basic/Intermediate/Advanced band label (D-01)."
    - "The rating panel shows industry average with peer overlay, a 12-month trend line with band thresholds, four vector grades, and outcome-multiplier assist copy (D-01)."
    - "The rating never blocks progression: Proceed / Continue and every canLeave* gate behave identically whether the rating is 300 or 850 (D-01)."
    - "On Policy Documents, each extracted-field section has one pen in its section header that unlocks every field in that section for editing; no individual field carries its own pen (D-02)."
    - "Each package document row exposes a type-of-doc dropdown that persists a corrected kind into store state (D-03)."
    - "An underwriter can leave Policy Documents after signing each section, with no package-level sign-off button and no per-document accept checkboxes anywhere in the flow (D-04)."
    - "Risk Information triage banners and findings appear once section answers are signed, without requiring a package-level sign-off timestamp (D-04)."
  artifacts:
    - src/cyber-uw/data/securityRatingDemo.ts
    - src/cyber-uw/components/SecurityRatingPanel.tsx
  key_links:
    - "RiskAnalysisStageBody in CaseWorkspace.tsx renders SecurityRatingPanel above RiskVizPanel (D-01)."
    - "PolicyDocumentsStageBody owns per-section edit state and passes it into IngestQuestionGrid as an `editing` prop (D-02)."
    - "Package doc kind dropdown calls a new store action setPackageDocKind, which mutates c.packageDocs[].kind (D-03)."
    - "canLeavePolicyDocuments in cyberFlow.ts depends only on completeness ≥ 80, no missing docs, and answersSignedForCase (D-04)."
    - "RiskInformationStageBody's answersSigned flag drops its packageSignOff.signedOffAt term, otherwise section signing (which clears signedOffAt) would permanently hide triage (D-04)."
---

<objective>
Add a BitSight-class mock security-rating enrichment panel to the top of Risk Analysis, and fix three Policy Documents interaction defects: per-field pens become one section-level pen, ingested docs get a correctable type-of-doc dropdown, and the document-level sign-off gate is replaced by section-level answer sign-off only.

Purpose: The underwriter currently has no partner-rating context when reading ALE charts, has to click a pencil per field to correct a whole misextracted section, cannot fix a misclassified document type, and is blocked by a redundant package-level sign-off on top of section sign-off.
Output: Two new files (mock rating feed + panel component), one new store action, one relaxed leave-gate, and a reworked Policy Documents body.
</objective>

<execution_context>
@$HOME/.cursor/gsd-core/workflows/execute-plan.md
@$HOME/.cursor/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@src/cyber-uw/components/CaseWorkspace.tsx
@src/cyber-uw/components/QuestionFields.tsx
@src/cyber-uw/components/RiskVizCharts.tsx
@src/cyber-uw/data/riskVizDemo.ts
@src/cyber-uw/data/dossierPackage.ts
@src/cyber-uw/store/cyberUwStore.ts
@src/cyber-uw/types.ts
@src/cyber-uw/constants/cyberFlow.ts
@src/cyber-uw/constants/qualificationBuckets.ts
@docs/planning/CYBER-RISK-VIZ-SPEC.md
</context>

<interface_context>
Already in the codebase — reuse, do not reinvent:

- `CyberCase` (src/cyber-uw/types.ts): has `signalScore: number`, `sector`, `insured`, `gaps: ControlGap[]`, `packageDocs: PackageDoc[]`, `packageSignOff?: PackageSignOff`, `completenessPct`.
- `PackageDoc` (src/cyber-uw/types.ts): `{ id: string; name: string; kind: string }` — `kind` is a plain string, so no type change is needed for the dropdown.
- `bucketLabel(id: QualificationBucketId): string` and `QUALIFICATION_BUCKETS` (src/cyber-uw/constants/qualificationBuckets.ts) — use these for finding cite-backs; `ControlGap.qualificationBucket` is already populated on every gap.
- `formatExposureUsd` (exported alias of `formatUsdShort`, src/cyber-uw/data/riskVizDemo.ts) — USD short formatter.
- `answersSignedForCase(c, keys)` / `isAnswerSigned(c, key)` / `allAnswerKeysForCase(c)` / `sectionReportsForCase(c)` (src/cyber-uw/data/cyberTriageRules.ts).
- `SignSectionButton({ caseId, keys, allSigned })` (src/cyber-uw/components/QuestionFields.tsx) — keep as-is.
- `IngestQuestionGrid({ caseId, sectionId, fields, c })` (src/cyber-uw/components/QuestionFields.tsx) — signature changes in Task 2.
- Store actions (src/cyber-uw/store/cyberUwStore.ts): `setAnswerOverride`, `toggleAnswerSigned`, `signSectionAnswers` all deliberately clear `packageSignOff.signedOffAt`. This is exactly why the `signedOffAt` gate must go.
- Existing dropdown idiom in this codebase: a native `<select className="wb-q-cell__input">` (see `FinancialSignOffPanel` pricing-tier field in CaseWorkspace.tsx). No HeroUI `Select` is used anywhere in `src/`, so use the native pattern rather than an unverified HeroUI v3 Select API — this satisfies D-05's "match existing workbench styles" intent.
- Charts: `recharts` ^3.10.1 is already a dependency and already used in RiskVizCharts.tsx (`ResponsiveContainer`, `CartesianGrid`, `XAxis`, `YAxis`, `Tooltip`, `Cell`). Add no new chart library.
- Available CSS hooks (src/styles/workbench-surface.css): `wb-qual-bucket`, `wb-qual-bucket__head`, `wb-q-grid`, `wb-q-cell`, `wb-q-cell__label`, `wb-q-cell__value`, `wb-q-cell__value--measured`, `wb-q-cell__note`, `wb-q-cell__input`, `wb-q-cell__toolbar`, `wb-q-cell__actions`, `wb-gap-pane`. The pen button class is styled with an `aria-pressed='true'` state selector already.

There is no unit-test runner in this repo (no vitest/jest; `@playwright/test` is present but there is no suite wired to these screens). Automated verification is therefore `npm run lint` (oxlint), `npm run build` (`tsc -b && vite build`), and structural greps. Task 3 closes with a browser checkpoint per D-06.
</interface_context>

<tasks>

<!-- Identifiers below are named in both action prose and verify greps by design: the greps
     assert on the repo's own source files, not on any file whose text this plan dictates. -->
<!-- planner-discipline-allow: SecurityRatingPanel -->
<!-- planner-discipline-allow: securityRating -->
<!-- planner-discipline-allow: Math.random -->
<!-- planner-discipline-allow: recharts -->
<!-- planner-discipline-allow: editing -->
<!-- planner-discipline-allow: editingKey -->
<!-- planner-discipline-allow: PencilOff -->
<!-- planner-discipline-allow: PACKAGE_DOC_KINDS -->
<!-- planner-discipline-allow: setPackageDocKind -->
<!-- planner-discipline-allow: SignSectionButton -->
<!-- planner-discipline-allow: canLeavePolicyDocuments -->

<task type="auto">
  <name>Task 1: Mock partner security-rating feed and enrichment panel at top of Risk Analysis (D-01, D-05)</name>
  <files>src/cyber-uw/data/securityRatingDemo.ts, src/cyber-uw/components/SecurityRatingPanel.tsx, src/cyber-uw/components/CaseWorkspace.tsx</files>
  <action>
Create `src/cyber-uw/data/securityRatingDemo.ts` exporting a pure, deterministic mock partner feed shaped as if it came from a BitSight/SecurityScorecard-style API. Per D-01 this is a mock feed only: do not add fetch/network code, do not add an API client, do not add scanners.

Export a `SecurityRatingBand` union of the three band names Basic, Intermediate and Advanced, and a `SECURITY_RATING_BANDS` array carrying each band's inclusive numeric floor and ceiling across the 250–900 composite scale (Basic at the bottom, Advanced at the top; use 250–639 / 640–739 / 740–900). Export a `bandForRating(rating: number)` helper.

Export a `SecurityRatingSnapshot` interface and a single entry point `securityRatingForCase(c: CyberCase): SecurityRatingSnapshot` carrying: `rating` (integer clamped to 250–900), `band`, `industryAvg` (integer on the same scale), `peerCohortLabel` (a sector-flavoured string such as the case sector plus a revenue-band phrase), `peerPercentile` (0–100 integer), `trend` (exactly 12 entries, each with a short month label, the insured's `rating` for that month, and the `industryAvg` for that month, ordered oldest to newest and ending on the current `rating`), `vectors` (exactly four entries with `id`, `label`, a letter `grade` from A to F, a `score` on the 250–900 scale, and a one-line `detail`), `multipliers` (assist-copy entries with `label`, a numeric `factor`, and a `note` phrased relative to a 750-plus cohort), and `citeBacks` (zero or more entries with `id`, `bucketId`, `bucketLabel` and `finding`).

Derive everything deterministically from the case so the demo is stable across reloads and consistent with the rest of the workbench:
  - Base the `rating` on `c.signalScore` mapped onto the 250–900 scale, then subtract a penalty scaled by the count and severity of open `c.gaps` (critical gaps penalise hardest), and clamp.
  - Derive `industryAvg` from `c.sector` via a small lookup with a sensible default, so healthcare/manufacturing/logistics differ.
  - Build `trend` with a tiny deterministic pseudo-random walk seeded by a numeric hash of `c.id` (write a local `hashSeed` helper — no external dependency, no `Math.random`, because a random walk would jitter on every render).
  - Name the four vectors after the D-01 vectors: diligence, compromised systems, user behavior, public disclosures. Grade each from its derived score using the band thresholds.
  - Include a ransomware multiplier of roughly 1.9 for sub-cohort ratings as the headline assist figure, plus one or two secondary multipliers (for example claim frequency and breach likelihood). These are advisory copy only.
  - Build `citeBacks` by mapping open `c.gaps` onto their existing `qualificationBucket` using `bucketLabel`, deduplicated by bucket, capped at four entries. If a case has no open gaps, return an empty array and let the panel omit the section.

Create `src/cyber-uw/components/SecurityRatingPanel.tsx` exporting `SecurityRatingPanel({ c }: { c: CyberCase })`. Structure it with the existing workbench chrome: an outer `wb-qual-bucket` container whose `wb-qual-bucket__head` carries the panel title, a "Partner feed · illustrative" style provenance caption making the mock nature obvious, the composite rating rendered large, and the band name as a secondary chip-style span. Below the head, in a padded body: (a) a `wb-q-grid` row of `wb-q-cell` entries for industry average, delta versus industry average, peer cohort label and peer percentile; (b) a 12-month trend chart built with recharts `ResponsiveContainer` + `LineChart` at roughly 160px height, plotting the insured series and the industry-average series, with `ReferenceLine` entries at the two band boundaries, a `YAxis` domain fixed to the 250–900 scale, small tick fonts matching RiskVizCharts.tsx, and a compact custom `Tooltip` in the same style as `InherentRiskBubble`; (c) a `wb-q-grid` of four `wb-q-cell` vector entries showing label, letter grade, score and detail; (d) the multipliers rendered as advisory prose lines, each explicitly framed as guidance rather than a rule; (e) the cite-backs list, rendered only when non-empty, each line naming the qualification bucket and the finding.

Keep all tone classes neutral/secondary chrome (slate/emerald/amber utility classes already used in this file set). Do not render a Proceed, Verify, Approve, Decline or any other decision affordance inside this panel.

Wire it in `src/cyber-uw/components/CaseWorkspace.tsx`: import `SecurityRatingPanel` and change `RiskAnalysisStageBody` so it returns a `space-y-3` wrapper containing `SecurityRatingPanel` first and the existing `RiskVizPanel` (unchanged props) second. Leave `RiskVizCharts.tsx` untouched.

Per D-01 the rating is not a gate: do not import `securityRatingDemo` or `SecurityRatingPanel` into `src/cyber-uw/constants/cyberFlow.ts`, `src/cyber-uw/store/cyberUwStore.ts`, or `src/cyber-uw/components/CyberWorkbenchDesk.tsx`, and do not reference the rating in any `canLeave*` predicate or advance-strip condition.
  </action>
  <verify>
    <automated>npm run lint &amp;&amp; npm run build &amp;&amp; test "$(grep -v '^[[:space:]]*[/*]' src/cyber-uw/components/CaseWorkspace.tsx | grep -c 'SecurityRatingPanel')" -ge 2 &amp;&amp; test "$(grep -v '^[[:space:]]*[/*]' src/cyber-uw/data/securityRatingDemo.ts | grep -c 'Math.random')" -eq 0 &amp;&amp; test "$(grep -v '^[[:space:]]*[/*]' src/cyber-uw/constants/cyberFlow.ts src/cyber-uw/components/CyberWorkbenchDesk.tsx | grep -c 'securityRating')" -eq 0 &amp;&amp; test "$(grep -v '^[[:space:]]*[/*]' src/cyber-uw/components/SecurityRatingPanel.tsx | grep -c 'recharts')" -ge 1</automated>
  </verify>
  <done>Risk Analysis renders the rating panel above the ALE bubble chart. The panel shows a 250–900 composite with a Basic/Intermediate/Advanced band, industry average plus peer overlay figures, a 12-month recharts trend with band threshold lines, four vector grades, ransomware-style outcome multipliers as advisory copy, and gap-bucket cite-backs when open gaps exist. The rating appears in no gate predicate, and lint plus build are clean.</done>
</task>

<task type="auto">
  <name>Task 2: Section-level edit pen and correctable document-type dropdown (D-02, D-03, D-05)</name>
  <files>src/cyber-uw/components/QuestionFields.tsx, src/cyber-uw/components/CaseWorkspace.tsx, src/cyber-uw/data/dossierPackage.ts, src/cyber-uw/store/cyberUwStore.ts</files>
  <action>
D-02 — move editability from field scope to section scope.

In `src/cyber-uw/components/QuestionFields.tsx`, change `IngestQuestionGrid` to accept an added required `editing: boolean` prop and delete its internal `editingKey` state. Every field in the grid renders its input when `editing` is true and its read-only value paragraph when false. Remove the per-field pencil toggle button entirely, along with its surrounding markup and the now-unused `Pencil`/`PencilOff` icon imports. Drop the `autoFocus` and the `onBlur` handler that used to close single-field editing, since blur must no longer collapse the section. Keep `setAnswerOverride` wired to each input's `onChange` exactly as today, and keep the per-field sign-off `Checkbox` bound to `toggleAnswerSigned` — D-04 removes package-level and per-document sign-off, not the per-field answer checkboxes that feed section state.

In `src/cyber-uw/components/CaseWorkspace.tsx`, inside `PolicyDocumentsStageBody`, add a single piece of state holding the set (or record) of section ids currently unlocked for editing, keyed by `report.section.id`. Render one pen toggle button in each section's `wb-qual-bucket__head`, immediately before the existing `SignSectionButton`, reusing the same button class and `aria-pressed` pattern the per-field pen used so existing CSS applies. Give it an accessible label that names the section and switches between an edit phrasing and a lock phrasing. Use the `Pencil` and `PencilOff` icons from `lucide-react` at size 14. Pass the section's unlocked boolean into `IngestQuestionGrid` as `editing`.

D-03 — let the underwriter correct a misclassified document type.

In `src/cyber-uw/data/dossierPackage.ts`, export a `PACKAGE_DOC_KINDS` readonly array of the selectable type-of-doc labels, matching the strings `kindFromName` can already produce plus the extra options named in D-03: Application, SOC2, Attestation, Loss runs, Attachment, Document. Keep `kindFromName` and `packageDocsFromNames` behaviour unchanged so existing mock cases classify the same way on ingest.

In `src/cyber-uw/store/cyberUwStore.ts`, add a `setPackageDocKind: (caseId: string, docId: string, kind: string) => void` entry to the store's action interface and implement it next to the other package actions: map over `cases`, and for the matching case map over `packageDocs` replacing the matching doc's `kind` with the new value, leaving every other field and every other slice untouched. Do not clear `packageSignOff` or any sign-off state from this action — correcting a document label is metadata repair, not a re-attestation.

Back in `PolicyDocumentsStageBody`, replace the static capitalised kind span on each document row with a native `<select className="wb-q-cell__input">` (the idiom used by the pricing-tier field in `FinancialSignOffPanel`) whose value is `doc.kind`, whose options come from `PACKAGE_DOC_KINDS`, and whose `onChange` calls `setPackageDocKind`. Size it so it does not dominate the row (a narrow max-width utility class plus the existing small text sizing). Give it an `aria-label` naming the document. If `doc.kind` is a value not present in `PACKAGE_DOC_KINDS`, render it as an additional leading option so the current classification is never silently dropped.
  </action>
  <verify>
    <automated>npm run lint &amp;&amp; npm run build &amp;&amp; test "$(grep -v '^[[:space:]]*[/*]' src/cyber-uw/components/QuestionFields.tsx | grep -c 'editingKey')" -eq 0 &amp;&amp; test "$(grep -v '^[[:space:]]*[/*]' src/cyber-uw/components/QuestionFields.tsx | grep -c 'PencilOff')" -eq 0 &amp;&amp; test "$(grep -v '^[[:space:]]*[/*]' src/cyber-uw/components/QuestionFields.tsx | grep -c 'editing')" -ge 2 &amp;&amp; test "$(grep -v '^[[:space:]]*[/*]' src/cyber-uw/components/CaseWorkspace.tsx | grep -c 'PencilOff')" -ge 1 &amp;&amp; test "$(grep -v '^[[:space:]]*[/*]' src/cyber-uw/data/dossierPackage.ts | grep -c 'PACKAGE_DOC_KINDS')" -ge 1 &amp;&amp; test "$(grep -v '^[[:space:]]*[/*]' src/cyber-uw/store/cyberUwStore.ts | grep -c 'setPackageDocKind')" -ge 2</automated>
  </verify>
  <done>One pen per extracted-field section unlocks every field in that section and no field carries its own pen. Typing in an unlocked field still persists through `setAnswerOverride`, and clicking away no longer re-locks the section. Each package document row has a type-of-doc dropdown whose selection persists in store state and survives navigating away and back. Lint and build are clean.</done>
</task>

<task type="auto">
  <name>Task 3: Section-only sign-off — retire the document-level gate (D-04)</name>
  <files>src/cyber-uw/constants/cyberFlow.ts, src/cyber-uw/components/CaseWorkspace.tsx, src/cyber-uw/store/cyberUwStore.ts</files>
  <action>
Per D-04, section answer sign-off becomes the only sign-off on Policy Documents.

In `src/cyber-uw/constants/cyberFlow.ts`, rewrite `canLeavePolicyDocuments` so it returns true when three conditions hold: `completenessPct` is at least 80, `missingDocsForCase` is empty, and `answersSignedForCase` passes for `allAnswerKeysForCase`. Delete the package sign-off timestamp check and the accepted-document-ids check, and drop `packageSignOff` from the `Pick<>` parameter type only if the remaining body no longer needs it — note `answersSignedForCase` reads `packageSignOff.signedAnswerKeys`, so the key stays in the Pick. Update the doc comment above the function so it describes the section-sign-off gate rather than package sign-off.

In `src/cyber-uw/components/CaseWorkspace.tsx`, inside `PolicyDocumentsStageBody`: delete the package-level sign-off button and the signed-package confirmation paragraph together with the whole trailing action row they lived in; delete the per-document accept `Checkbox`, rendering each document row as its name plus the Task 2 type dropdown; and delete the now-dead locals for accepted ids, all-checked, signed, and the composite can-sign flag. Keep `answerKeys`, keep `answersOk` (still used by the bulk "Sign all answers" button), and keep the `Sign all answers` button and every `SignSectionButton`. Remove the `togglePackageDocAccepted` and `signOffPackage` store selectors from this component, and remove `Checkbox` from the `@heroui/react` import if nothing else in the file uses it (oxlint and `tsc -b` will fail on an unused import, so re-check the whole file).

Also in `CaseWorkspace.tsx`, fix the downstream gate in `RiskInformationStageBody`: its `answersSigned` flag currently requires a package sign-off timestamp in addition to signed answers. Because `signSectionAnswers`, `toggleAnswerSigned` and `setAnswerOverride` all clear that timestamp, keeping the term would permanently hide triage banners and findings once doc-level sign-off is gone. Reduce the flag to the `answersSignedForCase` check over `allAnswerKeysForCase` alone.

In `src/cyber-uw/store/cyberUwStore.ts`, delete the `signOffPackage` and `togglePackageDocAccepted` implementations and their entries in the store's action interface. Leave `setAnswerOverride`, `toggleAnswerSigned` and `signSectionAnswers` alone, including the lines where they reset the package sign-off fields — those fields simply become inert. Leave the `PackageSignOff` interface in `src/cyber-uw/types.ts` and the `signedPackage` seed helper in `src/cyber-uw/data/mockCases.ts` untouched so seeded cases keep loading; only their use as a gate disappears. Confirm `canLeavePolicyDocuments` is still imported in the store for the stage-advance guard.
  </action>
  <verify>
    <automated>npm run lint &amp;&amp; npm run build &amp;&amp; test "$(grep -v '^[[:space:]]*[/*]' src/cyber-uw/store/cyberUwStore.ts src/cyber-uw/components/CaseWorkspace.tsx | grep -cE 'signOffPackage|togglePackageDocAccepted')" -eq 0 &amp;&amp; test "$(grep -v '^[[:space:]]*[/*]' src/cyber-uw/constants/cyberFlow.ts | grep -cE 'signedOffAt|acceptedDocIds')" -eq 0 &amp;&amp; test "$(grep -v '^[[:space:]]*[/*]' src/cyber-uw/components/CaseWorkspace.tsx | grep -c 'SignSectionButton')" -ge 2 &amp;&amp; test "$(grep -v '^[[:space:]]*[/*]' src/cyber-uw/constants/cyberFlow.ts | grep -c 'canLeavePolicyDocuments')" -ge 1</automated>
  </verify>
  <done>`canLeavePolicyDocuments` depends only on completeness, missing docs and section answer sign-off. The Policy Documents body has no package sign-off button and no per-document checkboxes, section sign-off buttons remain, and Risk Information triage appears from signed answers alone. Lint and build are clean.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 4: Browser-verify the four Policy Documents and Risk Analysis flows (D-06)</name>
  <files>none — verification only</files>
  <action>Blocking human verification. Do not write code in this task. Start the dev server, walk the four flows described below, and wait for the resume signal before recording the summary.</action>
  <verify>
    <automated>MISSING — repo has no unit-test runner wired to these screens; this task is a blocking human checkpoint per D-06, and automated coverage for Tasks 1–3 is lint plus build plus structural greps</automated>
  </verify>
  <done>Developer replies "approved", or reports issues that are fixed and re-verified before the plan is marked complete.</done>
  <what-built>
Mock partner security-rating panel at the top of Risk Analysis (composite 250–900 with band, industry average and peer overlay, 12-month trend with band thresholds, four vector grades, outcome-multiplier assist copy, gap-bucket cite-backs); section-level edit pen replacing per-field pens on Policy Documents; correctable type-of-doc dropdown on each package document; and section-only sign-off with the document-level gate removed.
  </what-built>
  <how-to-verify>
Per D-06, browser-verify the four flows. Start the dev server with `npm run dev` and open the printed local URL (Vite defaults to http://localhost:5173), then sign in as an underwriter and open any case from Open cases.

1. Risk Analysis enrichment panel — expand the Risk Analysis stage. Confirm the rating panel sits above the ALE bubble chart, shows a score in the 250–900 range with a Basic/Intermediate/Advanced band, industry average with peer figures, a 12-month trend line with band threshold lines, four vector grades, and the ransomware-style multiplier copy. Reload the page and confirm the score and trend are identical (deterministic, not random).
2. Section pen — expand Policy Documents. Confirm no field has its own pencil. Click one section's pen and confirm every field in that section becomes editable at once. Type into a field, click elsewhere in the page, and confirm the section stays unlocked and the edit persisted. Click the pen again and confirm the section locks back to read-only.
3. Doc type dropdown — on a package document row, change the type from its ingested value to a different one (for example Document to SOC2). Switch to another case and back, and confirm the corrected type persisted.
4. Proceed without document-level sign-off — confirm there is no "sign off ingested package" button and no per-document checkboxes. Sign each extracted-field section, then use the advance strip's Continue action and confirm the case moves to Risk Information. In Risk Information, confirm triage banners and findings render. Finally confirm the rating panel is not gating anything: no Continue or Proceed affordance mentions or blocks on the security rating.

If no dev server can be started in this environment, report that and treat items 1–4 as unverified rather than approving.
  </how-to-verify>
  <resume-signal>Type "approved" or describe issues</resume-signal>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Underwriter input → in-memory store | Free-text answer overrides and document-kind selections cross into `cyberUwStore` state and are re-rendered as UI text. |
| Mock partner feed → Risk Analysis UI | `securityRatingDemo` output is rendered as underwriting-relevant figures; there is no network boundary because the feed is local and deterministic. |
| Stage-advance gate | `canLeavePolicyDocuments` is the authorization point for leaving Policy Documents; this plan relaxes it. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-260909-sqt-01 | Elevation of Privilege | `canLeavePolicyDocuments` (cyberFlow.ts) | medium | mitigate | Removing the package gate must not remove all gating: Task 3 keeps completeness ≥ 80, no-missing-docs, and full section answer sign-off, and Task 3's verify greps assert `canLeavePolicyDocuments` still exists and is consulted by the store's advance guard. |
| T-260909-sqt-02 | Spoofing | `SecurityRatingPanel` (mock feed presented as partner data) | medium | mitigate | Panel renders an explicit "partner feed · illustrative" provenance caption so a mock score is never mistaken for a live BitSight/SecurityScorecard reading, and D-01 forbids using it as a Verify/Proceed gate. |
| T-260909-sqt-03 | Tampering | `setPackageDocKind` (store) | low | mitigate | Action replaces only the `kind` string on the addressed doc within the addressed case, touches no sign-off or gap state, and selectable values come from the fixed `PACKAGE_DOC_KINDS` list. |
| T-260909-sqt-04 | Repudiation | Section-only sign-off | low | accept | Existing `signedAnswerKeys` plus the case `audit` trail already record who signed what; the removed package-level timestamp was redundant with section sign-off, which is the locked product decision (D-04). |
| T-260909-sqt-05 | Information Disclosure | Rendered answer overrides and doc kinds | low | accept | All values are demo data rendered as React text nodes (auto-escaped), stored client-side only, with no persistence or transport added. |
| T-260909-sqt-SC | Tampering | npm/pip/cargo installs | high | mitigate | No package-manager install tasks in this plan — recharts, lucide-react, @heroui/react and zustand are all existing dependencies. Legitimacy gate is not applicable; if an executor finds it needs a new dependency, stop and escalate rather than installing. |
</threat_model>

<verification>
- `npm run lint` (oxlint) passes with no new findings.
- `npm run build` (`tsc -b && vite build`) succeeds — this is the type-check gate, since the repo has no unit-test runner.
- Structural greps in each task's verify block confirm the removals (per-field pen state, package sign-off actions, doc-level gate terms) and the additions (`SecurityRatingPanel` wiring, `editing` prop, `PACKAGE_DOC_KINDS`, `setPackageDocKind`).
- Non-gating assertion: no reference to the security rating exists in `cyberFlow.ts` or `CyberWorkbenchDesk.tsx`.
- Blocking human checkpoint covers the four D-06 browser flows.
</verification>

<success_criteria>
- Risk Analysis opens with the mock partner rating panel above the ALE charts, showing composite score plus band, industry average and peer overlay, 12-month trend with band thresholds, four vector grades, and outcome multipliers as assist copy; identical across reloads.
- The rating influences no gate: Continue / Proceed behaviour is unchanged at any score.
- Policy Documents has exactly one pen per extracted-field section, unlocking all fields in that section, and zero per-field pens.
- Every package document row has a working type-of-doc dropdown whose correction persists in store state.
- An underwriter reaches Risk Information after section sign-off alone, with no package sign-off button and no per-document checkboxes in the flow, and Risk Information triage renders from signed answers.
- `npm run lint` and `npm run build` both pass.
</success_criteria>

<source_audit>
## Multi-Source Coverage Audit

Sources for this quick task: the six locked product decisions supplied by the orchestrator (no ROADMAP phase goal, no REQUIREMENTS.md ids, no RESEARCH.md — research phase was explicitly skipped).

| Source | Item | Covered by | Status |
|--------|------|-----------|--------|
| CONTEXT | D-01 mock BitSight-class panel: 250–900 composite + band, industry avg + peer overlay, 12-month sparkline with band thresholds, four vector grades, outcome multipliers, optional gap-bucket cite-backs, top of Risk Analysis, never a Proceed gate, no scanners | Task 1 | COVERED |
| CONTEXT | D-02 section-level pen toggles editability for all fields in the section; per-field pens removed | Task 2 | COVERED |
| CONTEXT | D-03 type-of-doc dropdown on ingested package documents to correct misclassification | Task 2 | COVERED |
| CONTEXT | D-04 section sign-off only: remove package sign-off button, per-doc accept checkboxes as leave-gate, and package `signedOffAt` as required gate; `canLeavePolicyDocuments` keeps completeness ≥ 80 and no-missing-docs plus section sign-off | Task 3 | COVERED |
| CONTEXT | D-05 match existing workbench styles (`wb-qual-bucket`, `wb-q-*`, recharts, existing button/select idiom); no new chart library | Tasks 1 and 2 | COVERED |
| CONTEXT | D-06 browser-verify the three flows plus proceeding without doc-level sign-off, if a dev server is available | Task 4 (blocking checkpoint) | COVERED |

No unplanned items. One documented deviation within D-05: the doc-type dropdown uses the repo's existing native `<select className="wb-q-cell__input">` idiom rather than a HeroUI `Select`, because no HeroUI `Select` appears anywhere in `src/` and D-05's controlling requirement is style consistency with the existing workbench.
</source_audit>

<output>
Create `.planning/quick/260909-sqt-add-a-bitsight-class-security-rating-enr/260909-sqt-SUMMARY.md` when done
</output>
