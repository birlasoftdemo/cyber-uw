import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FadeUp, Paper, Panel, RolePill, SceneLabel, WinChip } from "../components/primitives";
import { colors } from "../theme";

export const OpsChase: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bar = spring({ frame: frame - 24, fps, config: { damping: 20, stiffness: 80 } });
  const pct = Math.round(interpolate(bar, [0, 1], [42, 88]));

  return (
    <Paper>
      <AbsoluteFill style={{ padding: "64px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <FadeUp>
            <SceneLabel
              eyebrow="Ops · Decision Desk · New → Feedback"
              title="Chase early. Hand off decision-ready."
              subtitle="What used to take three hours of email ping-pong clears before the underwriter even opens the case."
            />
          </FadeUp>
          <FadeUp delay={6}>
            <WinChip label="Win · Shorter turnaround" />
          </FadeUp>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.9fr", gap: 28 }}>
          <FadeUp delay={12}>
            <Panel title="Submission package · Meridian Health" tone="default">
              <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
                <RolePill label="Ops owns chase" tone="ops" />
                <RolePill label="Before Ready for UW" tone="system" />
              </div>
              <div style={{ fontSize: 22, marginBottom: 10, fontWeight: 600 }}>
                Completeness {pct}%
              </div>
              <div
                style={{
                  height: 18,
                  border: `1.5px solid ${colors.ink}`,
                  borderRadius: 999,
                  overflow: "hidden",
                  background: colors.gray,
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: colors.green,
                    transition: "none",
                  }}
                />
              </div>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "22px 0 0",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  fontSize: 22,
                }}
              >
                {[
                  "Run ingest again on missing loss runs",
                  "Material gaps referred to broker",
                  "Ideal vs Detected board opened in Feedback",
                ].map((item, i) => {
                  const on = interpolate(frame, [40 + i * 10, 52 + i * 10], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  });
                  return (
                    <li
                      key={item}
                      style={{
                        opacity: 0.25 + on * 0.75,
                        transform: `translateX(${(1 - on) * 16}px)`,
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 99,
                          background: on > 0.6 ? colors.green : colors.orange,
                          border: `1.5px solid ${colors.ink}`,
                        }}
                      />
                      {item}
                    </li>
                  );
                })}
              </ul>
            </Panel>
          </FadeUp>

          <FadeUp delay={20}>
            <Panel title="Turnaround" tone="green">
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <div style={{ fontSize: 18, color: colors.muted, fontWeight: 700 }}>Before</div>
                  <div style={{ fontSize: 36, fontWeight: 800, textDecoration: "line-through", opacity: 0.5 }}>
                    Days to decision-ready
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 18, color: colors.muted, fontWeight: 700 }}>With Cyber UW</div>
                  <div style={{ fontSize: 42, fontWeight: 800 }}>Same-day dossier</div>
                </div>
                <div
                  style={{
                    marginTop: 8,
                    border: `1.5px solid ${colors.ink}`,
                    borderRadius: 10,
                    background: colors.yellow,
                    padding: "14px 16px",
                    fontSize: 22,
                    fontWeight: 700,
                  }}
                >
                  Ready for UW → underwriter starts clean
                </div>
              </div>
            </Panel>
          </FadeUp>
        </div>
      </AbsoluteFill>
    </Paper>
  );
};
