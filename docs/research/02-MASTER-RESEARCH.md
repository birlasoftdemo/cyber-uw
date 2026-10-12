# Master Research — Cyber Underwriting Assistants

**Audience:** Product / strategy  
**Job:** Understand the evidence  
**As of:** September 2026  
**Method:** Secondary synthesis (open web + in-repo research). **No primary MGA underwriter interviews yet.**  
**Companions:** [01-EXECUTIVE-BRIEF.md](./01-EXECUTIVE-BRIEF.md) · [03-COMPETITIVE-LANDSCAPE.md](./03-COMPETITIVE-LANDSCAPE.md) · [04-CX-RESEARCH.md](./04-CX-RESEARCH.md) · [05-EVIDENCE-AND-SOURCES.md](./05-EVIDENCE-AND-SOURCES.md)

---

## 1. Research question

What problem do **cyber insurance underwriting assistants** solve, for whom, under what market conditions—and what evidence supports building a **Decision Workbench** (orchestrated stages + human-in-the-loop) rather than a form chatbot or an InsurSec carrier clone?

---

## 2. Category definition

**In scope:** Software that helps carriers/MGAs **intake, enrich, reconcile attestations vs signals, route against appetite, recommend Quote/Refer/Decline, and document** decisions with audit + PAS handoff. Humans retain bind authority.

**Out of primary scope:** Risk-bearing cyber products (Coalition et al.); pure ratings/ASM; pure cat models; broker-only portals.

**Working thesis (Estimated):** The job is *reconcile claim versus signal, then decide and defend under time and price pressure*—not complete another questionnaire.

---

## 3. Evidence map (themes → implications)

Evidence grades: **A** named survey / major broker / reinsurer / regulator · **B** attributed practitioner / reputable trade · **C** vendor / insurtech (bias). Full URLs in [05-EVIDENCE-AND-SOURCES.md](./05-EVIDENCE-AND-SOURCES.md).

### Theme 1 — Attestation vs reality

| Finding | Grade | Product implication |
| --- | --- | --- |
| Applicants describe policies/procedures more than live efficacy (Dark Reading / Tanium framing) | B | Gap board is the credibility wedge |
| “EDR everywhere” often fails IR reality checks (Cyber Insurance Academy) | B | Early RFIs on MFA/EDR/backup |
| Academic surveys: self-report incomplete / subjective / outdated (Springer 2026) | A | Don’t treat app answers as ground truth |
| Insurtech narrative: annual snapshot vs hourly threat (Coalition blogs) | C* | Continuous monitoring = partner layer later |

### Theme 2 — Throughput / research tax

| Finding | Grade | Product implication |
| --- | --- | --- |
| Specialty UW: large share of day searching vs deciding (SageSure paraphrase) | B | Decision-ready dossier > another portal |
| “30 minutes → 3 hours” submission sprawl (email/PDF → consolidate) | C/B | Multi-channel intake + SSOT submission |
| Admin share of UW time commonly cited ~35%+ (industry pattern via vendors) | C | Automate chase lists / completeness gates |
| Applicant-side questionnaire cost often cited high (KBPilot) | C | Broker RFI quality reduces cycle time |

### Theme 3 — Soft market + discipline

| Finding | Grade | Product implication |
| --- | --- | --- |
| Everest × Zywave (Jan 2024): rate adequacy top concern; competition up; brokers’ market | A | Explainable Quote/Refer/Decline + concession flags |
| Marsh GIMI Q2 2026: cyber −4% globally; 12th consecutive quarterly decline | A (market) | Speed is table stakes |
| Swiss Re: soft market → concessions on premium, limits, coverage, **controls**; manual UW costly for SME | A | Soft-market concession dual-control |
| Aon: capacity ample; pricing favorable but severity / BI / litigation / aggregation worries rise | A | Book watch + selection discipline |

### Theme 4 — Aggregation / systemic

| Finding | Grade | Product implication |
| --- | --- | --- |
| Aon: dependent BI / shared vendor can hit many policies from one event | A | Accumulation **alert** at quote (not full cat) |
| Supervisors / surveys push portfolio monitoring language | A/B | Vendor extraction + book CSV stub in MVP |
| Apps increasingly ask cloud/EDR/DNS/CDN/MSP | C | NER of shared vendors from app |

### Theme 5 — Claims/IR learning silo (moon)

| Finding | Grade | Product implication |
| --- | --- | --- |
| UW sees apps; claims see redacted forensics; IR holds ground truth (Cyber Insurance Academy) | B | Defer closed-loop learning; legal privilege hard |
| Misrep / rescission practice on control overclaims (US case commentary) | B | Confirm/Clear; never invent answers |

### Theme 6 — Regulatory evidence pressure

| Finding | Grade | Product implication |
| --- | --- | --- |
| EU DORA (Jan 2025), NIS2, PRA SS4/17 cyber UW themes | A | Evidence vault / dossier content |
| EU AI Act Art. 50 transparency (Aug 2026) for assistive AI | A | Disclose AI assist; HITL bind |
| ISO 27001:2022 transition cutoff Oct 2025; NIST CSF 2.0 | A/B | Map evidence labels carefully |

---

## 4. Market structure (stack trichotomy)

Desks typically run **two or more** of:

1. **External signal / ratings** — BitSight, SecurityScorecard, Black Kite, …  
2. **Cat / portfolio models** — CyberCube, Guidewire Cyence, …  
3. **MGA / carrier / InsurSec telemetry** — Coalition-style stacks, internal tools  

**Strategic stance (product):** orchestrate (1)–(2); enable desks vs competing as (3)’s capacity business.

**Agentic maturity horizons**

| Horizon | Meaning | Status (Estimated) |
| --- | --- | --- |
| H1 | Copilot on forms | Widely piloted; weak differentiation |
| H2 | Specialist stages + orchestrator + HITL cite-back | Target for POC |
| H3 | Continuous posture + claims/IR learning | Roadmap / partners / legal |

---

## 5. Demand drivers vs barriers

**Drivers (Known + Estimated):** soft-market speed; attestation gaps; InsurSec competitive bar; aggregation; regulatory evidence; UW labor cost.

**Barriers / unknowns:** no primary interviews; unclear WTP for “consulting IP accelerator” vs buying Coalition-like stack; PAS integration debt; AI governance cost; signal-feed COGS; status-quo spreadsheet inertia.

**What secondary research does *not* prove**

- Pain ranking at target Capgemini / Birlasoft MGA accounts  
- Exact hours per cyber submission at ICP desks  
- Which pain wedge partners will fund first  
- Precise software TAM (treat syndicated mega-TAMs as unreliable)

---

## 6. Forecast summary (1–3 years)

| Scenario | Assumptions | Outcome | Confidence |
| --- | --- | --- | --- |
| Base | Soft market decelerates; H2 workbenches win refs; ratings partner | Uneven spend growth; orchestrators + PAS depth win | Medium |
| Optimistic | Loss spike / supervisor push on evidence + aggregation | Email/PDF displaced; premium for gap+appetite | Low–Medium |
| Pessimistic | Carrier build/buy + InsurSec absorb category | Assistants become PAS features; niche retreat | Medium |

---

## 7. Product evidence → MVP mapping

| Evidence theme | MVP features (from FEATURE-LISTS) | Non-goal |
| --- | --- | --- |
| Attest vs signal | M5–M8 gap board, RFI, evidence lite | Rebuild BitSight |
| Throughput | M1–M4 intake, completeness, SSOT | Broker portal GTM |
| Soft-market discipline | M9–M12 appetite, Q/R/D, concession flags, audit | Silent auto-bind |
| Decision dossier | M13–M14 | — |
| Pricing guidance | M15 tiers (non-binding) | Full actuarial engine |
| Accumulation | M16 vendor alert stub | Full cat model |
| PAS | M17 adapter (mock in POC) | Own PAS |

**Success metrics (proposed):** time to decision-ready dossier; % attestation conflicts caught pre-quote; % decisions with auditable rationale; live appetite-rule swap for personalization demo.

---

## 8. Open research backlog

| Priority | Question | Method |
| --- | --- | --- |
| P0 | Rank pains 1–5 with 8–12 cyber UWs at ICP MGAs | Primary interviews |
| P0 | WTP and buy vs build vs partner preferences | Interviews + RFP artifacts |
| P1 | Minutes per cyber submission (intake → bind-ready) | Time-motion / diary study |
| P1 | Which PAS adapters appear most often | Engagement sampling |
| P2 | Win/loss vs Cytora / Concirrus / DeNexus / InsurSec | GTM interviews |

---

## 9. Source tree (internal)

| Doc | Role |
| --- | --- |
| `docs/research/CYBER-UW-ASSISTANTS-MARKET-REPORT.md` | Full market brief |
| `docs/planning/SECONDARY-RESEARCH-PAIN-POINTS.md` | Graded pain quotes |
| `docs/planning/USER-RESEARCH.md` | Locked insights |
| `docs/planning/COMPETITOR-RESEARCH.md` | Stack + horizons |
| `docs/research/CYBER-UW-REGULATORY-UPDATES-2024-PLUS.md` | Regulatory timeline |
| `docs/planning/FEATURE-LISTS-MVP-MOON.md` | Feature ↔ pain IDs |
| `docs/planning/forged-idea.md` | Scope lock |

---

*This document consolidates evidence for product/strategy decisions. For claim-level validation, use [05-EVIDENCE-AND-SOURCES.md](./05-EVIDENCE-AND-SOURCES.md).*
