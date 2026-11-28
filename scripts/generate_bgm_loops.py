#!/usr/bin/env python3
"""
V24.0 Procedural Royalty-Free Multi-Mood BGM Loop Generator
Generates 3 lightweight seamless 8.0s loopable mono 22050 Hz 16-bit PCM WAV files (< 360 KB each)
into web-studio/public/bgm/:
  1. bgm_curious.wav   (8.0s, C major warm pad + gentle slow pluck — discovery & science)
  2. bgm_tense.wav     (8.0s, A minor steady deep drone + soft subtle pulse — tension/chase)
  3. bgm_emotional.wav (8.0s, F major / D minor soft piano-pad chords — emotional twist/outro)

Uses ONLY Python standard library (math, struct, wave, pathlib).
"""

import math
import struct
import wave
from pathlib import Path

SAMPLE_RATE = 22050
LOOP_DUR_SEC = 8.0
TWO_PI = 2.0 * math.pi


def lowpass_1pole(samples, cutoff_hz):
    rc = 1.0 / (TWO_PI * cutoff_hz)
    dt = 1.0 / SAMPLE_RATE
    alpha = dt / (rc + dt)
    y = 0.0
    out = [0.0] * len(samples)
    for i, x in enumerate(samples):
        y = y + alpha * (x - y)
        out[i] = y
    return out


def make_seamless_loop(samples, target_peak=0.72):
    """Crossfade head and tail smoothly + normalize peak so looping produces zero clicks."""
    n = len(samples)
    fade_n = min(n // 16, int(0.18 * SAMPLE_RATE))
    for i in range(fade_n):
        w = 0.5 * (1.0 - math.cos(math.pi * i / fade_n))
        samples[i] *= w
        samples[n - 1 - i] *= w
    max_abs = max((abs(x) for x in samples), default=1.0)
    if max_abs > 1e-9:
        scale = target_peak / max_abs
        samples = [x * scale for x in samples]
    return samples


def write_mono_wav_16bit(out_path: Path, samples):
    out_path.parent.mkdir(parents=True, exist_ok=True)
    pcm = bytearray(len(samples) * 2)
    for i, s in enumerate(samples):
        clamped = max(-1.0, min(1.0, s))
        struct.pack_into("<h", pcm, i * 2, int(round(clamped * 32767.0)))
    with wave.open(str(out_path), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(bytes(pcm))


def add_pad_chord(buf, start_s, dur_s, freqs, amp):
    n = len(buf)
    s0 = max(0, int(round(start_s * SAMPLE_RATE)))
    length = int(round(dur_s * SAMPLE_RATE))
    s1 = min(n, s0 + length)
    fade_s = min(0.45, dur_s * 0.28)
    for i in range(s0, s1):
        t = (i - s0) / SAMPLE_RATE
        env = 1.0
        if t < fade_s:
            env = 0.5 * (1.0 - math.cos(math.pi * t / fade_s))
        elif t > dur_s - fade_s:
            env = 0.5 * (1.0 - math.cos(math.pi * (dur_s - t) / fade_s))
        val = 0.0
        for k, f in enumerate(freqs):
            val += 0.62 * math.sin(TWO_PI * f * t) + 0.24 * math.sin(TWO_PI * (f * 1.002) * t + k * 0.5)
        buf[i] += (val / max(1, len(freqs))) * env * amp


def add_pluck_note(buf, start_s, dur_s, freq, amp):
    n = len(buf)
    s0 = max(0, int(round(start_s * SAMPLE_RATE)))
    s1 = min(n, s0 + int(round(dur_s * SAMPLE_RATE)))
    for i in range(s0, s1):
        t = (i - s0) / SAMPLE_RATE
        attack = min(1.0, t / 0.012)
        decay = math.exp(-t * 3.8)
        tone = math.sin(TWO_PI * freq * t) + 0.18 * math.sin(TWO_PI * freq * 2.0 * t) * math.exp(-t * 8.0)
        buf[i] += tone * attack * decay * amp


def gen_bgm_curious():
    """8.0s C major warm pad + gentle slow pluck for science & curious storytelling."""
    n = int(round(LOOP_DUR_SEC * SAMPLE_RATE))
    buf = [0.0] * n
    chords = [
        (0.0, 2.0, [130.81, 196.00, 261.63, 329.63]),  # Cmaj
        (2.0, 2.0, [174.61, 220.00, 261.63, 329.63]),  # Fmaj7
        (4.0, 2.0, [196.00, 246.94, 293.66, 392.00]),  # G
        (6.0, 2.0, [130.81, 196.00, 261.63, 329.63]),  # Cmaj
    ]
    for st, dur, freqs in chords:
        add_pad_chord(buf, st, dur, freqs, amp=0.55)
    plucks = [
        (0.25, 523.25), (1.00, 659.25), (1.75, 587.33),
        (2.50, 523.25), (3.25, 440.00), (4.25, 587.33),
        (5.00, 659.25), (5.75, 783.99), (6.50, 659.25), (7.25, 523.25),
    ]
    for st, freq in plucks:
        add_pluck_note(buf, st, 0.85, freq, amp=0.22)
    filtered = lowpass_1pole(buf, cutoff_hz=1500.0)
    return make_seamless_loop(filtered, target_peak=0.72)


def gen_bgm_tense():
    """8.0s A minor deep stable drone + subtle rhythmic pulse for suspense & chase scenes."""
    n = int(round(LOOP_DUR_SEC * SAMPLE_RATE))
    buf = [0.0] * n
    # Steady warm A-minor drone pad (cycles smoothly across 8s)
    add_pad_chord(buf, 0.0, 4.0, [110.00, 164.81, 220.00, 261.63], amp=0.56)  # Am
    add_pad_chord(buf, 4.0, 4.0, [87.31, 164.81, 220.00, 261.63], amp=0.54)   # Fmaj7/Am tension
    # Gentle heartbeat-like low pulse every 0.5s
    for k in range(16):
        st = k * 0.50
        freq = 110.0 if (k % 2 == 0) else 82.41
        add_pluck_note(buf, st, 0.36, freq, amp=0.26 if (k % 4 == 0) else 0.16)
    filtered = lowpass_1pole(buf, cutoff_hz=820.0)
    return make_seamless_loop(filtered, target_peak=0.70)


def gen_bgm_emotional():
    """8.0s F major / D minor soft piano-pad progression for emotional twists & warm outros."""
    n = int(round(LOOP_DUR_SEC * SAMPLE_RATE))
    buf = [0.0] * n
    chords = [
        (0.0, 2.0, [174.61, 220.00, 261.63, 329.63]),  # Fmaj7
        (2.0, 2.0, [146.83, 220.00, 261.63, 349.23]),  # Dm7
        (4.0, 2.0, [116.54, 174.61, 220.00, 293.66]),  # Bbmaj7
        (6.0, 2.0, [130.81, 174.61, 196.00, 261.63]),  # Csus4
    ]
    for st, dur, freqs in chords:
        add_pad_chord(buf, st, dur, freqs, amp=0.60)
    melody = [
        (0.15, 523.25), (1.10, 440.00), (2.15, 587.33),
        (3.15, 523.25), (4.20, 466.16), (5.20, 440.00),
        (6.20, 392.00), (7.10, 523.25),
    ]
    for st, freq in melody:
        add_pluck_note(buf, st, 1.35, freq, amp=0.20)
    filtered = lowpass_1pole(buf, cutoff_hz=1250.0)
    return make_seamless_loop(filtered, target_peak=0.72)


def main():
    repo_root = Path(__file__).resolve().parent.parent
    out_dir = repo_root / "web-studio" / "public" / "bgm"
    out_dir.mkdir(parents=True, exist_ok=True)

    specs = [
        ("bgm_curious.wav", gen_bgm_curious()),
        ("bgm_tense.wav", gen_bgm_tense()),
        ("bgm_emotional.wav", gen_bgm_emotional()),
    ]
    for filename, samples in specs:
        out_path = out_dir / filename
        write_mono_wav_16bit(out_path, samples)
        size_kb = out_path.stat().st_size / 1024.0
        dur_s = len(samples) / SAMPLE_RATE
        print(f"Generated {out_path.relative_to(repo_root)} ({dur_s:.2f}s, {size_kb:.1f} KB)")


if __name__ == "__main__":
    main()
