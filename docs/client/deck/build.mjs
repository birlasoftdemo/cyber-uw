/**
 * Client deck for a cyber CUO / VP Underwriting (carrier or MGA).
 *
 * Voice assumptions:
 * - Peer, not a pitch. Short claims. A source, or an honest limit.
 * - Birlasoft identity: white ground, charcoal, red band, serif wordmark.
 *   Logo sits only on white (logo-usage manual). Red sampled from the wordmark.
 * - The 50–60 / >90 / 30–40 / 2–4 hr figures are pilot tests, not results.
 *   No carrier baseline exists in the research pack, so they are not on the cover.
 */
import { createRequire } from "module";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const pptxgen = require("pptxgenjs");
const html2pptx = require("/Users/chandansharma/.cursor/skills/pptx/scripts/html2pptx.js");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const slidesDir = path.join(__dirname, "slides");

const outDownloads =
  "/Users/chandansharma/Downloads/Birlasoft_Cyber_Underwriting_Strategy_Deck_Client.pptx";
const outRepo = path.join(
  __dirname,
  "..",
  "Birlasoft_Cyber_Underwriting_Strategy_Deck_Client.pptx",
);

const LOGO_SRC =
  "/Users/chandansharma/Documents/cyber-uw/public/birlasoft-logo.png";
const LOGO_FLAT = path.join(__dirname, "slides", "birlasoft-logo-on-white.png");

const RED = "#D0372C";
const INK = "#2A2A2A";
const MUTED = "#5A5A5A";
const LINE = "#E2E2E2";
const PANEL = "#F4F4F4";
const DARK = "#2A2A2A";

function doc(inner, bg = "#FFFFFF") {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    width: 720pt; height: 405pt; margin: 0;
    background: ${bg};
    font-family: Arial, sans-serif;
    color: ${INK};
    display: flex; flex-direction: column; overflow: hidden;
  }
  p, h1 { margin: 0; padding: 0; }
  h1 { font-weight: normal; }
</style>
</head>
<body>${inner}</body>
</html>`;
}

function mast(label) {
  return `<div style="height:32pt; background:#FFFFFF; display:flex; align-items:center; padding:5pt 26pt 0 26pt;">
    <img src="file://${LOGO_FLAT}" style="width:78pt; height:22pt;">
    <div style="flex:1;"></div>
    <p style="font-size:10pt; color:${MUTED};">${label}</p>
  </div>
  <div style="height:3pt; background:${RED};"></div>`;
}

function foot(n) {
  return `<div style="height:26pt; padding:0 26pt 9pt 26pt; display:flex; justify-content:space-between; align-items:flex-end;">
    <p style="font-size:9pt; color:${MUTED};">Cyber underwriting  ·  Client discussion</p>
    <p style="font-size:9pt; color:${MUTED};">${String(n).padStart(2, "0")}</p>
  </div>`;
}

function head(kicker, title, sub = "") {
  return `<div style="padding:12pt 26pt 0 26pt;">
    <p style="font-size:10pt; font-weight:bold; color:${RED};">${kicker}</p>
    <h1 style="font-family:Georgia, serif; font-size:22pt; line-height:1.12; color:${INK}; margin-top:4pt;">${title}</h1>
    ${sub ? `<p style="font-size:12pt; line-height:1.3; color:${MUTED}; margin-top:4pt;">${sub}</p>` : ""}
  </div>`;
}

const slides = [];

slides.push({
  name: "01-proposition",
  notes:
    "Open as a peer, not with a slogan. The offer is one sentence: faster, without giving away the file. If they ask for the ROI on slide one, say it is on the pilot slide, and it is a test against their baseline, not a case study. You do not have a Hartford number. Do not borrow one. You keep their paper, their appetite, and the rating vendors they already pay.",
  html: doc(`
    ${mast("Cyber underwriting")}
    <div style="flex:1; padding:22pt 32pt 0 32pt;">
      <p style="font-size:11pt; font-weight:bold; color:${RED};">FOR A CARRIER OR MGA CYBER DESK</p>
      <h1 style="font-family:Georgia, serif; font-size:32pt; line-height:1.05; color:${INK}; margin-top:10pt; width:620pt;">Quote faster. Do not loosen the file.</h1>
      <p style="font-size:15pt; line-height:1.35; color:${INK}; margin-top:14pt; width:600pt;">A workbench that takes a cyber submission from the broker's email to a decision a person signs.</p>
      <p style="font-size:13pt; line-height:1.35; color:${MUTED}; margin-top:8pt; width:580pt;">You keep the paper, the appetite, and the rating vendors you already pay for.</p>
    </div>
    <div style="height:78pt; background:${DARK}; display:flex;">
      <div style="flex:1; padding:14pt 16pt 0 28pt;">
        <p style="font-size:11pt; font-weight:bold; color:#F3F3F3;">Attestation against signal</p>
        <p style="font-size:11pt; color:#D0D0D0; margin-top:3pt;">What they declared, next to what an outside feed can see.</p>
      </div>
      <div style="flex:1; padding:14pt 16pt 0 16pt; border-left:1pt solid #4A4A4A;">
        <p style="font-size:11pt; font-weight:bold; color:#F3F3F3;">Your rules, versioned</p>
        <p style="font-size:11pt; color:#D0D0D0; margin-top:3pt;">Quote, refer, or decline, with the rule that fired.</p>
      </div>
      <div style="flex:1; padding:14pt 18pt 0 16pt; border-left:1pt solid #4A4A4A;">
        <p style="font-size:11pt; font-weight:bold; color:#F3F3F3;">A file you can hand on</p>
        <p style="font-size:11pt; color:#D0D0D0; margin-top:3pt;">Dossier out. Status into the policy system.</p>
      </div>
    </div>
  `),
});

slides.push({
  name: "02-market",
  notes:
    "These are published figures, not our math. Marsh Global Insurance Market Index, Q2 2026: global cyber rates down 4 percent, the twelfth straight quarterly decline. Everest and Zywave, January 2024: about 70 percent of underwriters called it a brokers' market, and about half of primary underwriters reported flat or negative rate. Swiss Re has said soft-market concessions land on controls as well as price. If they say their book is firming, agree. The point is not the last quarter. The point is that speed pressure and selection pressure arrive together. Source grades in our pack: Marsh known, Everest survey grade A, Swiss Re grade A.",
  html: doc(`
    ${mast("The market")}
    ${head(
      "CONTEXT",
      "Cyber got cheaper. The file did not.",
      "Brokers shop turnaround. A faster yes, on an unchecked control, is the larger exposure.",
    )}
    <div style="padding:12pt 26pt 0 26pt; display:flex;">
      <div style="flex:1; border-top:3pt solid ${RED}; padding-top:8pt; margin-right:14pt;">
        <p style="font-family:Georgia, serif; font-size:28pt; color:${INK};">−4%</p>
        <p style="font-size:13pt; font-weight:bold; margin-top:4pt;">Global cyber rates</p>
        <p style="font-size:11pt; color:${MUTED}; margin-top:3pt; line-height:1.3;">Q2 2026. Twelfth straight quarterly decline. Marsh.</p>
      </div>
      <div style="flex:1; border-top:3pt solid ${INK}; padding-top:8pt; margin-right:14pt;">
        <p style="font-family:Georgia, serif; font-size:28pt; color:${INK};">12</p>
        <p style="font-size:13pt; font-weight:bold; margin-top:4pt;">Quarters of decline</p>
        <p style="font-size:11pt; color:${MUTED}; margin-top:3pt; line-height:1.3;">Same Marsh index. The soft market is not a one-quarter story.</p>
      </div>
      <div style="flex:1; border-top:3pt solid ${INK}; padding-top:8pt;">
        <p style="font-family:Georgia, serif; font-size:28pt; color:${INK};">~70%</p>
        <p style="font-size:13pt; font-weight:bold; margin-top:4pt;">Call it a brokers' market</p>
        <p style="font-size:11pt; color:${MUTED}; margin-top:3pt; line-height:1.3;">Everest and Zywave, underwriter survey, January 2024.</p>
      </div>
    </div>
    <div style="margin:12pt 26pt 0 26pt; background:${PANEL}; padding:8pt 12pt;">
      <p style="font-size:12pt; line-height:1.35; color:${INK};">In that survey, about half of primary underwriters reported flat or negative rate. Swiss Re's point is the one to hold: the concession shows up in the control, not only in the premium.</p>
    </div>
    ${foot(2)}
  `),
});

slides.push({
  name: "03-bottlenecks",
  notes:
    "Walk it as their Monday, not as a capability list. Volume means the same submission is keyed more than once. Scoring drift means two of their people can hold one file to two standards. Enrichment is a scavenger hunt across feeds they already buy. The policy system hears late, so the bind and the file disagree. And nobody can see what is still open. The SageSure line, if you want it: a specialty underwriter, published December 2025, said half the day goes to searching rather than deciding, and a 30-minute job becomes three hours. That is one desk, paraphrased. Do not promote it to an industry census. Swiss Re, grade A, is the safer line: manual assessment is why small cyber is hard to make pay.",
  html: doc(`
    ${mast("The desk")}
    ${head("CONTEXT", "Five places the day actually goes")}
    <div style="padding:6pt 26pt 0 26pt;">
      ${[
        ["01", "The queue outruns the team", "The same submission gets keyed more than once."],
        ["02", "Two reviewers, two scores", "Nothing forces the same file to the same standard."],
        ["03", "Enrichment is a scavenger hunt", "The questionnaire, the rating, and the loss run live apart."],
        ["04", "The policy system hears late", "Quote state and the file fall out of step."],
        ["05", "No one picture of what is open", "Missing evidence sits in a mailbox, not on the file."],
      ]
        .map(
          ([n, t, d], i) => `
        <div style="display:flex; align-items:center; height:44pt; ${i < 4 ? `border-bottom:1pt solid ${LINE};` : ""}">
          <div style="width:36pt;"><p style="font-family:Georgia, serif; font-size:16pt; color:${RED};">${n}</p></div>
          <div style="width:250pt;"><p style="font-size:14pt; font-weight:bold;">${t}</p></div>
          <div style="flex:1;"><p style="font-size:13pt; color:${MUTED};">${d}</p></div>
        </div>`,
        )
        .join("")}
    </div>
    ${foot(3)}
  `),
});

slides.push({
  name: "04-fragmented",
  notes:
    "Four instruments, four questions. Do not let a rating vendor, or a cat-model vendor, or a form tool, own the decision. The applicant describes a procedure. A rating describes what can be seen from outside. A catastrophe model describes the book. Appetite describes what this carrier will write. The workbench is where those four are held against each other. We partner BitSight, SecurityScorecard, Black Kite, and later CyberCube or Cyence. We do not rebuild them.",
  html: doc(`
    ${mast("The desk")}
    ${head(
      "CONTEXT",
      "Four answers. None of them is the decision.",
      "Each system is useful. None of them tells you whether to write the risk.",
    )}
    <div style="padding:8pt 26pt 0 26pt;">
      <div style="display:flex; height:108pt;">
        <div style="flex:1; background:#F7F7F7; border-top:4pt solid ${RED}; padding:10pt 12pt 0 12pt; margin-right:8pt;">
          <p style="font-size:10pt; font-weight:bold; color:${RED};">WHAT THEY SAY</p>
          <p style="font-family:Georgia, serif; font-size:15pt; margin-top:6pt;">The application</p>
          <p style="font-size:12pt; color:${MUTED}; margin-top:4pt;">MFA, EDR, backups, response. Declared, not observed.</p>
        </div>
        <div style="flex:1; background:#F7F7F7; border-top:4pt solid ${INK}; padding:10pt 12pt 0 12pt;">
          <p style="font-size:10pt; font-weight:bold;">WHAT AN OUTSIDER CAN SEE</p>
          <p style="font-family:Georgia, serif; font-size:15pt; margin-top:6pt;">A security rating</p>
          <p style="font-size:12pt; color:${MUTED}; margin-top:4pt;">Exposure and posture, from a feed you already license.</p>
        </div>
      </div>
      <div style="height:8pt;"></div>
      <div style="display:flex; height:108pt;">
        <div style="flex:1; background:#F7F7F7; border-top:4pt solid ${INK}; padding:10pt 12pt 0 12pt; margin-right:8pt;">
          <p style="font-size:10pt; font-weight:bold;">WHAT THE BOOK DOES</p>
          <p style="font-family:Georgia, serif; font-size:15pt; margin-top:6pt;">A portfolio model</p>
          <p style="font-size:12pt; color:${MUTED}; margin-top:4pt;">Shared vendors and systemic scenarios. A capital question.</p>
        </div>
        <div style="flex:1; background:${DARK}; border-top:4pt solid ${RED}; padding:10pt 12pt 0 12pt;">
          <p style="font-size:10pt; font-weight:bold; color:${RED};">WHAT YOU WILL WRITE</p>
          <p style="font-family:Georgia, serif; font-size:15pt; color:#FFFFFF; margin-top:6pt;">Your appetite</p>
          <p style="font-size:12pt; color:#D8D8D8; margin-top:4pt;">The line, the floor, the sector you will actually defend.</p>
        </div>
      </div>
    </div>
    ${foot(4)}
  `),
});

slides.push({
  name: "05-jobs",
  notes:
    "Four jobs, each tied to a failure they already named. If a feature does not shorten rework, let someone reject a bad extraction, surface a missing control before price, or give the referral a reason, it is not in the first release. Say that out loud. It is how you stay out of a platform fantasy.",
  html: doc(`
    ${mast("The work")}
    ${head("VALUE", "Four jobs. Each one has to earn its place.")}
    <div style="padding:8pt 26pt 0 26pt;">
      <div style="display:flex; height:20pt; border-bottom:2pt solid ${INK};">
        <div style="width:168pt;"><p style="font-size:10pt; font-weight:bold;">JOB</p></div>
        <div style="width:330pt;"><p style="font-size:10pt; font-weight:bold;">ON THE FILE</p></div>
        <div style="flex:1;"><p style="font-size:10pt; font-weight:bold; color:${RED};">YOU SHOULD SEE</p></div>
      </div>
      ${[
        ["Sort the intake", "One record. Right queue. Right owner.", "Less re-keying"],
        ["Check the extract", "Every field points back at the page it came from.", "A field you can reject"],
        ["Hold it to a signal", "Missing or conflicting evidence, before anyone prices.", "A question sent early"],
        ["Write the reason", "Rationale, open items, and the next action.", "A referral that travels"],
      ]
        .map(
          ([a, b, c], i) => `
        <div style="display:flex; align-items:center; height:50pt; ${i < 3 ? `border-bottom:1pt solid ${LINE};` : ""}">
          <div style="width:168pt;"><p style="font-size:13pt; font-weight:bold;">${a}</p></div>
          <div style="width:330pt; padding-right:8pt;"><p style="font-size:12pt; color:${MUTED};">${b}</p></div>
          <div style="flex:1;"><p style="font-size:13pt; font-weight:bold; color:${RED};">${c}</p></div>
        </div>`,
        )
        .join("")}
    </div>
    ${foot(5)}
  `),
});

slides.push({
  name: "06-the-question",
  notes:
    "This is the slide for the person in the room, not for their underwriters. The question they will get from their own CUO, reinsurer, or board is whether speed cost them a control. Operations cares about touches. Underwriters care whether the hour came back. Compliance cares who overrode which rule version. If the tool only makes one of those three happy, it will not survive the steering group. Do not say ecosystem.",
  html: doc(`
    ${mast("The work")}
    ${head("VALUE", "The question you will get in the room")}
    <div style="margin:8pt 26pt 0 26pt; border-left:4pt solid ${RED}; padding:2pt 0 2pt 12pt;">
      <p style="font-family:Georgia, serif; font-size:20pt; line-height:1.2;">Did we get faster, and did we give a control away to do it?</p>
    </div>
    <div style="padding:12pt 26pt 0 26pt; display:flex;">
      <div style="flex:1; padding-right:12pt;">
        <p style="font-size:10pt; font-weight:bold; color:${RED};">OPERATIONS</p>
        <p style="font-size:14pt; font-weight:bold; margin-top:4pt;">Fewer touches</p>
        <p style="font-size:12pt; color:${MUTED}; margin-top:4pt; line-height:1.3;">Triage, re-entry, and the chase for a missing page.</p>
      </div>
      <div style="flex:1; padding:0 12pt; border-left:1pt solid ${LINE};">
        <p style="font-size:10pt; font-weight:bold; color:${RED};">UNDERWRITERS</p>
        <p style="font-size:14pt; font-weight:bold; margin-top:4pt;">The hour back</p>
        <p style="font-size:12pt; color:${MUTED}; margin-top:4pt; line-height:1.3;">Judgment, on evidence, with a reason they can send.</p>
      </div>
      <div style="flex:1; padding-left:12pt; border-left:1pt solid ${LINE};">
        <p style="font-size:10pt; font-weight:bold; color:${RED};">COMPLIANCE</p>
        <p style="font-size:14pt; font-weight:bold; margin-top:4pt;">The override</p>
        <p style="font-size:12pt; color:${MUTED}; margin-top:4pt; line-height:1.3;">Who changed the call, when, and against which rule.</p>
      </div>
    </div>
    ${foot(6)}
  `),
});

slides.push({
  name: "07-pilot-test",
  notes:
    "Say this before they read the numbers. These four figures came into the conversation as planning targets. They are not a published result, and they are not a Hartford or MGA case study. We do not have their baseline. The pilot exists to create it: time to a decision-ready file, accuracy of checks against the source page, cost per submission, and hours returned to judgment. If they want a guarantee, do not give one. Offer to write the four measures into the pilot, with their denominator.",
  html: doc(`
    ${mast("The work")}
    ${head(
      "VALUE",
      "Four numbers a pilot has to earn",
      "Not a case study. Your baseline is the denominator. We will not borrow someone else's.",
    )}
    <div style="padding:10pt 26pt 0 26pt;">
      <div style="background:${DARK}; padding:8pt 12pt;">
        <p style="font-size:10pt; font-weight:bold; color:${RED};">WHAT THE PILOT IS FOR</p>
        <p style="font-family:Georgia, serif; font-size:16pt; color:#FFFFFF; margin-top:2pt;">A decision-ready submission, measured on your book</p>
      </div>
      <div style="height:3pt; background:${RED};"></div>
      <div style="display:flex; margin-bottom:8pt;">
        ${[
          ["50–60%", "Speed", "Receipt to a file someone can act on."],
          [">90%", "Checks", "Fields and rules, tested against the page."],
          ["30–40%", "Cost", "Cost per submission, once re-keying falls."],
          ["2–4 hrs", "Time", "A day returned from search to judgment."],
        ]
          .map(
            ([n, l, d], i) => `
          <div style="flex:1; ${i < 3 ? `border-right:1pt solid ${LINE};` : ""}">
            <div style="display:flex; justify-content:center;">
              <div style="width:2pt; height:12pt; background:${RED};"></div>
            </div>
            <div style="padding:2pt 10pt 0 10pt;">
              <p style="font-family:Georgia, serif; font-size:22pt; color:${INK};">${n}</p>
              <p style="font-size:12pt; font-weight:bold; margin-top:2pt;">${l}</p>
              <p style="font-size:11pt; color:${MUTED}; margin-top:2pt; line-height:1.25;">${d}</p>
            </div>
          </div>`,
          )
          .join("")}
      </div>
    </div>
    ${foot(7)}
  `),
});

slides.push({
  name: "08-journey",
  notes:
    "Six steps, one record. Pause on Assess. That is appetite, referral, and a person. Signals are indicators. They are not the truth of the control inside the insured's network. Handoff is the brief, the human action, and a status in the policy system. Nothing binds by itself. If they ask about straight-through for small business, say that is a different market, already crowded, and not this offer.",
  html: doc(`
    ${mast("How it runs")}
    ${head("SOLUTION", "Six steps. A person at the fifth.")}
    <div style="padding:14pt 18pt 0 18pt;">
      <div style="height:2pt; background:${INK}; margin:11pt 22pt 0 22pt;"></div>
      <div style="display:flex; margin-top:-13pt;">
        ${[
          ["1", "Receive", "Email, forms, attachments", DARK],
          ["2", "Read", "Classify, extract, review", DARK],
          ["3", "Check", "Gaps, conflicts, source", DARK],
          ["4", "Enrich", "Ratings and outside signals", DARK],
          ["5", "Decide", "Appetite, referral, a person", RED],
          ["6", "Hand off", "Brief, action, policy system", DARK],
        ]
          .map(
            ([n, t, d, c]) => `
          <div style="flex:1; padding:0 3pt;">
            <div style="width:24pt; height:24pt; border-radius:50%; background:${c}; border:3pt solid #FFFFFF; margin:0 auto;">
              <p style="font-size:10pt; font-weight:bold; color:#FFFFFF; text-align:center; padding-top:3pt;">${n}</p>
            </div>
            <p style="font-size:12pt; font-weight:bold; text-align:center; margin-top:8pt;">${t}</p>
            <p style="font-size:10pt; color:${MUTED}; text-align:center; margin-top:2pt; line-height:1.25;">${d}</p>
          </div>`,
          )
          .join("")}
      </div>
      <div style="margin-top:14pt; background:${PANEL}; padding:8pt 12pt;">
        <p style="font-size:12pt;"><b>Decide is the gate.</b> An outside signal is a clue. It does not prove the control works, and it does not bind the policy.</p>
      </div>
    </div>
    ${foot(8)}
  `),
});

slides.push({
  name: "09-architecture",
  notes:
    "Read top to bottom, the way a file moves. Experience is the operations bench, the underwriter bench, and what the broker sees. Workflow is the queue and the approval. Intelligence is extraction, the comparison, the appetite, and the dossier. External data is whatever they already buy: ratings, attack surface, and a catastrophe model when they want the book view. Enterprise is their policy system, CRM, documents, and identity. The bar at the bottom is non-negotiable for this buyer: access, lineage, which model version, which rule version, and an audit trail. Feeds and the policy connector are named in the statement of work. They are not assumed.",
  html: doc(`
    ${mast("How it runs")}
    ${head(
      "ARCHITECTURE",
      "Where each piece sits",
      "Feeds and the policy connector are named in the work. They are not assumed.",
    )}
    <div style="padding:6pt 26pt 0 26pt;">
      ${[
        ["EXPERIENCE", DARK, "#F7F7F7", "Operations bench  ·  Underwriter bench  ·  What the broker sees"],
        ["WORKFLOW", "#3A3A3A", "#F7F7F7", "Orchestrator  ·  Queue and exceptions  ·  A person approves"],
        ["INTELLIGENCE", "#4A4A4A", "#F7F7F7", "Extraction  ·  Reconciliation  ·  Appetite rules  ·  Dossier"],
        ["OUTSIDE DATA", RED, "#FBF6F5", "Security ratings  ·  Attack surface  ·  Portfolio model, when in scope"],
        ["YOUR SYSTEMS", "#1F1F1F", "#F3F3F3", "Policy admin  ·  CRM  ·  Document store  ·  Identity"],
      ]
        .map(
          ([name, mark, bg, body]) => `
        <div style="display:flex; height:34pt; margin-bottom:3pt;">
          <div style="width:118pt; background:${mark}; padding:9pt 0 0 8pt;">
            <p style="font-size:10pt; font-weight:bold; color:#FFFFFF;">${name}</p>
          </div>
          <div style="flex:1; background:${bg}; padding:9pt 0 0 10pt;">
            <p style="font-size:12pt;">${body}</p>
          </div>
        </div>`,
        )
        .join("")}
      <div style="background:${DARK}; padding:6pt 10pt; margin-top:2pt;">
        <p style="font-size:11pt; color:#FFFFFF;">Across all of it: who can see it, where a field came from, which rule version, which model version, and the audit trail.</p>
      </div>
    </div>
    ${foot(9)}
  `),
});

slides.push({
  name: "10-enrichment",
  notes:
    "This is the third-party slide, and the distinction a reinsurer will care about. The insured says MFA, EDR, backups. A rating or a scan agrees, disagrees, or cannot see it. All three are results. 'Cannot see it' is not a failure of the tool. Pretending the scan settled an internal control is how you get a coverage argument later. The underwriter then asks for evidence, applies appetite, and writes the reason. Name the likely partners if they ask: BitSight, SecurityScorecard, Black Kite for posture. CyberCube or Guidewire Cyence later, for the book, and only by API. A pilot can run the same interface on a mock feed. Say so.",
  html: doc(`
    ${mast("Outside evidence")}
    ${head(
      "ENRICHMENT",
      "Match, conflict, or we cannot see it.",
      "A rating is a clue. It is not proof the control works inside their network.",
    )}
    <div style="padding:6pt 26pt 0 26pt; display:flex;">
      <div style="flex:1; border:1.5pt solid ${INK}; padding:7pt 10pt 0 10pt; height:52pt;">
        <p style="font-size:10pt; font-weight:bold;">THEY DECLARE</p>
        <p style="font-size:13pt; margin-top:3pt;">MFA on. EDR covered. Backups tested.</p>
      </div>
      <div style="width:24pt; padding-top:14pt;">
        <p style="font-size:14pt; font-weight:bold; color:${RED}; text-align:center;">+</p>
      </div>
      <div style="flex:1; border:1.5pt solid ${RED}; padding:7pt 10pt 0 10pt; height:52pt;">
        <p style="font-size:10pt; font-weight:bold; color:${RED};">A FEED REPORTS</p>
        <p style="font-size:13pt; margin-top:3pt;">Rating, exposure, or nothing usable.</p>
      </div>
    </div>
    <div style="padding:8pt 26pt 0 26pt; display:flex;">
      <div style="flex:1; background:#F7F7F7; border-top:4pt solid ${INK}; padding:8pt 10pt 0 10pt; height:78pt; margin-right:8pt;">
        <p style="font-size:13pt; font-weight:bold;">They agree</p>
        <p style="font-size:12pt; color:${MUTED}; margin-top:4pt; line-height:1.3;">Declaration and signal match. The file can move.</p>
      </div>
      <div style="flex:1; background:#FBF6F5; border-top:4pt solid ${RED}; padding:8pt 10pt 0 10pt; height:78pt; margin-right:8pt;">
        <p style="font-size:13pt; font-weight:bold; color:${RED};">They don't</p>
        <p style="font-size:12pt; color:${MUTED}; margin-top:4pt; line-height:1.3;">Ask for evidence before anyone prices it.</p>
      </div>
      <div style="flex:1; background:#F7F7F7; border-top:4pt solid ${INK}; padding:8pt 10pt 0 10pt; height:78pt;">
        <p style="font-size:13pt; font-weight:bold;">No outside view</p>
        <p style="font-size:12pt; color:${MUTED}; margin-top:4pt; line-height:1.3;">Name the gap. Do not pretend the scan settled it.</p>
      </div>
    </div>
    <div style="margin:8pt 26pt 0 26pt; background:${DARK}; padding:7pt 10pt;">
      <p style="font-size:12pt; color:#FFFFFF;">Then a person: request evidence, apply appetite, write the reason.</p>
    </div>
    ${foot(10)}
  `),
});

slides.push({
  name: "11-what-changed",
  notes:
    "This is product judgment, not a feature list. We watched the work and stopped four habits. Hunting across email became one submission record. An extraction the underwriter could not challenge became a field with a source, and a reject. A missing document became a piece of work with an owner, not a note in the margin. And operations and underwriting stopped sharing one cluttered screen. If they want a demo, show the decision the screen allows. Do not show a model reading a PDF.",
  html: doc(`
    ${mast("What we learned")}
    ${head(
      "PRODUCT",
      "What we stopped doing, after watching the work",
    )}
    <div style="padding:4pt 26pt 0 26pt;">
      <div style="display:flex; height:16pt;">
        <div style="flex:1;"><p style="font-size:10pt; font-weight:bold; color:${MUTED};">WHAT WE SAW</p></div>
        <div style="width:28pt;"></div>
        <div style="flex:1;"><p style="font-size:10pt; font-weight:bold; color:${RED};">WHAT WE BUILT</p></div>
      </div>
      ${[
        ["Files scattered across a mailbox", "One submission record", "Less hunting."],
        ["An extract nobody could challenge", "A field linked to its page", "You can reject it."],
        ["A gap with no owner", "An open item, and a chase", "Missing evidence is work."],
        ["One screen for every role", "A bench for ops, a bench for the underwriter", "The right context, not all of it."],
      ]
        .map(
          ([a, b, c]) => `
        <div style="display:flex; align-items:center; height:50pt; border-top:1pt solid ${LINE};">
          <div style="flex:1; padding-right:6pt;"><p style="font-size:13pt;">${a}</p></div>
          <div style="width:28pt;"><p style="font-family:Georgia, serif; font-size:16pt; color:${RED}; text-align:center;">→</p></div>
          <div style="flex:1;">
            <p style="font-size:13pt; font-weight:bold;">${b}</p>
            <p style="font-size:11pt; color:${MUTED}; margin-top:1pt;">${c}</p>
          </div>
        </div>`,
        )
        .join("")}
    </div>
    ${foot(11)}
  `),
});

slides.push({
  name: "12-worked-example",
  notes:
    "Do not call this a client. There is no TechCorp, and implying a reference logo in this room would be a mistake. It is a worked example: application, security questionnaire, incident-response plan. The point is the decision, not the extraction. Controls are checked against the page. MFA or EDR evidence is incomplete or in conflict. An outside signal is requested only where a feed is actually connected. A person refers, or asks for evidence. Offer to rerun the same path on a redacted file from their desk before anyone discusses scale. Confirm which feeds they already have before you imply one is live.",
  html: doc(`
    <div style="display:flex; width:720pt; height:405pt;">
      <div style="width:220pt; background:#FFFFFF; display:flex; flex-direction:column;">
        <div style="padding:16pt 16pt 0 16pt;">
          <img src="file://${LOGO_FLAT}" style="width:86pt; height:24pt;">
        </div>
        <div style="height:3pt; background:${RED}; margin-top:10pt;"></div>
        <div style="padding:16pt 16pt 0 16pt; flex:1; display:flex; flex-direction:column;">
          <p style="font-size:10pt; font-weight:bold; color:${RED};">A WORKED EXAMPLE</p>
          <h1 style="font-family:Georgia, serif; font-size:22pt; line-height:1.1; margin-top:8pt;">Not your file. Not a client.</h1>
          <p style="font-size:12pt; color:${MUTED}; margin-top:8pt; line-height:1.35;">One mid-market submission, so you can see the decision rather than the extract.</p>
          <div style="margin-top:14pt; border-top:1pt solid ${LINE}; padding-top:8pt;">
            <p style="font-size:11pt; font-weight:bold;">IN THE FILE</p>
            <p style="font-size:12pt; margin-top:4pt;">Application</p>
            <p style="font-size:12pt; margin-top:2pt;">Security questionnaire</p>
            <p style="font-size:12pt; margin-top:2pt;">Incident-response plan</p>
          </div>
          <div style="margin-top:auto; padding-bottom:16pt;">
            <p style="font-size:11pt; line-height:1.35;">Next, the same path on a redacted file from your desk.</p>
          </div>
        </div>
      </div>
      <div style="width:3pt; background:${RED};"></div>
      <div style="flex:1; background:#FFFFFF; padding:14pt 18pt 0 16pt; display:flex; flex-direction:column;">
        ${[
          ["1", "In", "Three documents become one record."],
          ["2", "Check", "Extracted controls are held against the page."],
          ["3", "Gap", "MFA or EDR evidence is thin, or it conflicts."],
          ["4", "Signal", "An outside feed is asked, only if you have one connected."],
          ["5", "Person", "The dossier is ready. Someone refers, or asks."],
        ]
          .map(
            ([n, t, d]) => `
          <div style="display:flex; height:58pt; border-bottom:1pt solid ${LINE};">
            <div style="width:28pt; padding-top:8pt;"><p style="font-family:Georgia, serif; font-size:18pt; color:${RED};">${n}</p></div>
            <div style="flex:1; padding-top:8pt;">
              <p style="font-size:14pt; font-weight:bold;">${t}</p>
              <p style="font-size:12pt; color:${MUTED}; margin-top:2pt;">${d}</p>
            </div>
          </div>`,
          )
          .join("")}
        <div style="margin-top:auto; padding-bottom:10pt; display:flex; justify-content:flex-end;">
          <p style="font-size:9pt; color:${MUTED};">12</p>
        </div>
      </div>
    </div>
  `),
});

slides.push({
  name: "13-rollout",
  notes:
    "Order is the point, and a VP has usually been burned by the reverse order. First, who can approve and who can override, and that the override is stored. Second, the four measures, on their baseline, before you connect the world. Third, one feed and the policy-system fields, with a data contract, not a platform program. Fourth, a second segment: more documents, more rules, another partner. A pilot that starts by integrating everything will not produce a number anyone trusts.",
  html: doc(`
    ${mast("How we start")}
    ${head(
      "DELIVERY",
      "Control first. Then a number. Then a connection.",
      "A pilot that wires everything on day one never produces a figure you can trust.",
    )}
    <div style="flex:1; display:flex; align-items:flex-end; padding:6pt 26pt 6pt 26pt;">
      <div style="flex:1; height:128pt; background:#F0F0F0; padding:10pt 10pt 0 10pt; margin-right:8pt;">
        <p style="font-size:11pt; font-weight:bold; color:${RED};">01</p>
        <p style="font-family:Georgia, serif; font-size:16pt; margin-top:4pt;">Control</p>
        <p style="font-size:12pt; margin-top:4pt; line-height:1.25;">Who approves. Who overrides. Both are stored.</p>
      </div>
      <div style="flex:1; height:160pt; background:#E4E4E4; padding:10pt 10pt 0 10pt; margin-right:8pt;">
        <p style="font-size:11pt; font-weight:bold; color:${RED};">02</p>
        <p style="font-family:Georgia, serif; font-size:16pt; margin-top:4pt;">A number</p>
        <p style="font-size:12pt; margin-top:4pt; line-height:1.25;">Time, exceptions, accuracy, cost. Your baseline.</p>
      </div>
      <div style="flex:1; height:192pt; background:#3A3A3A; padding:10pt 10pt 0 10pt; margin-right:8pt;">
        <p style="font-size:11pt; font-weight:bold; color:#F0B0A8;">03</p>
        <p style="font-family:Georgia, serif; font-size:16pt; color:#FFFFFF; margin-top:4pt;">One connection</p>
        <p style="font-size:12pt; color:#F0F0F0; margin-top:4pt; line-height:1.25;">A named feed, and the policy fields, under a data contract.</p>
      </div>
      <div style="flex:1; height:224pt; background:${DARK}; padding:10pt 10pt 0 10pt;">
        <p style="font-size:11pt; font-weight:bold; color:#F0B0A8;">04</p>
        <p style="font-family:Georgia, serif; font-size:16pt; color:#FFFFFF; margin-top:4pt;">Then wider</p>
        <p style="font-size:12pt; color:#F0F0F0; margin-top:4pt; line-height:1.25;">One cyber segment first. More documents and rules after.</p>
      </div>
    </div>
    ${foot(13)}
  `),
});

slides.push({
  name: "14-close",
  notes:
    "Close on the file a reinsurer would accept, then the ask. Do not summarize the fourteen slides. The next meeting has three products: their appetite in a form we can version, the baseline for the four measures, and a short list of which feed and which policy fields are in scope. Leave with owners and a date. Do not leave with a phase-two conversation.",
  html: doc(`
    ${mast("Next")}
    <div style="flex:1; background:${DARK}; padding:18pt 32pt 0 32pt; display:flex; flex-direction:column;">
      <p style="font-size:11pt; font-weight:bold; color:#F0B0A8;">CLOSE</p>
      <h1 style="font-family:Georgia, serif; font-size:26pt; line-height:1.1; color:#FFFFFF; margin-top:8pt; width:640pt;">Faster, and still a file you would show a reinsurer.</h1>
      <div style="display:flex; margin-top:16pt;">
        <div style="flex:1; border-top:2pt solid #F0B0A8; padding-top:8pt; margin-right:16pt;">
          <p style="font-size:11pt; font-weight:bold; color:#F0B0A8;">FROM</p>
          <p style="font-size:14pt; color:#FFFFFF; margin-top:6pt; line-height:1.3;">A submission in pieces. Intelligence in other systems. The reason assembled by hand.</p>
        </div>
        <div style="flex:1; border-top:2pt solid #FFFFFF; padding-top:8pt;">
          <p style="font-size:11pt; font-weight:bold; color:#FFFFFF;">TO</p>
          <p style="font-size:14pt; color:#FFFFFF; margin-top:6pt; line-height:1.3;">One file. The signal next to the declaration. A person, and a record of the call.</p>
        </div>
      </div>
    </div>
    <div style="height:92pt; background:#1A1A1A; padding:14pt 32pt 0 32pt;">
      <p style="font-size:10pt; font-weight:bold; color:#F0B0A8;">THE NEXT MEETING</p>
      <p style="font-size:14pt; color:#FFFFFF; margin-top:6pt;">Your appetite, your baseline, and which feed and policy fields are in scope.</p>
    </div>
  `),
});

await mkdir(slidesDir, { recursive: true });
const sharp = require("sharp");
const src = sharp(LOGO_SRC).ensureAlpha();
const { data, info } = await src.raw().toBuffer({ resolveWithObject: true });
for (let i = 0; i < data.length; i += 4) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  if (r > 210 && g > 210 && b > 210) {
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
    data[i + 3] = 255;
  }
}
await sharp(data, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .png()
  .toFile(LOGO_FLAT);
const files = [];
for (const slide of slides) {
  const file = path.join(slidesDir, `${slide.name}.html`);
  await writeFile(file, slide.html, "utf8");
  files.push(file);
}

const pptx = new pptxgen();
pptx.layout = "LAYOUT_16x9";
pptx.title = "Quote faster. Do not loosen the file.";
pptx.author = "Birlasoft";
pptx.subject = "Cyber underwriting, for a carrier or MGA desk";

for (let i = 0; i < files.length; i++) {
  const { slide } = await html2pptx(files[i], pptx);
  slide.addNotes(slides[i].notes);
}

await pptx.writeFile({ fileName: outDownloads });
await pptx.writeFile({ fileName: outRepo });
console.log("Wrote", outDownloads);
