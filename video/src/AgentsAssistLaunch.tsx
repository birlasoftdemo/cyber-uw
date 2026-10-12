import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  Series,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  Atmosphere,
  CloserCard,
  FragmentsScene,
  LogoSting,
  ProductHero,
  TypeCard,
} from "./launch/CineKit";
import { CINE_CHAPTERS, CINE_TOTAL_FRAMES, type CineChapter } from "./launch/cine";

export const LAUNCH_TOTAL_FRAMES = CINE_TOTAL_FRAMES;

export const AgentsAssistLaunch: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#ffffff" }}>
      <Atmosphere />
      <Series>
        {CINE_CHAPTERS.map((chapter) => (
          <Series.Sequence key={chapter.id} durationInFrames={chapter.durationInFrames}>
            <ChapterScene chapter={chapter} />
          </Series.Sequence>
        ))}
      </Series>
      <Sequence from={0} layout="none">
        <Audio src={staticFile("audio/score.wav")} volume={0.22} />
      </Sequence>
    </AbsoluteFill>
  );
};

const ChapterScene: React.FC<{ chapter: CineChapter }> = ({ chapter }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const opacity =
    interpolate(frame, [0, 8], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) *
    interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0.15], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <AbsoluteFill style={{ opacity: chapter.kind === "product" ? 1 : opacity }}>
      {chapter.kind === "logo" ? <LogoSting chapter={chapter} /> : null}
      {chapter.kind === "type" ? <TypeCard chapter={chapter} /> : null}
      {chapter.kind === "fragments" ? <FragmentsScene chapter={chapter} /> : null}
      {chapter.kind === "product" ? <ProductHero chapter={chapter} /> : null}
      {chapter.kind === "closer" ? <CloserCard chapter={chapter} /> : null}
      {chapter.voFile ? (
        <Sequence from={chapter.voStart} layout="none">
          <Audio src={staticFile(chapter.voFile)} volume={1} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
