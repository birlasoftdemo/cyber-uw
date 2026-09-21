import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../theme";

/** Composed UI overlays when walkthrough PNGs don't show Closure / HITL / PAS. */

export const RecommendChipsOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const on = spring({ frame: frame - 6, fps, config: { damping: 14 } });
  const chips = [
    { label: "Quote", tone: colors.green, conf: "62%" },
    { label: "Refer", tone: colors.yellow, conf: "AI · 81%", active: true },
    { label: "Decline", tone: colors.pink, conf: "12%" },
  ];

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom: "14%",
        transform: `translateX(-50%) translateY(${interpolate(on, [0, 1], [28, 0])}px)`,
        opacity: interpolate(on, [0, 1], [0, 1]),
        display: "flex",
        gap: 14,
        padding: "18px 20px",
        borderRadius: 18,
        background: "rgba(10, 16, 28, 0.92)",
        border: "1px solid rgba(255,255,255,0.22)",
        boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
      }}
    >
      {chips.map((c) => (
        <div
          key={c.label}
          style={{
            minWidth: 150,
            borderRadius: 12,
            padding: "14px 16px",
            background: c.tone,
            color: colors.ink,
            border: c.active ? "2px solid #fff" : "2px solid transparent",
            boxShadow: c.active ? "0 0 0 3px rgba(255,236,153,0.55)" : "none",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.6 }}>AI recommend</div>
          <div style={{ fontSize: 26, fontWeight: 800 }}>{c.label}</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>{c.conf}</div>
        </div>
      ))}
    </div>
  );
};

export const HitlConfirmOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const on = spring({ frame: frame - 4, fps, config: { damping: 15 } });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(6,10,18,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: interpolate(on, [0, 1], [0, 1]),
      }}
    >
      <div
        style={{
          width: 560,
          borderRadius: 18,
          background: "#f7f9fc",
          color: colors.ink,
          padding: "28px 30px",
          boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
          transform: `scale(${interpolate(on, [0, 1], [0.92, 1])})`,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.08em", opacity: 0.5 }}>
          CONFIRM BIND
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8, lineHeight: 1.2 }}>
          Underwriter locks the decision
        </div>
        <div style={{ marginTop: 14, fontSize: 16, lineHeight: 1.4, opacity: 0.75 }}>
          Override reason stays on the trail. Agents assist — they do not bind.
        </div>
        <div
          style={{
            marginTop: 18,
            padding: "12px 14px",
            borderRadius: 10,
            background: "#eef3ff",
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          Reason: MFA gap accepted with compensating EDR + broker attestation.
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 22, justifyContent: "flex-end" }}>
          <div
            style={{
              padding: "12px 18px",
              borderRadius: 10,
              border: "1.5px solid #ccd3df",
              fontWeight: 700,
            }}
          >
            Cancel
          </div>
          <div
            style={{
              padding: "12px 18px",
              borderRadius: 10,
              background: "#1e3a8a",
              color: "#fff",
              fontWeight: 800,
            }}
          >
            Bind · explainable
          </div>
        </div>
      </div>
    </div>
  );
};

export const PasApproveOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const on = spring({ frame: frame - 4, fps, config: { damping: 15 } });

  return (
    <div
      style={{
        position: "absolute",
        right: "6%",
        bottom: "12%",
        width: 420,
        borderRadius: 16,
        background: "rgba(10,16,28,0.94)",
        border: "1px solid rgba(255,255,255,0.2)",
        color: colors.white,
        padding: "20px 22px",
        boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
        opacity: interpolate(on, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(on, [0, 1], [20, 0])}px)`,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.1em", opacity: 0.55 }}>
        SYNC · POLICY ADMIN
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, marginTop: 8 }}>Approve before send</div>
      <div style={{ fontSize: 15, marginTop: 8, opacity: 0.7, lineHeight: 1.35 }}>
        Push to PAS when ready. Undo until synced.
      </div>
      <div
        style={{
          marginTop: 16,
          background: colors.yellow,
          color: colors.ink,
          textAlign: "center",
          padding: "12px 14px",
          borderRadius: 10,
          fontWeight: 800,
          fontSize: 17,
        }}
      >
        Approve → send to PAS
      </div>
    </div>
  );
};
