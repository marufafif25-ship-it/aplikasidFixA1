#!/usr/bin/env python3
"""Mix a local Indonesian narration with a soft original music bed for the 15s ad."""
import math
import struct
import sys
import wave

VOICE_PATH = sys.argv[1] if len(sys.argv) > 1 else "/tmp/aplikasid-narration.wav"
OUTPUT_PATH = sys.argv[2] if len(sys.argv) > 2 else "/tmp/aplikasid-meta-ad-mix.wav"
RATE = 44_100
DURATION = 15.0
TOTAL = int(RATE * DURATION)
TAU = math.tau

with wave.open(VOICE_PATH, "rb") as src:
    channels = src.getnchannels()
    width = src.getsampwidth()
    rate = src.getframerate()
    raw = src.readframes(src.getnframes())
if width != 2:
    raise RuntimeError("Expected 16-bit PCM narration")
voice_values = struct.unpack("<" + "h" * (len(raw) // 2), raw)
if channels > 1:
    voice_values = tuple(sum(voice_values[i:i + channels]) / channels for i in range(0, len(voice_values), channels))

# Resample the mono voice to the ad's 44.1 kHz timeline with linear interpolation.
source_count = len(voice_values)
voice = [0.0] * TOTAL
peak = max((abs(value) for value in voice_values), default=1) or 1
voice_gain = 0.78 / peak
for i in range(min(TOTAL, int(source_count * RATE / rate))):
    pos = i * rate / RATE
    left = int(pos)
    frac = pos - left
    a = voice_values[left]
    b = voice_values[min(left + 1, source_count - 1)]
    voice[i] = (a + (b - a) * frac) * voice_gain
speech_levels = []
for start in range(0, TOTAL, 441):
    block = voice[start:start + 441]
    average = sum(abs(value) for value in block) / max(1, len(block))
    speech_levels.append(min(1.0, max(0.0, (average - 0.012) / 0.13)))
speech_envelope = []
level = 0.0
for target in speech_levels:
    # Fast attack and a gentle release keep the music ducking smooth between words.
    coefficient = 0.35 if target > level else 0.10
    level += (target - level) * coefficient
    speech_envelope.append(level)

# A warm, restrained D major bed: soft sustained chords, a plucked four-note motif,
# and a very light pulse. This is synthesized locally and contains no licensed sample.
chords = [
    (146.83, 220.00, 293.66, 369.99),  # D
    (110.00, 164.81, 220.00, 277.18),  # A
    (123.47, 185.00, 246.94, 293.66),  # Bm
    (98.00, 146.83, 196.00, 246.94),   # G
]
melody = [587.33, 440.00, 369.99, 440.00, 659.25, 493.88, 440.00, 369.99]
beat = 0.6  # 100 BPM
step = 0.3
pcm = bytearray()
for i in range(TOTAL):
    t = i / RATE
    chord_index = min(3, int(t / 3.75))
    chord_start = chord_index * 3.75
    chord_age = t - chord_start
    chord_fade_in = min(1.0, chord_age / 0.55)
    end_fade = min(1.0, (DURATION - t) / 1.1)
    pad_env = min(chord_fade_in, end_fade)

    pad = 0.0
    for harmonic, frequency in enumerate(chords[chord_index]):
        phase = TAU * frequency * t
        pad += math.sin(phase) * (0.0075 if harmonic == 0 else 0.006)
        pad += math.sin(phase * 2.0) * 0.0011
    pad *= pad_env

    note_index = int(t / step) % len(melody)
    note_start = math.floor(t / step) * step
    note_age = t - note_start
    pluck = (math.sin(TAU * melody[note_index] * note_age) * 0.022
             + math.sin(TAU * melody[note_index] * 2.0 * note_age) * 0.006)
    pluck *= math.exp(-note_age * 5.8) * min(1.0, t / 0.25) * end_fade

    beat_phase = t % beat
    kick = 0.0
    if beat_phase < 0.18:
        kick_age = beat_phase
        kick_freq = 68.0 - 23.0 * (kick_age / 0.18)
        kick = math.sin(TAU * kick_freq * kick_age) * 0.025 * math.exp(-kick_age * 21.0)

    # Duck the bed while a sentence is being spoken.
    speech_level = speech_envelope[min(len(speech_envelope) - 1, i // 441)]
    music_gain = 0.82 - speech_level * 0.22
    music = (pad + pluck + kick) * music_gain

    left = voice[i] + music * 1.01
    right = voice[i] + music * 0.99
    # Gentle soft limiting keeps the mix clean without clipping peaks.
    left = math.tanh(left * 1.05) / 1.05
    right = math.tanh(right * 1.05) / 1.05
    pcm.extend(struct.pack("<hh", int(max(-1.0, min(1.0, left)) * 32767), int(max(-1.0, min(1.0, right)) * 32767)))

with wave.open(OUTPUT_PATH, "wb") as out:
    out.setnchannels(2)
    out.setsampwidth(2)
    out.setframerate(RATE)
    out.writeframes(pcm)
print(f"Wrote 15-second stereo mix: {OUTPUT_PATH}")
