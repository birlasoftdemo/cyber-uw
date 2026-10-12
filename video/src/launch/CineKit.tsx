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
import type { CineChapter } from "./cine";

export const FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif';

export const cine = {
  ink: "#111827",
  mute: "#64748b",
  blue: "#3b82f6",
  blueSoft: "#7eb6ff",
  red: "#ec1c24",
  paper: "#ffffff",
} as const;

export const Atmosphere: React.FC<{ warmth?: number }> = ({ warmth = 0 }) => {
  const frame = useCurrentFrame();
  const a = interpolate(Math.sin(frame / 48), [-1, 1], [18, 38]);
  const b = interpolate(Math.cos(frame / 62), [-1, 1], [62, 82]);
  const c = interpolate(Math.sin(frame / 73), [-1, 1], [22, 48]);

  return (
    <AbsoluteFill style={{ background: cine.paper, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: "-18%",
          background: `
            radial-gradient(ellipse 58% 48% at ${a}% 12%, rgba(59,130,246,0.22) 0%, transparent 62%),
            radial-gradient(ellipse 50% 46% at ${b}% 88%, rgba(125,211,252,0.28) 0%, transparent 60%),
            radial-gradient(ellipse 42% 38% at 8% 78%, rgba(59,130,246,0.12) 0%, transparent 58%),
            radial-gradient(ellipse 36% 32% at 92% ${c}%, rgba(236,28,36,${0.05 + warmth * 0.06}) 0%, transparent 55%)
          `,
          filter: "blur(8px)",
        }}
      />
    </AbsoluteFill>
  );
};

const WordWall: React.FC<{ word: string; opacity?: number }> = ({
  word,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  const y = interpolate(frame, [0, 200], [0, -40]);
  const line = Array.from({ length: 8 }, () => word).join("   ");
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        opacity,
        pointerEvents: "none",
        transform: `translateY(${y}px)`,
      }}
    >
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={{
            fontFamily: FONT,
            fontSize: 92,
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "rgba(59,130,246,0.055)",
            whiteSpace: "nowrap",
            lineHeight: 1.55,
            marginLeft: i % 2 === 0 ? 0 : -120,
          }}
        >
          {line}
        </div>
      ))}
    </div>
  );
};

export const Wordmark: React.FC<{ size?: number }> = ({ size = 42 }) => (
  <div
    style={{
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontSize: size,
      fontWeight: 500,
      letterSpacing: "-0.02em",
      lineHeight: 1,
      color: "#4a4a4a",
    }}
  >
    birla<span style={{ color: cine.red }}>soft</span>
  </div>
);

export const TypedTitle: React.FC<{
  title: string;
  accent?: string;
  size?: number;
  color?: string;
  accentColor?: string;
}> = ({
  title,
  accent,
  size = 64,
  color = cine.ink,
  accentColor = cine.blue,
}) => {
  if (!accent || !title.includes(accent)) {
    return (
      <div
        style={{
          fontFamily: FONT,
          fontSize: size,
          fontWeight: 500,
          letterSpacing: "-0.035em",
          lineHeight: 1.15,
          color,
          textAlign: "center",
        }}
      >
        {title}
      </div>
    );
  }
  const [pre, post] = title.split(accent);
  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize: size,
        fontWeight: 500,
        letterSpacing: "-0.035em",
        lineHeight: 1.15,
        color,
        textAlign: "center",
      }}
    >
      {pre}
      <span style={{ color: accentColor, fontWeight: 600 }}>{accent}</span>
      {post}
    </div>
  );
};

export const Cursor: React.FC<{ x: number; y: number; opacity?: number }> = ({
  x,
  y,
  opacity = 1,
}) => (
  <div
    style={{
      position: "absolute",
      left: `${x}%`,
      top: `${y}%`,
      width: 22,
      height: 22,
      opacity,
      transform: "translate(-10%, -6%)",
      zIndex: 8,
      filter: "drop-shadow(0 2px 4px rgba(15,23,42,0.35))",
      pointerEvents: "none",
    }}
  >
    <svg viewBox="0 0 24 24" width="22" height="22">
      <path
        d="M4 2.5 L20 12.2 L12.4 13.7 L16.8 22 L13.1 23.5 L8.8 15.1 L4 19.6 Z"
        fill="#111827"
        stroke="#fff"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

export const ProductHero: React.FC<{ chapter: CineChapter }> = ({ chapter }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const enter = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 70, mass: 1.1 },
  });
  const exit = interpolate(
    frame,
    [durationInFrames - 14, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const scale = interpolate(
    frame,
    [0, durationInFrames],
    [chapter.zoomFrom ?? 1, chapter.zoomTo ?? 1.06],
  );
  const rx = interpolate(
    frame,
    [0, durationInFrames],
    [chapter.tiltFrom?.[0] ?? 4, chapter.tiltTo?.[0] ?? 1],
  );
  const ry = interpolate(
    frame,
    [0, durationInFrames],
    [chapter.tiltFrom?.[1] ?? -6, chapter.tiltTo?.[1] ?? 2],
  );
  const titleOn = spring({
    frame: frame - 6,
    fps,
    config: { damping: 16, stiffness: 90 },
  });

  let cross = 0;
  if (chapter.screenB && chapter.screenBAt != null) {
    cross = interpolate(
      frame,
      [chapter.screenBAt - 10, chapter.screenBAt + 8],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
  }

  const cx = chapter.cursorFrom
    ? interpolate(
        frame,
        [12, durationInFrames - 18],
        [chapter.cursorFrom[0], chapter.cursorTo?.[0] ?? chapter.cursorFrom[0]],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )
    : null;
  const cy = chapter.cursorFrom
    ? interpolate(
        frame,
        [12, durationInFrames - 18],
        [chapter.cursorFrom[1], chapter.cursorTo?.[1] ?? chapter.cursorFrom[1]],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )
    : null;

  return (
    <AbsoluteFill style={{ opacity: exit }}>
      <div
        style={{
          position: "absolute",
          left: 36,
          right: 36,
          top: 108,
          bottom: 118,
          perspective: 1700,
          opacity: interpolate(enter, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(enter, [0, 1], [36, 0])}px)`,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            transform: `rotateX(${rx}deg) rotateY(${ry}deg) scale(${interpolate(enter, [0, 1], [0.94, 1]) * scale})`,
            transformOrigin: "50% 28%",
            borderRadius: 18,
            overflow: "hidden",
            background: "#eef3fb",
            boxShadow:
              "0 50px 140px rgba(37,99,235,0.18), 0 18px 40px rgba(15,23,42,0.1)",
          }}
        >
          {chapter.screen ? (
            <Img
              src={staticFile(chapter.screen)}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: chapter.objectPosition ?? "top center",
              }}
            />
          ) : null}
          {chapter.screenB ? (
            <Img
              src={staticFile(chapter.screenB)}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: chapter.objectPosition ?? "top center",
                opacity: cross,
              }}
            />
          ) : null}
          {cx != null && cy != null ? <Cursor x={cx} y={cy} /> : null}
        </div>
        <div
          style={{
            position: "absolute",
            inset: -4,
            pointerEvents: "none",
            background: `
              linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 11%, rgba(255,255,255,0) 74%, rgba(247,250,255,0.92) 100%),
              linear-gradient(90deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 10%, rgba(255,255,255,0) 90%, rgba(255,255,255,0.32) 100%)
            `,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 64,
          right: 64,
          top: 22,
          opacity: interpolate(titleOn, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(titleOn, [0, 1], [12, 0])}px)`,
          zIndex: 6,
          textAlign: "center",
          fontFamily: FONT,
        }}
      >
        {chapter.kicker ? (
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: cine.red,
              marginBottom: 8,
            }}
          >
            {chapter.kicker}
          </div>
        ) : null}
        <div
          style={{
            fontSize: 40,
            fontWeight: 600,
            letterSpacing: "-0.03em",
            color: cine.blue,
            textShadow: "0 2px 0 rgba(255,255,255,0.85), 0 16px 40px rgba(255,255,255,0.9)",
            lineHeight: 1.15,
          }}
        >
          {chapter.title}
        </div>
      </div>
      {(chapter.why || chapter.win) && (
        <div
          style={{
            position: "absolute",
            left: 56,
            right: 56,
            bottom: 22,
            zIndex: 7,
            opacity: interpolate(titleOn, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(titleOn, [0, 1], [14, 0])}px)`,
            fontFamily: FONT,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            alignItems: "center",
          }}
        >
          {chapter.why ? (
            <div
              style={{
                maxWidth: 1480,
                fontSize: 20,
                lineHeight: 1.35,
                color: cine.ink,
                textAlign: "center",
                textShadow: "0 1px 0 #fff",
              }}
            >
              {chapter.why}
            </div>
          ) : null}
          {chapter.win ? (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: "rgba(255,255,255,0.92)",
                border: "1px solid rgba(15,23,42,0.08)",
                borderRadius: 999,
                padding: "8px 16px",
                fontSize: 16,
                fontWeight: 600,
                color: cine.ink,
                boxShadow: "0 10px 28px rgba(15,23,42,0.08)",
              }}
            >
              <span style={{ color: cine.red, letterSpacing: "0.1em", fontSize: 12, fontWeight: 800 }}>
                WIN
              </span>
              {chapter.win}
            </div>
          ) : null}
        </div>
      )}
    </AbsoluteFill>
  );
};

const FRAGMENTS = [
  { tag: "P", name: "Cyber application", meta: "PDF · inbound" },
  { tag: "X", name: "InfoSec questionnaire", meta: "XLSX · inbound" },
  { tag: "P", name: "Incident response plan", meta: "PDF · inbound" },
  { tag: "P", name: "Loss history", meta: "PDF · inbound" },
];

export const FragmentsScene: React.FC<{ chapter: CineChapter }> = ({
  chapter,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const titleOn = spring({ frame, fps, config: { damping: 16 } });
  const pull = interpolate(frame, [durationInFrames - 28, durationInFrames - 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fade = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: fade, fontFamily: FONT }}>
      <div
        style={{
          position: "absolute",
          left: 88,
          right: 88,
          top: 86,
          opacity: interpolate(titleOn, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(titleOn, [0, 1], [16, 0])}px)`,
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "0.16em",
            color: cine.red,
            marginBottom: 14,
          }}
        >
          {chapter.kicker ?? "01 / INBOUND"}
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 600,
            letterSpacing: "-0.035em",
            color: cine.ink,
            lineHeight: 1.12,
          }}
        >
          {chapter.title}
        </div>
        {chapter.why ? (
          <div style={{ marginTop: 14, fontSize: 22, color: cine.mute, maxWidth: 980, lineHeight: 1.4 }}>
            {chapter.why}
          </div>
        ) : chapter.subtitle ? (
          <div style={{ marginTop: 12, fontSize: 20, color: cine.mute }}>
            {chapter.subtitle}
          </div>
        ) : null}
        {chapter.win ? (
          <div
            style={{
              marginTop: 16,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "#fff",
              borderRadius: 999,
              padding: "8px 16px",
              fontSize: 16,
              fontWeight: 600,
              boxShadow: "0 10px 28px rgba(15,23,42,0.08)",
            }}
          >
            <span style={{ color: cine.red, letterSpacing: "0.1em", fontSize: 12, fontWeight: 800 }}>
              WIN
            </span>
            {chapter.win}
          </div>
        ) : null}
      </div>
      <div
        style={{
          position: "absolute",
          left: 72,
          right: 72,
          bottom: 88,
          display: "flex",
          gap: 22,
        }}
      >
        {FRAGMENTS.map((card, i) => {
          const on = spring({
            frame: frame - 8 - i * 5,
            fps,
            config: { damping: 14, stiffness: 90 },
          });
          return (
            <div
              key={card.name}
              style={{
                flex: 1,
                background: "#fff",
                borderRadius: 18,
                padding: "28px 24px",
                boxShadow: "0 18px 50px rgba(15,23,42,0.08)",
                border: "1px solid rgba(15,23,42,0.06)",
                opacity: interpolate(on, [0, 1], [0, 1]) * (1 - pull * 0.35),
                transform: `translateY(${interpolate(on, [0, 1], [40, 0]) - pull * 48}px) scale(${1 - pull * 0.08})`,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "rgba(236,28,36,0.1)",
                  color: cine.red,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 18,
                }}
              >
                {card.tag}
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: cine.ink,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.25,
                }}
              >
                {card.name}
              </div>
              <div style={{ marginTop: 8, fontSize: 14, color: cine.mute }}>
                {card.meta}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const TypeCard: React.FC<{ chapter: CineChapter }> = ({ chapter }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const on = spring({ frame, fps, config: { damping: 16, stiffness: 80 } });
  const fade = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        opacity: fade,
        justifyContent: "center",
        alignItems: "center",
        padding: 120,
      }}
    >
      {chapter.wall ? <WordWall word={chapter.wall} /> : null}
      <div
        style={{
          opacity: interpolate(on, [0, 1], [0, 1]),
          transform: `scale(${interpolate(on, [0, 1], [0.96, 1])})`,
          maxWidth: 1280,
        }}
      >
        <TypedTitle
          title={chapter.title}
          accent={chapter.accent}
          size={64}
          color={cine.ink}
          accentColor={cine.blue}
        />
        {chapter.why ? (
          <div
            style={{
              marginTop: 22,
              fontSize: 22,
              lineHeight: 1.4,
              color: cine.mute,
              textAlign: "center",
              fontFamily: FONT,
            }}
          >
            {chapter.why}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

export const LogoSting: React.FC<{ chapter: CineChapter }> = ({ chapter }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const on = spring({ frame, fps, config: { damping: 14 } });
  const fade = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        opacity: fade,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          textAlign: "center",
          opacity: interpolate(on, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(on, [0, 1], [14, 0])}px)`,
        }}
      >
        <Wordmark size={52} />
        <div
          style={{
            marginTop: 22,
            fontSize: 18,
            letterSpacing: "0.18em",
            fontWeight: 700,
            color: cine.mute,
            textTransform: "uppercase",
          }}
        >
          {chapter.subtitle}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const CloserCard: React.FC<{ chapter: CineChapter }> = ({ chapter }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const on = spring({ frame, fps, config: { damping: 16, stiffness: 70 } });
  const fade = interpolate(frame, [durationInFrames - 16, durationInFrames], [1, 0.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        opacity: fade,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FONT,
        padding: 100,
      }}
    >
      {chapter.wall ? <WordWall word={chapter.wall} opacity={0.9} /> : null}
      <div
        style={{
          textAlign: "center",
          maxWidth: 1280,
          opacity: interpolate(on, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(on, [0, 1], [20, 0])}px)`,
        }}
      >
        <div
          style={{
            fontSize: 52,
            fontWeight: 500,
            letterSpacing: "-0.035em",
            lineHeight: 1.2,
            color: cine.blue,
          }}
        >
          {chapter.title}
        </div>
        <div style={{ marginTop: 36, display: "flex", justifyContent: "center" }}>
          <Wordmark size={40} />
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: cine.mute,
          }}
        >
          {chapter.subtitle}
        </div>
        {chapter.why ? (
          <div
            style={{
              marginTop: 18,
              fontSize: 20,
              color: cine.mute,
              lineHeight: 1.4,
            }}
          >
            {chapter.why}
          </div>
        ) : null}
        {chapter.win ? (
          <div
            style={{
              marginTop: 22,
              fontSize: 18,
              fontWeight: 600,
              color: cine.ink,
            }}
          >
            {chapter.win}
          </div>
        ) : (
          <div
            style={{
              marginTop: 18,
              fontSize: 16,
              color: cine.mute,
            }}
          >
            Built around the underwriting desk. Human authority preserved.
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
