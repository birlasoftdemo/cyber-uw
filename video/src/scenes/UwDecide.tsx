import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FadeUp, Paper, Panel, RolePill, SceneLabel, WinChip } from "../components/primitives";
import { colors, journeySteps } from "../theme";

export const UwDecide: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Paper>
      <AbsoluteFill style={{ padding: "56px 72px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <FadeUp>
            <SceneLabel
              eyebrow="Underwriter · Case progress"
              title="See the need. Decide with confidence."
              subtitle="Ideal vs Detected gaps, appetite assist, then Quote / Refer / Decline — human locks every bind."
            />
          </FadeUp>
          <FadeUp delay={6}>
            <WinChip label="Win · User need wins" />
          </FadeUp>
        </div>

        <FadeUp delay={10}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: 10,
              marginBottom: 24,
            }}
          >
            {journeySteps.map((step, i) => {
              const on = spring({
                frame: frame - (12 + i * 5),
                fps,
                config: { damping: 14 },
              });
              const active = i >= 1 && i <= 4;
              return (
                <div
                  key={step.title}
                  style={{
                    border: `1.5px solid ${colors.ink}`,
                    borderRadius: 10,
                    background: step.fill,
                    padding: "12px 10px",
                    minHeight: 96,
                    opacity: interpolate(on, [0, 1], [0.25, 1]),
                    transform: `translateY(${interpolate(on, [0, 1], [16, 0])}px)`,
                    outline: active && frame > 40 ? `3px solid ${colors.ink}` : undefined,
                    outlineOffset: 2,
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700, opacity: 0.5 }}>{step.n}</div>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{step.title}</div>
                  <div style={{ fontSize: 14, marginTop: 4, lineHeight: 1.25 }}>{step.blurb}</div>
                </div>
              );
            })}
          </div>
        </FadeUp>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.9fr", gap: 24 }}>
          <FadeUp delay={28}>
            <Panel title="Feedback · Ideal vs Detected" tone="cream">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div
                  style={{
                    border: `1.5px solid ${colors.ink}`,
                    borderRadius: 10,
                    padding: 14,
                    background: colors.green,
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>IDEAL</div>
                  <div style={{ fontSize: 20, fontWeight: 600 }}>Appetite floor · MFA on admin</div>
                </div>
                <div
                  style={{
                    border: `1.5px solid ${colors.ink}`,
                    borderRadius: 10,
                    padding: 14,
                    background: colors.pink,
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>DETECTED</div>
                  <div style={{ fontSize: 20, fontWeight: 600 }}>Signal ~78% · cite-back ready</div>
                </div>
              </div>
              <div style={{ marginTop: 14, fontSize: 20, color: colors.muted, fontWeight: 600 }}>
                Decide & defend — every override stays explainable.
              </div>
            </Panel>
          </FadeUp>

          <FadeUp delay={36}>
            <Panel title="Closure · Human in the loop" tone="green">
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <RolePill label="UW locks" tone="uw" />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {["Quote", "Refer", "Decline"].map((action, i) => {
                  const on = spring({
                    frame: frame - (50 + i * 6),
                    fps,
                    config: { damping: 14 },
                  });
                  return (
                    <div
                      key={action}
                      style={{
                        flex: 1,
                        textAlign: "center",
                        border: `1.5px solid ${colors.ink}`,
                        borderRadius: 10,
                        padding: "16px 8px",
                        background: i === 0 ? colors.yellow : colors.white,
                        fontSize: 24,
                        fontWeight: 800,
                        opacity: interpolate(on, [0, 1], [0.2, 1]),
                        transform: `scale(${interpolate(on, [0, 1], [0.9, 1])})`,
                      }}
                    >
                      {action}
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 14, fontSize: 18, fontWeight: 600, color: colors.muted }}>
                Agents assist · underwriter binds
              </div>
            </Panel>
          </FadeUp>
        </div>
      </AbsoluteFill>
    </Paper>
  );
};
