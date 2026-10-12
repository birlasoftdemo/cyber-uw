import { fps } from "../theme";

export const sec = (s: number) => Math.round(s * fps);

export type CineKind = "logo" | "type" | "fragments" | "product" | "closer";

export type CineChapter = {
  id: string;
  durationInFrames: number;
  voStart: number;
  voFile: string | null;
  kind: CineKind;
  title: string;
  /** Word inside title to tint (exact substring). */
  accent?: string;
  subtitle?: string;
  /** Screen name / what. */
  kicker?: string;
  /** Why this screen exists + how it works. */
  why?: string;
  /** Intentional design / user win. */
  win?: string;
  wall?: string;
  screen?: string;
  screenB?: string;
  screenBAt?: number;
  objectPosition?: string;
  zoomFrom?: number;
  zoomTo?: number;
  tiltFrom?: [number, number];
  tiltTo?: [number, number];
  cursorFrom?: [number, number];
  cursorTo?: [number, number];
};

/**
 * Clueso-style investor cut · ~80s @ 30fps.
 * Storyboard spine, Brightcare MVP screens (not TechCorp wireframes).
 */
export const CINE_CHAPTERS: CineChapter[] = [
  {
    id: "00",
    durationInFrames: sec(2.0),
    voStart: 0,
    voFile: null,
    kind: "logo",
    title: "Birlasoft",
    subtitle: "Cyber Submission Automation",
  },
  {
    id: "hook",
    durationInFrames: sec(5.2),
    voStart: 0,
    voFile: null,
    kind: "type",
    title: "What if the pack arrived as a risk story?",
    why: "Today it arrives as attachments. The rest of this film is how the desk turns that pile into a decision.",
    wall: "SUBMISSION",
  },
  {
    id: "01",
    durationInFrames: sec(8.8),
    voStart: sec(0.35),
    voFile: "vo/01.m4a",
    kind: "fragments",
    kicker: "Inbound pack",
    title: "The submission is still four files.",
    subtitle: "Brightcare Digital Health · live prototype",
    why: "Application, questionnaire, IR plan, loss history. Different files. Same risk.",
    win: "Show the mess first. The workbench has to earn the next screen.",
  },
  {
    id: "02",
    durationInFrames: sec(8.0),
    voStart: sec(0.2),
    voFile: "vo/02.m4a",
    kind: "product",
    kicker: "Customer 360",
    title: "One picture before anyone opens a PDF.",
    why: "Limit $5M, revenue $128M, Marsh, 96% complete, signal 84 — Ops and UW see the same first card.",
    win: "Shared first look. Nobody asks “forward me the latest.”",
    screen: "handoff/04-customer-360.png",
    objectPosition: "top center",
    zoomFrom: 1.02,
    zoomTo: 1.1,
    tiltFrom: [5, -8],
    tiltTo: [2, -3],
    cursorFrom: [72, 18],
    cursorTo: [28, 34],
  },
  {
    id: "type-file",
    durationInFrames: sec(4.0),
    voStart: 0,
    voFile: null,
    kind: "type",
    title: "One file. Structured facts.",
    accent: "Structured facts.",
    why: "Extract once. Keep the source on the field. That’s the only way an underwriter trusts a number.",
    wall: "RECORD",
  },
  {
    id: "03",
    durationInFrames: sec(8.0),
    voStart: sec(0.25),
    voFile: "vo/03.m4a",
    kind: "product",
    kicker: "Policy Documents",
    title: "Completeness is a gate, not a vibe.",
    why: "SOC, IRP, ISO, DR drill marked Present. Risk Information stays locked until Documents Complete.",
    win: "You don’t start triage on an empty folder.",
    screen: "handoff/06-policy-documents.png",
    objectPosition: "top center",
    zoomFrom: 1.0,
    zoomTo: 1.08,
    tiltFrom: [4, 7],
    tiltTo: [1, 2],
    cursorFrom: [80, 78],
    cursorTo: [62, 82],
  },
  {
    id: "04",
    durationInFrames: sec(7.8),
    voStart: 0,
    voFile: null,
    kind: "product",
    kicker: "Risk Information",
    title: "Open risks are named questions.",
    why: "MFA, restoration time, HIPAA, aggregate limit — each row is a policy check with an ID, not a mystery flag.",
    win: "The chase list is the screen. Nobody hunts the pack.",
    screen: "handoff/07-risk-information.png",
    objectPosition: "top center",
    zoomFrom: 1.02,
    zoomTo: 1.07,
    tiltFrom: [3, -5],
    tiltTo: [2, 4],
  },
  {
    id: "type-compare",
    durationInFrames: sec(4.2),
    voStart: 0,
    voFile: null,
    kind: "type",
    title: "Risk comparison. Received vs permitted.",
    accent: "Received vs permitted.",
    why: "What the pack said. What the floor requires. Same row — before review burns a day.",
    wall: "COMPARISON",
  },
  {
    id: "05",
    durationInFrames: sec(9.2),
    voStart: sec(0.3),
    voFile: "vo/04.m4a",
    kind: "product",
    kicker: "Risk comparison",
    title: "Received vs permitted. Same row.",
    why: "Coverage can sit as Needs review. MFA can fail the floor. Approve, Ignore, and View source stay on the question.",
    win: "The comparison is the work. You don’t leave the row to hunt a PDF.",
    screen: "handoff/risk-comparison-coverage.png",
    screenB: "handoff/risk-comparison-mfa.png",
    screenBAt: sec(4.2),
    objectPosition: "center center",
    zoomFrom: 1.02,
    zoomTo: 1.08,
    tiltFrom: [3, -4],
    tiltTo: [1, 2],
    cursorFrom: [42, 52],
    cursorTo: [38, 62],
  },
  {
    id: "06",
    durationInFrames: sec(8.6),
    voStart: sec(0.25),
    voFile: "vo/05.m4a",
    kind: "product",
    kicker: "Risk Analysis",
    title: "Rating, ALE, and the book. Same view.",
    why: "762 Advanced. Est. ALE $79M. Stacked exposure $29M against a $5M limit. View sources is one click.",
    win: "Know the book before you bind. This is not a catastrophe model.",
    screen: "handoff/08-risk-analysis.png",
    objectPosition: "top center",
    zoomFrom: 1.0,
    zoomTo: 1.08,
    tiltFrom: [4, 6],
    tiltTo: [1, -2],
    cursorFrom: [70, 40],
    cursorTo: [58, 58],
  },
  {
    id: "07",
    durationInFrames: sec(8.2),
    voStart: sec(0.25),
    voFile: "vo/06.m4a",
    kind: "product",
    kicker: "Getting Ready to Quote",
    title: "Sign the numbers. Then choose.",
    why: "Limit, SIR, stub, Tier 2. AI recommends Quote — labeled assist. The chips stay dead until financial sign-off is recorded.",
    win: "Guidance is not a bound premium. The underwriter still owns the click.",
    screen: "handoff/09-getting-ready-quote.png",
    objectPosition: "bottom center",
    zoomFrom: 1.02,
    zoomTo: 1.1,
    tiltFrom: [3, -4],
    tiltTo: [1, 1],
    cursorFrom: [58, 78],
    cursorTo: [64, 80],
  },
  {
    id: "08",
    durationInFrames: sec(8.0),
    voStart: sec(0.2),
    voFile: "vo/07.m4a",
    kind: "product",
    kicker: "Human in the loop",
    title: "Confirm is the bind. Not the recommendation.",
    why: "The modal says it: human in the loop. Tier assist is not a binding premium. Then the decision locks as Quote.",
    win: "Agents prepare the file. They do not click Confirm.",
    screen: "handoff/09b-decision-confirm.png",
    screenB: "handoff/10-decision-locked.png",
    screenBAt: sec(4.4),
    objectPosition: "center center",
    zoomFrom: 1.0,
    zoomTo: 1.05,
    tiltFrom: [0, 0],
    tiltTo: [2, -2],
  },
  {
    id: "09",
    durationInFrames: sec(8.0),
    voStart: sec(0.35),
    voFile: "vo/08.m4a",
    kind: "closer",
    title: "From fragments to a decision the underwriter can defend.",
    subtitle: "Cyber Submission Automation",
    why: "Built around the desk. Human authority stays on the bind.",
    win: "Agents assist · underwriter binds · every override is explainable",
    wall: "UNDERWRITER",
  },
];

export const CINE_TOTAL_FRAMES = CINE_CHAPTERS.reduce(
  (sum, c) => sum + c.durationInFrames,
  0,
);
