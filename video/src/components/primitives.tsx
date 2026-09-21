import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors } from "../theme";

export const Paper: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <AbsoluteFill
    style={{
      backgroundColor: colors.paper,
      backgroundImage:
        "radial-gradient(circle at 12% 18%, rgba(0,0,0,0.015) 0 1px, transparent 2px), radial-gradient(circle at 78% 62%, rgba(0,0,0,0.02) 0 1px, transparent 2px)",
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      color: colors.ink,
      ...style,
    }}
  >
    {children}
  </AbsoluteFill>
);

export const FadeUp: React.FC<{
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({
    frame: frame - delay,
    fps,
    config: { damping: 18, stiffness: 120 },
  });
  const opacity = interpolate(frame - delay, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${interpolate(t, [0, 1], [28, 0])}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const RolePill: React.FC<{ label: string; tone?: "ops" | "uw" | "broker" | "system" }> = ({
  label,
  tone = "ops",
}) => {
  const bg =
    tone === "ops"
      ? colors.blue
      : tone === "uw"
        ? colors.green
        : tone === "broker"
          ? colors.violet
          : colors.gray;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        border: `1.5px solid ${colors.ink}`,
        borderRadius: 999,
        padding: "6px 14px",
        background: bg,
        fontSize: 22,
        fontWeight: 700,
        letterSpacing: "0.02em",
      }}
    >
      {label}
    </span>
  );
};

export const WinChip: React.FC<{ label: string; active?: boolean }> = ({
  label,
  active = true,
}) => (
  <div
    style={{
      border: `1.5px solid ${colors.ink}`,
      borderRadius: 10,
      padding: "10px 16px",
      background: active ? colors.yellow : colors.white,
      fontSize: 20,
      fontWeight: 700,
      opacity: active ? 1 : 0.45,
    }}
  >
    {label}
  </div>
);

export const Panel: React.FC<{
  title: string,
  children: React.ReactNode,
  tone?: "default" | "cream" | "blue" | "green",
  style?: React.CSSProperties,
}> = ({ title, children, tone = "default", style }) => {
  const bg =
    tone === "cream"
      ? colors.cream
      : tone === "blue"
        ? "#e7f5ff"
        : tone === "green"
          ? "#ebfbee"
          : colors.white;
  return (
    <div
      style={{
        border: `1.5px solid ${colors.ink}`,
        borderRadius: 14,
        background: bg,
        padding: 22,
        boxShadow: "4px 4px 0 rgba(0,0,0,0.08)",
        ...style,
      }}
    >
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          borderBottom: "1px solid #ccc",
          paddingBottom: 8,
          marginBottom: 14,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
};

export const SceneLabel: React.FC<{ eyebrow: string; title: string; subtitle?: string }> = ({
  eyebrow,
  title,
  subtitle,
}) => (
  <div style={{ marginBottom: 28 }}>
    <div
      style={{
        fontSize: 18,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: colors.muted,
        marginBottom: 8,
      }}
    >
      {eyebrow}
    </div>
    <h1 style={{ fontSize: 56, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.05, margin: 0 }}>
      {title}
    </h1>
    {subtitle ? (
      <p style={{ fontSize: 26, color: colors.muted, marginTop: 12, maxWidth: 980, lineHeight: 1.35 }}>
        {subtitle}
      </p>
    ) : null}
  </div>
);

export const FlowArrow: React.FC<{ from: string; to: string }> = ({ from, to }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      fontSize: 22,
      fontWeight: 700,
    }}
  >
    <span>{from}</span>
    <span style={{ fontSize: 28 }}>→</span>
    <span>{to}</span>
  </div>
);
