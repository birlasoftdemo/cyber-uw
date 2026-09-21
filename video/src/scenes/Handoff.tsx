import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FadeUp, Paper, RolePill, SceneLabel } from "../components/primitives";
import { colors } from "../theme";

export const Handoff: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pulse = spring({ frame: frame - 20, fps, config: { damping: 12, stiffness: 100 } });

  return (
    <Paper>
      <AbsoluteFill
        style={{
          padding: "64px 80px",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <FadeUp>
          <SceneLabel
            eyebrow="Handoff"
            title="Ops clears the path. UW owns the bind."
          />
        </FadeUp>

        <FadeUp delay={10}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 28,
              marginTop: 12,
            }}
          >
            <div
              style={{
                border: `2px solid ${colors.ink}`,
                borderRadius: 16,
                background: colors.blue,
                padding: "36px 44px",
                minWidth: 320,
                textAlign: "center",
              }}
            >
              <RolePill label="Cyber Ops" tone="ops" />
              <div style={{ fontSize: 28, fontWeight: 800, marginTop: 18 }}>
                Gaps chased
                <br />
                Package complete
              </div>
            </div>

            <div
              style={{
                fontSize: 64,
                fontWeight: 800,
                transform: `scale(${interpolate(pulse, [0, 1], [0.6, 1])})`,
                opacity: interpolate(frame, [15, 35], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              →
            </div>

            <div
              style={{
                border: `2px solid ${colors.ink}`,
                borderRadius: 16,
                background: colors.green,
                padding: "36px 44px",
                minWidth: 320,
                textAlign: "center",
                boxShadow: pulse > 0.8 ? "0 0 0 6px rgba(178,242,187,0.55)" : undefined,
              }}
            >
              <RolePill label="Cyber UW" tone="uw" />
              <div style={{ fontSize: 28, fontWeight: 800, marginTop: 18 }}>
                Ready for UW
                <br />
                Decision desk opens
              </div>
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={28}>
          <div
            style={{
              marginTop: 48,
              border: `1.5px solid ${colors.ink}`,
              borderRadius: 12,
              background: colors.yellow,
              padding: "16px 28px",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            Shorter turnaround = less waiting on the underwriting desk
          </div>
        </FadeUp>
      </AbsoluteFill>
    </Paper>
  );
};
