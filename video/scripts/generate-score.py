#!/usr/bin/env python3
"""Original light SaaS score — soft pulse + airy pads. Not copied from any reference."""
from __future__ import annotations

import math
import struct
import wave
from pathlib import Path

SR = 44100
DUR = 86.0
N = int(SR * DUR)


def env_adsr(i: int, n: int, a=0.04, d=0.12, s=0.72, r=0.18) -> float:
    t = i / n
    if t < a:
        return t / a
    if t < a + d:
        return 1 - (1 - s) * ((t - a) / d)
    if t > 1 - r:
        return s * (1 - (t - (1 - r)) / r)
    return s


def tone(i: int, freq: float, amp: float) -> float:
    t = i / SR
    return amp * (
        0.62 * math.sin(2 * math.pi * freq * t)
        + 0.22 * math.sin(2 * math.pi * freq * 2 * t)
        + 0.08 * math.sin(2 * math.pi * freq * 3 * t)
    )


# Airy Cmaj7 / Am9 / Fmaj7 / Gsus progression, 8-bar feel (~2.4s per chord)
CHORDS = [
    [130.81, 164.81, 196.00, 246.94],  # C E G B
    [110.00, 164.81, 196.00, 246.94],  # A C E G
    [174.61, 220.00, 261.63, 329.63],  # F A C E
    [196.00, 246.94, 293.66, 392.00],  # G B D G
]
BAR = int(SR * 2.4)

samples = []
for i in range(N):
    bar_i = (i // BAR) % len(CHORDS)
    local = i % BAR
    pad = 0.0
    for f in CHORDS[bar_i]:
        pad += tone(i, f, 0.045)
        pad += tone(i, f * 0.5, 0.028)
    pad *= env_adsr(local, BAR, 0.12, 0.18, 0.78, 0.22)

    # Gentle 120bpm-ish pulse (eighths) — high, quiet
    beat = 0.5  # seconds
    phase = (i / SR) % beat
    click = math.exp(-phase * 28) * 0.035 * math.sin(2 * math.pi * 1760 * (i / SR))
    # offbeat shimmer
    phase2 = (i / SR + 0.25) % beat
    hat = math.exp(-phase2 * 42) * 0.018 * (1 if (i % 7) else 0.2) * (
        (i * 13 % 97) / 97 - 0.5
    )

    # Slow swell
    swell = 0.72 + 0.28 * math.sin(2 * math.pi * i / (SR * 16))
    v = (pad + click + hat) * swell
    samples.append(max(-1.0, min(1.0, v)))

# Fade in/out
fade = int(SR * 0.9)
for i in range(fade):
    samples[i] *= i / fade
    samples[-1 - i] *= i / fade

out = Path(__file__).resolve().parents[1] / "public" / "audio" / "score.wav"
out.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(out), "w") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    for s in samples:
        n = int(s * 28000)
        w.writeframes(struct.pack("<hh", n, n))
print(f"Wrote {out} ({DUR}s)")
