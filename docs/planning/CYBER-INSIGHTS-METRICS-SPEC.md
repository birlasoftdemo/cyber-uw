---
status: locked
created: 2026-07-30
updated: 2026-07-30
source: Moody overview 02-METRICS-SPEC (underwriting assistant)
---

# Cyber Insights Metrics Specification

> Metric dictionary and visualization plan for a portfolio **Speed · Quality · Portfolio** insights surface. Pattern mirrors the Moody overview dashboard (hero KPIs → section charts → insight chips → drill-down drawer → workbench). Metrics map from existing `CyberCase` fields — no actuarial engine, claims ledger, or live ASM feed required for the POC.

**Case model:** [`src/cyber-uw/types.ts`](../../src/cyber-uw/types.ts)  
**Product stages:** Intake → Verify → Tier → Book → Decide  
**UI implementation:** deferred (this doc is the locked contract for a follow-on phase)

---

## Layout (locked)

| Layer | Count | Purpose |
|-------|-------|---------|
| **Hero KPIs** | 4 | Pipeline health + risk posture at a glance |
| **Speed** | 3 charts | Aging, cycle time, quote/refer/decline trend |
| **Quality** | 2 widgets | Control-gap mix + recommendation vs decision |
| **Portfolio** | 3 charts | Limit concentration, sector × decision, vendor accumulation |

Reuse Moody interaction contract: duration / assignee / Ops·UW persona filters, insight chips (`calm` / `watch` / `action`), click segment → **DrillDownDrawer** → open `CyberCase` in Decision Workbench.

---

## Hero KPIs

| ID | Metric | Definition | Source fields | Widget | Badge |
|----|--------|------------|---------------|--------|-------|
| CH01 | Median days to decision-ready | Median elapsed days from `receivedAt` to first non-pending `decision` (or dossier-ready proxy via `audit`) | `receivedAt`, `audit`, `decision` | Hero KPI + sparkline | UW |
| CH02 | Signal / completeness health | % of cases with `completenessPct ≥ 80` **and** `signalStatus = ready` | `completenessPct`, `signalStatus` | Hero KPI + sparkline | Both |
| CH03 | Pipeline limit | Sum of `limitRequestedUsd` for in-flight (`decision = pending`) cases; **MetricToggle** shows count with limit ≥ $5M (client threshold configurable) | `limitRequestedUsd`, `decision` | Hero KPI + MetricToggle | UW |
| CH04 | Gap-blocked backlog | Count of pending cases with ≥1 `critical` or `high` gap still open | `gaps[].severity`, `decision` | Hero KPI + sparkline | Ops |

Limit toggle syncs hero tile value with `CP01` highlight on the ≥$5M bucket (Moody TIV toggle analog).

---

## Speed metrics

| ID | Metric | Definition | Viz | Segment key | Badge |
|----|--------|------------|-----|-------------|-------|
| CS01 | Stage aging | WIP count by stage × age bucket (0–24h, 24–48h, >48h) | Stacked bar | `{ stage, ageBucket }` | Ops |
| CS02 | Cycle time by stage | Median days in stage vs SLA threshold (config stub) | Bar | `{ stage }` | UW |
| CS03 | Quote / refer / decline trend | Weekly volume by `decision` (quote · refer · decline) | Multi-line | `{ week, decision }` | Both |

**Stages:** `intake` · `verify` · `tier` · `book` · `decide` (from [`cyberFlow.ts`](../../src/cyber-uw/constants/cyberFlow.ts)).

### Speed insight chips (examples)

| Tone | Example label |
|------|---------------|
| `action` | N submissions aged >48h on Verify |
| `watch` | Median days to decision-ready rising vs prior period |
| `calm` | Decide backlog within SLA |

---

## Quality metrics

| ID | Metric | Definition | Viz | Segment key | Badge |
|----|--------|------------|-----|-------------|-------|
| CQ01 | Control gap severity mix | Gap counts by severity across the book; ranked list of top controls (MFA, EDR, backups) | Pie + ranked list | `{ severity }` or `{ control }` | Both |
| CQ02 | Recommendation vs decision | Mix of `recommendation` vs actual `decision` (HITL override rate) | Stacked bar (or dual pie) | `{ recommendation, decision }` | UW |

**Footer (STP analog):** % of cases with appetite `pass` and zero `critical` gaps — “clean quote path.”

### Quality insight chips (examples)

| Tone | Example label |
|------|---------------|
| `action` | Critical MFA attest-vs-signal mismatches |
| `watch` | Elevated Refer override rate |
| `watch` | Intake completeness &lt;80% on N cases |

---

## Portfolio metrics

| ID | Metric | Definition | Viz | Segment key | Badge |
|----|--------|------------|-----|-------------|-------|
| CP01 | Limit concentration | Submission count / $M by limit bucket; ≥$5M highlight when hero toggle on | Bar | `{ limitBucket }` | UW |
| CP02 | Sector × decision mix | New-business volume by sector stacked by quote / refer / decline (renewal N/A until modeled) | Stacked bar | `{ sector, decision }` | Both |
| CP03 | Vendor accumulation hits | Vendors with `bookCount` ≥ watch threshold (product default **25**); alert callout for top MSP / cloud / IdP | Horizontal bar + ranked list + AlertCallout | `{ vendor }` | UW |

### Portfolio insight chips (examples)

| Tone | Example label |
|------|---------------|
| `action` | Shared-vendor watch: N vendors ≥ threshold |
| `watch` | Sector cluster of declines |
| `watch` | Limit pile-up in ≥$5M bucket |

---

## Moody → Cyber mapping

| Moody metric | Cyber replacement | Rationale |
|--------------|-------------------|-----------|
| H01 Median days to quote | CH01 Median days to decision-ready | Cyber UW ends at quote / refer / decline, not bind |
| H02 Data quality score | CH02 Signal / completeness health | Attest + intake integrity is the quality signal |
| H03 Pipeline TIV / count >$5M | CH03 Pipeline limit / count ≥$5M | `limitRequestedUsd` is the capital proxy |
| H04 Quote-ready backlog | CH04 Gap-blocked backlog | Control gaps block cyber quote readiness |
| SP01–SP03 Status aging / cycle / quote-bind | CS01–CS03 Same structure on cyber stages + Q/R/D trend | Preserve drill-down UX |
| Q01 Quality blockers / Q02 Tier pie | CQ01 Gap severity / CQ02 Rec vs decision | Cyber quality = control gaps + HITL overrides |
| PF01 TIV / PF02 LOB-renewal / PF03 Geo-cat | CP01 Limit / CP02 Sector-decision / CP03 Vendor accumulation | Cyber systemic risk is vendor + sector, not cat geo |

**Design primitives to reuse conceptually** (from Moody dashboard CSS already present in this repo):

| Primitive | Role |
|-----------|------|
| Hero KPI tile + sparkline | CH01–CH04 |
| MetricToggle | CH03 ↔ CP01 |
| Insight chips (`calm` / `watch` / `action`) | Section narratives |
| Chart card + duration / users / persona filters | CS / CQ / CP cards |
| DrillDownDrawer → workbench open | Segment click → `CyberCase` |

---

## Drill-down contract

Click any chart segment (bar, pie slice, line dot, legend row, hero tile) → **DrillDownDrawer** with a case list.

### Row schema (`CyberDrillDownRow`)

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Case id; Open enabled when present in mock store |
| `insured` | string | `CyberCase.insured` |
| `broker` | string | |
| `sector` | string | |
| `stage` | string | Derived from journey position |
| `tier` | 1–5 | |
| `signalScore` | number | 0–100 mock posture |
| `limitRequestedUsd` | number | |
| `gapCriticalCount` | number | Count of critical (+ optionally high) gaps |
| `decision` | pending \| quote \| refer \| decline | |
| `assignee` | string | From audit / demo stub |
| `ageHours` | number | Since `receivedAt` or stage entry |
| `isReal` | boolean | Synthetic demo rows: Open disabled |

### Segment keys by chart

| Chart | Segment |
|-------|---------|
| Stage aging | `{ stage, ageBucket }` |
| Cycle time | `{ stage }` |
| Q/R/D trend | `{ week, decision }` |
| Gap severity | `{ severity }` or `{ control }` |
| Rec vs decision | `{ recommendation, decision }` |
| Limit concentration | `{ limitBucket }` |
| Sector × decision | `{ sector, decision }` |
| Vendor accumulation | `{ vendor }` |
| Hero KPIs | `{ kpi, … }` via `segmentFromHeroKpi` |

Synthetic demo rows use `CYB-2026-DEMO-###` IDs (Open disabled). Real rows navigate to Decision Workbench with the case selected.

---

## Per-chart filters

| Filter | Options | Behavior |
|--------|---------|----------|
| **Duration** | Last 24h, last week, last month, last 3 months | Exclusive; scales aggregates for demo |
| **Users** | Demo assignee list + Unassigned | Multi-select; proportional subset |
| **Persona** | Ops / UW | Ops weights aging/backlog; UW weights gaps / accumulation / tiers (+lens on relevant series) |

Hero KPI row uses default filters (logged-in persona, last month, all users) without inline filter UI.

---

## Role badge contract

| Badge | Primary audience |
|-------|------------------|
| Ops | Operations / triage — aging, backlog |
| UW | Underwriters — gaps, limit, vendors, overrides |
| Both | Shared KPIs |

Login role may ring-highlight matching widgets (visual affordance only; no hide/show).

---

## Data sources (POC)

| Source | Use |
|--------|-----|
| `CyberCase` mock store / `mockCases.ts` | All aggregates |
| `ControlGap`, `AppetiteHit`, `VendorExposure` | Quality + portfolio |
| Config stub for SLA days / limit threshold / vendor watch count | CS02, CH03, CP03 |

No backend required for the first insights implementation — mirror Moody `overviewDemo.ts` / `overviewDrillDown.ts` pattern with cyber-shaped demo aggregates.

---

## Out of scope (deferred)

| Item | Why deferred |
|------|--------------|
| Continuous post-bind posture drift | Moon X1 |
| Full cat / correlated loss scenarios | Moon X3 |
| Live rating / ELR concession simulator | Moon X4 / X5 |
| Claims / IR closed-loop learning | Moon X8 |
| Real BitSight / CyberCube feeds | Keep mock `signalScore` (M5) |
| Renewal mix in CP02 | Not on `CyberCase` yet |
| Binding premium / policy entity metrics | Non-goal for MVP |

---

## Acceptance (for follow-on UI phase)

- [ ] Hero row renders CH01–CH04 with sparklines; CH03 MetricToggle syncs CP01 highlight
- [ ] Speed / Quality / Portfolio sections match chart IDs and viz types above
- [ ] Each section shows ≥1 insight chip with tone
- [ ] Segment click opens drawer with `CyberDrillDownRow` list; real IDs open Decision Workbench
- [ ] Filters (duration, users, persona) change demo aggregates without layout shift
- [ ] No dependency on live ASM, PAS, or claims APIs
