import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FadeUp, Paper, Panel, RolePill, SceneLabel, WinChip } from "../components/primitives";
import { colors } from "../theme";

const modules = ["Applicant", "Controls", "Claims", "Vendors", "Security signal"];

export const ManageForms: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Paper>
      <AbsoluteFill style={{ padding: "64px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <FadeUp>
            <SceneLabel
              eyebrow="Ops · Manage Submissions"
              title="Ship the right form — not another questionnaire pile."
              subtitle="Templates and shared outtakes keep broker packages adaptive and trackable."
            />
          </FadeUp>
          <FadeUp delay={8}>
            <WinChip label="Win · Manage forms" />
          </FadeUp>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 28, marginTop: 8 }}>
          <FadeUp delay={14}>
            <Panel title="Form packages · Templates" tone="cream">
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {["Cyber Core Adaptive", "Renewal lite", "High-hazard add-on"].map((name, i) => {
                  const on = spring({
                    frame: frame - (20 + i * 8),
                    fps,
                    config: { damping: 16 },
                  });
                  return (
                    <div
                      key={name}
                      style={{
                        border: `1.5px solid ${colors.ink}`,
                        borderRadius: 10,
                        padding: "14px 16px",
                        background: i === 0 ? colors.yellow : colors.white,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        opacity: interpolate(on, [0, 1], [0.3, 1]),
                        transform: `translateX(${interpolate(on, [0, 1], [24, 0])}px)`,
                      }}
                    >
                      <span style={{ fontSize: 24, fontWeight: 700 }}>{name}</span>
                      <span style={{ fontSize: 18, color: colors.muted }}>
                        {i === 0 ? "Create template →" : "Reuse"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </FadeUp>

          <FadeUp delay={22}>
            <Panel title="Parameter builder → broker outtake" tone="blue">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
                {modules.map((m, i) => {
                  const on = interpolate(frame, [30 + i * 6, 42 + i * 6], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  });
                  return (
                    <span
                      key={m}
                      style={{
                        border: `1.5px solid ${colors.ink}`,
                        borderRadius: 8,
                        padding: "10px 14px",
                        background: on > 0.5 ? colors.green : colors.white,
                        fontSize: 20,
                        fontWeight: 600,
                        opacity: 0.35 + on * 0.65,
                      }}
                    >
                      {m}
                    </span>
                  );
                })}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderTop: "1px solid #ccc",
                  paddingTop: 16,
                }}
              >
                <RolePill label="Broker completes live form" tone="broker" />
                <div style={{ fontSize: 20, fontWeight: 700 }}>
                  Sent → In progress → Returned
                </div>
              </div>
            </Panel>
          </FadeUp>
        </div>
      </AbsoluteFill>
    </Paper>
  );
};
