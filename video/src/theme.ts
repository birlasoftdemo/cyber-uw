export const colors = {
  ink: "#1e1e1e",
  muted: "#5c5c5c",
  paper: "#fffcf5",
  white: "#ffffff",
  blue: "#a5d8ff",
  green: "#b2f2bb",
  yellow: "#ffec99",
  orange: "#ffc078",
  pink: "#ffc9c9",
  violet: "#d0bfff",
  gray: "#e9ecef",
  cream: "#fff9db",
  sea: "#0d4f5c",
  foam: "#f5f9fb",
  accent: "#3b5bdb",
} as const;

export const fps = 30;

export const journeySteps = [
  { n: 1, title: "Intake", blurb: "Package lands. Completeness checked.", fill: colors.blue, role: "Ops" },
  { n: 2, title: "Verify", blurb: "Ideal vs Detected. Early chase.", fill: colors.violet, role: "Ops → UW" },
  { n: 3, title: "Tier", blurb: "Appetite rules. Pricing-tier assist.", fill: colors.yellow, role: "UW" },
  { n: 4, title: "Book", blurb: "Shared-vendor watch on the book.", fill: colors.orange, role: "UW" },
  { n: 5, title: "Decide", blurb: "Quote / Refer / Decline — human locks.", fill: colors.green, role: "UW" },
  { n: 6, title: "Sync", blurb: "Approve-before-send to PAS.", fill: colors.gray, role: "System" },
] as const;

export const wins = [
  {
    id: "need",
    label: "User need wins",
    detail: "Attest vs signal gaps — decide & defend with an explainable dossier.",
  },
  {
    id: "speed",
    label: "Shorter turnaround",
    detail: "Ops chases early so underwriters start decision-ready.",
  },
  {
    id: "forms",
    label: "Manage submissions forms",
    detail: "Adaptive packages, templates, and broker outtakes in one place.",
  },
  {
    id: "comms",
    label: "Centralized communication",
    detail: "Referral Inbox — broker chase, notes, and return-to-UW in one hub.",
  },
] as const;
