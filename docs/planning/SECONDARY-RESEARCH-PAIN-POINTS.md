# Secondary research — cyber UW pain points (open web)

**Scope:** MGA / specialty cyber underwriter-first lens  
**Method:** open-web secondary only (surveys, carriers, reinsurers, brokers, specialty UW vendors)  
**Date scraped:** 2026-07-20  
**Not included:** primary interviews (none yet) — do not treat vendor marketing stats as primary verbatim

**Evidence grades:**  

- **A** — named survey / reinsurer / major broker / peer-reviewed  
- **B** — named practitioner / industry publication with attribution  
- **C** — vendor / insurtech blog (useful language; commercial bias)

---

## Theme 1 — Application vs reality (attestation gap)


| Pain                                         | Verbatim / near-verbatim                                                                                                                                                                                                       | Source                                                 | Grade |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ | ----- |
| Questionnaires describe policy, not efficacy | “Right now, policyholders tell insurers about policies and procedures rather than the actual efficacy of their operations.”                                                                                                    | Mark Millender (Tanium), Dark Reading, Feb 2024        | B     |
| Insurers already know the gap                | “Insurers know gaps exist between questionnaires and the live environments. They want a clearer understanding of what reality is…”                                                                                             | Same                                                   | B     |
| Self-report is structurally inadequate       | “The specific place the legacy model breaks is underwriting itself… Controls are attested to. Premium is set. The carrier doesn't see the insured's security posture again until next year's renewal, unless there's a claim.” | Coalition, “After Mythos…”, 2025/26                    | C*    |
| Annual snapshot vs hourly threat             | “You cannot underwrite cyber risk on annual snapshots anymore.” / “The underwriter is analyzing a posture that existed on the day the questionnaire was completed, against a threat that may not have existed yet.”            | Coalition                                              | C*    |
| EDR “yes” ≠ deployed                         | “Most cyber applications include a simple question: ‘Do you have EDR deployed across all endpoints?’ Insureds almost always answer yes, but IR investigations often reveal a different reality: a ‘Deployment Gap’…”           | Cyber Insurance Academy, Dec 2025                      | B     |
| Wrong questions, unreliable answers          | “…these questionnaires ask the wrong questions, get unreliable answers to those wrong questions, and are out of date before they're even completed.”                                                                           | Attributed as “one major cyber insurer” via Todyl blog | C     |
| Academic framing                             | Traditional models “rely heavily on questionnaires and self-reported data… often resulting in incomplete, subjective, or outdated evaluations.”                                                                                | Springer survey, *Int. J. Information Security*, 2026  | A     |


Coalition is a cyber carrier/insurtech — treat as expert-operator voice with product agenda.

**UW job implication:** primary judgment work is *reconciling stated controls vs observable posture*, not filling forms.

---

## Theme 2 — Manual throughput / information hunt (specialty UW desk)


| Pain                                     | Verbatim / near-verbatim                                                                                                                            | Source                                                            | Grade |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ----- |
| Search > decide                          | Specialty UW: “I spend half my day searching for information instead of making decisions.”                                                          | SageSure interview paraphrase of mid-sized specialty UW, Dec 2025 | B     |
| Submission workflow drag                 | “What should take 30 minutes takes three hours.” (email/PDF → manual review → internal search → external intel → consolidate)                       | SageSure                                                          | C/B   |
| Admin share of UW time                   | “Underwriters spend at least 35% of their time on administrative work…”                                                                             | Veridion (cites industry pattern)                                 | C     |
| Non-sales time                           | “Only 25% of an underwriter’s day is spent on selling and broker engagement.”                                                                       | Insurance Thought Leadership                                      | C     |
| Cyber questionnaires burn applicant side | “A typical underwriting questionnaire takes 2-4 weeks… Labor time: 40-80 hours… $5,000–$10,000 per renewal”                                         | KBPilot (applicant-side vendor)                                   | C     |
| Multi-carrier app hell                   | “Each insurer traditionally requires its own application… unprotected spreadsheets…”                                                                | Marsh Online Cyber self-assessment PDF                            | A/B   |
| Dynamic cyber forms                      | Challenges listed: “Highly dynamic questions… Carrier-specific appetite… Subjectivity in responses… Attachments required… Tight turnaround demands” | Insurance Journal / Selectsys RQB, Nov 2025                       | C     |


**UW job implication:** speed-to-quote is a competitive weapon in a soft market; tool value = decision-ready dossier, not another portal.

---

## Theme 3 — Soft market + discipline under price pressure


| Pain                                 | Verbatim / near-verbatim                                                                                                                                        | Source                                              | Grade |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ----- |
| Rate adequacy #1 UW worry            | “rate adequacy is a top concern for underwriters”; ~50% primary UW flat/negative rate; ~80% say competition ramped up; ~70% “it's a brokers’ market right now.” | Everest × Zywave survey (Catherine Rudow), Jan 2024 | A     |
| Less leeway on coverage/price        | “they have far less leeway on coverage or price.”                                                                                                               | Everest/Zywave                                      | A     |
| Soft rates vs rising claims severity | Premiums down while “Claims severity intensified… trend materially worse year on year.”                                                                         | Guidewire citing Lockton/Munich Re patterns, 2025   | B     |
| Concessions on controls              | Soft market → “further concessions on premium, limits, coverage and cyber security controls.”                                                                   | Swiss Re, cyber growth piece                        | A     |
| Manual UW costs kill SME product     | “Complex and time-consuming risk assessments, particularly questionnaires… Manual underwriting consumes too many resources, driving up costs…”                  | Swiss Re                                            | A     |


**UW job implication:** POC must help *defend risk selection while competing on speed/price* — not only add more questions.

---

## Theme 4 — Aggregation / systemic / third-party opacity


| Pain                            | Verbatim / near-verbatim                                                                                                                 | Source                              | Grade |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ----- |
| Dependent BI / shared vendor    | “Dependent business interruption poses a significant concern… large vendor incidents can trigger numerous policies from a single event.” | Aon cyber/E&O market note           | A     |
| Portfolio monitoring            | “underwriters should regularly monitor their portfolios…”; rising third-party claims need “appropriate underwriting evaluation tools.”   | Everest/Zywave takeaways            | A     |
| Exclusion/aggregation tension   | UWs expect more exclusions for aggregation; brokers less supportive.                                                                     | Everest/Zywave                      | A     |
| Vendor concentration blind spot | Apps increasingly ask cloud/EDR/DNS/CDN/MSP; incomplete apps deferred or loaded.                                                         | Sarvada (India market UW practices) | C     |
| Third-party loss lag            | Broker voice: third-party exposures “Sometimes it takes years to really see the financial impact…”                                       | Insurance Business (Wills)          | B     |


**UW job implication:** single-risk UW tools that ignore portfolio concentration are incomplete for MGA books.

---

## Theme 5 — UW ↔ claims ↔ IR data silo


| Pain                      | Verbatim / near-verbatim                                                                                                                                                                                           | Source                            | Grade |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------- | ----- |
| Information asymmetry     | “Underwriters price risk using static, often self-reported applications; claims teams settle losses based on filtered, redacted forensic summaries; while IR firms hold the ‘Ground Truth’ locked in system logs.” | Cyber Insurance Academy, Dec 2025 | B     |
| Privilege blocks learning | IR findings often routed through counsel → redacted summaries; “leaves the insurer’s underwriting models blind to the very ‘Ground Truth’…”                                                                        | Same                              | B     |


**UW job implication:** closed-loop learning from losses is a hidden capability gap — strong for “moon” story, hard for MVP legally.

---

## Theme 6 — Evidence / warranty / claims denial risk (feeds UW caution)


| Pain                   | Signal                                                                                                                     | Source                                   | Grade      |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ---------- |
| Controls as warranty   | Questionnaire answers become conditions; misrep → claim denial                                                             | Obsidian Ridge / CNIC industry summaries | C          |
| Cross-check with scans | “The questionnaire says ‘MFA enabled…’ but your domain scan shows exposed RDP…”                                            | Resiliently broker guide 2026            | C          |
| Denial frequency cited | ~27% data breach claims / ~24% first-party had exclusions affecting payment (cited industry stat — verify before pitching) | CNIC statistics page                     | C — verify |


---

## Ranked pain hypotheses for **cyber MGA underwriter** (secondary synthesis)

1. **Attestation–reality gap** at quote time (controls claimed vs scan/telemetry/IR truth)
2. **Throughput / research tax** on every submission (find, reconcile, document)
3. **Appetite + soft-market bind** (defend discipline while brokers shop speed/price)
4. **Accumulation blindness** (shared cloud/SaaS/MSP across book)
5. **Loss-learning silo** (UW models starved of IR ground truth)

---

## What secondary research does *not* prove yet

- Capgemini-client MGA pain ranking (no primary)  
- Exact hours per cyber submission at target MGAs  
- Willingness-to-pay for consulting IP accelerator vs buy Coalition-like stack  
- Which of (1)–(5) is the wedge partners will fund first

---

## Source index (URLs)

- [https://www.everestglobal.com/us-en/news-media/features/2024/viewpoint/the-state-of-the-cyber-insurance-market](https://www.everestglobal.com/us-en/news-media/features/2024/viewpoint/the-state-of-the-cyber-insurance-market)  
- [https://www.swissre.com/risk-knowledge/advancing-societal-benefits-digitalisation/cyber-insurance-growth-shift.html](https://www.swissre.com/risk-knowledge/advancing-societal-benefits-digitalisation/cyber-insurance-growth-shift.html)  
- [https://www.aon.com/en/insights/articles/cyber-and-eo-market-conditions-remain-favorable-amid-emerging-global-risks](https://www.aon.com/en/insights/articles/cyber-and-eo-market-conditions-remain-favorable-amid-emerging-global-risks)  
- [https://www.darkreading.com/cyber-risk/cyber-insurance-needs-to-evolve-to-ensure-greater-benefit](https://www.darkreading.com/cyber-risk/cyber-insurance-needs-to-evolve-to-ensure-greater-benefit)  
- [https://www.coalitioninc.com/blog/cyber-insurance/after-mythos-what-actually-changes-for-cyber-risk](https://www.coalitioninc.com/blog/cyber-insurance/after-mythos-what-actually-changes-for-cyber-risk)  
- [https://www.cyberinsuranceacademy.com/blog/guides/3-ir-data-points-claims-certainty-and-pricing-accuracy-in-2026/](https://www.cyberinsuranceacademy.com/blog/guides/3-ir-data-points-claims-certainty-and-pricing-accuracy-in-2026/)  
- [https://sagesure.io/ai-you-can-be-sure/the-breakdown-of-traditional-processes-in-specialty-insurance](https://sagesure.io/ai-you-can-be-sure/the-breakdown-of-traditional-processes-in-specialty-insurance)  
- [https://www.guidewire.com/resources/blog/general-interest/underwriters-facing-constant-recalibration-in-the-cyber-risk-space](https://www.guidewire.com/resources/blog/general-interest/underwriters-facing-constant-recalibration-in-the-cyber-risk-space)  
- [https://www.insurancebusinessmag.com/us/news/cyber/cyber-insurance-struggles-to-keep-pace-with-rising-exposures-558983.aspx](https://www.insurancebusinessmag.com/us/news/cyber/cyber-insurance-struggles-to-keep-pace-with-rising-exposures-558983.aspx)  
- [https://www.marsh.com/content/dam/marsh/Documents/PDF/US-en/marsh-online-cyber-self-assessment-tool.pdf](https://www.marsh.com/content/dam/marsh/Documents/PDF/US-en/marsh-online-cyber-self-assessment-tool.pdf)  
- [https://link.springer.com/article/10.1007/s10207-026-01275-5](https://link.springer.com/article/10.1007/s10207-026-01275-5)  
- [https://www.todyl.com/blog/cyber-insurance-security-assurance-msps](https://www.todyl.com/blog/cyber-insurance-security-assurance-msps)  
- [https://www.insurancejournal.com/blogs/expert-insured/2025/11/13/848923.htm](https://www.insurancejournal.com/blogs/expert-insured/2025/11/13/848923.htm)

