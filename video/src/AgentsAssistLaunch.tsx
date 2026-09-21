import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  Series,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors } from "./theme";
import { LAUNCH_CHAPTERS, LAUNCH_TOTAL_FRAMES, type LaunchChapter } from "./launch/chapters";
import { CrossfadeSpotlight } from "./launch/Spotlight";
import {
  HitlConfirmOverlay,
  PasApproveOverlay,
  RecommendChipsOverlay,
} from "./launch/Overlays";

export { LAUNCH_TOTAL_FRAMES };

export const AgentsAssistLaunch: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#070c16" }}>
      <Series>
        {LAUNCH_CHAPTERS.map((chapter) => (
          <Series.Sequence key={chapter.id} durationInFrames={chapter.durationInFrames}>
            <ChapterScene chapter={chapter} />
          </Series.Sequence>
        ))}
      </Series>
      <Sequence layout="none">
        <ProgressRail />
      </Sequence>
    </AbsoluteFill>
  );
};

const ChapterScene: React.FC<{ chapter: LaunchChapter }> = ({ chapter }) => {
  return (
    <AbsoluteFill>
      {chapter.kind === "cold" ? (
        <ColdOpen chapter={chapter} />
      ) : chapter.kind === "closer" ? (
        <CloserCard chapter={chapter} />
      ) : (
        <ScreenChapter chapter={chapter} />
      )}
      {chapter.voFile ? (
        <Sequence from={chapter.voStart} layout="none">
          <Audio src={staticFile(chapter.voFile)} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};

const ScreenChapter: React.FC<{ chapter: LaunchChapter }> = ({ chapter }) => {
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
  const scale = interpolate(
    frame,
    [0, durationInFrames],
    [chapter.zoomFrom ?? 1, chapter.zoomTo ?? 1.06],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(160deg, #070c16 0%, #121c30 48%, #182438 100%)",
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        color: colors.white,
        opacity,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "40px 52px 128px",
          borderRadius: 18,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.16)",
          boxShadow: "0 28px 70px rgba(0,0,0,0.5)",
          background: "#070b12",
          transform: `translateY(${interpolate(enter, [0, 1], [28, 0])}px) scale(${interpolate(enter, [0, 1], [0.97, 1])})`,
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
        {chapter.overlay === "chips" ? <RecommendChipsOverlay /> : null}
        {chapter.overlay === "hitl" ? <HitlConfirmOverlay /> : null}
        {chapter.overlay === "pas" ? <PasApproveOverlay /> : null}
      </div>
      <CaptionBar chapter={chapter} />
    </AbsoluteFill>
  );
};

const CaptionBar: React.FC<{ chapter: LaunchChapter }> = ({ chapter }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const on = spring({ frame: frame - 4, fps, config: { damping: 16 } });

  return (
    <div
      style={{
        position: "absolute",
        left: 64,
        right: 64,
        bottom: 36,
        opacity: interpolate(on, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(on, [0, 1], [16, 0])}px)`,
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      }}
    >
      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.5)",
          marginBottom: 8,
        }}
      >
        {chapter.eyebrow}
      </div>
      <div
        style={{
          fontSize: 40,
          fontWeight: 800,
          letterSpacing: "-0.025em",
          lineHeight: 1.1,
          maxWidth: 1400,
        }}
      >
        {chapter.title}
      </div>
      {chapter.caption ? (
        <div
          style={{
            marginTop: 10,
            fontSize: 22,
            color: "rgba(255,255,255,0.7)",
            maxWidth: 980,
            lineHeight: 1.35,
          }}
        >
          {chapter.caption}
        </div>
      ) : null}
    </div>
  );
};

const ColdOpen: React.FC<{ chapter: LaunchChapter }> = ({ chapter }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 90 } });
  const opacity =
    interpolate(frame, [0, 10], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) *
    interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  const grain = interpolate(Math.sin(frame / 7), [-1, 1], [0.04, 0.09]);

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, #1a2740 0%, #070c16 70%)",
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        color: colors.white,
        justifyContent: "center",
        alignItems: "center",
        opacity,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.015) 3px)",
          opacity: grain + 0.4,
        }}
      />
      <div
        style={{
          textAlign: "center",
          opacity: interpolate(enter, [0, 1], [0, 1]),
          transform: `scale(${interpolate(enter, [0, 1], [0.94, 1])})`,
          padding: "0 80px",
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)",
            marginBottom: 22,
          }}
        >
          {chapter.eyebrow}
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: "-0.035em",
            lineHeight: 1.05,
          }}
        >
          {chapter.title}
        </div>
        {chapter.caption ? (
          <div
            style={{
              marginTop: 28,
              fontSize: 26,
              color: "rgba(255,255,255,0.62)",
              maxWidth: 760,
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: 1.4,
            }}
          >
            {chapter.caption}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

const CloserCard: React.FC<{ chapter: LaunchChapter }> = ({ chapter }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 16 } });
  const opacity =
    interpolate(frame, [0, 10], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) *
    interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(160deg, #070c16 0%, #142038 50%, #1a2a44 100%)",
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        color: colors.white,
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
        opacity,
      }}
    >
      <div
        style={{
          textAlign: "center",
          opacity: interpolate(enter, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(enter, [0, 1], [24, 0])}px)`,
          maxWidth: 1400,
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.5)",
            marginBottom: 28,
          }}
        >
          {chapter.eyebrow}
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.2,
          }}
        >
          {chapter.title}
        </div>
        <div
          style={{
            marginTop: 40,
            display: "inline-block",
            background: colors.yellow,
            color: colors.ink,
            padding: "14px 22px",
            borderRadius: 12,
            fontSize: 20,
            fontWeight: 800,
          }}
        >
          Cyber Underwriting Dashboard
        </div>
      </div>
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

  return (
    <div
      style={{
        position: "absolute",
        left: 56,
        right: 56,
        bottom: 12,
        height: 4,
        borderRadius: 99,
        background: "rgba(255,255,255,0.12)",
        zIndex: 40,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${progress * 100}%`,
          height: "100%",
          background: colors.yellow,
        }}
      />
    </div>
  );
};
