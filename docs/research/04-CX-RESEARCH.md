# CX Research — Cyber Underwriting Decision Workbench

**Audience:** UX / Product / Engineering  
**Job:** Understand the user / job  
**As of:** September 2026  
**Method:** Secondary synthesis only (no primary UW interviews yet). Treat personas and journey times as **hypotheses**.  
**Companions:** [02-MASTER-RESEARCH.md](./02-MASTER-RESEARCH.md) · [03-COMPETITIVE-LANDSCAPE.md](./03-COMPETITIVE-LANDSCAPE.md) · `docs/planning/USER-RESEARCH.md` · `src/cyber-uw/HEURISTICS.md`

---

## 1. Job to be done (primary)

**When** a cyber submission lands as messy email/PDFs/spreadsheets,  
**I want to** reconcile what the applicant attested vs what I can see in signals/evidence, apply appetite, and produce a defendable Quote / Refer / Decline,  
**so I can** move at soft-market speed **without** silently conceding on controls—and leave an audit trail.

**Not the job:** fill another questionnaire portal · chat with a model for its own sake · rebuild security ratings.

---

## 2. Personas (hypotheses)

### P1 — Cyber underwriter (primary)

| Attribute | Hypothesis |
| --- | --- |
| Org | Specialty MGA or carrier cyber desk (multi-tenant possible) |
| Day | Mix of new business, renewals, referrals; broker pressure for turnaround |
| Success | Clean decisions they can defend to managers, auditors, and themselves after a loss |
| Fear | Soft-market concessions that blow up later; missing shared-vendor concentration |
| Tool reality | Email + PDF + spreadsheet + 1–2 signal portals + PAS |
| AI tolerance | Useful if cite-back + override; hostile to black-box decline |

### P2 — UW ops / submission coordinator (secondary)

| Attribute | Hypothesis |
| --- | --- |
| Job | Chase completeness, RFIs, attachments, status |
| Pain | Multi-carrier apps, missing evidence, dual entry |
| Success | Clean handoff to UW; fewer “where is the SOC2?” loops |
| AI tolerance | High for chase drafts and completeness flags |

### P3 — UW manager / portfolio (occasional)

| Attribute | Hypothesis |
| --- | --- |
| Job | Appetite consistency, referral quality, book aggregation MI |
| Pain | Underwriters improvising; accumulation invisible at quote |
| Success | Comparable decisions; early alerts on vendor concentration |
| AI tolerance | Needs audit + rule versioning |

### Not primary users of *this* product

- Broker placement teams (adjacent; may receive redacted export)  
- Insured CISO (InsurSec buyer, not Decision Workbench buyer)  
- Reinsurer cat analyst (different tools)

---

## 3. Pain themes → UX implications

Ranked for cyber MGA underwriter (secondary synthesis):

| Rank | Pain | User language (paraphrase) | UX implication |
| --- | --- | --- | --- |
| 1 | Attest–reality gap | “They said MFA everywhere—scan says otherwise.” | **Gap board** with cite-back; early RFI pack |
| 2 | Research tax | “I spend half my day searching, not deciding.” | One SSOT submission; decision-ready **dossier** |
| 3 | Soft-market bind | “Brokers want speed and price; I still need floors.” | Visible appetite hits; concession **dual-control** |
| 4 | Accumulation blindness | “How many of our insureds share this MSP?” | Book **alert** at quote (stub OK) |
| 5 | Claims/IR silo | “We never see the IR ground truth.” | Moon; don’t fake in MVP |

**Evidence grades and quotes:** `docs/planning/SECONDARY-RESEARCH-PAIN-POINTS.md` and [05-EVIDENCE-AND-SOURCES.md](./05-EVIDENCE-AND-SOURCES.md).

---

## 4. Journey map (target experience)

Demo / product spine (aligned with heuristics + feature lists):

```text
Intake  →  Verify (gap)  →  Tier / appetite  →  Book watch  →  Decide (HITL)  →  Closure / PAS
```

| Stage | User goal | Critical UX | Failure mode |
| --- | --- | --- | --- |
| **Intake** | Get chaos into one record | Multi-channel ingest; completeness gate; progress honesty | Silent incomplete files |
| **Verify** | See attest vs signal | Gap cards with field + signal cites; RFI draft | Gaps without sources → distrust |
| **Tier / appetite** | Know why Quote/Refer/Decline | Rule hits visible; version label; override path | Black-box score only |
| **Book watch** | Spot shared-vendor risk | Named vendors + count alert | Fake “cat model” claims |
| **Decide** | Bind human judgment | HITL sign-off; immutable audit of overrides | Auto-bind / invented answers |
| **Closure** | Hand off | Broker-safe export; PAS push status | Dual entry back into PAS |

**Principle line (product copy):** *Agents assist · underwriter binds · every override is explainable.*

---

## 5. Interaction principles (for design + eng)

| # | Principle | Why |
| --- | --- | --- |
| 1 | **Cite or don’t claim** | UW trust; rescission / misrep risk |
| 2 | **Proceed gates > infinite chat** | Soft-market speed needs staged completion |
| 3 | **Override is first-class** | HITL is the product, not a disclaimer |
| 4 | **Appetite is config, not hard-code** | White-label / personalization story |
| 5 | **Guidance ≠ bind** | Tiers / premium indications never silent auto-issue |
| 6 | **Alert ≠ model** | Accumulation stub must not overclaim cat science |
| 7 | **Confirm / Clear on attestations** | Regulatory + legal hygiene |
| 8 | **One job per stage** | Avoid dashboard soup in the workbench |

Inherited UI heuristics live in `src/cyber-uw/HEURISTICS.md` (stage chrome, Proceed gating, etc.).

---

## 6. Jobs → MVP features (traceability)

| Job moment | Pain IDs (planning) | MVP features |
| --- | --- | --- |
| Capture messy pack | P2.1, P2.6 | M1–M4 intake / completeness / SSOT |
| Spot control lies / gaps | P1.2, P1.4, P1.10 | M5–M8 gap board, RFI, evidence lite |
| Apply appetite under pressure | P3.3–P3.5, P2.11 | M9–M12 rules, Q/R/D, concessions, audit |
| Leave a defendable memo | P2.4, P2.12 | M13–M14 dossier + export |
| Price guidance without binding | P3.7 | M15 tiers |
| Shared-vendor alert | P4.1, P4.3 | M16 accumulation stub |
| Don’t re-key into PAS | P2.5 | M17 PAS adapter (mock OK) |

Full feature tables: `docs/planning/FEATURE-LISTS-MVP-MOON.md`.

---

## 7. Scenario scripts (for design critique / usability)

### S1 — Soft-market rush

Broker needs a quote today. App says EDR 100%. Mock signal shows partial coverage.  
**Expect:** gap card + draft RFI + option to quote with concession flag requiring dual control—or refer/decline with reasons.

### S2 — Clean mid-market renewal

Signals align with attestation; appetite green.  
**Expect:** short path to dossier; still HITL confirm; PAS stub push.

### S3 — Shared MSP concentration

Applicant lists MSP also on 40 policies in sample book CSV.  
**Expect:** book alert visible before bind; not a full loss curve.

### S4 — UW disagrees with AI

Model recommends Decline; UW overrides to Refer with note.  
**Expect:** override captured with rule versions + rationale; outbound shows human decision.

---

## 8. Metrics that matter to the user (and to us)

| Metric | User meaning |
| --- | --- |
| Time to decision-ready dossier | “When can I stop hunting?” |
| % files with attestation conflict caught pre-quote | “Did we catch the lie early?” |
| % decisions with auditable rationale | “Can I defend this later?” |
| Override rate + reasons | “Is the assistant calibrated?” |
| RFI round-trips before quote | Ops + broker friction |

---

## 9. Research gaps (CX backlog)

| Gap | Risk if ignored | Next method |
| --- | --- | --- |
| No primary UW interviews | Wrong stage order / wrong labels | 8–12 contextual interviews |
| Unknown actual minutes per file | ROI story soft | Diary / shadowing |
| Unvalidated WTP for workbench vs InsurSec | GTM misfire | Buyer interviews |
| PAS field mapping variance | Integration thrash | Adapter spike with 2 PAS shapes |
| Accessibility / dense gap board | Desk fatigue | Prototype test with real UW |

**Do not** invent primary quotes for decks until interviews exist (`forged-idea.md` rejected fake primary quotes).

---

## 10. Design/eng checklist (ship bar)

- [ ] Stage stepper with clear Proceed gates  
- [ ] Gap board shows attestation + signal + confidence/cite  
- [ ] Appetite version visible on recommendation  
- [ ] Override path mandatory before outbound bind-ish actions  
- [ ] Accumulation labeled as **alert**, not model  
- [ ] Pricing tiers labeled as **guidance / referral**, not binder  
- [ ] Audit log immutable for demo narrative  
- [ ] Empty/error states for missing signal connector  

---

*Recycled from USER-RESEARCH, pain-point memo, feature lists, market brief, and product heuristics. Update after primary interviews.*
