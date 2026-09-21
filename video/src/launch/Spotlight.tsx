import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { SpotlightFocus } from "./chapters";
import { colors } from "../theme";

type Props = {
  focus: SpotlightFocus;
  /** 0–1 intensity of dimming outside the hole */
  dim?: number;
};

export const Spotlight: React.FC<Props> = ({ focus, dim = 0.72 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 90 } });
  const pulse = interpolate(Math.sin(frame / 18), [-1, 1], [0.92, 1.05]);

  const rx = focus.rx * pulse;
  const ry = focus.ry * pulse;
  const opacity = interpolate(enter, [0, 1], [0, 1]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity,
      }}
    >
      {/* Dim layer with elliptical clear via radial mask */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `rgba(4, 10, 22, ${dim})`,
          WebkitMaskImage: `radial-gradient(ellipse ${rx}% ${ry}% at ${focus.x}% ${focus.y}%, transparent 0%, transparent 52%, black 78%)`,
          maskImage: `radial-gradient(ellipse ${rx}% ${ry}% at ${focus.x}% ${focus.y}%, transparent 0%, transparent 52%, black 78%)`,
        }}
      />
      {/* Soft ring */}
      <div
        style={{
          position: "absolute",
          left: `${focus.x}%`,
          top: `${focus.y}%`,
          width: `${rx * 2}%`,
          height: `${ry * 2}%`,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          border: "2px solid rgba(255, 236, 153, 0.85)",
          boxShadow:
            "0 0 0 1px rgba(255,236,153,0.25), 0 0 40px rgba(255,236,153,0.35)",
        }}
      />
      {/* Callout pill */}
      <div
        style={{
          position: "absolute",
          left: `${Math.min(Math.max(focus.x, 12), 78)}%`,
          top: `${Math.max(focus.y - focus.ry - 6, 4)}%`,
          transform: "translateX(-50%)",
          background: colors.yellow,
          color: colors.ink,
          padding: "8px 14px",
          borderRadius: 999,
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: "-0.01em",
          whiteSpace: "nowrap",
          boxShadow: "0 10px 28px rgba(0,0,0,0.35)",
        }}
      >
        {focus.label}
      </div>
    </div>
  );
};

export const CrossfadeSpotlight: React.FC<{
  a: SpotlightFocus;
  b?: SpotlightFocus;
  switchAt?: number;
}> = ({ a, b, switchAt }) => {
  const frame = useCurrentFrame();
  if (!b || switchAt == null) {
    return <Spotlight focus={a} />;
  }
  const t = interpolate(frame, [switchAt - 8, switchAt + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - t }}>
        <Spotlight focus={a} />
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: t }}>
        <Spotlight focus={b} />
      </div>
    </>
  );
};
