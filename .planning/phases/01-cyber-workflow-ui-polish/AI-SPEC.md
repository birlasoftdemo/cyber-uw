# AI-SPEC — Phase 01 Cyber workflow UI polish

**System type:** Hybrid (HITL decision aid + structured rule/appetite assist; mock signals)  
**Phase goal:** Client-demo-ready cyber UW journey with one clear job per stage through Quote → mock PAS.  
**Focus of §1b:** Hard pivot — Verify / Risk Review / Platform / Decide stage model; pre-qualification buckets; drop opaque signal score & Gap board as separate surface.

---

## 1b. Domain Context

**Industry Vertical:** Specialty cyber insurance underwriting (MGA / carrier desk; Birlasoft Decision Workbench POC)  
**User Population:** Cyber underwriters (primary), senior/referral underwriters, UW ops; demo audience = client buyers evaluating desk realism  
**Stakes Level:** High (bind / decline / referral commits capital and creates audit + misrepresentation exposure; not Critical clinical/life safety)  
**Output Consequence:** Locked disposition feeds dossier audit trail and PAS stub; wrong Quote on open control floors → adverse selection / rescission risk; wrong Decline → lost premium and broker friction; silent platform concentration miss → portfolio correlated-loss exposure

**Stage spine (hard pivot):** Intake → Verify → Risk Review → Platform → Decide → mock PAS

---

### What Domain Experts Evaluate Against

```
Dimension: Control-floor disposition integrity
Good: Quote only after MFA (email / remote / privileged / cloud admin), EDR, and backup/IR floors are either met, Resolve-signed, or explicitly accepted with rationale; Refer when a binary floor is open and authority exceeds the desk; Decline when a hard carrier floor fails with no compensating control.
Bad: UW quotes while a critical MFA/EDR gap remains unsigned, or panels imply acceptance without a clear override path.
Stakes: Critical
Source: Carrier control-floor practice (MFA as coverage gate); Travelers/ICS-class MFA misrep/rescission pattern; 2025–2026 renewal checklists (Sherlock / BindLedger / Cyvatar synthesis)
```

```
Dimension: Attest-vs-signal reconciliation before Proceed
Good: Material gaps show disposition (Resolve / Refer) inline on Verify, cite-backed to attested answer vs evidence/signal; buckets map to pre-qualification parameters; Decide surfaces gap status as a gate chip, not a second Gap board.
Bad: Separate Gap board that duplicates Verify work; or Decide re-litigates every gap in a dense narrative.
Stakes: Critical
Source: Practitioner pain — questionnaires describe policy not efficacy (Tanium/Dark Reading; Cyber Insurance Academy deployment-gap pattern); project USER-RESEARCH Theme 1
```

```
Dimension: Actionable risk review (threat + impact)
Good: Each Assess threats / Assess impacts item is sign-offable (Accept / Escalate / Note) and bucketed by the same qualification parameters as Verify gaps; UW leaves Risk Review with owned judgments, not unread insights.
Bad: Insight-only severity essays with no action; or opaque “signal score 62/100” as the stage headline.
Stakes: High
Source: Specialty UW “search vs decide” time tax; desk norm — judgment work is reconcile + own, not consume scores
```

```
Dimension: Platform / interrelated risk as portfolio input
Good: Cards name the dependency class (shared IdP, critical SaaS/API, MSP/RMM path, cloud concentration, sector/limit aggregate) and what binding this risk does to terms/capacity; UW signs Watch / Terms / Block with rationale.
Bad: “41 policies on book with Microsoft 365” as the story; or auto-declining a clean mid-market risk solely because a common vendor is prevalent.
Stakes: High (portfolio); Medium as single-risk auto-decline trigger
Source: PRA SS4/17 (aggregation MI, cloud stress ~1-in-200); BoE IST cloud-down scenarios; Aon dependent BI / shared-vendor pattern
```

```
Dimension: Defensible HITL lock (checklist, not essay)
Good: Decide is a checklist of prior stage sign-offs + disposition (Quote / Refer / Decline) + override rationale; no “why this recommendation” prose column.
Bad: Three equal Quote/Refer/Decline essay columns; KPI tile chrome that forces the UW to reconstruct the story; ungrounded narrative as the main surface.
Stakes: High
Source: IUI’26 insurance LLM decision-visibility work; Respan / NAIC AI bulletin direction — grounding + audit for UW-supporting models
```

---

### Known Failure Modes in This Domain

1. **Floor-bypass Quote** — Soft-market pressure + UI that makes Quote look as easy as Refer → binding with open MFA/EDR floors; later claim dispute / rescission vector.
2. **Score theater** — Opaque composite (62/100) creates false confidence or false rejection; not calibrated to loss cost; UW cannot defend the number to a referral desk or broker.
3. **Insight-only Risk Review** — Threat/impact panels that cannot be signed off → deferred judgment, email notes, audit hole.
4. **Vendor-count false decline** — Treating shared-platform prevalence as an insured-specific decline driver instead of portfolio Watch / Terms / capacity Block.
5. **Decide overpack** — Replaying Verify/Risk/Platform detail + recommendation essay → rubber-stamp or abandon stage.

---

### Regulatory / Compliance Context

- **UK PRA SS4/17 (Nov 2024 update):** Board-owned cyber UW strategy; aggregate exposure MI; stress tests that consider loss aggregation (e.g. cloud) at extreme return periods — Platform stage is **portfolio governance** at the desk, not a vanity chart.
- **US misrepresentation / rescission practice:** Material false control attestations (esp. MFA) remain a Critical post-claim dispute vector — Verify and Decide must not obscure open control gaps.
- **EU AI Act Art. 50 (from 2 Aug 2026) / CPPA ADMT:** Keep HITL Confirm and non-binding AI assist — relevant to demo honesty.
- **POC note:** No live BitSight/PAS; mock signals still must be *citeable field-level* diffs, not a single opaque score. Full cat/agg modeling out of scope.

---

### Domain Expert Roles for Evaluation

| Role | Responsibility in Eval |
|------|----------------------|
| Cyber UW (desk) | Label gold Quote/Refer/Decline on 10–20 canned dossiers; calibrate Verify bucket labels and Decide checklist density |
| Senior / referral UW | Rubric calibration on override cases and when Platform Block becomes disposition-blocking |
| UW / product owner (Birlasoft client proxy) | Accept demo spine realism; sign off STAGE-01 “one job per stage” under hard pivot |
| Compliance / counsel (later) | Sample production decision logs for grounding, AI disclosure — not required to ship POC chrome |

---

## Practitioner brief — Decision Workbench hard pivot

### 1. Pre-qualification / UW qualification parameter buckets (UI grouping)

Use these **stable IDs** for Verify gaps, Risk Review threat/impact cards, and Decide gate chips. 6 buckets (plus optional 7th for geo-heavy books).

| ID | Label | What groups here | Typical disposition effect |
|----|-------|------------------|----------------------------|
| `controls_access` | Identity & access | MFA (email / remote / privileged / cloud admin), PAM, RDP/VPN exposure, conditional access | Hard floor → Decline / Refer if open |
| `controls_endpoint` | Endpoint & detection | EDR/MDR coverage %, SOC/monitoring hours, lateral-movement hygiene | Hard floor → Decline / Refer if open |
| `controls_recoverability` | Backup & recoverability | Immutable/offline backups, restore-test date, backup-console MFA | Hard floor / ransomware endorsement conditions |
| `ransomware_readiness` | Ransomware readiness | IR plan + tabletop date, email auth (SPF/DKIM/DMARC), patch/KEV cadence, phishing controls | Loading, sublimits, coinsurance, or Refer |
| `appetite_fit` | Appetite & limit fit | Sector / NAICS, revenue band, requested limit, geography, prior claims / notice | Pass / Refer / Decline per named appetite rules |
| `third_party_ops` | Third-party & ops dependency | MSP/RMM access governance, critical SaaS admin paths, vendor security asks | Refer, terms, or feed Platform stage |
| `external_exposure` *(optional)* | External exposure | Attack-surface findings that contradict attestation (open RDP, stale certs, exposed admin) — **field-level**, not a composite score | Opens/holds gaps in the buckets above |

**Do not** invent a separate “score” bucket. External ratings belong as **cite-backs inside** the control/exposure items they contradict.

---

### 2. Signal score verdict — DROP

**Verdict: DROP** the opaque “signal score 62/100” (and equivalent A–F / 0–900 chrome) as a Verify or Risk Review headline for desk UW.

| Why drop | Replace with |
|----------|--------------|
| Not loss-calibrated; vendors have not published score→claim maps for binding decisions | Field-level attest vs evidence diffs inside qualification buckets |
| Opaque number fails referral-desk / broker defense (“why 62?”) | Named rule / floor hits (`controls_access.mfa_remote = open`) |
| Creates false confidence or false rejection (CDN noise, shared IP, stale scans) | Optional **tier assist** only as secondary chrome (e.g. “hygiene tier: assist”) — never a Proceed gate alone |
| Bitsight/SSC useful as *intake triage* or *portfolio scan*, not as the desk’s decision object | Cite specific finding → gap card |

**Keep:** discrete external findings that open or support a gap. **Drop:** composite score as primary UX.

---

### 3. Gap board — DROP as separate surface

**Recommendation: DROP** the standalone Gap board if Verify supports **inline Resolve / Refer** with the same material-gap Proceed gate.

| Keep on Verify | Loss if you drop the board | Mitigation |
|----------------|----------------------------|------------|
| Focused stack or bucketed list of open material gaps | Deep archive of resolved/historical gaps | Dossier / Gaps tab (read-only history), not a parallel work surface |
| AI note + cite-back + Resolve/Refer HITL | Power-user “see all gaps at once” board | Optional **expand-all** within Verify (same stage), not a second nav destination |
| Proceed gated until critical/high open gaps signed | STAGE-05 wording that named “Gap board” | Update STAGE-05 → “Verify inline Resolve/Refer” |

**Net:** separate Gap board was a second job competing with Verify. One job = clear material gaps in place. No material loss for desk realism if history lives on Dossier.

---

### 4. Platform stage (replaces Book “vendor count on book”)

**Proposed stage name:** **Platform**  
**Subtitle / job line:** *Interrelated & concentration risk — sign off before bind*  
**Not:** “Book” / “41 on book with Vendor X”

**Risk card types (3–5):**

| Card type ID | Label | What the UW sees | Why it matters |
|--------------|-------|------------------|----------------|
| `shared_idp` | Shared identity provider | Insured IdP (Okta / Entra / Google) × book concentration + failure mode | Systemic auth outage / credential blast radius across policies |
| `critical_saas_api` | Critical SaaS / API dependency | Top SaaS that holds operational or data plane (M365, Salesforce, payment API) × dependent-BI relevance | Single-vendor BI / outage correlates losses |
| `msp_rmm_path` | MSP / RMM access path | Managed-service or RMM dependency; privileged remote path shared across insureds | Classic ransomware entry + multi-policy correlation |
| `cloud_concentration` | Cloud concentration | Primary cloud (AWS/Azure/GCP) share of limit or count vs appetite threshold | PRA-class aggregation stress input |
| `sector_limit_aggregate` | Sector / limit aggregate | Binding this limit vs sector or program remaining capacity | Treaty / program capacity — not vanity vendor tally |

**Sign-off actions (per card or stage roll-up):**

1. **Accept / Watch** — note on portfolio MI; does not block Quote  
2. **Terms** — proceed only with named term effect (waiting period, contingent BI sublimit, vendor exclusion, retention)  
3. **Block** — binding would breach capacity / “no more limit on dependency X”; disposition must be Refer or Decline unless senior override  
4. **Escalate** — send to referral / portfolio desk with card IDs  

Proceed from Platform requires an explicit stage outcome: `clear` | `watch` | `terms` | `blocks`.

---

### 5. Decide — sign-off checklist (before Quote / Refer / Decline)

Decide shows **gates already owned**, not a new analysis essay. No “why this recommendation” prose column.

**Checklist items (all must show status before lock):**

| # | Checklist item | Source stage | Blocking if |
|---|----------------|--------------|-------------|
| 1 | Control floors cleared or owned (`controls_access`, `controls_endpoint`, `controls_recoverability`) | Verify | Any critical open / unsigned |
| 2 | Ransomware-readiness items owned or conditioned | Verify + Risk Review | Material unsigned |
| 3 | Appetite & limit fit rule outcome named (pass / refer / decline) | Intake + rules | Missing rule label |
| 4 | Risk Review threat judgments signed (Accept / Escalate / Note) | Risk Review | Required cards unsigned |
| 5 | Risk Review impact judgments signed | Risk Review | Required cards unsigned |
| 6 | Platform outcome (`clear` / `watch` / `terms` / `blocks`) | Platform | Missing; or `blocks` without Refer/Decline/override |
| 7 | Disposition + HITL lock (Quote / Refer / Decline) | Decide | No selection |
| 8 | Override rationale (required when disposition ≠ AI lean **or** when overriding a Block / open floor) | Decide | Empty when required |

**Drop from Decide:** long dossier paragraph, three-column “If you Quote/Refer/Decline” essays, Score/Gaps/Book KPI trio, full vendor list.

**Keep thin:** one recommended disposition chip + ≤5 **reason codes** (IDs pointing at checklist rows / rules) — codes only, not narrative.

---

### 6. UX principle — actionable vs insight-only

Every panel on Verify, Risk Review, and Platform must end in a **UW-owned action** (Resolve / Refer / Accept / Escalate / Note / Watch / Terms / Block). If the UW cannot change the case state from the panel, it is insight-only and belongs in Dossier or a collapsed “context” drawer — never as the stage’s primary surface. Scores, essays, and vendor tallies that do not map to a sign-off are chrome, not work.

---

### Research Sources

- Project: `docs/planning/USER-RESEARCH.md`, `SECONDARY-RESEARCH-PAIN-POINTS.md`, `docs/research/CYBER-UW-REGULATORY-UPDATES-2024-PLUS.md`, prior §1b Decide/Book research
- Carrier control-floor / 2026 renewal checklists (MFA, EDR, immutable backups, IR, PAM, patch) — BindLedger, Cyvatar, UnderDefense, Obsidian Ridge secondary synthesis
- PRA SS4/17 cyber insurance underwriting risk (Nov 2024 update); BoE IST cloud-down / ransomware aggregation scenarios
- Aon / market notes on dependent BI and shared-vendor accumulation
- Security ratings vs UW decisions — Resiliently (ratings not loss-calibrated); Burning Cost 2026 (Bitsight/SSC as posture prior, not actuarial gate); Bitsight vendor framing (attest-vs-rating gap, portfolio vendor scan)
- Caveat: secondary research + desk norms; primary MGA UW interviews still recommended before binding product claims
