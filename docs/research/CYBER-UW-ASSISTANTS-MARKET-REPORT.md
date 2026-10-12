# Cyber Insurance Underwriting Assistants: A Plain-English Market Brief

**Assumptions for this rewrite:** Full humanization pass for a general (“average Joe”) reader. Voice is peer-to-peer and plainspoken. Analyst jargon is kept only where useful, and explained in normal words. Facts and confidence labels are preserved.

**Important:** This is **not** an official Gartner report. Nobody here has access to Gartner’s paid databases or confidential research. What’s below comes from public news and reports, industry commentary, secondary research in this project, history, and common-sense inference. When something is a guess, it’s labeled. Before you put money behind any of this, re-check the latest Marsh, Aon, and Howden rate reports and what vendors are actually shipping.

**As of:** September 2026  
**Audience pack (JTBD-split docs):** [README.md](./README.md) — Executive Brief · Master Research · Competitive Landscape · CX Research · Evidence & Sources

**How to read the labels**

- **Known** — you can look it up in a public source  
- **Estimated** — a reasonable guess from how the market behaves  
- **Speculative** — “what if” scenarios, not predictions you should treat as fact  

Related project notes (also secondary research, not live underwriter interviews): `docs/planning/COMPETITOR-RESEARCH.md`, `docs/planning/SECONDARY-RESEARCH-PAIN-POINTS.md`, `docs/planning/USER-RESEARCH.md`, `docs/research/CYBER-UW-REGULATORY-UPDATES-2024-PLUS.md`

---

## Executive Summary

Here’s the short version.

- **What this market even is.** An underwriting assistant is software that helps an insurance company (or MGA — a specialized underwriting shop) take in a cyber insurance application, check it against outside security data, match it to their appetite rules (“we like this risk / we don’t”), recommend quote, refer, or decline, and leave a paper trail. A human still decides whether to bind the policy. It is **not** the insurance policy. It is also **not** a BitSight-style security score or a CyberCube-style catastrophe model. Those are inputs.
- **What’s going on in cyber insurance itself (Known + Estimated).** Prices are still falling. Marsh’s Global Insurance Market Index said global cyber rates dropped **4% in Q2 2026** — the **12th quarter in a row**. There’s lots of capacity and brokers have leverage. When prices are soft, desks get hammered to quote fast. The tools that win help them go fast **without quietly saying yes to weak security controls**.
- **Where adoption sits (Estimated).** Lots of people are trying chatbots that fill forms. Fewer are buying the real thing: staged workflows that catch “they said they have EDR everywhere” vs “the scan says half the endpoints are naked,” then force an underwriter sign-off.
- **Who dominates the neighborhood (Known).** Three stacks show up on desks: (1) tech-forward cyber insurers like Coalition, At-Bay, Cowbell, Resilience (and Corvus now inside Travelers), (2) outside security ratings like BitSight or SecurityScorecard, (3) portfolio/catastrophe models like CyberCube or Guidewire Cyence. If your “assistant” tries to rebuild all three instead of plugging into them, you’re probably in trouble.
- **What actually differentiates a product.** Catching control gaps. Asking for missing evidence early. Clear appetite rules with reasons. A warning when too many policies share the same cloud or MSP. Syncing the decision into the policy admin system. Chatbot polish is not the product.
- **Next 1–3 years, base case (Estimated).** Budgets move from “AI chat on forms” to real decision workbenches. Buyers care about integrations, explainability, and fitting their policy system — not cloning Coalition. Consolidation continues; Travelers buying Corvus for about **$435M** (closed Jan 2024) is the big public signal.
- **Biggest risk to the category.** Carriers build or buy this stuff in-house and leave standalone tools with nowhere to go. Or investors believe fantasy “market size” numbers that mix insurance premiums with software spend.
- **Where the money is likelier (Estimated).** Mid-market specialty desks that have to compete with Coalition-speed quotes but can’t rebuild BitSight. Industrial / OT risks where a submission eats hours and deep help is worth paying for. Straight-through SMB cyber is already crowded.

---

## 1. Market Overview

### 1.1 What we’re talking about

Think of an underwriting desk buried in broker emails, PDFs, and spreadsheets. The assistant’s job is to turn that mess into a decision the underwriter can defend.

| What it does | In plain English |
| --- | --- |
| Intake | Pulls the application out of PDFs and email into structured fields |
| Enrichment | Adds outside scores, scans, company info, loss history |
| Gap check | Flags “they claim MFA/EDR/backups” vs what external signals show |
| Appetite & triage | Applies the desk’s rules: quote, refer upstairs, or decline |
| Decision support | Suggests tier/price ideas, conditions, and a written rationale |
| Book watch | Warns if too many policies share one vendor or cloud (not a full catastrophe model) |
| Handoff | Sends the result into the policy admin system with an audit trail |

**Not the main product (but they matter):**

- Cyber insurers that also sell security tools to customers (Coalition Control, At-Bay’s Stance/MDR, and so on)
- Pure security-rating vendors, unless they’re wired into the underwriting workflow
- Pure catastrophe / capital models
- Broker portals that never touch the bind decision

**Working thesis (Estimated):** The underwriter’s real job is *check what the applicant claimed against what you can see, then decide and defend that call under time and price pressure*. It is not “fill out another form.” We don’t have a fat pile of primary underwriter interviews industry-wide to prove that ranking, but secondary sources keep pointing the same way.

### 1.2 How the market looks today

| Dimension | What’s true | Label |
| --- | --- | --- |
| The cyber insurance line | Soft, competitive, lots of capacity | **Known** — Marsh Q2 2026 (−4% global; 12th decline); Aon says buyers still get favorable pricing, though cuts are slowing |
| How desks work | Still questionnaire-heavy; people burn hours hunting info | **Known/Estimated** — practitioner stories; Swiss Re on how manual UW kills SME economics |
| Tech on the desk | Usually two or more of: outside signals, cat/portfolio model, carrier/MGA telemetry | **Estimated** |
| Assistant products | Fragmented — form tools, specialty AI, posture tools, carrier-built stacks | **Known** from public product pages |
| Real software spend | A slice of cyber premium, not the whole pie. Be wary of giant “platform market” numbers | **Estimated** |

### 1.3 Why people want these tools

1. **Soft-market speed.** Brokers shop on turnaround and price. If your dossier takes half a day, you lose. (**Known** market; **Estimated** how much they’ll pay for software.)
2. **Apps lie by accident.** Questionnaires describe policies, not how security actually works. Incident responders keep finding “EDR everywhere” that isn’t. (**Known** theme in industry write-ups.)
3. **The new cyber writers set the bar.** Coalition-style shops quote with live scan data. Old-school desks need orchestration to keep up without becoming an insurer-plus-security company themselves. (**Known** models; size of the pressure is **Estimated**.)
4. **Shared-vendor blowups.** One cloud or MSP outage can hit many policies at once. Aon and regulators keep talking about portfolio monitoring. (**Known.**)
5. **Regulators want evidence.** EU DORA and NIS2, UK PRA cyber underwriting expectations, U.S. fights over misrepresentation on apps, EU AI Act transparency for assistive AI. (**Known** rules; product impact **Estimated**.)
6. **People are expensive.** Manual underwriting makes small-business cyber hard to price profitably (Swiss Re theme). (**Known** as an industry story.)

### 1.4 How mature is this stuff?

| Stage | Meaning | Where we are (Estimated) |
| --- | --- | --- |
| H1 | Chatbot / LLM that extracts forms | Common in pilots; easy to demo, easy to shrug off |
| H2 | Specialist steps + a conductor + human sign-off with sources cited | Early real deployments; RFPs starting to sound like this |
| H3 | Always-on posture plus learning from claims and incident response | Mostly roadmap; lawyers and privilege get in the way |

Most buyers sit between H1 and H2. If your RFP ends at “chatbot on the form,” you’re shopping for the wrong KPI. Soft-market discipline is the KPI.

### 1.5 Who buys

| Segment | Buyer | Need | Fit for an assistant |
| --- | --- | --- | --- |
| Specialty cyber MGA | Underwriters + ops | Speed, appetite discipline, maybe white-label | High |
| Carrier cyber desk | UW managers + IT / policy-system owners | Integrations, audit, aggregation reports | High |
| Reinsurer / portfolio | Cat and cyber analytics | Exposure and accumulation | Medium (more model than assistant) |
| Broker / wholesaler | Placement teams | Complete submissions, a posture story for the insured | Adjacent |
| Insured / CISO | People buying coverage | Not the assistant buyer | Low — they’re InsurSec customers |

### 1.6 Bigger forces in play

- Rates stay soft while claim severity, lawsuits, and business interruption keep worrying people. Tools have to protect selection, not only speed.
- AI in underwriting stopped being a novelty. Now it’s governed (ISO 42001 talk, EU AI Act Art. 50 from Aug 2026).
- Carriers buy cyber tech shops (Travelers–Corvus) when they want to own signal-backed underwriting.
- Rules and standards (DORA, NIS2, NIST CSF 2.0, ISO 27001:2022 transition) change what “good evidence” looks like in a file.
- Threats move hourly. Annual questionnaire snapshots as a *method* are getting stale even if policies still renew once a year. (**Estimated** commercial read.)

---

## 2. How the Market Splits

| Cut | Segments | Planning note |
| --- | --- | --- |
| **Buyer size** | Small desk · Mid specialty · Huge carrier | Mid specialty is the sweet spot for standalone tools. Big carriers lean build, buy, and embed. |
| **Geography** | US · UK/Lloyd’s · EU · APAC / IMEA | U.S. has the most cyber premium and InsurSec competition. EU adds evidence rules. IMEA saw deeper Marsh cuts (−14% cyber in Q2 2026). |
| **Product type** | Digitize & triage · Gap check · Actuarial exposure AI · Portfolio watch · Full workbench | Winners stack layers. One score is not a product. |
| **Pricing** | Per seat · Per submission · Platform + usage · White-label / consulting · Bundled with insurance capacity | Services-led white-label still works for first installs. Pure SaaS needs a clear hours-saved story. |
| **Use cases** | New business · Renewal · Referrals · Book watch · Broker follow-ups | Soft market cares about new business and renewals. Supervisors care about book watch. |
| **Maturity** | Email/spreadsheet · Rules in the policy system · H1 chat · H2 orchestrated · H3 closed loop | Most specialty desks are still closer to email than H2. |
| **Risk class** | SME package · Mid-market · Industrial/OT · Tech E&O nearby | OT/industrial burns hours per file — clearer ROI for deep assistants. |

**Spend ballpark (Estimated, not a market size):** A mid-sized cyber desk handling hundreds to a few thousand submissions a year can often justify **six figures a year** if the tool saves 30–60 minutes of research per file and catches bad control claims before quote — **and** if it plugs into the policy system and passes audit. Exact willingness to pay is still fuzzy without primary interviews.

---

## 3. Who’s Who

These “Leader / Challenger / …” labels are **our sorting hat for this brief**, not a Gartner Magic Quadrant. Strengths and weaknesses are inferred from public positioning and how insurance tech usually works.

| Vendor | Bucket | Strengths | Weaknesses | Likely path |
| --- | --- | --- | --- | --- |
| **Cytora** | Leader (workflow) | Digitization at scale; appetite routing; cyber enrichment partners (e.g. VulnCheck, Apr 2026) | Not cyber-only; more of a horizontal underwriting OS | Deepen cyber packs; become the intake system for multi-line desks |
| **Guidewire (+ Cyence)** | Leader (core + analytics) | Owns a lot of carrier policy systems; Cyence models for portfolio risk | Heavy; “assistant UX” may feel secondary | Put assistive UW inside PolicyCenter; partner more than displace |
| **Concirrus (Inspire)** | Challenger | Built for specialty MGAs/carriers; submission to bind; AI governance story | Must prove real cyber depth | Grow cyber modules; chase greenfield specialty stacks |
| **DeNexus (DeRISK UWA)** | Challenger | Multi-agent pipeline; actuarial-style outputs; industrial OT niche | Smaller addressable market; actuarial claims need independent checks | Own complex industrial cyber; partner for the policy system |
| **BitSight (+ Moody’s work)** | Niche specialist | Huge coverage; insurers already buy the feeds | A score is not a decision file; doesn’t own appetite | Stay the enricher; deepen underwriting packs |
| **SecurityScorecard / Black Kite** | Niche specialist | Continuous outside posture; broker and insurer channels | Can look like a commodity; not a full UW desk product | Compete on packaging and APIs for cyber UW |
| **CyberCube** | Niche specialist | Portfolio / systemic scenarios for carriers and reinsurers | Wrong tool for a single-risk gap board | Stay the capital/portfolio layer; API into assistants |
| **Deepinfo and similar** | Emerging | “Replace the questionnaire” with continuous monitoring | Has to live inside carrier workflow to get paid | Sell evidence into assistants and renewals |
| **ArxNimbus-class tools** | Emerging | Talks exposure in money terms underwriters/actuaries use | Niche distribution; heavy proof burden | Feed APIs into pricing engines |
| **Coalition** | Disruptor (substitute) | Insurance + security monitoring + IR; fast signal-backed quotes | Sells **capacity and a product**, not a toolkit to rival desks | Keeps raising the bar for “fast cyber quote” |
| **At-Bay** | Disruptor (substitute) | Insurance + MDR path; scan-driven speed | Scope choices; not a multi-carrier toolkit | Presses SMB–mid desks on speed and security bundle |
| **Cowbell** | Disruptor (substitute) | Continuous scoring; SMB velocity | Less room if buyers want enterprise depth | Owns SMB straight-through; forces legacy shops to automate |
| **Resilience** | Disruptor (substitute) | Risk in dollar language for boards; mid to upper mid | Less “portal speed” story than Coalition/At-Bay | Pulls sophisticated buyers toward quant + engineering |
| **Corvus by Travelers** | Disruptor (acquired) | Carrier balance sheet + Smart Cyber history | Integration risk; wholesale focus | Case study for “buy the tech MGU” |
| **Beazley / AIG / Chubb / AXA XL** | Incumbent capacity | Panel quality, claims muscle, big limits | Digital UW experience varies | Buy, partner, or build; cherry-pick InsurSec features |

**Simple positioning map (Estimated):**

- **Win as an assistant:** gap check + appetite + decision file + book alert + policy-system sync  
- **Partner:** ratings, continuous monitoring, cat engines  
- **Don’t confuse yourself with:** becoming the next Coalition (wrong business for a pure software vendor)

---

## 4. How Competition Works

### Barriers

- Messy domain reality: cyber apps, OT supplements, broker chaos, policy-system schemas  
- Trust: underwriters and compliance hate black-box “decline this” with no cite  
- Distribution: long insurance sales cycles and panel politics  
- Signal cost: useful enrichment often means paying for BitSight-class feeds  
- AI rules: transparency and human oversight, especially in the EU  

### Switching costs

- **High** once appetite rules, past decisions, and policy-system adapters live in the tool  
- **Medium** for pure extraction chatbots (easy to swap)  
- **Lower** for a lone score with no decision dossier  

### Pricing pressure

Soft insurance market means you sell on **hours saved and fewer bad risks**, not an “AI tax.” Horizontal platforms can throw cyber in as a module and squeeze niche pricing. Consulting / white-label has thinner margins but an easier first conversation.

### What still differentiates

1. Quality of the gap board and the follow-up questions it generates  
2. Appetite rules you can version, test, and override with an audit log  
3. Explainability — cite the source; underwriter binds  
4. Book alerts that are useful without pretending to be a full catastrophe model  
5. Time-to-value inside the email + policy-system world desks already live in  

### Consolidation

- **Known:** Travelers–Corvus (~$435M, Jan 2024) — carriers buying tech MGUs to own signal-backed UW  
- **Estimated:** More tuck-ins of enrichment vendors; specialty AI UW shops become targets for big platforms or carriers  
- Chatbot startups with no cyber spine: cheap exits or quiet deaths  

### Lock-in and substitutes

Desks already run multi-vendor stacks. Assistants that become the **hub** gain gravity. InsurSec writers lock customers in at the **policy** layer and can replace third-party assistants inside their own franchise.

| Substitute | Threat | Why |
| --- | --- | --- |
| InsurSec MGA platforms | High | UW tooling lives inside the product |
| Core policy-system AI modules | Medium–High | Procurement likes one vendor |
| Ratings portal + spreadsheet | Medium | Status quo is sticky |
| Offshore / BPO underwriting ops | Medium | Labor arbitrage vs software |
| Broker portals alone | Low–Medium | They don’t own the bind |

---

## 5. Forecast: Next 1–3 Years

**Shared assumptions:**

- Cyber stays a real commercial line; ransomware, BI, and privacy losses don’t vanish  
- Soft market **eases** but doesn’t flip hard overnight without a capital shock (**Estimated**)  
- AI governance gets stricter, not looser  
- No single open form standard replaces carrier-specific apps in this window  

| Scenario | What we’d have to believe | What probably happens | Confidence |
| --- | --- | --- | --- |
| **Base** | Rate cuts keep slowing; serious vendors land a few reference MGA/carrier deals; ratings stay partners; a couple more tuck-ins | Spend grows, unevenly. “Assistant” becomes a real budget line. Orchestrators with policy-system depth win. Chat-only stalls. | **Medium** |
| **Optimistic** | A near-miss or loss-ratio spike forces evidence-backed UW; supervisors push aggregation MI; buyers standardize on decision files | Email/PDF workflows get displaced fast. Gap+appetite platforms can charge more. Clearer standalone SaaS category. | **Low–Medium** |
| **Pessimistic** | Soft market + carrier build/buy eats the category; InsurSec takes share; AI pilots fail ROI checks; data friction blocks feeds | Assistants become a checkbox inside the policy system. Niche players retreat to OT or enrichment APIs. Money leaves H1 chatbot names. | **Medium** |

**What could grow the category:** competition on quote speed against InsurSec; EU/UK evidence rules; the labor cost of specialty UW research; board focus on aggregation; cheaper partner APIs.

**What could stall it:** “Why not just use Coalition for that segment?”; painful policy-system integrations; legal walls between claims/IR and underwriting; AI pilot fatigue; fake giant market-size stories.

**Watch these dials:**

1. Marsh / Aon / Howden cyber rates and loss-ratio commentary  
2. New cyber logos for Cytora / Concirrus / DeNexus-class vendors  
3. More carriers buying cyber tech MGUs or UW AI shops  
4. Supervisor language on aggregation tools and AI in underwriting  
5. Share of files decided with scans vs questionnaire-only  
6. Whether BitSight / CyberCube package deeper into UW workflows or compete with them  

---

## 6. Opportunities

| Who | Opportunity | Why it’s real | What it takes |
| --- | --- | --- | --- |
| **Incumbents (policy systems / digitization)** | Ship real cyber H2 modules: gap packs, appetite templates | They already own intake; cyber needs domain depth | Cyber talent; rating/cat partners; UW UX, not just extraction |
| **Startups** | Own gap check + decision file for mid-market MGAs | InsurSec won’t sell a toolkit to rival capacity; BitSight won’t own appetite | Narrow ICP; connectors; human override; never pitch “next Coalition” |
| **Investors** | Back orchestration hubs and OT/complex niches; skip pure chat | Structural need for fast-but-disciplined UW; exits via tuck-in are plausible | Diligence on policy-system depth, signal cost of goods, real UW interviews |
| **Builders** | Decision workbench pattern: stages, gap board, cite-back, book alert stub | Clear job; demoable spine | Explainability; swappable appetite; partner don’t rebuild; measure time-to-dossier |
| **Carrier / MGA buyers** | Cut research tax; defend selection; stay audit-ready | Soft market + supervisor pressure | Demand human bind; RFP for integrations and override logs; pilot on renewals |
| **Consultancies / SIs** | White-label accelerators, appetite config, adapters | Carriers want personalization without building a product from scratch | Cyber UW experts; reusable adapters; SLAs on dossier time and conflicts caught |

---

## 7. Risks and Constraints

| Risk | What it is | Why you should care |
| --- | --- | --- |
| **AI / regulatory rules** | EU AI Act transparency; automated-decision notices; cross-border dossier transfers | Design cost; features blocked if the tool silently auto-binds |
| **Misrepresentation spillover** | U.S. practice when apps overclaim controls | Invented answers = legal risk. Confirm/clear and provenance aren’t optional. |
| **“AI underwriting” fatigue** | Too many pilots | Longer sales; ROI proof required |
| **Adoption** | Underwriters don’t trust black boxes; email culture | Shelfware if humans aren’t in the loop |
| **Tech limits** | Outside scans ≠ internal control quality; OT blind spots | Gap boards that overclaim create false confidence |
| **Competition** | InsurSec substitutes; features absorbed into the policy system | Standalone margins get crushed |
| **Margins** | Soft insurance line → tight IT budgets; paid signal feeds | Need clear cost per submission |
| **Platform dependency** | BitSight / model APIs / policy systems | Pricing and roadmap can get held hostage |
| **Macro cyber event** | Could harden pricing **or** overwhelm weak automation | See the scenarios in §5 |
| **Dirty data** | Messy broker packs | Extraction has a ceiling without human review |

---

## 8. Emerging Trends

| # | Trend | What’s happening | Why it matters | Who benefits | Who’s threatened |
| --- | --- | --- | --- | --- | --- |
| 1 | Gap checks become table stakes | Desks cross-check apps with outside posture | Questionnaire-only UW looks weak | Gap-board tools; ratings vendors | Pure form portals |
| 2 | H2 orchestration | Specialist steps + human sign-off beat one chatbot | Buyers ask for audit trails and stages | Concirrus/DeNexus/Cytora-class; workbench builders | H1 chatbot startups |
| 3 | Disciplined speed | Rates still cut; brokers call the shots | Tools must protect selection **and** cycle time | Explainable quote/refer/decline platforms | Slow traditional desks |
| 4 | Book risk at quote time | Shared cloud/MSP awareness | Single-risk tools are incomplete | Portfolio-aware assistants; CyberCube APIs | Tools that ignore the book |
| 5 | InsurSec as catalyst | Coalition et al. set the UX bar | Forces legacy shops to automate | Tech MGAs; carriers who buy them | Capacity with no digital muscle |
| 6 | Carrier M&A of cyber tech | Travelers–Corvus pattern | Build-vs-buy tips toward buy | Acquirers; scarce cyber UW talent | Independent MGUs without a moat |
| 7 | Evidence packs | DORA/NIS2/PRA/ISO 27001:2022 reshape asks | The dossier itself becomes product surface | Adaptive intake + evidence vaults | Static PDF questionnaires |
| 8 | Ratings × workflow deals | e.g. Cytora–VulnCheck; BitSight–Moody’s | Enrichment shows up at decision time | Platforms with partner ecosystems | Isolated score portals |
| 9 | OT / industrial depth | Multi-hour complex submissions | Clearer ROI for deep assistants | DeNexus-class; OT specialists | Generic SME straight-through tools in that niche |
| 10 | AI governance as a sales feature | ISO 42001 / SOC 2 / explainability | Becomes an RFP checkbox in EU/UK | Compliant platforms | Opaque model vendors |

---

## 9. What To Do With This

### Where the market is going

Toward workbenches that pull in ratings and cat signals, catch attestation gaps, enforce appetite with a human bind, and leave an audit trail — while the soft market screams for speed. Away from annual questionnaire theater and lonely chat demos.

### Best segments near-term

1. Specialty mid-market MGA/carrier cyber desks competing with InsurSec speed but keeping their own paper  
2. Complex / OT industrial cyber where hours per file justify depth  
3. EU/UK financial and essential-entity books where evidence packs aren’t optional  

Less attractive soon: pure SMB straight-through already owned by Cowbell-class writers; reinsurer cat modeling (different category).

### Best-positioned player type

Orchestrators with a real cyber spine **and** a path into the policy system. Not score vendors alone. Not “we’re an insurer, but software-only” clones. Partnering with BitSight/CyberCube-class feeds is a feature, not a lack of ambition.

### Mistakes to avoid

- Pitching “next Coalition” with no capacity and no claims desk  
- Shipping chat without gap checks, appetite, and audit  
- Rebuilding ratings or full cat models in version one  
- Silent auto-bind or invented control answers  
- Selling only extraction when the job is **decide and defend**  
- Treating mega “TAM” slides as software reality  

### If you’re a new entrant

1. Pick **one** customer type (say: U.S. specialty cyber MGA desk).  
2. Ship the H2 spine: messy intake → gap board → appetite quote/refer/decline → dossier → policy-system stub.  
3. Partner signals on day one (mocked is fine); go live in phase two.  
4. Measure time to a decision-ready file, % of attestation conflicts caught before quote, % of decisions with a written rationale.  
5. Design for underwriter override and regulatory disclosure from day one.  
6. Price against hours saved and bad risks avoided — not AI mystique.  
7. Plan scale or exit through a policy-system ecosystem or a carrier tuck-in. Perpetual standalone SaaS is a wish, not a plan.

### For Decision Workbench builders (category-level, not a sales pitch)

The product that makes commercial sense is an **enablement layer for desks**, not an InsurSec carrier. Credibility is gap + appetite + dossier + book alert — not “we replaced BitSight.”

---

## 10. Known vs Estimated vs Speculative

| Type | Examples |
| --- | --- |
| **Known / public** | Marsh GIMI Q2 2026: global cyber −4%, 12th straight quarterly drop; Aon soft-market commentary; Travelers closed Corvus (~$435M, Jan 2024); public positioning of Coalition, At-Bay, Cowbell, Resilience, Cytora, Concirrus Inspire, DeNexus DeRISK UWA, BitSight, CyberCube, Guidewire Cyence; EU DORA (Jan 2025), NIS2, PRA SS4/17 themes, EU AI Act Art. 50 (Aug 2026); ISO 27001:2022 transition cutoff (31 Oct 2025) |
| **Estimated / inferred** | Digitization is early-majority; full H2 cyber spines are still early-adopter; six-figure annual spend can make sense for mid desks with proven time savings; more tuck-ins coming; soft market is the near-term demand driver for “disciplined speed”; buyers will pay more for gap+appetite than for chat; OT/complex risks show clearer ROI |
| **Speculative / scenario** | Optimistic hard-market forcing dossier standards; pessimistic absorption into policy systems / InsurSec; H3 claims↔IR learning unlocking inside three years; naming “winners” without win/loss data; any precise global TAM for “cyber UW assistant software” as a clean category |

### Re-check before you act

- Marsh Global Insurance Market Index (cyber) — quarterly  
- Aon / Howden cyber outlooks  
- Vendor sites and partnership announcements  
- Supervisor publications (PRA, EIOPA, NAIC) on cyber UW and AI  
- Primary underwriter interviews — still the biggest evidence hole  

---

*End of brief. For planning and research conversation — not investment advice, not affiliated with Gartner.*
