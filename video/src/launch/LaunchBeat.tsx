import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors } from "../theme";
import type { LaunchChapter } from "./chapters";
import { CrossfadeSpotlight } from "./Spotlight";

/** Kept for Studio previews of a single beat; composition uses AgentsAssistLaunch. */
export const LaunchBeat: React.FC<{ chapter: LaunchChapter }> = ({
  chapter,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18, stiffness: 110 } });
  const opacity =
    interpolate(frame, [0, 8], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) *
    interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  if (chapter.kind === "cold" || chapter.kind === "closer") {
    return (
      <AbsoluteFill style={{ opacity, background: "#070c16" }}>
        <div style={{ padding: 80, color: colors.white }}>
          <div style={{ opacity: 0.5 }}>{chapter.eyebrow}</div>
          <div style={{ fontSize: 48, fontWeight: 800 }}>{chapter.title}</div>
        </div>
        {chapter.voFile && frame >= chapter.voStart ? (
          <Audio src={staticFile(chapter.voFile)} />
        ) : null}
      </AbsoluteFill>
    );
  }

  const scale = interpolate(
    frame,
    [0, durationInFrames],
    [chapter.zoomFrom ?? 1, chapter.zoomTo ?? 1.06],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ opacity, background: "#070c16" }}>
      <div
        style={{
          position: "absolute",
          inset: "40px 52px 128px",
          borderRadius: 18,
          overflow: "hidden",
          transform: `translateY(${interpolate(enter, [0, 1], [28, 0])}px)`,
        }}
      >
        {chapter.screen ? (
          <Img
            src={staticFile(chapter.screen)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top center",
              transform: `scale(${scale})`,
              transformOrigin: "top center",
            }}
          />
        ) : null}
        {chapter.focus ? (
          <CrossfadeSpotlight
            a={chapter.focus}
            b={chapter.focusB}
            switchAt={chapter.focusBAt}
          />
        ) : null}
      </div>
      {chapter.voFile && frame >= chapter.voStart ? (
        <Audio src={staticFile(chapter.voFile)} />
      ) : null}
    </AbsoluteFill>
  );
};
