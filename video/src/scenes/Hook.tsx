import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FadeUp, Paper, RolePill } from "../components/primitives";
import { colors } from "../theme";

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const strike = interpolate(frame, [40, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Paper>
      <AbsoluteFill style={{ padding: "72px 88px" }}>
        <FadeUp>
          <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
            <RolePill label="Cyber Ops" tone="ops" />
            <RolePill label="Cyber UW" tone="uw" />
          </div>
        </FadeUp>

        <FadeUp delay={6}>
          <h1
            style={{
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              maxWidth: 1400,
              margin: 0,
            }}
          >
            From ops desk to underwriter bind —
            <br />
            one decision workbench.
          </h1>
        </FadeUp>

        <FadeUp delay={18}>
          <p
            style={{
              marginTop: 28,
              fontSize: 30,
              color: colors.muted,
              maxWidth: 1100,
              lineHeight: 1.4,
            }}
          >
            End-to-end cyber submission workflow: ship forms, chase gaps early,
            keep communication centralized, hand off decision-ready.
          </p>
        </FadeUp>

        <FadeUp delay={32}>
          <div
            style={{
              marginTop: 56,
              display: "inline-flex",
              alignItems: "center",
              gap: 18,
              border: `1.5px solid ${colors.ink}`,
              borderRadius: 12,
              background: colors.white,
              padding: "18px 24px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <span style={{ fontSize: 26, fontWeight: 600, color: colors.muted }}>
              Before: scattered email · slow chase · decision-ready in days
            </span>
            <div
              style={{
                position: "absolute",
                left: 16,
                right: 16,
                height: 3,
                background: colors.ink,
                top: "50%",
                transform: `scaleX(${strike})`,
                transformOrigin: "left center",
              }}
            />
          </div>
        </FadeUp>
      </AbsoluteFill>
    </Paper>
  );
};
