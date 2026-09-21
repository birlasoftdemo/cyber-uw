import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FadeUp, Paper, Panel, RolePill, SceneLabel, WinChip } from "../components/primitives";
import { colors } from "../theme";

const tickets = [
  {
    status: "Awaiting broker",
    label: "EDR coverage evidence",
    who: "Broker",
    tone: colors.orange,
  },
  {
    status: "With Ops",
    label: "Missing loss runs · re-ingest",
    who: "Ops",
    tone: colors.blue,
  },
  {
    status: "Back with UW",
    label: "Vendor concentration watch",
    who: "UW",
    tone: colors.green,
  },
] as const;

export const CentralComms: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Paper>
      <AbsoluteFill style={{ padding: "64px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <FadeUp>
            <SceneLabel
              eyebrow="Shared · Referral Inbox"
              title="One hub for chase — not five inboxes."
              subtitle="Refer from gaps, ingest, or risk. Remind broker. Resolve. Return to UW. Everyone sees the same thread."
            />
          </FadeUp>
          <FadeUp delay={6}>
            <WinChip label="Win · Centralized communication" />
          </FadeUp>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "0.85fr 1.15fr", gap: 28 }}>
          <FadeUp delay={12}>
            <Panel title="How work enters the hub" tone="cream">
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  "Discussion · Refer from case",
                  "Gap · Refer to Broker",
                  "Ingest · missing package items",
                  "Risk / Platform · specialist eyes",
                ].map((step, i) => {
                  const on = spring({
                    frame: frame - (18 + i * 7),
                    fps,
                    config: { damping: 14 },
                  });
                  return (
                    <div
                      key={step}
                      style={{
                        border: `1.5px solid ${colors.ink}`,
                        borderRadius: 10,
                        padding: "14px 16px",
                        background: colors.white,
                        fontSize: 22,
                        fontWeight: 600,
                        opacity: interpolate(on, [0, 1], [0.2, 1]),
                        transform: `translateY(${interpolate(on, [0, 1], [18, 0])}px)`,
                      }}
                    >
                      {step}
                    </div>
                  );
                })}
              </div>
            </Panel>
          </FadeUp>

          <FadeUp delay={18}>
            <Panel title="Referral Inbox · Open / Awaiting / Resolved" tone="blue">
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <RolePill label="Ops Inbox" tone="ops" />
                <RolePill label="UW Referrals" tone="uw" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {tickets.map((t, i) => {
                  const on = spring({
                    frame: frame - (28 + i * 10),
                    fps,
                    config: { damping: 16 },
                  });
                  return (
                    <div
                      key={t.label}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "160px 1fr auto",
                        gap: 14,
                        alignItems: "center",
                        border: `1.5px solid ${colors.ink}`,
                        borderRadius: 10,
                        padding: "14px 16px",
                        background: colors.white,
                        opacity: interpolate(on, [0, 1], [0.15, 1]),
                        transform: `translateX(${interpolate(on, [0, 1], [30, 0])}px)`,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 16,
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          background: t.tone,
                          border: `1.5px solid ${colors.ink}`,
                          borderRadius: 8,
                          padding: "6px 10px",
                          textAlign: "center",
                        }}
                      >
                        {t.status}
                      </span>
                      <span style={{ fontSize: 22, fontWeight: 700 }}>{t.label}</span>
                      <span style={{ fontSize: 18, color: colors.muted, fontWeight: 600 }}>
                        {t.who}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div
                style={{
                  marginTop: 18,
                  fontSize: 20,
                  fontWeight: 600,
                  color: colors.muted,
                }}
              >
                Actions: Remind broker · Resolve · Return to UW · Continue in case
              </div>
            </Panel>
          </FadeUp>
        </div>
      </AbsoluteFill>
    </Paper>
  );
};
