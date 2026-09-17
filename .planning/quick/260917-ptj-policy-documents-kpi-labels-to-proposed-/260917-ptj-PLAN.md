---
phase: 260917-ptj
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/cyber-uw/components/CaseWorkspace.tsx
  - src/main.tsx
  - src/styles/typography.css
  - src/index.css
  - package.json
  - package-lock.json
autonomous: true
requirements:
  - D-01
  - D-02
  - D-03
must_haves:
  truths:
    - "Policy Documents QuestionMetaGrid shows Proposed start date and Proposed end date (not bare Start/End date) with values and icons unchanged (D-01)"
    - "Page-wide type uses Source Sans 3 for UI/titles and Source Serif 4 for kickers, captions, body, and labels — no Inter, Geist, or SF Pro as primary stacks (D-02)"
    - "No Risk Analysis redesign and no button chrome changes in this plan (D-03)"
  artifacts:
    - path: src/cyber-uw/components/CaseWorkspace.tsx
      provides: Proposed start/end date KPI labels on Policy Documents meta grid
    - path: src/main.tsx
      provides: @fontsource/source-sans-3 and source-serif-4 imports; Geist/Inter imports removed
    - path: src/styles/typography.css
      provides: --font-ui/--font-display Source Sans 3; --font-serif Source Serif 4 wired into supporting type classes
    - path: package.json
      provides: Source Sans 3 + Source Serif 4 deps; unused Geist/Inter packages removed
  key_links:
    - from: main.tsx fontsource CSS imports
      to: typography.css CSS variables
      via: font-family name strings matching @fontsource family names
    - from: --font-serif
      to: .cuw-type-kicker .cuw-type-caption .cuw-type-body .cuw-type-label
      via: font-family: var(--font-serif)
    - from: body in index.css
      to: --font-ui
      via: existing font-family: var(--font-ui) (Source Sans 3 after var update)
---

<objective>
Rename Policy Documents period KPI labels to Proposed start/end date (D-01) and replace AI-generic Inter/Geist/SF Pro stacks with page-wide Source Sans 3 + Source Serif 4 (D-02), without touching Risk Analysis layout or buttons (D-03).

Purpose: Clarify that policy period KPIs are proposed dates, and give the UW desk an elegant financial-SaaS type system instead of AI-default fonts.
Output: Two-string label fix + font packages/wiring/CSS variable update across typography and entry imports.
</objective>

<execution_context>
@$HOME/.cursor/gsd-core/workflows/execute-plan.md
@$HOME/.cursor/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@src/cyber-uw/components/CaseWorkspace.tsx
@src/styles/typography.css
@src/main.tsx
@src/index.css
@package.json
</context>

<tasks>

<task type="auto">
  <name>Task 1: Proposed start/end date KPI labels</name>
  <files>src/cyber-uw/components/CaseWorkspace.tsx</files>
  <action>
In CaseWorkspace Policy Documents QuestionMetaGrid (period meta ~lines 575–578), change only the label strings per D-01:
- Start date → Proposed start date
- End date → Proposed end date

Do not change values (formatPolicyDate), icons (CalendarRange / CalendarCheck2), grid structure, or any other stage UI (D-03).
  </action>
  <verify>
    <automated>rg -n "Proposed start date|Proposed end date" src/cyber-uw/components/CaseWorkspace.tsx && ! rg -n "label: 'Start date'|label: 'End date'" src/cyber-uw/components/CaseWorkspace.tsx</automated>
  </verify>
  <done>
QuestionMetaGrid period items use Proposed start date and Proposed end date; values and icons unchanged.
  </done>
</task>

<task type="auto">
  <name>Task 2: Source Sans 3 + Source Serif 4 page-wide type</name>
  <files>package.json, package-lock.json, src/main.tsx, src/styles/typography.css, src/index.css</files>
  <action>
Replace AI-generic font stack with elegant financial UW SaaS type per D-02 (packages locked by user — Adobe Source families via @fontsource; treat as approved, no alternate stack).

1. Install: `npm install @fontsource/source-sans-3 @fontsource/source-serif-4`
2. Remove unused: `npm uninstall @fontsource/geist-sans @fontsource/inter`
3. In main.tsx: remove all Geist and Inter @fontsource imports. Import Source Sans 3 weights 400/500/600/700 and Source Serif 4 weights 400/500/600 (css entry paths matching installed package layout — typically `@fontsource/source-sans-3/400.css` etc.). Keep `./index.css` and other existing imports order after fonts.
4. In typography.css :root:
   - Set `--font-ui` and `--font-display` to `'Source Sans 3', ui-sans-serif, sans-serif` (no Inter, Geist, SF Pro Display/Text, system-ui-as-hero).
   - Add `--font-serif: 'Source Serif 4', ui-serif, Georgia, serif` (or `--font-supporting` with the same family — prefer `--font-serif`).
5. Point supporting classes to serif: `.cuw-type-kicker`, `.cuw-type-caption`, `.cuw-type-body`, `.cuw-type-label` use `font-family: var(--font-serif)`. Keep `.cuw-type-title` and `.cuw-type-metric` (and `.font-display` / `.font-ui`) on Source Sans via existing --font-display / --font-ui.
6. Confirm index.css body still uses `font-family: var(--font-ui)` so base UI is Source Sans 3 — no body redesign beyond font family resolution.
7. Do not redesign Risk Analysis, buttons, colors, or layout (D-03). Do not introduce Inter, Roboto, Arial, purple themes, or cream+terracotta editorial looks.
  </action>
  <verify>
    <automated>rg -n "source-sans-3|source-serif-4|Source Sans 3|Source Serif 4|--font-serif" src/main.tsx src/styles/typography.css package.json && ! rg -n "@fontsource/geist-sans|@fontsource/inter" src/main.tsx package.json && ! rg -n "SF Pro Display|SF Pro Text" src/styles/typography.css && npm run build</automated>
  </verify>
  <done>
Source Sans 3 drives UI/titles; Source Serif 4 drives kicker/caption/body/label; Geist/Inter imports and deps gone; build passes; Risk Analysis and buttons untouched.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| npm registry → local node_modules | New @fontsource packages enter the build dependency graph |
| Browser → rendered CSS | Font family names must match shipped @fontsource CSS or fallbacks apply |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-ptj-01 | Tampering | npm install source-sans-3 / source-serif-4 | low | accept | Packages explicitly locked by user (Adobe Source via @fontsource); pin via package-lock.json |
| T-ptj-02 | Spoofing | font-family CSS names | low | mitigate | Verify @fontsource CSS family names match typography.css strings; build must succeed with imports resolving |
| T-ptj-SC | Tampering | npm/pip/cargo installs | low | accept | User-locked font packages only; no other new deps |
</threat_model>

<verification>
- rg confirms Proposed start/end date labels and absence of bare Start/End date labels in CaseWorkspace.
- rg confirms Source Sans 3 / Source Serif 4 wiring; no Geist/Inter in main.tsx or package.json; no SF Pro primary stack in typography.css.
- `npm run build` succeeds.
</verification>

<success_criteria>
- Policy Documents period KPIs read Proposed start date / Proposed end date.
- Desk type system is Source Sans 3 (UI/titles) + Source Serif 4 (supporting text classes) page-wide.
- Scope limited to labels + type system (D-03).
</success_criteria>

<output>
Create `.planning/quick/260917-ptj-policy-documents-kpi-labels-to-proposed-/260917-ptj-SUMMARY.md` when done
</output>
