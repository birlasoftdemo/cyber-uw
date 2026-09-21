import React from "react";
import {
  AbsoluteFill,
  Sequence,
  Series,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Hook } from "./scenes/Hook";
import { ManageForms } from "./scenes/ManageForms";
import { OpsChase } from "./scenes/OpsChase";
import { CentralComms } from "./scenes/CentralComms";
import { Handoff } from "./scenes/Handoff";
import { UwDecide } from "./scenes/UwDecide";
import { WinsCloser } from "./scenes/WinsCloser";
import { colors, fps } from "./theme";

/** Scene lengths in frames @ 30fps (~65s total). */
export const SCENE = {
  hook: 4 * fps,
  forms: 9 * fps,
  chase: 9 * fps,
  comms: 11 * fps,
  handoff: 6 * fps,
  decide: 15 * fps,
  wins: 11 * fps,
} as const;

export const TOTAL_FRAMES =
  SCENE.hook +
  SCENE.forms +
  SCENE.chase +
  SCENE.comms +
  SCENE.handoff +
  SCENE.decide +
  SCENE.wins;

export const CyberUwExplainer: React.FC = () => {
  return (
    <AbsoluteFill>
      <Series>
        <Series.Sequence durationInFrames={SCENE.hook}>
          <Hook />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE.forms}>
          <ManageForms />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE.chase}>
          <OpsChase />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE.comms}>
          <CentralComms />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE.handoff}>
          <Handoff />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE.decide}>
          <UwDecide />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE.wins}>
          <WinsCloser />
        </Series.Sequence>
      </Series>

      <Sequence from={0} layout="none">
        <ProgressRail />
      </Sequence>
    </AbsoluteFill>
  );
};

const ProgressRail: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const labels = [
    { at: 0, text: "Hook" },
    { at: SCENE.hook, text: "Forms" },
    { at: SCENE.hook + SCENE.forms, text: "Chase" },
    { at: SCENE.hook + SCENE.forms + SCENE.chase, text: "Comms" },
    { at: SCENE.hook + SCENE.forms + SCENE.chase + SCENE.comms, text: "Handoff" },
    {
      at: SCENE.hook + SCENE.forms + SCENE.chase + SCENE.comms + SCENE.handoff,
      text: "Decide",
    },
    {
      at:
        SCENE.hook +
        SCENE.forms +
        SCENE.chase +
        SCENE.comms +
        SCENE.handoff +
        SCENE.decide,
      text: "Wins",
    },
  ];

  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        bottom: 28,
        height: 8,
        borderRadius: 99,
        background: "rgba(0,0,0,0.08)",
        border: `1px solid ${colors.ink}`,
        overflow: "visible",
        zIndex: 20,
      }}
    >
      <div
        style={{
          width: `${progress * 100}%`,
          height: "100%",
          background: colors.ink,
          borderRadius: 99,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 14,
          display: "flex",
          justifyContent: "space-between",
          pointerEvents: "none",
          fontSize: 12,
          fontWeight: 700,
          color: colors.muted,
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        }}
      >
        {labels.map((l) => (
          <span key={l.text} style={{ opacity: frame >= l.at ? 1 : 0.4 }}>
            {l.text}
          </span>
        ))}
      </div>
    </div>
  );
};
