import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FadeUp, Paper, RolePill } from "../components/primitives";
import { colors, wins } from "../theme";

export const WinsCloser: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Paper>
      <AbsoluteFill style={{ padding: "64px 80px" }}>
        <FadeUp>
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            <RolePill label="Ops → UW" tone="ops" />
            <RolePill label="End-to-end" tone="uw" />
          </div>
          <h1
            style={{
              fontSize: 58,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              margin: 0,
              maxWidth: 1400,
              lineHeight: 1.08,
            }}
          >
            Four wins on every submission.
          </h1>
        </FadeUp>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 18,
            marginTop: 36,
          }}
        >
          {wins.map((win, i) => {
            const on = spring({
              frame: frame - (10 + i * 8),
              fps,
              config: { damping: 15 },
            });
            const fills = [colors.yellow, colors.green, colors.blue, colors.violet];
            return (
              <div
                key={win.id}
                style={{
                  border: `1.5px solid ${colors.ink}`,
                  borderRadius: 14,
                  background: fills[i],
                  padding: "22px 24px",
                  opacity: interpolate(on, [0, 1], [0.15, 1]),
                  transform: `translateY(${interpolate(on, [0, 1], [24, 0])}px)`,
                  boxShadow: "4px 4px 0 rgba(0,0,0,0.08)",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 800, opacity: 0.55, marginBottom: 6 }}>
                  0{i + 1}
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>{win.label}</div>
                <div style={{ fontSize: 20, lineHeight: 1.35, maxWidth: 520 }}>{win.detail}</div>
              </div>
            );
          })}
        </div>

        <FadeUp delay={48}>
          <div
            style={{
              marginTop: 40,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: `1.5px solid ${colors.ink}`,
              paddingTop: 22,
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 700 }}>
              Cyber Underwriting Dashboard · Birlasoft IP accelerator
            </div>
            <div
              style={{
                border: `1.5px solid ${colors.ink}`,
                borderRadius: 10,
                background: colors.white,
                padding: "12px 18px",
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              Agents assist · underwriter binds · overrides explainable
            </div>
          </div>
        </FadeUp>
      </AbsoluteFill>
    </Paper>
  );
};
