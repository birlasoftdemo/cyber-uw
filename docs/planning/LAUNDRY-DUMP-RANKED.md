# Laundry dump + ranking — themes 1–4

**Wedge lock:** 1 attestation–reality + 2 throughput/search + 3 soft-market discipline + 4 accumulation  
**Excluded this pass:** theme 5 (UW↔claims↔IR silo)  
**Buyer lens:** carrier / risk-bearing MGA desk  
**Builder lens:** Birlasoft — consulting IP accelerator POC → personalized client solutions  

**Scoring (1–5, higher = better priority for Birlasoft to pursue)**

| Axis | Meaning |
|------|---------|
| **Impact** | Business impact for carriers/MGAs if solved (loss ratio, adverse selection, speed-to-quote, portfolio survival, competitive win-rate) |
| **MVP-ready** | Birlasoft can ship a credible POC/MVP without becoming a licensed cyber carrier, without owning proprietary insured telemetry, using APIs + docs + configurable rules — demo in ~6–12 weeks, extendable per client |

**Composite** = Impact × MVP-ready (max 25). Sort by composite; ties break to higher Impact.

**Caveat:** scores are synthesis judgments from secondary research + Birlasoft delivery constraints — not actuarial or primary-validated.

---

## A. Laundry dump (atomic pains)

### Theme 1 — Attestation–reality gap

| ID | Pain (atomic) |
|----|----------------|
| P1.1 | Application answers are self-attested; no independent check at quote |
| P1.2 | “Control exists” ≠ “control deployed / configured / enforced” (esp. MFA, EDR, backups) |
| P1.3 | Answers go stale between bind and next renewal (point-in-time posture) |
| P1.4 | Applicant overclaims; scan/external signal contradicts questionnaire |
| P1.5 | Applicant under-knows own environment (shadow IT, incomplete asset inventory) |
| P1.6 | Evidence packets inconsistent (screenshots, SOC2, scans, RMM exports) — hard to normalize |
| P1.7 | Multi-carrier / multi-form wording differences → same control asked 5 ways |
| P1.8 | Warranty / conditions-precedent risk if attestation wrong (claims denial later → UW caution) |
| P1.9 | Sector-specific control bars (healthcare, retail, MSP) poorly encoded in guidelines |
| P1.10 | Follow-up RFIs to broker/insured multiply cycle time when gaps found late |

### Theme 2 — Throughput / information hunt

| ID | Pain (atomic) |
|----|----------------|
| P2.1 | Submissions arrive as email + PDF + spreadsheet sprawl |
| P2.2 | UW time spent searching internal systems for similar risks / precedents |
| P2.3 | UW time spent hunting external intel (threat, vendor, ratings) per risk |
| P2.4 | Manual consolidation into decision memo / referral note |
| P2.5 | Re-keying same facts across PAS / rating / notes / broker reply |
| P2.6 | Incomplete submissions; chase loops with broker |
| P2.7 | Attachment chaos (loss runs, apps, SOC reports) — tagging & completeness |
| P2.8 | Junior UW bottleneck waiting on scarce cyber specialist |
| P2.9 | Knowledge trapped in senior heads / old email / wiki fragments |
| P2.10 | Same-day / broker-competitive turnaround pressure vs thorough review |
| P2.11 | Multi-tenant / multi-program appetite rules hard to apply consistently |
| P2.12 | Audit trail of “why quoted / declined / referred” weak or manual |

### Theme 3 — Soft-market discipline bind

| ID | Pain (atomic) |
|----|----------------|
| P3.1 | Rate adequacy under competitive pressure (flat/negative rates) |
| P3.2 | Brokers shop speed + price; UW has less leeway on terms |
| P3.3 | Pressure to concede on controls / coverage / limits to win |
| P3.4 | Need to defend declinations / referrals with clear rationale |
| P3.5 | Inconsistent UW decisions across desk → leakage / adverse selection |
| P3.6 | Appetite guidelines lag threat landscape (constant recalibration) |
| P3.7 | Pricing weakly differentiated by true posture → good risks overpay, bad underpay |
| P3.8 | New capacity / market entrants compress margins; process cost must fall |
| P3.9 | SME/micro segment uneconomic if UW stays fully manual |
| P3.10 | Coverage wording / exclusion debates (war, aggregation) slow quote negotiation |

### Theme 4 — Accumulation / systemic opacity

| ID | Pain (atomic) |
|----|----------------|
| P4.1 | Shared cloud / IdP / SaaS / MSP concentration across book invisible at quote |
| P4.2 | Dependent / contingent BI from single vendor outage under-modeled at single-risk UW |
| P4.3 | Incomplete vendor disclosure on apps → deferral or loaded pricing |
| P4.4 | Portfolio monitoring after bind is weak or periodic only |
| P4.5 | No live “how many insureds share this vendor?” view for UW/portfolio |
| P4.6 | Supply-chain / software dependency of insured poorly captured |
| P4.7 | Accumulation exclusions / limits hard to operationalize in day-to-day UW |
| P4.8 | Correlation risk across industry verticals hit by same campaign |
| P4.9 | Reinsurance / treaty constraints not surfaced in submission workflow |
| P4.10 | Third-party claim lag makes early portfolio signals weak |

---

## B. Ranked matrix (Impact × MVP-ready)

### Scoring notes (Birlasoft-specific)

**High MVP-ready when:** LLM doc extraction, rules engine, API enrichment (BitSight/SSC/Black Kite-class), checklist/dossier UX, configurable appetite YAML, multi-tenant tenancy — classic SI + IP pattern.

**Low MVP-ready when:** needs continuous insured telemetry (Coalition-like), licensed capital, cat-model rebuild (CyberCube), full PAS replacement, privileged IR data feeds, or “sell ratings data” against BitSight head-on.

| Rank | ID | Pain (short) | Impact | MVP | Comp | Why this score |
|------|----|--------------|--------|-----|------|----------------|
| 1 | P1.4 | App vs external-signal contradiction | 5 | 5 | 25 | Highest loss-ratio lever + demoable with scan API + app parse |
| 2 | P1.2 | Exists ≠ deployed/enforced (MFA/EDR/backup) | 5 | 5 | 25 | Same; control-gap checklist is core cyber UW craft |
| 3 | P2.4 | Manual decision-memo consolidation | 4 | 5 | 20 | LLM + structured dossier; clear POC wow; SI-configurable |
| 4 | P2.1 | Email/PDF/spreadsheet intake sprawl | 4 | 5 | 20 | Bread-and-butter accelerator; reusable across LOBs later |
| 5 | P2.12 | Weak audit trail of UW decision | 4 | 5 | 20 | Governance/HITL story partners sell; cheap to build |
| 6 | P1.10 | Late RFIs explode cycle time | 4 | 5 | 20 | Gap detection at intake → fewer late surprises |
| 7 | P2.6 | Incomplete submission chase loops | 4 | 5 | 20 | Completeness agent; broker UX secondary |
| 8 | P2.7 | Attachment completeness / tagging | 3 | 5 | 15 | Ops pain; pairs with intake |
| 9 | P2.5 | Re-keying across systems | 4 | 4 | 16 | High impact; MVP needs light PAS/export adapters |
| 10 | P3.5 | Inconsistent desk decisions / leakage | 5 | 4 | 20 | Soft-market killer; needs rules + explainability |
| 11 | P3.4 | Defend decline/referral rationale | 4 | 5 | 20 | Narrative generation from rules+signals |
| 12 | P1.1 | Pure self-attest underwriting | 5 | 4 | 20 | Solving fully needs data partners; MVP = hybrid attest+signal |
| 13 | P2.10 | Same-day turnaround vs thoroughness | 5 | 4 | 20 | Outcome of 1+2 stack; score as product goal |
| 14 | P1.6 | Normalize heterogeneous evidence packs | 4 | 4 | 16 | High value; OCR/LLM variance; doable in MVP slice |
| 15 | P2.11 | Multi-program appetite consistency | 4 | 5 | 20 | Config-as-code appetite = Birlasoft personalization hook |
| 16 | P3.7 | Weak posture→price differentiation | 5 | 3 | 15 | Needs rating model trust; MVP = tier/referral not full price |
| 17 | P4.1 | Shared-vendor concentration blind | 5 | 3 | 15 | Huge carrier impact; MVP = vendor extract + book rollup stub |
| 18 | P4.5 | Live “insureds sharing vendor” view | 5 | 3 | 15 | Needs portfolio data model; phase-2 after single-risk |
| 19 | P1.7 | Multi-form control question mapping | 3 | 5 | 15 | Master-question library; strong for multi-carrier MGAs |
| 20 | P2.3 | External intel hunt per risk | 4 | 4 | 16 | Orchestrate 1–2 rating APIs; don’t rebuild BitSight |
| 21 | P2.2 | Internal precedent search | 3 | 4 | 12 | RAG on past submissions; needs client data corpus |
| 22 | P3.1 | Rate adequacy pressure | 5 | 2 | 10 | Business context not a feature; enable via better selection |
| 23 | P3.2 | Broker speed/price shopping | 4 | 3 | 12 | Outcome metric; product enables, doesn’t “solve” |
| 24 | P3.3 | Concede controls to win | 5 | 3 | 15 | Guardrails + exception workflow MVP-able |
| 25 | P4.2 | Dependent BI / vendor outage modeling | 5 | 2 | 10 | Needs cat/agg models (CyberCube territory) |
| 26 | P4.3 | Incomplete vendor disclosure | 4 | 4 | 16 | Structured vendor fields + enrichment |
| 27 | P1.8 | Warranty / misrep downstream | 4 | 3 | 12 | Legal/claims adjacency; flag risk in UW notes |
| 28 | P1.3 | Posture stale post-bind | 5 | 2 | 10 | Continuous monitoring = platform play / partner |
| 29 | P4.4 | Weak post-bind portfolio monitor | 5 | 2 | 10 | Same; partner BitSight-class or phase-2 |
| 30 | P2.8 | Junior vs specialist bottleneck | 4 | 4 | 16 | Guided playbooks + AI assist |
| 31 | P2.9 | Tribal knowledge loss | 3 | 4 | 12 | Knowledge base; longer to prove value |
| 32 | P1.5 | Shadow IT / incomplete inventory | 4 | 3 | 12 | Partial via external ASM; deep = agent/telemetry |
| 33 | P1.9 | Sector control bars poorly encoded | 3 | 5 | 15 | Content pack / rules — easy personalization |
| 34 | P3.6 | Appetite lags threats | 4 | 3 | 12 | Threat-feed→rule suggestions; human approve |
| 35 | P3.8 | Process cost must fall | 4 | 4 | 16 | Meta-outcome of automation stack |
| 36 | P3.9 | SME uneconomic if manual | 4 | 3 | 12 | STP path; needs appetite + signals mature |
| 37 | P3.10 | Wording/exclusion negotiation drag | 3 | 2 | 6 | Legal/coverage expertise; weak POC fit |
| 38 | P4.6 | Software supply-chain of insured | 4 | 2 | 8 | SBOM-level; heavy for MVP |
| 39 | P4.7 | Aggregation limits in daily UW | 4 | 3 | 12 | Surface treaty caps in workflow — mid |
| 40 | P4.8 | Vertical campaign correlation | 4 | 2 | 8 | Threat intel + portfolio; advanced |
| 41 | P4.9 | Reinsurance constraints not in UW UI | 3 | 3 | 9 | Client-specific; later personalization |
| 42 | P4.10 | Third-party claim lag | 3 | 1 | 3 | Observability problem; not MVP |

---

## C. Priority bands (for Birlasoft launch pathway)

### Band A — MVP spine · LOCKED for POC (2026-07-20)

Build as one **Cyber UW Decision Workbench** POC:

1. **Intake & normalize** — P2.1, P2.6, P2.7, P1.7  
2. **Attest vs signal reconcile** — P1.2, P1.4, P1.10, P2.3 (via partner API)  
3. **Appetite / consistency / defend** — P2.11, P3.4, P3.5, P2.12  
4. **Decision dossier** — P2.4, P2.10 (as outcome)

**Forced Band B into same POC:**

5. **Pricing tiers** — P3.7 as *tier / referral assist* (not full actuarial rating)  
6. **Accumulation stub** — P4.1 / P4.3 / P4.5 vendor extract + book rollup (not cat model)  
7. **PAS adapter** — P2.5 light export/sync via adapter interface (named PAS or mock)

**Birlasoft story:** configurable rules + HITL underwriter + pluggable scan/rating connectors — personalized per MGA/carrier without competing as a licensed cyber MGA.

### Band B — remainder (still release-2+)

| Items | Move when |
|-------|-----------|
| P3.3 concession guardrails | Soft-market playbooks per client |
| P1.6 evidence normalization (full breadth) | Broader doc types after core controls |

### Band C — Moon / partner / don’t DIY early

| Items | Why |
|-------|-----|
| P1.3, P4.4 continuous monitoring | BitSight / Black Kite / SecurityScorecard territory — integrate, don’t rebuild |
| P4.2 agg/cat modeling | CyberCube / Cyence / Kovrr territory |
| P3.1 rate adequacy | Actuarial + capital; not a feature |
| P4.6–P4.8 deep systemic | Research + reinsurance-grade |
| Competing with Coalition/At-Bay as risk bearer | Wrong business model for Birlasoft IP |

---

## D. Suggested ranking headline (pitch slide)

**For carriers:** biggest impact cluster = *stop underwriting fiction* (1.2, 1.4) + *stop desk leakage under soft rates* (3.5, 3.4) + *see shared-vendor bomb* (4.1).  

**For Birlasoft MVP launch:** start where Impact×Readiness peaks — **reconcile attestations with external signals inside a submission workbench**, with **explainable appetite/referral** and **audit-ready decision memo**. Park pure accumulation cat-modeling and continuous telemetry as partner-fed roadmap.

---

## E. Open cracks / locks

- **LOCKED:** POC uses **mocked** signal API + **mocked** PAS (swap real partners per engagement)  
- Whether first *sales* target is MGA vs carrier desk (affects later PAS + portfolio data)  
- Theme 5 (IR learning loop) intentionally deferred — revisit for moon list  

*Sources underpinning Impact scores: Everest×Zywave, Swiss Re, Aon, Dark Reading, Cyber Insurance Academy, SageSure specialty UW interview — see `SECONDARY-RESEARCH-PAIN-POINTS.md`.*
