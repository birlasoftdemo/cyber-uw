import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  Series,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ScreenBeat } from "./components/ScreenBeat";
import { colors, fps, wins } from "./theme";

/**
 * Product demo walkthrough — Ops shipping arc → UW Northwind stage arc.
 * Screens: video/public/walkthrough/ (refresh via `node scripts/capture-walkthrough.mjs`).
 */
export const SCENE = {
  login: 3 * fps,
  // —— Ops persona ——
  opsShipping: 6 * fps,
  opsModules: 7 * fps,
  opsShipReturned: 6 * fps,
  opsProceed: 6 * fps,
  opsHandoff: 5 * fps,
  opsInbox: 6 * fps,
  handoff: 4 * fps,
  // —— Cyber UW persona ——
  uwInsights: 6 * fps,
  uwGapBacklog: 6 * fps,
  uwNorthwind: 6 * fps,
  uwFeedback: 7 * fps,
  uwReviewRisk: 7 * fps,
  uwReviewPlatform: 6 * fps,
  uwClosure: 7 * fps,
  uwRefs: 5 * fps,
  closer: 9 * fps,
} as const;

export const TOTAL_FRAMES = Object.values(SCENE).reduce((a, b) => a + b, 0);

export const ProductWalkthrough: React.FC = () => {
  return (
    <AbsoluteFill>
      <Series>
        <Series.Sequence durationInFrames={SCENE.login}>
          <ScreenBeat
            src="walkthrough/01-login.png"
            eyebrow="Start · Cyber Underwriting Dashboard"
            title="One workbench for Ops and Underwriting."
            caption="Ship forms, chase gaps, decide — without email ping-pong."
            zoomFrom={1.02}
            zoomTo={1.08}
          />
        </Series.Sequence>

        {/* ——— Ops: shipping → modules → ship → returned → closure → handoff → inbox ——— */}
        <Series.Sequence durationInFrames={SCENE.opsShipping}>
          <ScreenBeat
            src="walkthrough/03-manage-submissions.png"
            eyebrow="Cyber Ops · Manage Submissions"
            title="Start from shipping — every broker outtake in one queue."
            caption="Sent → In progress → Returned. Proceed to closure when the package is back."
            win="Win · Manage forms"
            zoomFrom={1}
            zoomTo={1.05}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE.opsModules}>
          <ScreenBeat
            src="walkthrough/11-ops-module-builder.png"
            eyebrow="Ops · Form parameter builder"
            title="Select modules for the questionnaire."
            caption="Toggle adaptive modules — Firmographics, Identity, Endpoint, Email — then Send form."
            win="Win · Manage forms"
            zoomFrom={1}
            zoomTo={1.06}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE.opsShipReturned}>
          <ScreenBeat
            src="walkthrough/12-ops-returned-and-ship.png"
            eyebrow="Ops · Shared outtakes"
            title="Ship the template — then track the return."
            caption="Returned packages unlock Proceed to closure. No more inbox archaeology."
            win="Win · Shorter turnaround"
            zoomFrom={1}
            zoomTo={1.05}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE.opsProceed}>
          <ScreenBeat
            src="walkthrough/13-ops-proceed-closure-desk.png"
            eyebrow="Ops · Decision Desk · Feedback"
            title="Proceed to closure — chase Ideal vs Detected."
            caption="Ops owns New + Feedback. Resolve or Refer material gaps before handoff."
            win="Win · Shorter turnaround"
            zoomFrom={1}
            zoomTo={1.06}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE.opsHandoff}>
          <ScreenBeat
            src="walkthrough/14-ops-uw-handoff.png"
            eyebrow="Ops · Ready for UW"
            title="Package clear — hand off to underwriting."
            caption="Ready for UW moves risk judgment and financial authority to the Decision Desk."
            win="Win · Shorter turnaround"
            zoomFrom={1}
            zoomTo={1.05}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE.opsInbox}>
          <ScreenBeat
            src="walkthrough/05-referral-inbox.png"
            eyebrow="Ops · Referral Inbox"
            title="Centralized chase — Remind, Resolve, Return to UW."
            caption="Gaps, missing package, risk escalations. One hub instead of five inboxes."
            win="Win · Centralized communication"
            zoomFrom={1}
            zoomTo={1.05}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE.handoff}>
          <HandoffCard />
        </Series.Sequence>

        {/* ——— Cyber UW: insights → gap backlog → Northwind → stages + sign-offs ——— */}
        <Series.Sequence durationInFrames={SCENE.uwInsights}>
          <ScreenBeat
            src="walkthrough/15-uw-insights.png"
            eyebrow="Cyber UW · Insights"
            title="Land on the dashboard — portfolio pulse first."
            caption="Median days · completeness · pipeline limit · gap-blocked backlog."
            win="Win · User need wins"
            zoomFrom={1}
            zoomTo={1.05}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE.uwGapBacklog}>
          <ScreenBeat
            src="walkthrough/16-uw-gap-backlog-drill.png"
            eyebrow="UW · Gap-blocked backlog"
            title="Click the gap backlog — open the case that matters."
            caption="Drill-down lists Northwind Health Systems (CYB-2401) ready to Open."
            win="Win · User need wins"
            zoomFrom={1.02}
            zoomTo={1.08}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE.uwNorthwind}>
          <ScreenBeat
            src="walkthrough/07-uw-decision-desk.png"
            eyebrow="UW · Northwind · New → Feedback"
            title="Northwind Health Systems — New signed, Feedback active."
            caption="Demo case for Cyber UW. Stepper shows New completed; Feedback owns the chase."
            win="Win · User need wins"
            zoomFrom={1}
            zoomTo={1.04}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE.uwFeedback}>
          <ScreenBeat
            src="walkthrough/08-uw-feedback-ideal-detected.png"
            eyebrow="UW · Feedback · Ideal vs Detected"
            title="Sign off gaps — Resolve or Refer with cite-back."
            caption="MFA critical open · EDR referred. Clear material gaps before Review Risk."
            win="Win · User need wins"
            zoomFrom={1}
            zoomTo={1.06}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE.uwReviewRisk}>
          <ScreenBeat
            src="walkthrough/17-uw-review-risk.png"
            eyebrow="UW · Review Risk · sign-offs"
            title="Own each threat and impact judgment."
            caption="Accept / Escalate / Note on required items — then Continue to Review Platform."
            win="Win · User need wins"
            zoomFrom={1}
            zoomTo={1.05}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE.uwReviewPlatform}>
          <ScreenBeat
            src="walkthrough/18b-uw-review-platform-signed.png"
            eyebrow="UW · Review Platform · signed"
            title="Concentration cards signed — Watch / Terms / Block."
            caption="Shared IdP, SaaS, MSP, cloud, sector aggregate — every card has a sign-off."
            win="Win · User need wins"
            zoomFrom={1}
            zoomTo={1.05}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE.uwClosure}>
          <ScreenBeat
            src="walkthrough/09-uw-closure.png"
            eyebrow="UW · Closure · financial sign-off"
            title="Lock limit, SIR, tier — then Quote / Refer / Decline."
            caption="Manager cosign when over authority. Financial sign-off before PAS sync."
            win="Win · User need wins"
            zoomFrom={1}
            zoomTo={1.05}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE.uwRefs}>
          <ScreenBeat
            src="walkthrough/10-uw-referrals.png"
            eyebrow="UW · Referrals"
            title="Same chase thread — UW view."
            caption="With Ops · Waiting on broker · Continue in case."
            win="Win · Centralized communication"
            zoomFrom={1}
            zoomTo={1.04}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE.closer}>
          <CloserMosaic />
        </Series.Sequence>
      </Series>

      <Sequence from={0} layout="none">
        <ProgressRail />
      </Sequence>
    </AbsoluteFill>
  );
};

const HandoffCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame, fps, config: { damping: 14 } });

  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(160deg, #0b1220 0%, #152238 45%, #1a2740 100%)",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        color: colors.white,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 36,
          opacity: interpolate(t, [0, 1], [0, 1]),
          transform: `scale(${interpolate(t, [0, 1], [0.92, 1])})`,
        }}
      >
        <RoleBlock label="Cyber Ops" detail="Forms shipped · gaps chased · Ready for UW" tone={colors.blue} />
        <div style={{ fontSize: 64, fontWeight: 800 }}>→</div>
        <RoleBlock label="Cyber UW" detail="Northwind · Feedback → Closure" tone={colors.green} />
      </div>
      <div
        style={{
          marginTop: 40,
          fontSize: 28,
          fontWeight: 700,
          color: colors.yellow,
        }}
      >
        Shorter turnaround = underwriters start decision-ready
      </div>
    </AbsoluteFill>
  );
};

const RoleBlock: React.FC<{ label: string; detail: string; tone: string }> = ({
  label,
  detail,
  tone,
}) => (
  <div
    style={{
      minWidth: 340,
      border: "1.5px solid rgba(255,255,255,0.35)",
      borderRadius: 16,
      background: tone,
      color: colors.ink,
      padding: "32px 36px",
      textAlign: "center",
    }}
  >
    <div style={{ fontSize: 22, fontWeight: 800 }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 700, marginTop: 12, lineHeight: 1.25 }}>
      {detail}
    </div>
  </div>
);

const CloserMosaic: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const thumbs = [
    "walkthrough/11-ops-module-builder.png",
    "walkthrough/14-ops-uw-handoff.png",
    "walkthrough/16-uw-gap-backlog-drill.png",
    "walkthrough/09-uw-closure.png",
  ];

  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(160deg, #0b1220 0%, #152238 45%, #1a2740 100%)",
        padding: "56px 64px",
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        color: colors.white,
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.1em", opacity: 0.55 }}>
        END-TO-END · OPS SHIPPING → UW NORTHWIND
      </div>
      <h1
        style={{
          fontSize: 48,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          margin: "10px 0 28px",
        }}
      >
        Four wins on every submission.
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.15fr 0.85fr",
          gap: 22,
          height: 620,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          {thumbs.map((src, i) => {
            const on = spring({
              frame: frame - i * 4,
              fps,
              config: { damping: 16 },
            });
            return (
              <div
                key={src}
                style={{
                  borderRadius: 12,
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.2)",
                  opacity: interpolate(on, [0, 1], [0.2, 1]),
                  transform: `translateY(${interpolate(on, [0, 1], [18, 0])}px)`,
                }}
              >
                <Img
                  src={staticFile(src)}
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                />
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {wins.map((win, i) => {
            const on = spring({
              frame: frame - (8 + i * 5),
              fps,
              config: { damping: 15 },
            });
            const fills = [colors.yellow, colors.green, colors.blue, colors.violet];
            return (
              <div
                key={win.id}
                style={{
                  flex: 1,
                  borderRadius: 12,
                  background: fills[i],
                  color: colors.ink,
                  padding: "14px 16px",
                  opacity: interpolate(on, [0, 1], [0.15, 1]),
                  transform: `translateX(${interpolate(on, [0, 1], [24, 0])}px)`,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 800, opacity: 0.55 }}>0{i + 1}</div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{win.label}</div>
                <div style={{ fontSize: 15, marginTop: 4, lineHeight: 1.3 }}>{win.detail}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          marginTop: 22,
          fontSize: 20,
          fontWeight: 600,
          opacity: 0.75,
        }}
      >
        Agents assist · underwriter binds · every override is explainable
      </div>
    </AbsoluteFill>
  );
};

const ProgressRail: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 56,
        right: 56,
        bottom: 14,
        height: 4,
        borderRadius: 99,
        background: "rgba(255,255,255,0.15)",
        zIndex: 30,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${progress * 100}%`,
          height: "100%",
          background: colors.yellow,
        }}
      />
    </div>
  );
};
