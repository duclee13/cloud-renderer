#!/usr/bin/env python3
"""
V23.0 Procedural Royalty-Free Auto-SFX Pack Generator
Generates 5 lightweight mono 44100 Hz 16-bit PCM WAV files into web-studio/public/sfx/:
  1. pop_soft.wav    (0.11s) — soft speech bubble / SVG card pop (380 -> 760 Hz)
  2. whoosh_in.wav   (0.26s) — gentle air sweep opening HOST_EXPLAIN_OVERLAY (180 -> 340 Hz)
  3. whoosh_out.wav  (0.22s) — gentle reverse air sweep closing HOST_EXPLAIN_OVERLAY (320 -> 170 Hz)
  4. ding_warm.wav   (0.42s) — warm C6 + G6 chord chime for TIPS / SUMMARY cards
  5. alert_soft.wav  (0.24s) — soft 2-note low-mid alert pulse (440 Hz -> 330 Hz)

Uses ONLY Python standard library (math, struct, wave, random, pathlib).
"""

import math
import random
import struct
import wave
from pathlib import Path

SAMPLE_RATE = 44100
TWO_PI = 2.0 * math.pi


def normalize_and_fade(samples, target_peak=0.82, fade_ms=4.0):
    """Normalize peak safely and apply short zero-click head/tail cosine ramps."""
    if not samples:
        return samples
    max_abs = max(abs(x) for x in samples)
    if max_abs > 1e-9:
        scale = target_peak / max_abs
        samples = [x * scale for x in samples]

    fade_n = min(len(samples) // 4, max(1, int(SAMPLE_RATE * (fade_ms / 1000.0))))
    for i in range(fade_n):
        w = 0.5 * (1.0 - math.cos(math.pi * i / fade_n))
        samples[i] *= w
        samples[-1 - i] *= w
    return samples


def write_mono_wav_16bit(out_path: Path, samples):
    """Write normalized [-1, 1] float samples to mono 44100 Hz 16-bit PCM WAV."""
    out_path.parent.mkdir(parents=True, exist_ok=True)
    pcm_frames = bytearray()
    for s in samples:
        clamped = max(-1.0, min(1.0, s))
        pcm_frames.extend(struct.pack("<h", int(round(clamped * 32767.0))))

    with wave.open(str(out_path), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(bytes(pcm_frames))


def gen_pop_soft():
    """0.11s soft bubble/card pop: sine sweep 380 -> 760 Hz, 8ms attack + fast exponential decay."""
    dur = 0.11
    n = int(round(dur * SAMPLE_RATE))
    attack_sec = 0.008
    phase = 0.0
    out = []
    for i in range(n):
        t = i / SAMPLE_RATE
        u = t / dur
        freq = 380.0 + (760.0 - 380.0) * (u ** 0.72)
        phase += TWO_PI * freq / SAMPLE_RATE
        attack = min(1.0, t / attack_sec) if attack_sec > 0 else 1.0
        decay = math.exp(-t * 30.0)
        # Subtle 2nd harmonic warmth
        tone = math.sin(phase) + 0.18 * math.sin(2.0 * phase)
        out.append(tone * attack * decay)
    return normalize_and_fade(out, target_peak=0.80, fade_ms=3.0)


def lowpass_1pole(samples, alpha):
    """Simple 1-pole moving-average low-pass filter for silky air whoosh."""
    y = 0.0
    out = []
    for x in samples:
        y = y + alpha * (x - y)
        out.append(y)
    return out


def gen_whoosh(dur, f_start, f_end, seed):
    """Bell-enveloped low-passed white noise + subtle low sine sweep."""
    rng = random.Random(seed)
    n = int(round(dur * SAMPLE_RATE))
    raw_noise = [rng.uniform(-1.0, 1.0) for _ in range(n)]
    # Cascade two gentle 1-pole moving averages -> warm silky wind (no harsh hiss)
    filtered = lowpass_1pole(lowpass_1pole(raw_noise, 0.065), 0.085)

    phase = 0.0
    out = []
    for i in range(n):
        t = i / SAMPLE_RATE
        u = t / dur
        # Smooth bell curve (sin^1.5) for effortless fade-in & fade-out
        bell = math.sin(math.pi * u) ** 1.45
        freq = f_start + (f_end - f_start) * u
        phase += TWO_PI * freq / SAMPLE_RATE
        sine_bed = 0.34 * math.sin(phase)
        air_bed = 0.78 * filtered[i]
        out.append((air_bed + sine_bed) * bell)
    return normalize_and_fade(out, target_peak=0.78, fade_ms=6.0)


def gen_ding_warm():
    """0.42s warm chime chord: C6 (1046.5 Hz) + G6 (1568 Hz) at 0.35 level, smooth decay."""
    dur = 0.42
    n = int(round(dur * SAMPLE_RATE))
    attack_sec = 0.010
    f_c6 = 1046.5
    f_g6 = 1568.0
    out = []
    for i in range(n):
        t = i / SAMPLE_RATE
        attack = min(1.0, t / attack_sec)
        env_c = math.exp(-t * 6.8)
        env_g = math.exp(-t * 8.4)
        sample = (
            math.sin(TWO_PI * f_c6 * t) * env_c
            + 0.35 * math.sin(TWO_PI * f_g6 * t) * env_g
            + 0.14 * math.sin(TWO_PI * (f_c6 * 0.5) * t) * math.exp(-t * 5.2)
        )
        out.append(sample * attack)
    return normalize_and_fade(out, target_peak=0.80, fade_ms=5.0)


def gen_alert_soft():
    """0.24s soft 2-note low-mid alert pulse: 440 Hz then 330 Hz (warm, non-piercing)."""
    dur = 0.24
    n = int(round(dur * SAMPLE_RATE))
    split = 0.115
    out = []
    for i in range(n):
        t = i / SAMPLE_RATE
        if t < split:
            lt = t
            freq = 440.0
            note_dur = split
        else:
            lt = t - split
            freq = 330.0
            note_dur = dur - split

        attack = min(1.0, lt / 0.008)
        decay = math.exp(-lt * 16.0)
        tail = min(1.0, max(0.0, (note_dur - lt) / 0.012))
        env = attack * decay * tail
        # Soft triangle-like warm tone (fundamental + mild 2nd harmonic)
        tone = math.sin(TWO_PI * freq * lt) + 0.16 * math.sin(TWO_PI * (freq * 2.0) * lt)
        out.append(tone * env)
    return normalize_and_fade(out, target_peak=0.76, fade_ms=4.0)


def main():
    repo_root = Path(__file__).resolve().parent.parent
    out_dir = repo_root / "web-studio" / "public" / "sfx"
    out_dir.mkdir(parents=True, exist_ok=True)

    specs = [
        ("pop_soft.wav", gen_pop_soft()),
        ("whoosh_in.wav", gen_whoosh(0.26, 180.0, 340.0, seed=2301)),
        ("whoosh_out.wav", gen_whoosh(0.22, 320.0, 170.0, seed=2302)),
        ("ding_warm.wav", gen_ding_warm()),
        ("alert_soft.wav", gen_alert_soft()),
    ]

    for filename, samples in specs:
        out_path = out_dir / filename
        write_mono_wav_16bit(out_path, samples)
        size_kb = out_path.stat().st_size / 1024.0
        dur_s = len(samples) / SAMPLE_RATE
        print(f"Generated {out_path.relative_to(repo_root)} ({dur_s:.2f}s, {size_kb:.1f} KB)")


if __name__ == "__main__":
    main()
