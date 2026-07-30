# Feature lists — MVP vs Moon (Band A + forced Band B)

**Product (working name):** Cyber UW Decision Workbench  
**Builder:** Birlasoft IP accelerator → personalized per MGA/carrier  
**Primary persona:** Cyber underwriter  
**POC scope lock:** Band A + pricing tiers + accumulation stub + PAS adapter  
**Non-goals (MVP):** become a risk-bearing cyber MGA; rebuild BitSight/CyberCube; full continuous telemetry; IR privilege bridge (theme 5)

---

## MVP — innovation that still ships (AI marries real desk pain)

*Principle: decision-ready dossier in one place; human binds; every AI claim is explainable and overrideable.*

### 1. Intake & normalize
| # | Feature | AI role | Pain IDs |
|---|---------|---------|----------|
| M1 | Multi-channel intake (email forward / upload / drag-drop) into one submission record | Classify docs; extract firmographics + control answers | P2.1 |
| M2 | Completeness gate — required app sections, loss runs, evidence attachments | Flag missing; draft broker chase list | P2.6, P2.7 |
| M3 | Master control-question map (carrier/MGA form variants → canonical controls) | Fuzzy map “MFA everywhere?” ↔ canonical MFA | P1.7 |
| M4 | Shared submission record (SSOT) — UW, ops views; no dual entry | — | P2.5 foundation |

### 2. Attest vs signal reconcile
| # | Feature | AI role | Pain IDs |
|---|---------|---------|----------|
| M5 | Pluggable external-signal connector — **POC: mocked ratings/ASM**; real partner per client later | — | P2.3 |
| M6 | Control gap board — attested MFA/EDR/backup vs signal/evidence | Diff engine + plain-language gap cards | P1.2, P1.4 |
| M7 | Early RFI pack — gaps detected at intake, not at quote desk | Draft RFIs with cite-back to field + signal | P1.10 |
| M8 | Evidence lite — accept screenshot/PDF for top 3 critical controls; link to gap board | Extract claims from evidence; confidence score | P1.6 (thin slice) |

### 3. Appetite / consistency / defend
| # | Feature | AI role | Pain IDs |
|---|---------|---------|----------|
| M9 | Versioned appetite rules (YAML/config) — LOB, geography, revenue, control floors, sector bars | Explain which rules fired | P2.11, P1.9 |
| M10 | Recommendation: Quote / Refer / Decline with reason codes | Rank reasons; UW override mandatory on outbound | P3.4, P3.5 |
| M11 | Soft-market concession flags — “below control floor” requires dual control | — | P3.3 (thin) |
| M12 | Immutable decision audit log (who, when, overrides, rule versions) | — | P2.12 |

### 4. Decision dossier
| # | Feature | AI role | Pain IDs |
|---|---------|---------|----------|
| M13 | One-page UW dossier (risk summary, gaps, appetite hits, tier, vendor flags) | Generate narrative; citations to fields/rules/signals | P2.4 |
| M14 | Broker-safe summary export (no internal rule IPs) | Tone/redact | P2.10 |

### 5. Forced Band B — in MVP
| # | Feature | AI role | Pain IDs | Guardrail |
|---|---------|---------|----------|-----------|
| M15 | **Pricing tiers** — Tier 1–5 (or client scale) from posture score + rule hits; show “referral pricing” not binding premium | Score assist; never silent auto-bind | P3.7 | No full rating engine; actuarial factors stubbed/configurable |
| M16 | **Accumulation stub** — extract named vendors (cloud, IdP, EDR, MSP, M365…); roll up count of book exposures sharing vendor from uploaded book CSV | NER/extract vendors from app + enrichment | P4.1, P4.3, P4.5 | Not a cat model; concentration *alert* only |
| M17 | **PAS adapter** — outbound: push quoted/declined status + key fields; inbound: poll stub status. Hexagonal port; **POC: mock only** (+ optional sample adapter shape) | Map fields | P2.5 | Interface-first; real PAS named per client engagement |

### MVP acceptance bar (Birlasoft internal pitch)
- UW can go **intake → gap board → tier + quote/refer/decline → dossier → PAS stub** on a canned cyber submission in one sitting  
- Every recommendation shows **evidence trail**  
- Appetite + tier weights **swappable config** (personalization story)  
- Accumulation shows **at least one “shared vendor” alert** against sample book  

---

## Moon — shoot for real pain with ambitious AI

*Principle: continuous truth, portfolio brain, closed-loop learning — still HITL on capital decisions; Birlasoft orchestrates partners + agents.*

### Moon features (beyond MVP)
| # | Feature | Why moon | Partner / build |
|---|---------|----------|-----------------|
| X1 | Continuous posture (post-bind) — drift alerts when MFA/EDR degrades mid-term | Theme 1.3 / 4.4; carrier loss prevention | BitSight / SSC / Black Kite continuous feeds |
| X2 | Agentic multi-carrier form fill + evidence chase (ops + broker copilots) | Throughput at scale across tenants | Build agents on MVP spine |
| X3 | Portfolio accumulation brain — correlated loss scenarios, treaty caps in UW UI, what-if “add this risk” | Theme 4.2 / 4.7 / 4.9 | CyberCube / Cyence / Kovrr + internal book graph |
| X4 | Live pricing — connect to client rating service; suggest premium deltas from posture delta | Beyond tiers | Client actuarial API |
| X5 | Concession simulator — “if we waive EDR floor, expected loss ratio impact” | Soft-market discipline with numbers | Needs loss model |
| X6 | Sector threat → appetite auto-draft (UW approves rule PRs) | Theme 3.6 recalibration | Threat intel + policy-as-code |
| X7 | Junior UW copilots with specialist shadow mode (senior reviews AI plan) | P2.8 / P2.9 | Org change + eval harness |
| X8 | Claims/IR learning loop — anonymized IR artifacts retrain gap priors (theme 5) | Closes information asymmetry | Legal privilege + IR partners — hardest |
| X9 | Parametric / event triggers (vendor outage → portfolio ping) | Systemic moonshot | Capital markets / parametric partners |
| X10 | Multi-tenant “program factory” — spin client-branded workbench + rules + connectors in days | Capgemini/Birlasoft industrialization | Platform ops |

### Moon acceptance bar (narrative for pitch)
- “We don’t replace underwriters or BitSight — we become the **operating system** where signals, appetite, capital constraints, and UW judgment meet, and where every client gets a personalized instance.”

### Next surface — portfolio insights (spec only)
Moody-pattern Speed · Quality · Portfolio metrics dictionary (hero KPIs, charts, drill-down, insight chips) → [`CYBER-INSIGHTS-METRICS-SPEC.md`](./CYBER-INSIGHTS-METRICS-SPEC.md). UI not in MVP; follow-on phase.

---

## Competitor positioning (one-liner map)

*Full market signals, agentic architecture stance, and 24-row industry feature checklist → `COMPETITOR-RESEARCH.md` (also summarized in `USER-RESEARCH.md` §4).*

| Class | Examples | Birlasoft stance |
|-------|----------|------------------|
| Risk-bearing cyber MGA | Coalition, At-Bay, Corvus/Travelers | **Not competing** — different GTM; learn UX patterns |
| External ratings / ASM | BitSight, SecurityScorecard, Black Kite | **Integrate** in MVP (M5); don’t rebuild |
| Cat / agg models | CyberCube, Guidewire Cyence, Kovrr | **Moon partner** (X3); stub only in MVP (M16) |
| UW workflow / doc AI | Cytora-class, specialty submission tools | **Compete/overlap** on intake+dossier; differentiate on *cyber control gap + appetite + accumulation stub + PAS* in one configurable spine |
| Agentic UW specialists | DeNexus, WNS SKENSE-class, Bold Penguin-class | **Pattern peers** — orchestrator + specialist agents + HITL; do not claim H3 autonomy in MVP |
| Broker submission portals | Marsh Online Cyber, RQB-like | Adjacent; workbench sits on **carrier/MGA UW side** |

---

## Traceability — scope → features

| Locked scope | MVP features |
|--------------|--------------|
| Band A intake | M1–M4 |
| Band A attest/signal | M5–M8 |
| Band A appetite/defend | M9–M12 |
| Band A dossier | M13–M14 |
| Band B pricing tiers | M15 |
| Band B accumulation stub | M16 |
| Band B PAS adapter | M17 |
