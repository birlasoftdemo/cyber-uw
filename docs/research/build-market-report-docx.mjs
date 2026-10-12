/**
 * Build polished Word version of the cyber UW assistants market brief.
 * Run: node docs/research/build-market-report-docx.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  LevelFormat,
  Packer,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
  PageBreak,
} from "docx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "CYBER-UW-ASSISTANTS-MARKET-REPORT.docx");

const C = {
  ink: "1A2332",
  body: "2C3340",
  muted: "5B6573",
  line: "D0D7DE",
  headerBg: "1B3A4B",
  headerFg: "FFFFFF",
  accentBg: "E8F1F4",
  altRow: "F6F9FA",
  calloutBg: "FFF8E8",
  calloutBorder: "E0C56E",
  knownBg: "E6F4EA",
  knownFg: "1B5E20",
  estBg: "E8F0FE",
  estFg: "174EA6",
  specBg: "F3E8FD",
  specFg: "6A1B9A",
  white: "FFFFFF",
  cardBorder: "B8C9D1",
};

const PAGE_W = 10224; // Letter with 0.7" margins (12240 - 2*1008)
const thin = { style: BorderStyle.SINGLE, size: 6, color: C.line };
const borders = { top: thin, bottom: thin, left: thin, right: thin };

function p(text, opts = {}) {
  const {
    bold,
    italics,
    size = 20,
    color = C.body,
    after = 120,
    before = 0,
    align,
    heading,
    numbering,
    spacing,
  } = opts;
  return new Paragraph({
    heading,
    numbering,
    alignment: align,
    spacing: spacing ?? { before, after, line: 276 },
    children: [
      new TextRun({
        text,
        bold,
        italics,
        size,
        color,
        font: "Arial",
      }),
    ],
  });
}

function rich(runs, opts = {}) {
  const { after = 120, before = 0, numbering, align, spacing } = opts;
  return new Paragraph({
    numbering,
    alignment: align,
    spacing: spacing ?? { before, after, line: 276 },
    children: runs.map((r) =>
      typeof r === "string"
        ? new TextRun({ text: r, size: 20, color: C.body, font: "Arial" })
        : new TextRun({ size: 20, color: C.body, font: "Arial", ...r })
    ),
  });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160 },
    children: [new TextRun({ text, bold: true, size: 28, color: C.headerBg, font: "Arial" })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text, bold: true, size: 24, color: C.ink, font: "Arial" })],
  });
}

function cell(text, width, opts = {}) {
  const {
    bold = false,
    fill,
    color = C.body,
    size = 16,
    align = AlignmentType.LEFT,
    vAlign = VerticalAlign.TOP,
  } = opts;
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: fill ? { fill, type: ShadingType.CLEAR } : undefined,
    verticalAlign: vAlign,
    children: [
      new Paragraph({
        alignment: align,
        spacing: { before: 40, after: 40, line: 240 },
        children: [
          new TextRun({
            text: String(text ?? ""),
            bold,
            size,
            color,
            font: "Arial",
          }),
        ],
      }),
    ],
  });
}

function headerCell(text, width) {
  return cell(text, width, {
    bold: true,
    fill: C.headerBg,
    color: C.headerFg,
    size: 16,
    align: AlignmentType.LEFT,
    vAlign: VerticalAlign.CENTER,
  });
}

function styledTable(headers, rows, widths) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => headerCell(h, widths[i])),
  });
  const body = rows.map(
    (row, ri) =>
      new TableRow({
        children: row.map((val, ci) =>
          cell(val, widths[ci], {
            fill: ri % 2 === 1 ? C.altRow : C.white,
            size: 15,
          })
        ),
      })
  );
  return new Table({
    columnWidths: widths,
    width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    rows: [headerRow, ...body],
  });
}

function calloutBox(title, body) {
  return new Table({
    columnWidths: [PAGE_W],
    width: { size: PAGE_W, type: WidthType.DXA },
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: {
              top: { style: BorderStyle.SINGLE, size: 12, color: C.calloutBorder },
              bottom: { style: BorderStyle.SINGLE, size: 12, color: C.calloutBorder },
              left: { style: BorderStyle.SINGLE, size: 24, color: C.calloutBorder },
              right: { style: BorderStyle.SINGLE, size: 12, color: C.calloutBorder },
            },
            width: { size: PAGE_W, type: WidthType.DXA },
            shading: { fill: C.calloutBg, type: ShadingType.CLEAR },
            children: [
              new Paragraph({
                spacing: { after: 60 },
                children: [
                  new TextRun({
                    text: title,
                    bold: true,
                    size: 18,
                    color: C.ink,
                    font: "Arial",
                  }),
                ],
              }),
              new Paragraph({
                spacing: { after: 40, line: 260 },
                children: [
                  new TextRun({
                    text: body,
                    size: 17,
                    color: C.body,
                    font: "Arial",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function metricCards(items) {
  const w = Math.floor(PAGE_W / items.length);
  const widths = items.map(() => w);
  // fix last for rounding
  widths[widths.length - 1] = PAGE_W - w * (items.length - 1);
  return new Table({
    columnWidths: widths,
    width: { size: PAGE_W, type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    rows: [
      new TableRow({
        children: items.map((it, i) =>
          new TableCell({
            borders: {
              top: { style: BorderStyle.SINGLE, size: 8, color: C.cardBorder },
              bottom: { style: BorderStyle.SINGLE, size: 8, color: C.cardBorder },
              left: { style: BorderStyle.SINGLE, size: 8, color: C.cardBorder },
              right: { style: BorderStyle.SINGLE, size: 8, color: C.cardBorder },
            },
            width: { size: widths[i], type: WidthType.DXA },
            shading: { fill: C.accentBg, type: ShadingType.CLEAR },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 40 },
                children: [
                  new TextRun({
                    text: it.value,
                    bold: true,
                    size: 32,
                    color: C.headerBg,
                    font: "Arial",
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 20 },
                children: [
                  new TextRun({
                    text: it.label,
                    size: 14,
                    color: C.muted,
                    font: "Arial",
                  }),
                ],
              }),
            ],
          })
        ),
      }),
    ],
  });
}

function spacer(after = 160) {
  return new Paragraph({ spacing: { after }, children: [] });
}

const numbering = {
  config: [
    {
      reference: "exec-bullets",
      levels: [
        {
          level: 0,
          format: LevelFormat.BULLET,
          text: "•",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        },
      ],
    },
    {
      reference: "out-of-scope",
      levels: [
        {
          level: 0,
          format: LevelFormat.BULLET,
          text: "•",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        },
      ],
    },
    {
      reference: "drivers",
      levels: [
        {
          level: 0,
          format: LevelFormat.DECIMAL,
          text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        },
      ],
    },
    {
      reference: "macro",
      levels: [
        {
          level: 0,
          format: LevelFormat.BULLET,
          text: "•",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        },
      ],
    },
    {
      reference: "positioning",
      levels: [
        {
          level: 0,
          format: LevelFormat.BULLET,
          text: "•",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        },
      ],
    },
    {
      reference: "barriers",
      levels: [
        {
          level: 0,
          format: LevelFormat.BULLET,
          text: "•",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        },
      ],
    },
    {
      reference: "switching",
      levels: [
        {
          level: 0,
          format: LevelFormat.BULLET,
          text: "•",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        },
      ],
    },
    {
      reference: "diff",
      levels: [
        {
          level: 0,
          format: LevelFormat.DECIMAL,
          text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        },
      ],
    },
    {
      reference: "consol",
      levels: [
        {
          level: 0,
          format: LevelFormat.BULLET,
          text: "•",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        },
      ],
    },
    {
      reference: "assumptions",
      levels: [
        {
          level: 0,
          format: LevelFormat.BULLET,
          text: "•",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        },
      ],
    },
    {
      reference: "watch",
      levels: [
        {
          level: 0,
          format: LevelFormat.DECIMAL,
          text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        },
      ],
    },
    {
      reference: "segments",
      levels: [
        {
          level: 0,
          format: LevelFormat.DECIMAL,
          text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        },
      ],
    },
    {
      reference: "mistakes",
      levels: [
        {
          level: 0,
          format: LevelFormat.BULLET,
          text: "•",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        },
      ],
    },
    {
      reference: "entrant",
      levels: [
        {
          level: 0,
          format: LevelFormat.DECIMAL,
          text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        },
      ],
    },
    {
      reference: "recheck",
      levels: [
        {
          level: 0,
          format: LevelFormat.BULLET,
          text: "•",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        },
      ],
    },
    {
      reference: "labels",
      levels: [
        {
          level: 0,
          format: LevelFormat.BULLET,
          text: "•",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        },
      ],
    },
  ],
};

const children = [
  // Cover
  new Paragraph({
    spacing: { before: 200, after: 80 },
    children: [
      new TextRun({
        text: "MARKET BRIEF  ·  SEPTEMBER 2026",
        bold: true,
        size: 16,
        color: C.muted,
        font: "Arial",
        allCaps: true,
      }),
    ],
  }),
  new Paragraph({
    spacing: { before: 80, after: 120 },
    children: [
      new TextRun({
        text: "Cyber Insurance Underwriting Assistants",
        bold: true,
        size: 44,
        color: C.headerBg,
        font: "Arial",
      }),
    ],
  }),
  new Paragraph({
    spacing: { after: 200 },
    children: [
      new TextRun({
        text: "A plain-English strategic market brief for builders, buyers, and investors",
        size: 22,
        color: C.muted,
        italics: true,
        font: "Arial",
      }),
    ],
  }),
  spacer(80),
  metricCards([
    { value: "−4%", label: "Global cyber rates Q2 2026 (Marsh)" },
    { value: "12th", label: "Straight quarterly rate decline" },
    { value: "~$435M", label: "Travelers–Corvus (Jan 2024)" },
    { value: "H1→H2", label: "Adoption: chat → orchestrated HITL" },
  ]),
  spacer(200),
  calloutBox(
    "Not an official Gartner report",
    "This brief does not use Gartner’s paid databases or confidential research. It draws on public news and reports, industry commentary, secondary project research, history, and labeled estimates. Re-check Marsh, Aon, and Howden rate reports—and what vendors are shipping—before you put money behind any conclusion."
  ),
  spacer(160),
  p("How to read the evidence labels", { bold: true, size: 18, color: C.ink, after: 80 }),
  rich(
    [
      { text: "Known", bold: true, color: C.knownFg },
      " — you can look it up in a public source.  ",
      { text: "Estimated", bold: true, color: C.estFg },
      " — a reasonable guess from how the market behaves.  ",
      { text: "Speculative", bold: true, color: C.specFg },
      " — “what if” scenarios, not facts to treat as certainty.",
    ],
    { after: 200 }
  ),

  new Paragraph({ children: [new PageBreak()] }),

  // Executive Summary
  h1("Executive Summary"),
  p("Here’s the short version.", { after: 140 }),
  rich(
    [
      { text: "What this market even is. ", bold: true },
      "An underwriting assistant helps a carrier or MGA (a specialized underwriting shop) take in a cyber application, check it against outside security data, match it to appetite rules, recommend quote / refer / decline, and leave a paper trail. A human still binds. It is not the insurance policy, and not a BitSight-style score or CyberCube-style catastrophe model—those are inputs.",
    ],
    { numbering: { reference: "exec-bullets", level: 0 } }
  ),
  rich(
    [
      { text: "What’s going on in cyber insurance (Known + Estimated). ", bold: true },
      "Prices are still falling. Marsh said global cyber rates dropped ",
      { text: "4% in Q2 2026", bold: true },
      " — the ",
      { text: "12th quarter in a row", bold: true },
      ". Capacity is ample and brokers have leverage. Winning tools help desks go fast without quietly accepting weak controls.",
    ],
    { numbering: { reference: "exec-bullets", level: 0 } }
  ),
  rich(
    [
      { text: "Where adoption sits (Estimated). ", bold: true },
      "Lots of form-filling chatbots in pilots. Fewer real staged workflows that catch “EDR everywhere” claims vs scan reality, then force underwriter sign-off.",
    ],
    { numbering: { reference: "exec-bullets", level: 0 } }
  ),
  rich(
    [
      { text: "Who dominates the neighborhood (Known). ", bold: true },
      "Three stacks: tech-forward cyber writers (Coalition, At-Bay, Cowbell, Resilience; Corvus in Travelers); outside ratings (BitSight, SecurityScorecard, Black Kite); portfolio/catastrophe models (CyberCube, Guidewire Cyence). Rebuild-all-three assistants usually fail.",
    ],
    { numbering: { reference: "exec-bullets", level: 0 } }
  ),
  rich(
    [
      { text: "What differentiates. ", bold: true },
      "Control-gap catching, early evidence asks, clear appetite with reasons, shared-vendor warnings, policy-admin sync. Chatbot polish is not the product.",
    ],
    { numbering: { reference: "exec-bullets", level: 0 } }
  ),
  rich(
    [
      { text: "1–3 year base case (Estimated). ", bold: true },
      "Budgets shift from “AI chat on forms” to decision workbenches. Buyers want integrations and explainability—not a Coalition clone. Travelers–Corvus (~$435M, Jan 2024) is the consolidation landmark.",
    ],
    { numbering: { reference: "exec-bullets", level: 0 } }
  ),
  rich(
    [
      { text: "Biggest category risk. ", bold: true },
      "Carriers absorb tooling in-house, or investors believe fantasy market-size numbers that mix premiums with software spend.",
    ],
    { numbering: { reference: "exec-bullets", level: 0 } }
  ),
  rich(
    [
      { text: "Where money is likelier (Estimated). ", bold: true },
      "Mid-market specialty desks competing with Coalition-speed quotes; industrial/OT where files eat hours. SMB straight-through is already crowded.",
    ],
    { numbering: { reference: "exec-bullets", level: 0 } }
  ),

  // Section 1
  h1("1. Market Overview"),
  h2("1.1 What we’re talking about"),
  p(
    "Think of an underwriting desk buried in broker emails, PDFs, and spreadsheets. The assistant turns that mess into a decision the underwriter can defend."
  ),
  spacer(80),
  styledTable(
    ["What it does", "In plain English"],
    [
      ["Intake", "Pulls the application out of PDFs and email into structured fields"],
      ["Enrichment", "Adds outside scores, scans, company info, loss history"],
      ["Gap check", "Flags claimed MFA/EDR/backups vs what external signals show"],
      ["Appetite & triage", "Applies desk rules: quote, refer upstairs, or decline"],
      ["Decision support", "Suggests tier/price ideas, conditions, and a written rationale"],
      ["Book watch", "Warns if too many policies share one vendor or cloud"],
      ["Handoff", "Sends the result into the policy admin system with an audit trail"],
    ],
    [2800, 7280]
  ),
  spacer(140),
  p("Not the main product (but they matter)", { bold: true, size: 18, color: C.ink, after: 80 }),
  p("Cyber insurers that also sell security tools to customers (Coalition Control, At-Bay Stance/MDR, etc.)", {
    numbering: { reference: "out-of-scope", level: 0 },
  }),
  p("Pure security-rating vendors, unless wired into the underwriting workflow", {
    numbering: { reference: "out-of-scope", level: 0 },
  }),
  p("Pure catastrophe / capital models", { numbering: { reference: "out-of-scope", level: 0 } }),
  p("Broker portals that never touch the bind decision", {
    numbering: { reference: "out-of-scope", level: 0 },
  }),
  spacer(80),
  rich([
    { text: "Working thesis (Estimated): ", bold: true, italics: true },
    {
      text: "The underwriter’s real job is check what the applicant claimed against what you can see, then decide and defend that call under time and price pressure—not fill out another form.",
      italics: true,
    },
  ]),

  h2("1.2 How the market looks today"),
  styledTable(
    ["Dimension", "What’s true", "Label"],
    [
      [
        "The cyber insurance line",
        "Soft, competitive, lots of capacity",
        "Known — Marsh Q2 2026 (−4% global; 12th decline); Aon: favorable pricing, cuts slowing",
      ],
      [
        "How desks work",
        "Still questionnaire-heavy; hours spent hunting info",
        "Known/Estimated — practitioner stories; Swiss Re on SME UW cost",
      ],
      [
        "Tech on the desk",
        "Usually 2+ of: outside signals, cat/portfolio model, carrier/MGA telemetry",
        "Estimated",
      ],
      [
        "Assistant products",
        "Fragmented — form tools, specialty AI, posture tools, carrier-built stacks",
        "Known from public product pages",
      ],
      [
        "Real software spend",
        "A slice of cyber premium, not the whole pie",
        "Estimated — be wary of giant “platform market” numbers",
      ],
    ],
    [2400, 3600, 4080]
  ),

  h2("1.3 Why people want these tools"),
  rich(
    [
      { text: "Soft-market speed. ", bold: true },
      "Brokers shop on turnaround and price. Half-day dossiers lose. (Known market; Estimated WTP.)",
    ],
    { numbering: { reference: "drivers", level: 0 } }
  ),
  rich(
    [
      { text: "Apps lie by accident. ", bold: true },
      "Questionnaires describe policy, not reality. IR keeps finding “EDR everywhere” that isn’t. (Known.)",
    ],
    { numbering: { reference: "drivers", level: 0 } }
  ),
  rich(
    [
      { text: "New cyber writers set the bar. ", bold: true },
      "Coalition-style shops quote with live scan data. Legacy desks need orchestration to keep up. (Known models; pressure size Estimated.)",
    ],
    { numbering: { reference: "drivers", level: 0 } }
  ),
  rich(
    [
      { text: "Shared-vendor blowups. ", bold: true },
      "One cloud or MSP outage can hit many policies. Aon and regulators flag portfolio monitoring. (Known.)",
    ],
    { numbering: { reference: "drivers", level: 0 } }
  ),
  rich(
    [
      { text: "Regulators want evidence. ", bold: true },
      "DORA, NIS2, PRA expectations, U.S. misrepresentation fights, EU AI Act transparency. (Known rules; product impact Estimated.)",
    ],
    { numbering: { reference: "drivers", level: 0 } }
  ),
  rich(
    [
      { text: "People are expensive. ", bold: true },
      "Manual UW makes small-business cyber hard to price profitably (Swiss Re theme). (Known narrative.)",
    ],
    { numbering: { reference: "drivers", level: 0 } }
  ),

  h2("1.4 How mature is this stuff?"),
  styledTable(
    ["Stage", "Meaning", "Where we are (Estimated)"],
    [
      ["H1", "Chatbot / LLM that extracts forms", "Common in pilots; easy to demo, easy to shrug off"],
      [
        "H2",
        "Specialist steps + conductor + human sign-off with sources cited",
        "Early real deployments; RFPs starting to sound like this",
      ],
      [
        "H3",
        "Always-on posture + learning from claims / IR",
        "Mostly roadmap; lawyers and privilege get in the way",
      ],
    ],
    [1200, 4200, 4680]
  ),
  spacer(100),
  p(
    "Most buyers sit between H1 and H2. If your RFP ends at “chatbot on the form,” you’re shopping for the wrong KPI. Soft-market discipline is the KPI."
  ),

  h2("1.5 Who buys"),
  styledTable(
    ["Segment", "Buyer", "Need", "Fit"],
    [
      ["Specialty cyber MGA", "Underwriters + ops", "Speed, appetite discipline, maybe white-label", "High"],
      [
        "Carrier cyber desk",
        "UW managers + IT / PAS owners",
        "Integrations, audit, aggregation reports",
        "High",
      ],
      [
        "Reinsurer / portfolio",
        "Cat and cyber analytics",
        "Exposure and accumulation",
        "Medium (more model)",
      ],
      [
        "Broker / wholesaler",
        "Placement teams",
        "Complete submissions, posture story",
        "Adjacent",
      ],
      ["Insured / CISO", "Coverage buyers", "Not the assistant buyer", "Low (InsurSec)"],
    ],
    [2400, 2400, 3600, 1680]
  ),

  h2("1.6 Bigger forces in play"),
  p(
    "Rates stay soft while claim severity, lawsuits, and business interruption keep worrying people. Tools must protect selection, not only speed.",
    { numbering: { reference: "macro", level: 0 } }
  ),
  p(
    "AI in underwriting is now governed (ISO 42001 talk; EU AI Act Art. 50 from Aug 2026).",
    { numbering: { reference: "macro", level: 0 } }
  ),
  p(
    "Carriers buy cyber tech shops (Travelers–Corvus) when they want to own signal-backed underwriting.",
    { numbering: { reference: "macro", level: 0 } }
  ),
  p(
    "Rules and standards (DORA, NIS2, NIST CSF 2.0, ISO 27001:2022) change what “good evidence” looks like.",
    { numbering: { reference: "macro", level: 0 } }
  ),
  p(
    "Threats move hourly. Annual questionnaire snapshots as a method are getting stale even if policies still renew yearly. (Estimated commercial read.)",
    { numbering: { reference: "macro", level: 0 } }
  ),

  // Section 2
  h1("2. How the Market Splits"),
  styledTable(
    ["Cut", "Segments", "Planning note"],
    [
      [
        "Buyer size",
        "Small desk · Mid specialty · Huge carrier",
        "Mid specialty is the sweet spot for standalone tools",
      ],
      [
        "Geography",
        "US · UK/Lloyd’s · EU · APAC / IMEA",
        "U.S. leads premium & InsurSec; EU adds evidence rules; IMEA −14% cyber Q2 2026",
      ],
      [
        "Product type",
        "Digitize · Gap check · Exposure AI · Portfolio · Full workbench",
        "Winners stack layers. One score is not a product.",
      ],
      [
        "Pricing",
        "Seat · Per submission · Platform · White-label · Bundled capacity",
        "White-label works for first installs; SaaS needs hours-saved story",
      ],
      [
        "Use cases",
        "New business · Renewal · Referrals · Book watch · Broker follow-ups",
        "Soft market → new business/renewals; supervisors → book watch",
      ],
      [
        "Maturity",
        "Email · Rules PAS · H1 chat · H2 orchestrated · H3 loop",
        "Most specialty desks still closer to email than H2",
      ],
      [
        "Risk class",
        "SME · Mid-market · Industrial/OT · Tech E&O nearby",
        "OT/industrial burns hours — clearer ROI for deep assistants",
      ],
    ],
    [1800, 3600, 4680]
  ),
  spacer(120),
  rich([
    { text: "Spend ballpark (Estimated, not a market size): ", bold: true },
    "A mid-sized cyber desk handling hundreds to a few thousand submissions a year can often justify ",
    { text: "six figures a year", bold: true },
    " if the tool saves 30–60 minutes per file and catches bad control claims—and plugs into the policy system. Exact WTP is still fuzzy without primary interviews.",
  ]),

  // Section 3
  new Paragraph({ children: [new PageBreak()] }),
  h1("3. Who’s Who"),
  p(
    "Leader / Challenger / … labels are our sorting hat for this brief—not a Gartner Magic Quadrant. Strengths and weaknesses are inferred from public positioning and how insurance tech usually works."
  ),
  spacer(80),
  styledTable(
    ["Vendor", "Bucket", "Strengths", "Weaknesses", "Likely path"],
    [
      [
        "Cytora",
        "Leader (workflow)",
        "Digitization at scale; appetite routing; cyber enrichment partners",
        "Not cyber-only; horizontal UW OS",
        "Deepen cyber packs; multi-line intake",
      ],
      [
        "Guidewire (+ Cyence)",
        "Leader (core)",
        "Owns many carrier policy systems; Cyence portfolio models",
        "Heavy; assistant UX secondary",
        "Embed assistive UW in PolicyCenter",
      ],
      [
        "Concirrus (Inspire)",
        "Challenger",
        "Specialty MGA/carrier focus; AI governance story",
        "Must prove cyber depth",
        "Grow cyber modules; greenfield stacks",
      ],
      [
        "DeNexus (DeRISK UWA)",
        "Challenger",
        "Multi-agent pipeline; OT niche; actuarial-style outputs",
        "Smaller TAM; validation burden",
        "Own industrial cyber; partner for PAS",
      ],
      [
        "BitSight (+ Moody’s)",
        "Niche specialist",
        "Huge coverage; insurers already buy feeds",
        "Score ≠ decision file",
        "Stay enricher; deepen UW packs",
      ],
      [
        "SecurityScorecard / Black Kite",
        "Niche specialist",
        "Continuous outside posture",
        "Commodity risk; not full UW desk",
        "Compete on packaging & APIs",
      ],
      [
        "CyberCube",
        "Niche specialist",
        "Portfolio / systemic scenarios",
        "Wrong tool for single-risk gap board",
        "Capital layer; API into assistants",
      ],
      [
        "Deepinfo & similar",
        "Emerging",
        "Continuous monitoring vs questionnaire",
        "Needs carrier workflow to monetize",
        "Sell evidence into assistants",
      ],
      [
        "ArxNimbus-class",
        "Emerging",
        "Exposure in money terms",
        "Niche distribution; proof burden",
        "Feed APIs into pricing engines",
      ],
      [
        "Coalition",
        "Disruptor (substitute)",
        "Insurance + monitoring + IR; fast quotes",
        "Sells capacity—not a rival toolkit",
        "Raises bar for fast cyber quote",
      ],
      [
        "At-Bay",
        "Disruptor (substitute)",
        "Insurance + MDR; scan-driven speed",
        "Not a multi-carrier toolkit",
        "Presses SMB–mid on speed & security",
      ],
      [
        "Cowbell",
        "Disruptor (substitute)",
        "Continuous scoring; SMB velocity",
        "Less room for enterprise depth",
        "Owns SMB STP; forces legacy automation",
      ],
      [
        "Resilience",
        "Disruptor (substitute)",
        "Risk in dollar language for boards",
        "Less portal-speed story",
        "Pulls buyers toward quant + engineering",
      ],
      [
        "Corvus by Travelers",
        "Disruptor (acquired)",
        "Carrier balance sheet + Smart Cyber",
        "Integration risk; wholesale focus",
        "Case study: buy the tech MGU",
      ],
      [
        "Beazley / AIG / Chubb / AXA XL",
        "Incumbent capacity",
        "Panel quality, claims muscle, big limits",
        "Digital UW experience varies",
        "Buy, partner, or build",
      ],
    ],
    [1680, 1680, 2400, 2160, 2160]
  ),
  spacer(140),
  p("Simple positioning map (Estimated)", { bold: true, size: 18, color: C.ink, after: 80 }),
  rich(
    [
      { text: "Win as an assistant: ", bold: true },
      "gap check + appetite + decision file + book alert + policy-system sync",
    ],
    { numbering: { reference: "positioning", level: 0 } }
  ),
  rich(
    [
      { text: "Partner: ", bold: true },
      "ratings, continuous monitoring, cat engines",
    ],
    { numbering: { reference: "positioning", level: 0 } }
  ),
  rich(
    [
      { text: "Don’t confuse yourself with: ", bold: true },
      "becoming the next Coalition (wrong business for pure software)",
    ],
    { numbering: { reference: "positioning", level: 0 } }
  ),

  // Section 4
  h1("4. How Competition Works"),
  h2("Barriers"),
  p("Messy domain reality: cyber apps, OT supplements, broker chaos, policy-system schemas", {
    numbering: { reference: "barriers", level: 0 },
  }),
  p("Trust: underwriters and compliance hate black-box “decline this” with no cite", {
    numbering: { reference: "barriers", level: 0 },
  }),
  p("Distribution: long insurance sales cycles and panel politics", {
    numbering: { reference: "barriers", level: 0 },
  }),
  p("Signal cost: useful enrichment often means paying for BitSight-class feeds", {
    numbering: { reference: "barriers", level: 0 },
  }),
  p("AI rules: transparency and human oversight, especially in the EU", {
    numbering: { reference: "barriers", level: 0 },
  }),

  h2("Switching costs"),
  rich(
    [
      { text: "High ", bold: true },
      "once appetite rules, past decisions, and policy-system adapters live in the tool",
    ],
    { numbering: { reference: "switching", level: 0 } }
  ),
  rich(
    [
      { text: "Medium ", bold: true },
      "for pure extraction chatbots (easy to swap)",
    ],
    { numbering: { reference: "switching", level: 0 } }
  ),
  rich(
    [
      { text: "Lower ", bold: true },
      "for a lone score with no decision dossier",
    ],
    { numbering: { reference: "switching", level: 0 } }
  ),

  h2("Pricing pressure"),
  p(
    "Soft insurance market means you sell on hours saved and fewer bad risks—not an “AI tax.” Horizontal platforms can throw cyber in as a module and squeeze niche pricing. Consulting / white-label has thinner margins but an easier first conversation."
  ),

  h2("What still differentiates"),
  p("Quality of the gap board and the follow-up questions it generates", {
    numbering: { reference: "diff", level: 0 },
  }),
  p("Appetite rules you can version, test, and override with an audit log", {
    numbering: { reference: "diff", level: 0 },
  }),
  p("Explainability — cite the source; underwriter binds", {
    numbering: { reference: "diff", level: 0 },
  }),
  p("Book alerts that are useful without pretending to be a full catastrophe model", {
    numbering: { reference: "diff", level: 0 },
  }),
  p("Time-to-value inside the email + policy-system world desks already live in", {
    numbering: { reference: "diff", level: 0 },
  }),

  h2("Consolidation"),
  rich(
    [
      { text: "Known: ", bold: true },
      "Travelers–Corvus (~$435M, Jan 2024) — carriers buying tech MGUs to own signal-backed UW",
    ],
    { numbering: { reference: "consol", level: 0 } }
  ),
  rich(
    [
      { text: "Estimated: ", bold: true },
      "More tuck-ins of enrichment vendors; specialty AI UW shops become targets",
    ],
    { numbering: { reference: "consol", level: 0 } }
  ),
  p("Chatbot startups with no cyber spine: cheap exits or quiet deaths", {
    numbering: { reference: "consol", level: 0 },
  }),

  h2("Lock-in and substitutes"),
  p(
    "Desks already run multi-vendor stacks. Assistants that become the hub gain gravity. InsurSec writers lock customers in at the policy layer."
  ),
  spacer(80),
  styledTable(
    ["Substitute", "Threat", "Why"],
    [
      ["InsurSec MGA platforms", "High", "UW tooling lives inside the product"],
      ["Core policy-system AI modules", "Medium–High", "Procurement likes one vendor"],
      ["Ratings portal + spreadsheet", "Medium", "Status quo is sticky"],
      ["Offshore / BPO underwriting ops", "Medium", "Labor arbitrage vs software"],
      ["Broker portals alone", "Low–Medium", "They don’t own the bind"],
    ],
    [3600, 1800, 4680]
  ),

  // Section 5
  new Paragraph({ children: [new PageBreak()] }),
  h1("5. Forecast: Next 1–3 Years"),
  p("Shared assumptions", { bold: true, size: 18, color: C.ink, after: 80 }),
  p("Cyber stays a real commercial line; ransomware, BI, and privacy losses don’t vanish", {
    numbering: { reference: "assumptions", level: 0 },
  }),
  p(
    "Soft market eases but doesn’t flip hard overnight without a capital shock (Estimated)",
    { numbering: { reference: "assumptions", level: 0 } }
  ),
  p("AI governance gets stricter, not looser", {
    numbering: { reference: "assumptions", level: 0 },
  }),
  p("No single open form standard replaces carrier-specific apps in this window", {
    numbering: { reference: "assumptions", level: 0 },
  }),
  spacer(100),
  styledTable(
    ["Scenario", "What we’d have to believe", "What probably happens", "Confidence"],
    [
      [
        "Base",
        "Rate cuts keep slowing; vendors land a few reference deals; ratings stay partners; a couple more tuck-ins",
        "Spend grows unevenly. Orchestrators with PAS depth win. Chat-only stalls.",
        "Medium",
      ],
      [
        "Optimistic",
        "Near-miss or loss-ratio spike; supervisors push aggregation; buyers standardize on decision files",
        "Email/PDF displaced fast. Gap+appetite platforms charge more.",
        "Low–Medium",
      ],
      [
        "Pessimistic",
        "Soft market + carrier build/buy; InsurSec takes share; AI pilots fail ROI; data friction",
        "Assistants become a PAS checkbox. Niche retreat to OT/APIs.",
        "Medium",
      ],
    ],
    [1400, 3000, 3600, 2080]
  ),
  spacer(140),
  rich([
    { text: "What could grow the category: ", bold: true },
    "quote-speed competition vs InsurSec; EU/UK evidence rules; specialty UW labor cost; board focus on aggregation; cheaper partner APIs.",
  ]),
  rich([
    { text: "What could stall it: ", bold: true },
    "“Why not just use Coalition?”; painful PAS integrations; legal walls between claims/IR and UW; AI pilot fatigue; fake giant market-size stories.",
  ]),
  spacer(80),
  p("Watch these dials", { bold: true, size: 18, color: C.ink, after: 80 }),
  p("Marsh / Aon / Howden cyber rates and loss-ratio commentary", {
    numbering: { reference: "watch", level: 0 },
  }),
  p("New cyber logos for Cytora / Concirrus / DeNexus-class vendors", {
    numbering: { reference: "watch", level: 0 },
  }),
  p("More carriers buying cyber tech MGUs or UW AI shops", {
    numbering: { reference: "watch", level: 0 },
  }),
  p("Supervisor language on aggregation tools and AI in underwriting", {
    numbering: { reference: "watch", level: 0 },
  }),
  p("Share of files decided with scans vs questionnaire-only", {
    numbering: { reference: "watch", level: 0 },
  }),
  p("Whether BitSight / CyberCube package deeper into UW workflows", {
    numbering: { reference: "watch", level: 0 },
  }),

  // Section 6
  h1("6. Opportunities"),
  styledTable(
    ["Who", "Opportunity", "Why it’s real", "What it takes"],
    [
      [
        "Incumbents (PAS / digitization)",
        "Ship real cyber H2 modules",
        "They already own intake; cyber needs domain depth",
        "Cyber talent; rating/cat partners; UW UX",
      ],
      [
        "Startups",
        "Own gap check + decision file for mid MGAs",
        "InsurSec won’t sell a toolkit to rivals",
        "Narrow ICP; connectors; human override",
      ],
      [
        "Investors",
        "Back orchestration hubs & OT niches; skip pure chat",
        "Need for fast-but-disciplined UW; tuck-in exits",
        "Diligence on PAS depth, signal COGS, UW interviews",
      ],
      [
        "Builders",
        "Decision workbench pattern",
        "Clear job; demoable spine",
        "Explainability; swappable appetite; partner feeds",
      ],
      [
        "Carrier / MGA buyers",
        "Cut research tax; defend selection; stay audit-ready",
        "Soft market + supervisor pressure",
        "Demand human bind; RFP integrations; renewals pilot",
      ],
      [
        "Consultancies / SIs",
        "White-label accelerators & adapters",
        "Personalization without greenfield product risk",
        "Cyber UW experts; reusable adapters; outcome SLAs",
      ],
    ],
    [2200, 2600, 2640, 2640]
  ),

  // Section 7
  h1("7. Risks and Constraints"),
  styledTable(
    ["Risk", "What it is", "Why you should care"],
    [
      [
        "AI / regulatory rules",
        "EU AI Act; automated-decision notices; cross-border dossiers",
        "Design cost; blocked features if silent auto-bind",
      ],
      [
        "Misrepresentation spillover",
        "U.S. practice when apps overclaim controls",
        "Invented answers = legal risk",
      ],
      ["“AI underwriting” fatigue", "Too many pilots", "Longer sales; ROI proof required"],
      [
        "Adoption",
        "UW distrust of black boxes; email culture",
        "Shelfware if humans aren’t in the loop",
      ],
      [
        "Tech limits",
        "Outside scans ≠ internal control quality; OT blind spots",
        "Overclaiming gap boards create false confidence",
      ],
      [
        "Competition",
        "InsurSec substitutes; PAS feature absorption",
        "Standalone margins get crushed",
      ],
      [
        "Margins",
        "Soft insurance line; paid signal feeds",
        "Need clear cost per submission",
      ],
      [
        "Platform dependency",
        "BitSight / model APIs / policy systems",
        "Pricing and roadmap can get held hostage",
      ],
      [
        "Macro cyber event",
        "Could harden pricing or overwhelm weak automation",
        "See scenarios in §5",
      ],
      [
        "Dirty data",
        "Messy broker packs",
        "Extraction has a ceiling without human review",
      ],
    ],
    [2400, 3840, 3840]
  ),

  // Section 8
  new Paragraph({ children: [new PageBreak()] }),
  h1("8. Emerging Trends"),
  styledTable(
    ["#", "Trend", "What’s happening", "Why it matters", "Who benefits", "Who’s threatened"],
    [
      [
        "1",
        "Gap checks as table stakes",
        "Cross-check apps with outside posture",
        "Questionnaire-only UW looks weak",
        "Gap-board tools; ratings",
        "Pure form portals",
      ],
      [
        "2",
        "H2 orchestration",
        "Specialist steps + human sign-off",
        "Buyers ask for audit & stages",
        "Concirrus/DeNexus/Cytora-class",
        "H1 chatbot startups",
      ],
      [
        "3",
        "Disciplined speed",
        "Rates still cut; brokers call shots",
        "Protect selection and cycle time",
        "Explainable Q/R/D platforms",
        "Slow traditional desks",
      ],
      [
        "4",
        "Book risk at quote time",
        "Shared cloud/MSP awareness",
        "Single-risk tools incomplete",
        "Portfolio-aware assistants",
        "Tools ignoring the book",
      ],
      [
        "5",
        "InsurSec as catalyst",
        "Coalition et al. set UX bar",
        "Forces legacy shops to automate",
        "Tech MGAs; acquiring carriers",
        "Capacity with no digital muscle",
      ],
      [
        "6",
        "Carrier M&A of cyber tech",
        "Travelers–Corvus pattern",
        "Build-vs-buy tips toward buy",
        "Acquirers; scarce UW talent",
        "MGUs without a moat",
      ],
      [
        "7",
        "Evidence packs",
        "DORA/NIS2/PRA/ISO reshape asks",
        "Dossier becomes product surface",
        "Adaptive intake + evidence vaults",
        "Static PDF questionnaires",
      ],
      [
        "8",
        "Ratings × workflow deals",
        "Cytora–VulnCheck; BitSight–Moody’s",
        "Enrichment at decision time",
        "Partner ecosystems",
        "Isolated score portals",
      ],
      [
        "9",
        "OT / industrial depth",
        "Multi-hour complex submissions",
        "Clearer ROI for deep assistants",
        "DeNexus-class; OT specialists",
        "Generic SME STP in that niche",
      ],
      [
        "10",
        "AI governance as sales feature",
        "ISO 42001 / SOC 2 / explainability",
        "RFP checkbox in EU/UK",
        "Compliant platforms",
        "Opaque model vendors",
      ],
    ],
    [600, 1680, 2040, 1920, 1920, 1920]
  ),

  // Section 9
  h1("9. What To Do With This"),
  h2("Where the market is going"),
  p(
    "Toward workbenches that pull in ratings and cat signals, catch attestation gaps, enforce appetite with a human bind, and leave an audit trail—while the soft market screams for speed. Away from annual questionnaire theater and lonely chat demos."
  ),

  h2("Best segments near-term"),
  p(
    "Specialty mid-market MGA/carrier cyber desks competing with InsurSec speed but keeping their own paper",
    { numbering: { reference: "segments", level: 0 } }
  ),
  p("Complex / OT industrial cyber where hours per file justify depth", {
    numbering: { reference: "segments", level: 0 },
  }),
  p(
    "EU/UK financial and essential-entity books where evidence packs aren’t optional",
    { numbering: { reference: "segments", level: 0 } }
  ),
  p(
    "Less attractive soon: pure SMB straight-through already owned by Cowbell-class writers; reinsurer cat modeling (different category)."
  ),

  h2("Best-positioned player type"),
  p(
    "Orchestrators with a real cyber spine and a path into the policy system. Not score vendors alone. Not “we’re an insurer, but software-only” clones. Partnering with BitSight/CyberCube-class feeds is a feature, not a lack of ambition."
  ),

  h2("Mistakes to avoid"),
  p("Pitching “next Coalition” with no capacity and no claims desk", {
    numbering: { reference: "mistakes", level: 0 },
  }),
  p("Shipping chat without gap checks, appetite, and audit", {
    numbering: { reference: "mistakes", level: 0 },
  }),
  p("Rebuilding ratings or full cat models in version one", {
    numbering: { reference: "mistakes", level: 0 },
  }),
  p("Silent auto-bind or invented control answers", {
    numbering: { reference: "mistakes", level: 0 },
  }),
  p("Selling only extraction when the job is decide and defend", {
    numbering: { reference: "mistakes", level: 0 },
  }),
  p("Treating mega “TAM” slides as software reality", {
    numbering: { reference: "mistakes", level: 0 },
  }),

  h2("If you’re a new entrant"),
  p("Pick one customer type (say: U.S. specialty cyber MGA desk).", {
    numbering: { reference: "entrant", level: 0 },
  }),
  p(
    "Ship the H2 spine: messy intake → gap board → appetite quote/refer/decline → dossier → policy-system stub.",
    { numbering: { reference: "entrant", level: 0 } }
  ),
  p("Partner signals on day one (mocked is fine); go live in phase two.", {
    numbering: { reference: "entrant", level: 0 },
  }),
  p(
    "Measure time to a decision-ready file, % of attestation conflicts caught before quote, % of decisions with a written rationale.",
    { numbering: { reference: "entrant", level: 0 } }
  ),
  p("Design for underwriter override and regulatory disclosure from day one.", {
    numbering: { reference: "entrant", level: 0 },
  }),
  p("Price against hours saved and bad risks avoided — not AI mystique.", {
    numbering: { reference: "entrant", level: 0 },
  }),
  p(
    "Plan scale or exit through a policy-system ecosystem or a carrier tuck-in. Perpetual standalone SaaS is a wish, not a plan.",
    { numbering: { reference: "entrant", level: 0 } }
  ),

  h2("For Decision Workbench builders"),
  p(
    "The product that makes commercial sense is an enablement layer for desks, not an InsurSec carrier. Credibility is gap + appetite + dossier + book alert — not “we replaced BitSight.”"
  ),

  // Section 10
  h1("10. Known vs Estimated vs Speculative"),
  styledTable(
    ["Type", "Examples"],
    [
      [
        "Known / public",
        "Marsh GIMI Q2 2026 (−4%, 12th drop); Aon soft-market commentary; Travelers–Corvus (~$435M, Jan 2024); public vendor positioning; DORA (Jan 2025), NIS2, PRA SS4/17 themes, EU AI Act Art. 50 (Aug 2026); ISO 27001:2022 cutoff (31 Oct 2025)",
      ],
      [
        "Estimated / inferred",
        "Digitization early-majority; H2 cyber spines early-adopter; six-figure ACV plausible for mid desks; more tuck-ins; soft market drives “disciplined speed”; WTP higher for gap+appetite than chat; OT/complex clearer ROI",
      ],
      [
        "Speculative / scenario",
        "Hard-market forcing dossier standards; absorption into PAS/InsurSec; H3 claims↔IR learning in 3 years; naming winners without win/loss data; precise global TAM for this software category",
      ],
    ],
    [2400, 7680]
  ),
  spacer(140),
  p("Re-check before you act", { bold: true, size: 18, color: C.ink, after: 80 }),
  p("Marsh Global Insurance Market Index (cyber) — quarterly", {
    numbering: { reference: "recheck", level: 0 },
  }),
  p("Aon / Howden cyber outlooks", { numbering: { reference: "recheck", level: 0 } }),
  p("Vendor sites and partnership announcements", {
    numbering: { reference: "recheck", level: 0 },
  }),
  p("Supervisor publications (PRA, EIOPA, NAIC) on cyber UW and AI", {
    numbering: { reference: "recheck", level: 0 },
  }),
  p("Primary underwriter interviews — still the biggest evidence hole", {
    numbering: { reference: "recheck", level: 0 },
  }),

  spacer(280),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200 },
    border: {
      top: { style: BorderStyle.SINGLE, size: 6, color: C.line, space: 12 },
    },
    children: [
      new TextRun({
        text: "End of brief  ·  For planning and research — not investment advice  ·  Not affiliated with Gartner",
        size: 15,
        color: C.muted,
        italics: true,
        font: "Arial",
      }),
    ],
  }),
];

const doc = new Document({
  creator: "Cyber UW Research",
  title: "Cyber Insurance Underwriting Assistants — Market Brief",
  description:
    "Plain-English strategic market brief on cyber insurance underwriting assistants. Not an official Gartner report.",
  styles: {
    default: {
      document: {
        run: { font: "Arial", size: 20, color: C.body },
      },
    },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 28, bold: true, color: C.headerBg, font: "Arial" },
        paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 0 },
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 24, bold: true, color: C.ink, font: "Arial" },
        paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 1 },
      },
    ],
  },
  numbering,
  sections: [
    {
      properties: {
        page: {
          margin: { top: 1008, right: 1008, bottom: 1008, left: 1008 }, // 0.7"
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              border: {
                bottom: { style: BorderStyle.SINGLE, size: 6, color: C.line, space: 8 },
              },
              spacing: { after: 120 },
              children: [
                new TextRun({
                  text: "Cyber UW Assistants  ·  Market Brief  ·  Sep 2026",
                  size: 14,
                  color: C.muted,
                  font: "Arial",
                }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              border: {
                top: { style: BorderStyle.SINGLE, size: 6, color: C.line, space: 8 },
              },
              spacing: { before: 80 },
              children: [
                new TextRun({
                  text: "Public / secondary synthesis  ·  Page ",
                  size: 14,
                  color: C.muted,
                  font: "Arial",
                }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  size: 14,
                  color: C.muted,
                  font: "Arial",
                }),
                new TextRun({
                  text: " of ",
                  size: 14,
                  color: C.muted,
                  font: "Arial",
                }),
                new TextRun({
                  children: [PageNumber.TOTAL_PAGES],
                  size: 14,
                  color: C.muted,
                  font: "Arial",
                }),
              ],
            }),
          ],
        }),
      },
      children,
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(OUT, buffer);
console.log(`Wrote ${OUT} (${buffer.length} bytes)`);
