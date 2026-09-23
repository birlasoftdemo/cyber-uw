import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors } from "../theme";

export const ScreenBeat: React.FC<{
  src: string;
  eyebrow: string;
  title: string;
  win?: string;
  caption?: string;
  /** Developer lens — what to understand (gates, files, store). */
  devTakeaway?: string;
  zoomFrom?: number;
  zoomTo?: number;
}> = ({
  src,
  eyebrow,
  title,
  win,
  caption,
  devTakeaway,
  zoomFrom = 1,
  zoomTo = 1.06,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const dense = Boolean(devTakeaway);

  const enter = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 120 },
  });
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exit = interpolate(
    frame,
    [durationInFrames - 10, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const scale = interpolate(frame, [0, durationInFrames], [zoomFrom, zoomTo], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(160deg, #0b1220 0%, #152238 45%, #1a2740 100%)",
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        color: colors.white,
        opacity: opacity * exit,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: dense ? "40px 56px 168px" : "48px 56px 110px",
          borderRadius: 18,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
          background: "#0a0f18",
          transform: `translateY(${interpolate(enter, [0, 1], [36, 0])}px) scale(${interpolate(enter, [0, 1], [0.96, 1])})`,
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top center",
            transform: `scale(${scale})`,
            transformOrigin: "top center",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(8,12,20,0.05) 35%, rgba(8,12,20,0.72) 100%)",
            pointerEvents: "none",
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 72,
          right: 72,
          bottom: 28,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 24,
        }}
      >
        <div style={{ maxWidth: dense ? 1280 : 1200 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
              marginBottom: 6,
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              fontSize: dense ? 34 : 42,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1.12,
            }}
          >
            {title}
          </div>
          {caption ? (
            <div
              style={{
                marginTop: 8,
                fontSize: dense ? 19 : 22,
                color: "rgba(255,255,255,0.72)",
                maxWidth: 1100,
                lineHeight: 1.35,
              }}
            >
              {caption}
            </div>
          ) : null}
          {devTakeaway ? (
            <div
              style={{
                marginTop: 10,
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid rgba(165,216,255,0.35)",
                background: "rgba(11,18,32,0.85)",
                fontSize: 17,
                fontWeight: 600,
                color: colors.blue,
                maxWidth: 1100,
                lineHeight: 1.4,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  marginRight: 8,
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "rgba(165,216,255,0.7)",
                }}
              >
                Dev · understand
              </span>
              {devTakeaway}
            </div>
          ) : null}
        </div>
        {win ? (
          <div
            style={{
              flexShrink: 0,
              border: "1.5px solid rgba(255,255,255,0.35)",
              borderRadius: 12,
              background: colors.yellow,
              color: colors.ink,
              padding: "14px 18px",
              fontSize: 20,
              fontWeight: 800,
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            }}
          >
            {win}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
