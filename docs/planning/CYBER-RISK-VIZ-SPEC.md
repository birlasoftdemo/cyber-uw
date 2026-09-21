---
status: active
created: 2026-08-11
updated: 2026-08-11
companion: CYBER-INSIGHTS-METRICS-SPEC.md, COMPETITOR-RESEARCH.md
---

# Cyber Risk & Threat Visualization Spec

> Quantify ingested raw findings as UW-facing charts. Mock aggregates only — no actuarial engine, BitSight, or CyberCube live feeds. Partner-class signals stay stubbed via `signalScore` / demo confidence.

**Case UI:** [`src/cyber-uw/components/RiskVizCharts.tsx`](../../src/cyber-uw/components/RiskVizCharts.tsx) inside Review Risk  
**Portfolio UI:** Insights **Risk** section ([`InsightCharts.tsx`](../../src/cyber-uw/insights/InsightCharts.tsx))  
**Demo data:** [`riskVizDemo.ts`](../../src/cyber-uw/data/riskVizDemo.ts), [`insightsDemo.ts`](../../src/cyber-uw/insights/insightsDemo.ts)

---

## Layers

| Layer | Surface | Purpose |
|-------|---------|---------|
| Case | Review Risk | Inherent threat prioritization + data confidence from ingest |
| Portfolio | Insights → Risk | Book threat mix over time + Risk Map concentration |

Stance (from competitor research): own gap / appetite / book watch; **mock** ratings + accumulation; do not rebuild scanners or cat models.

---

## Chart IDs (Tier 1 shipped)

| ID | Name | Viz | Placement | Segment key |
|----|------|-----|-----------|-------------|
| RV01 | Inherent risk by threat | Bubble / scatter | Case · Review Risk | `{ threatId }` → expand threat row |
| RV02 | Confidence vs sources | Box summary + mean line | Case · Review Risk | `{ sourceCount }` |
| RV03 | Signal confidence histogram | Histogram + mean/median | Case · Review Risk | `{ bin }` |
| CR01 | Cyber risk threat trend | Combo bar + multi-line | Insights · Risk | `{ month, threatCategory }` |
| CR02 | Risk Map sector × vendor heatmap | CSS grid heatmap | Insights · Risk (beside CP03) | `{ sector, vendor }` |
| CR03 | Top exposures by limit | Ranked list + trend | Insights · Risk | `{ caseId }` / insured |

### Tier 2 (specced, not required for first UI pass)

| ID | Name | Notes |
|----|------|-------|
| RV04 | Confidence decay by source type | Multi-line vs days since collection |
| RV05 | Confidence by risk band | Strip / mini-box (no violin) |
| RV06 | Gap ↔ threat correlation matrix | Heat cells from `gaps[]` × risk items |
| RV07 | Peer benchmark gauge | `signalScore` vs sector median |
| RV08 | Marginal book impact | Delta vs vendor watch threshold 25 |

### Deferred (Tier 3)

PML / EP curves, live posture drift, true violin density, full dependency node graphs.

---

## Mock field shapes

### Per threat (case · RV01)

| Field | Type | Notes |
|-------|------|-------|
| `threatId` | string | Matches `RiskActionItem.id` |
| `label` | string | Short chart label |
| `likelihoodPct` | 0–100 | Mock LEF |
| `impactUsd` | number | Expected severity $ |
| `exposureWeight` | number | Bubble size (limit / frequency weight) |
| `color` | string | Series color |

### Per finding (case · RV02 / RV03)

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Finding id |
| `confidence` | 0–1 | Data confidence (not “AI certainty”) |
| `sourceCount` | 1–5+ | Corroborating sources |
| `sourceType` | enum | whois · certificate · dns · topology · behavioral · form · asm |
| `collectedAtDaysAgo` | number | Freshness |
| `riskBand` | Minimal…Critical | Optional for RV05 |

### Portfolio (CR01–CR03)

| Field | Type | Notes |
|-------|------|-------|
| `month` | string | `YYYY-MM` |
| `volume` | number | Submission / finding volume bars |
| `byThreatCategory` | Record | Line series (ransomware, phishing, dos, …) |
| `vendor` / `sector` / `policyCount` / `exposedLimitUsd` / `avgSignalScore` | heatmap + list | Risk Map stub |

---

## Interaction contract

| Chart | Click |
|-------|-------|
| RV01 bubble | Expand matching Review Risk threat/impact row (`threatId`) |
| RV02 / RV03 | Optional highlight of findings in that bin / source count (no drawer) |
| CR01 / CR02 / CR03 | `InsightDrillDownDrawer` with case list (`rowsForSelection`) |

Label confidence as **data confidence** in UI copy.

Reuse insight chip tones `calm` / `watch` / `action` and dashboard / workbench surfaces.

---

## Acceptance

- [x] Review Risk shows RV01 bubble + RV02 sources + RV03 histogram above judgment lists
- [x] Bubble click expands the matching threat/impact card
- [x] Insights Risk section shows CR01 trend, CR02 heatmap, CR03 top exposures
- [x] CR01–CR03 open drill-down drawer with Open → workbench for real cases
- [x] No new chart library — Recharts (+ CSS heatmap) only
