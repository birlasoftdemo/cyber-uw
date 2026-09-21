import { fps } from "../theme";

/** Spotlight focus as % of the product frame (inset chrome). */
export type SpotlightFocus = {
  x: number;
  y: number;
  rx: number;
  ry: number;
  label: string;
};

export type LaunchChapter = {
  id: string;
  /** Frames for this chapter (includes VO lead-in + tail hold). */
  durationInFrames: number;
  /** Frame offset inside chapter when VO starts. */
  voStart: number;
  voFile: string | null;
  eyebrow: string;
  title: string;
  caption?: string;
  screen?: string;
  zoomFrom?: number;
  zoomTo?: number;
  focus?: SpotlightFocus;
  /** Second focus that crossfades mid-chapter (optional). */
  focusB?: SpotlightFocus;
  focusBAt?: number;
  overlay?: "chips" | "hitl" | "pas";
  kind?: "cold" | "screen" | "closer";
};

const sec = (s: number) => Math.round(s * fps);

/**
 * Durations sized to Flo VO (see public/vo/durations.json) + lead-in + tail hold.
 * Total ≈ 91s @ 30fps.
 */
export const LAUNCH_CHAPTERS: LaunchChapter[] = [
  {
    id: "01",
    durationInFrames: sec(9.0),
    voStart: sec(0.7),
    voFile: "vo/01.m4a",
    eyebrow: "Cyber underwriting",
    title: "Attestation isn’t reality.",
    caption: "Soft market pressure meets hard signal truth.",
    kind: "cold",
  },
  {
    id: "02",
    durationInFrames: sec(8.4),
    voStart: sec(0.55),
    voFile: "vo/02.m4a",
    eyebrow: "Decision Workbench",
    title: "One workbench.",
    caption: "Ops + underwriting. AI search finds the case worth opening.",
    screen: "walkthrough/03-manage-submissions.png",
    zoomFrom: 1.0,
    zoomTo: 1.08,
    focus: {
      x: 48,
      y: 11,
      rx: 22,
      ry: 7,
      label: "AI search",
    },
    focusB: {
      x: 42,
      y: 42,
      rx: 38,
      ry: 10,
      label: "Case queue",
    },
    focusBAt: sec(3.8),
    kind: "screen",
  },
  {
    id: "03",
    durationInFrames: sec(7.2),
    voStart: sec(0.5),
    voFile: "vo/03.m4a",
    eyebrow: "Intake",
    title: "Package lands.",
    caption: "Agents begin thinking the moment the package arrives.",
    screen: "walkthrough/06-ops-decision-desk-feedback.png",
    zoomFrom: 1.02,
    zoomTo: 1.1,
    focus: {
      x: 72,
      y: 28,
      rx: 18,
      ry: 16,
      label: "Agent thinking",
    },
    kind: "screen",
  },
  {
    id: "04",
    durationInFrames: sec(8.2),
    voStart: sec(0.5),
    voFile: "vo/04.m4a",
    eyebrow: "Verify · Gap board",
    title: "Ideal vs Detected.",
    caption: "Every material gap cites its signal.",
    screen: "walkthrough/06-ops-decision-desk-feedback.png",
    zoomFrom: 1.04,
    zoomTo: 1.12,
    focus: {
      x: 48,
      y: 48,
      rx: 36,
      ry: 22,
      label: "Ideal vs Detected",
    },
    focusB: {
      x: 48,
      y: 58,
      rx: 40,
      ry: 12,
      label: "Signal cite-back",
    },
    focusBAt: sec(3.6),
    kind: "screen",
  },
  {
    id: "05",
    durationInFrames: sec(8.6),
    voStart: sec(0.5),
    voFile: "vo/05.m4a",
    eyebrow: "Tier",
    title: "Tier is guidance.",
    caption: "Appetite assist — not a bound premium.",
    screen: "walkthrough/07-uw-decision-desk.png",
    zoomFrom: 1.02,
    zoomTo: 1.09,
    focus: {
      x: 55,
      y: 36,
      rx: 28,
      ry: 14,
      label: "Appetite / tier assist",
    },
    kind: "screen",
  },
  {
    id: "06",
    durationInFrames: sec(8.5),
    voStart: sec(0.5),
    voFile: "vo/06.m4a",
    eyebrow: "Review Risk",
    title: "Stacked exposure.",
    caption: "Know the book before you bind. Estimated ALE.",
    screen: "walkthrough/08-uw-review-risk.png",
    zoomFrom: 1.0,
    zoomTo: 1.08,
    focus: {
      x: 50,
      y: 38,
      rx: 34,
      ry: 18,
      label: "ALE · stacked exposure",
    },
    kind: "screen",
  },
  {
    id: "07",
    durationInFrames: sec(9.0),
    voStart: sec(0.5),
    voFile: "vo/07.m4a",
    eyebrow: "Decide",
    title: "Quote · Refer · Decline",
    caption: "AI recommendation with confidence — UW still owns the chip.",
    screen: "walkthrough/08-uw-review-risk.png",
    zoomFrom: 1.0,
    zoomTo: 1.04,
    focus: {
      x: 50,
      y: 78,
      rx: 34,
      ry: 14,
      label: "AI recommend chips",
    },
    overlay: "chips",
    kind: "screen",
  },
  {
    id: "08",
    durationInFrames: sec(6.9),
    voStart: sec(0.45),
    voFile: "vo/08.m4a",
    eyebrow: "Referral Inbox",
    title: "Centralized chase.",
    caption: "Remind · Resolve · Return — one hub, not five inboxes.",
    screen: "walkthrough/05-referral-inbox.png",
    zoomFrom: 1.0,
    zoomTo: 1.07,
    focus: {
      x: 42,
      y: 46,
      rx: 36,
      ry: 20,
      label: "Chase hub",
    },
    kind: "screen",
  },
  {
    id: "09",
    durationInFrames: sec(9.4),
    voStart: sec(0.5),
    voFile: "vo/09.m4a",
    eyebrow: "Human-in-the-loop",
    title: "Underwriter binds.",
    caption: "Agents assist. Every override stays explainable.",
    screen: "walkthrough/07-uw-decision-desk.png",
    zoomFrom: 1.0,
    zoomTo: 1.03,
    focus: {
      x: 50,
      y: 48,
      rx: 26,
      ry: 22,
      label: "HITL confirm",
    },
    overlay: "hitl",
    kind: "screen",
  },
  {
    id: "10",
    durationInFrames: sec(7.1),
    voStart: sec(0.45),
    voFile: "vo/10.m4a",
    eyebrow: "Sync · Closure",
    title: "Approve before send.",
    caption: "Push to policy admin when you’re ready.",
    screen: "walkthrough/07-uw-decision-desk.png",
    zoomFrom: 1.0,
    zoomTo: 1.04,
    focus: {
      x: 78,
      y: 78,
      rx: 18,
      ry: 12,
      label: "Approve → PAS",
    },
    overlay: "pas",
    kind: "screen",
  },
  {
    id: "11",
    durationInFrames: sec(9.0),
    voStart: sec(0.6),
    voFile: "vo/11.m4a",
    eyebrow: "Birlasoft IP accelerator",
    title: "Agents assist · underwriter binds · every override is explainable",
    kind: "closer",
  },
];

export const LAUNCH_TOTAL_FRAMES = LAUNCH_CHAPTERS.reduce(
  (sum, c) => sum + c.durationInFrames,
  0,
);
