#!/usr/bin/env python3
"""
vital2strudel.py — Convert Vital synthesizer presets to Strudel live coding patterns.

Usage:
    python vital2strudel.py preset.vital [--output-dir ./output] [--base-url /vital-wavetables/]

This script:
1. Parses .vital JSON preset files
2. Exports wavetable data as .wav files
3. Generates Strudel JS code using ONLY confirmed Strudel API features

Strudel features used:
  Synth: note(), .s(), .gain()
  Wavetable: samples() with custom .wav files, .begin() for position
  Envelope: .attack(), .decay(), .sustain(), .release()
  Filter: .lpf(hz), .hpf(hz), .bpf(hz), .lpq(), .hpq(), .bpq(), .ftype()
  Filter envelope: .lpenv(), .lpattack(), .lpdecay(), .lpsustain(), .lprelease(), .fanchor()
  Pitch envelope: .penv(), .pattack(), .pdecay(), .prelease(), .pcurve()
  FM: .fm(), .fmh(), .fmattack(), .fmdecay(), .fmsustain()
  Vibrato: .vib(), .vibmod()
  Tremolo: .tremolosync(), .tremolodepth(), .tremoloshape(), .tremoloskew()
  Effects: .room(), .roomsize(), .delay(), .delaytime(), .delayfeedback()
  Distortion: .shape(), .distort(), .crush(), .coarse()
  Phaser: .phaser(), .phaserdepth(), .phasercenter(), .phasersweep()
  Pan: .pan()
  Compressor: .compressor()
  Unison: .unison(), .detune(), .spread()
"""

import json
import gzip
import math
import struct
import base64
import argparse
import re
import sys
import os
from pathlib import Path
from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any, Tuple

# ============================================================
# Constants
# ============================================================

FRAME_SIZE = 2048  # Vital wavetable frame size

# Vital tempo index → seconds at 120 BPM
# For delay: these represent the delay time in seconds
TEMPO_TO_SECONDS = {
    0: 0.0469,  # 1/128 dotted
    1: 0.0313,  # 1/128
    2: 0.0938,  # 1/64 dotted
    3: 0.0625,  # 1/64
    4: 0.1875,  # 1/32 dotted
    5: 0.125,   # 1/32
    6: 0.375,   # 1/16 dotted
    7: 0.25,    # 1/16
    8: 0.75,    # 1/8 dotted
    9: 0.5,     # 1/8
    10: 1.5,    # 1/4 dotted
    11: 1.0,    # 1/4
    12: 3.0,    # 1/2 dotted
    13: 2.0,    # 1/2
    14: 6.0,    # 1/1 dotted
    15: 4.0,    # 1/1
    16: 8.0,    # 2/1
    17: 16.0,   # 4/1
}

NOTE_NAMES = ['c', 'db', 'd', 'eb', 'e', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'b']


# ============================================================
# Data Classes
# ============================================================

@dataclass
class Oscillator:
    index: int = 0
    enabled: bool = False
    level: float = 0.7071
    transpose: float = 0.0
    tune: float = 0.0
    unison_voices: int = 1
    unison_detune: float = 0.0
    unison_blend: float = 0.8
    wave_frame: float = 0.0  # 0-255
    destination: int = 0  # 0=filter1, 1=filter2, 2=both, 3=direct
    wavetable_frames: Optional[bytes] = None
    num_frames: int = 0


@dataclass
class Filter:
    index: int = 0
    enabled: bool = False
    model: int = 0
    style: int = 0
    blend: float = 0.0
    cutoff: float = 60.0  # MIDI note number
    resonance: float = 0.0
    drive: float = 0.0


@dataclass
class Envelope:
    index: int = 1
    attack: float = 0.0
    decay: float = 1.0
    sustain: float = 1.0
    release: float = 0.3


@dataclass
class LFO:
    index: int = 1
    frequency: float = 1.0
    sync: bool = False
    sync_type: int = 0  # 0=Trigger, 1=Sync, 2=Envelope, 3+=other envelope modes
    tempo: int = 7


@dataclass
class Modulation:
    source: str = ""
    destination: str = ""
    amount: float = 0.0
    bipolar: bool = False
    bypass: bool = False


@dataclass
class Effects:
    reverb_on: bool = False
    reverb_dry_wet: float = 0.0
    reverb_size: float = 0.5
    delay_on: bool = False
    delay_dry_wet: float = 0.0
    delay_feedback: float = 0.5
    delay_sync: bool = True
    delay_tempo: int = 9
    delay_frequency: float = 2.0
    chorus_on: bool = False
    chorus_dry_wet: float = 0.0
    chorus_frequency: float = 2.0
    distortion_on: bool = False
    distortion_drive: float = 0.0
    distortion_mix: float = 1.0
    distortion_type: int = 0
    phaser_on: bool = False
    phaser_dry_wet: float = 0.0
    phaser_center: float = 80.0
    phaser_mod_depth: float = 24.0
    phaser_frequency: float = 1.0
    phaser_feedback: float = 0.5
    flanger_on: bool = False
    flanger_dry_wet: float = 0.0
    compressor_on: bool = False
    compressor_mix: float = 1.0


@dataclass
class VitalPreset:
    name: str = ""
    oscillators: List[Oscillator] = field(default_factory=list)
    filters: List[Filter] = field(default_factory=list)
    envelopes: List[Envelope] = field(default_factory=list)
    lfos: List[LFO] = field(default_factory=list)
    modulations: List[Modulation] = field(default_factory=list)
    effects: Effects = field(default_factory=Effects)
    volume: float = 1.0
    macros: List[float] = field(default_factory=lambda: [0.0, 0.0, 0.0, 0.0])


# ============================================================
# Utility Functions
# ============================================================

def slugify(name: str) -> str:
    s = name.lower().strip()
    s = re.sub(r'[^\w\s-]', '', s)
    s = re.sub(r'[\s-]+', '_', s)
    s = s.strip('_')
    return s


def midi_to_hz(midi_note: float) -> float:
    return 8.17579 * (2.0 ** (midi_note / 12.0))


def midi_to_note_name(midi: int) -> str:
    octave = (midi // 12) - 1
    note_idx = midi % 12
    return f"{NOTE_NAMES[note_idx]}{octave}"


def vital_resonance_to_q(resonance: float) -> float:
    """Vital resonance (0-1) → Strudel Q (0-50). Musical range ~0-20."""
    return resonance * 20.0


def vital_volume_to_gain(volume: float) -> float:
    """Convert Vital volume to 0-1 gain."""
    if volume <= 0:
        return 0
    # Vital default volume ~7071 = unity gain (sqrt(2) * 5000)
    # Normalize so that ~7071 → 1.0
    gain = volume / 7071.0
    return max(0, min(1.5, gain))


def round_val(v: float, decimals: int = 3) -> float:
    return round(v, decimals)


def tempo_to_delaytime(tempo_idx: int) -> float:
    """Vital tempo index → Strudel delaytime (fraction of 1 cycle at ~120BPM).
    In Strudel, delaytime of 0.5 = half a cycle."""
    # Map to fraction: 1/4 note at 120BPM is 1 beat = 0.25 cycle (4 beats per cycle)
    fractions = {
        0: 0.012, 1: 0.008, 2: 0.023, 3: 0.016,
        4: 0.047, 5: 0.031, 6: 0.094, 7: 0.063,
        8: 0.188, 9: 0.125, 10: 0.375, 11: 0.25,
        12: 0.75, 13: 0.5, 14: 1.0, 15: 1.0,
    }
    idx = int(max(0, min(15, tempo_idx)))
    return fractions.get(idx, 0.125)


# ============================================================
# Wavetable Extraction
# ============================================================

def extract_wavetable_data(wavetable_dict: dict, frame_size: int = FRAME_SIZE) -> Optional[bytes]:
    """Extract raw float32 wavetable data from a Vital wavetable JSON object."""
    groups = wavetable_dict.get("groups", [])
    all_frames = []

    for group in groups:
        components = group.get("components", [])
        for comp in components:
            comp_type = comp.get("type", "")
            keyframes = comp.get("keyframes", [])

            if comp_type == "Wave Source":
                for kf in keyframes:
                    wave_data = kf.get("wave_data")
                    if wave_data:
                        decoded = base64.b64decode(wave_data)
                        if len(decoded) >= frame_size * 4:
                            all_frames.append(decoded[:frame_size * 4])
                        elif len(decoded) > 0:
                            all_frames.append(decoded)

            elif comp_type == "Line Source":
                for kf in keyframes:
                    if 'wave_data' in kf:
                        decoded = base64.b64decode(kf['wave_data'])
                        if len(decoded) >= frame_size * 4:
                            all_frames.append(decoded[:frame_size * 4])
                    elif 'points' in kf:
                        frame = _render_line_source(kf, frame_size)
                        all_frames.append(struct.pack(f'<{frame_size}f', *frame))

            elif comp_type == "Frequency Amplitude Phase":
                for kf in keyframes:
                    amps_b64 = kf.get("amplitudes")
                    phases_b64 = kf.get("phases")
                    if amps_b64:
                        frame = _reconstruct_harmonics(amps_b64, phases_b64, frame_size)
                        all_frames.append(frame)

            elif comp_type == "Audio File Source":
                audio_b64 = comp.get("audio_file")
                if audio_b64:
                    audio_bytes = base64.b64decode(audio_b64)
                    num_samples = len(audio_bytes) // 4
                    num_frames = num_samples // frame_size
                    if num_frames > 0:
                        for fi in range(min(num_frames, 256)):
                            offset = fi * frame_size * 4
                            chunk = audio_bytes[offset:offset + frame_size * 4]
                            if len(chunk) == frame_size * 4:
                                all_frames.append(chunk)
                    elif num_samples > 0:
                        padded = audio_bytes + b'\x00' * (frame_size * 4 - len(audio_bytes))
                        all_frames.append(padded[:frame_size * 4])
                else:
                    for kf in keyframes:
                        if 'wave_data' in kf:
                            decoded = base64.b64decode(kf['wave_data'])
                            if len(decoded) >= frame_size * 4:
                                all_frames.append(decoded[:frame_size * 4])

            elif comp_type in ("Wave Folder", "Wave Warp", "Frequency Filter",
                               "Phase Shift", "Wave Window", "Slew Limiter"):
                for kf in keyframes:
                    if 'wave_data' in kf:
                        decoded = base64.b64decode(kf['wave_data'])
                        if len(decoded) >= frame_size * 4:
                            all_frames.append(decoded[:frame_size * 4])

    if all_frames:
        return b''.join(all_frames)
    return None


def _render_line_source(keyframe: dict, frame_size: int) -> List[float]:
    """Render a waveform frame from Vital Line Source control points."""
    points_flat = keyframe.get('points', [0.0, 0.5, 1.0, 0.5])
    num_points = keyframe.get('num_points', len(points_flat) // 2)
    powers = keyframe.get('powers', [0.0] * num_points)

    points = []
    for i in range(num_points):
        x = points_flat[i * 2] if i * 2 < len(points_flat) else 0
        y = points_flat[i * 2 + 1] if i * 2 + 1 < len(points_flat) else 0
        points.append((x, y))
    points.sort(key=lambda p: p[0])

    frame = []
    for i in range(frame_size):
        x = i / frame_size
        y = 0.5

        for j in range(len(points) - 1):
            x0, y0 = points[j]
            x1, y1 = points[j + 1]
            if x0 <= x <= x1 or (j == len(points) - 2):
                if x1 == x0:
                    t = 0.0
                else:
                    t = (x - x0) / (x1 - x0)
                t = max(0, min(1, t))

                power = powers[j] if j < len(powers) else 0.0
                if abs(power) > 0.001:
                    if power > 0:
                        t = t ** (1.0 + power * 4)
                    else:
                        t = 1.0 - (1.0 - t) ** (1.0 - power * 4)

                y = y0 + t * (y1 - y0)
                break
        else:
            if points:
                y = points[-1][1]

        frame.append(y * 2.0 - 1.0)

    return frame


def _reconstruct_harmonics(amps_b64: str, phases_b64: str = None, frame_size: int = FRAME_SIZE) -> bytes:
    """Reconstruct a waveform frame from spectral data."""
    try:
        amp_bytes = base64.b64decode(amps_b64)
        num_harmonics = len(amp_bytes) // 4
        amps = struct.unpack(f'<{num_harmonics}f', amp_bytes)

        if phases_b64:
            phase_bytes = base64.b64decode(phases_b64)
            phases = struct.unpack(f'<{num_harmonics}f', phase_bytes)
        else:
            phases = [0.0] * num_harmonics

        samples = [0.0] * frame_size
        for h in range(1, min(num_harmonics, frame_size // 2)):
            if abs(amps[h]) < 0.0001:
                continue
            for i in range(frame_size):
                t = i / frame_size
                samples[i] += amps[h] * math.sin(2 * math.pi * h * t + phases[h])

        peak = max(abs(s) for s in samples) or 1.0
        samples = [s / peak for s in samples]
        return struct.pack(f'<{frame_size}f', *samples)
    except Exception:
        return b'\x00' * (frame_size * 4)


# ============================================================
# WAV Export
# ============================================================

def export_wavetable_wav(osc: Oscillator, output_path: str, frame_size: int = FRAME_SIZE) -> bool:
    """Export oscillator's wavetable frames as a 16-bit mono WAV file."""
    if not osc.wavetable_frames:
        return False

    num_samples = len(osc.wavetable_frames) // 4
    if num_samples == 0:
        return False

    floats = struct.unpack(f'<{num_samples}f', osc.wavetable_frames)

    peak = max(abs(f) for f in floats) or 1.0
    scale = 32767.0 / peak if peak > 0.0001 else 0

    int16_data = b''
    for f in floats:
        sample = int(max(-32768, min(32767, f * scale)))
        int16_data += struct.pack('<h', sample)

    sample_rate = 44100
    num_channels = 1
    bits_per_sample = 16
    byte_rate = sample_rate * num_channels * bits_per_sample // 8
    block_align = num_channels * bits_per_sample // 8
    data_size = len(int16_data)

    with open(output_path, 'wb') as f:
        f.write(b'RIFF')
        f.write(struct.pack('<I', 36 + data_size))
        f.write(b'WAVE')
        f.write(b'fmt ')
        f.write(struct.pack('<I', 16))
        f.write(struct.pack('<H', 1))
        f.write(struct.pack('<H', num_channels))
        f.write(struct.pack('<I', sample_rate))
        f.write(struct.pack('<I', byte_rate))
        f.write(struct.pack('<H', block_align))
        f.write(struct.pack('<H', bits_per_sample))
        f.write(b'data')
        f.write(struct.pack('<I', data_size))
        f.write(int16_data)

    return True


# ============================================================
# Preset Parsing
# ============================================================

def load_vital_preset(filepath: str) -> dict:
    """Load a .vital preset file (JSON or gzipped JSON)."""
    with open(filepath, 'rb') as f:
        header = f.read(2)

    if header == b'\x1f\x8b':
        with gzip.open(filepath, 'rt', encoding='utf-8') as f:
            return json.load(f)
    else:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)


def parse_preset(raw: dict, name_override: str = None) -> VitalPreset:
    """Parse a raw Vital JSON dict into a structured VitalPreset."""
    settings = raw.get('settings', {})
    preset = VitalPreset()

    preset.name = name_override or raw.get('preset_name', 'Untitled')

    vol = settings.get('volume', 7071.0)
    preset.volume = vital_volume_to_gain(vol)

    for i in range(4):
        preset.macros[i] = settings.get(f'macro_control_{i + 1}', 0.0)

    wavetables = settings.get('wavetables', [])
    for i in range(3):
        osc = _parse_oscillator(settings, i, wavetables)
        preset.oscillators.append(osc)

    for i in range(2):
        flt = _parse_filter(settings, i)
        preset.filters.append(flt)

    for i in range(1, 7):
        env = _parse_envelope(settings, i)
        preset.envelopes.append(env)

    for i in range(1, 9):
        lfo = _parse_lfo(settings, i)
        preset.lfos.append(lfo)

    preset.effects = _parse_effects(settings)
    preset.modulations = _parse_modulations(settings)

    return preset


def _parse_oscillator(settings: dict, index: int, wavetables: list) -> Oscillator:
    prefix = f"osc_{index + 1}_"
    osc = Oscillator(index=index)

    osc.enabled = settings.get(f'{prefix}on', 0.0) >= 0.5
    osc.level = settings.get(f'{prefix}level', 0.7071)
    osc.transpose = settings.get(f'{prefix}transpose', 0.0)
    osc.tune = settings.get(f'{prefix}tune', 0.0)
    osc.unison_voices = int(settings.get(f'{prefix}unison_voices', 1.0))
    osc.unison_detune = settings.get(f'{prefix}unison_detune', 0.0)
    osc.unison_blend = settings.get(f'{prefix}unison_blend', 0.8)
    osc.wave_frame = settings.get(f'{prefix}wave_frame', 0.0)
    osc.destination = int(settings.get(f'{prefix}destination', 0.0))

    if index < len(wavetables):
        wt_dict = wavetables[index]
        data = extract_wavetable_data(wt_dict)
        if data:
            osc.wavetable_frames = data
            osc.num_frames = len(data) // (FRAME_SIZE * 4)

    return osc


def _parse_filter(settings: dict, index: int) -> Filter:
    prefix = f"filter_{index + 1}_"
    flt = Filter(index=index)

    flt.enabled = settings.get(f'{prefix}on', 0.0) >= 0.5
    flt.model = int(settings.get(f'{prefix}model', 0.0))
    flt.style = int(settings.get(f'{prefix}style', 0.0))
    flt.blend = settings.get(f'{prefix}blend', 0.0)
    flt.cutoff = settings.get(f'{prefix}cutoff', 60.0)
    flt.resonance = settings.get(f'{prefix}resonance', 0.0)
    flt.drive = settings.get(f'{prefix}drive', 0.0)

    return flt


def _parse_envelope(settings: dict, index: int) -> Envelope:
    prefix = f"env_{index}_"
    env = Envelope(index=index)
    env.attack = settings.get(f'{prefix}attack', 0.0)
    env.decay = settings.get(f'{prefix}decay', 1.0)
    env.sustain = settings.get(f'{prefix}sustain', 1.0)
    env.release = settings.get(f'{prefix}release', 0.3)
    return env


def _parse_lfo(settings: dict, index: int) -> LFO:
    prefix = f"lfo_{index}_"
    lfo = LFO(index=index)
    lfo.frequency = settings.get(f'{prefix}frequency', 1.0)
    lfo.sync = settings.get(f'{prefix}sync', 0.0) >= 0.5
    lfo.sync_type = int(settings.get(f'{prefix}sync_type', 0.0))
    lfo.tempo = int(settings.get(f'{prefix}tempo', 7.0))
    return lfo


def _parse_effects(settings: dict) -> Effects:
    fx = Effects()
    fx.reverb_on = settings.get('reverb_on', 0.0) >= 0.5
    fx.reverb_dry_wet = settings.get('reverb_dry_wet', 0.0)
    fx.reverb_size = settings.get('reverb_size', 0.5)
    fx.delay_on = settings.get('delay_on', 0.0) >= 0.5
    fx.delay_dry_wet = settings.get('delay_dry_wet', 0.0)
    fx.delay_feedback = settings.get('delay_feedback', 0.5)
    fx.delay_sync = settings.get('delay_sync', 1.0) >= 0.5
    fx.delay_tempo = int(settings.get('delay_tempo', 9.0))
    fx.delay_frequency = settings.get('delay_frequency', 2.0)
    fx.chorus_on = settings.get('chorus_on', 0.0) >= 0.5
    fx.chorus_dry_wet = settings.get('chorus_dry_wet', 0.0)
    fx.chorus_frequency = settings.get('chorus_frequency', 2.0)
    fx.distortion_on = settings.get('distortion_on', 0.0) >= 0.5
    fx.distortion_drive = settings.get('distortion_drive', 0.0)
    fx.distortion_mix = settings.get('distortion_mix', 1.0)
    fx.distortion_type = int(settings.get('distortion_type', 0.0))
    fx.phaser_on = settings.get('phaser_on', 0.0) >= 0.5
    fx.phaser_dry_wet = settings.get('phaser_dry_wet', 0.0)
    fx.phaser_center = settings.get('phaser_center', 80.0)
    fx.phaser_mod_depth = settings.get('phaser_mod_depth', 24.0)
    fx.phaser_frequency = settings.get('phaser_frequency', 1.0)
    fx.phaser_feedback = settings.get('phaser_feedback', 0.5)
    fx.flanger_on = settings.get('flanger_on', 0.0) >= 0.5
    fx.flanger_dry_wet = settings.get('flanger_dry_wet', 0.0)
    fx.compressor_on = settings.get('compressor_on', 0.0) >= 0.5
    fx.compressor_mix = settings.get('compressor_mix', 1.0)
    return fx


def _parse_modulations(settings: dict) -> List[Modulation]:
    """Parse modulation matrix from settings['modulations'] list."""
    mods_list = settings.get('modulations', [])
    if not isinstance(mods_list, list):
        return []

    result = []
    for i, mod_entry in enumerate(mods_list):
        source = mod_entry.get('source', '')
        dest = mod_entry.get('destination', '')
        if not source or not dest:
            continue

        idx = i + 1  # 1-indexed
        amount = settings.get(f'modulation_{idx}_amount', 0.0)
        bipolar = settings.get(f'modulation_{idx}_bipolar', 0.0) >= 0.5
        bypass = settings.get(f'modulation_{idx}_bypass', 0.0) >= 0.5

        if bypass or amount == 0.0:
            continue

        result.append(Modulation(
            source=source, destination=dest, amount=amount,
            bipolar=bipolar, bypass=bypass,
        ))

    return result


# ============================================================
# Modulation Analysis
# ============================================================

def _analyze_modulations(preset: VitalPreset) -> dict:
    """Analyze modulations and categorize into Strudel-mappable features.

    Returns a dict with:
      - 'filter_N_env': {env_index, amount, decay?}
      - 'osc_N_pitch_env': {env_index, amount, semitones?, decay?}
      - 'osc_N_vibrato': {frequency, depth}
      - 'osc_N_tremolo': {cycles, depth}
      - 'osc_N_level_env': True (osc level animated by envelope-mode LFO)
      - 'global_tremolo': {cycles, depth}
      - 'unmapped': [descriptions]
    """
    result = {'unmapped': []}

    for mod in preset.modulations:
        src = mod.source
        dst = mod.destination
        amt = mod.amount
        mapped = False

        # --- Envelope → Filter Cutoff → .lpenv() ---
        if 'env' in src and 'filter' in dst and 'cutoff' in dst:
            env_idx = _extract_index(src)
            flt_idx = _extract_index(dst)
            if env_idx and flt_idx:
                key = f'filter_{flt_idx}_env'
                if key not in result:
                    result[key] = {'env_index': env_idx, 'amount': amt}
                    mapped = True

        # --- Envelope → Osc Transpose → .penv() ---
        elif 'env' in src and ('transpose' in dst or 'tune' in dst) and 'filter' not in dst:
            env_idx = _extract_index(src)
            osc_idx = _extract_osc_index(dst)
            if env_idx:
                if not osc_idx:
                    osc_idx = 1
                key = f'osc_{osc_idx}_pitch_env'
                if key not in result:
                    result[key] = {'env_index': env_idx, 'amount': amt}
                    mapped = True

        # --- LFO → Osc Transpose/Tune or voice_transpose ---
        elif 'lfo' in src and ('transpose' in dst or 'tune' in dst) and 'filter' not in dst:
            lfo_idx = _extract_index(src)
            osc_idx = _extract_osc_index(dst)
            if lfo_idx:
                lfo = _get_lfo(preset, lfo_idx)
                if not osc_idx:
                    osc_idx = 1
                if lfo and lfo.sync_type >= 2:
                    # Envelope-mode LFO → pitch = pitch envelope
                    key = f'osc_{osc_idx}_pitch_env'
                    if key not in result:
                        semitones = amt * 60.0
                        decay = 1.0 / max(0.1, lfo.frequency) if lfo.frequency > 0 else 0.5
                        result[key] = {'env_index': 0, 'amount': amt,
                                      'semitones': semitones, 'decay': min(decay, 2.0)}
                        mapped = True
                elif lfo and lfo.sync_type < 2:
                    # Looping LFO → vibrato
                    freq = _get_lfo_frequency(lfo)
                    if freq < 20:
                        depth = abs(amt) * 60.0
                        depth = min(depth, 24.0)
                        key = f'osc_{osc_idx}_vibrato'
                        if key not in result:
                            result[key] = {'frequency': round_val(freq, 2), 'depth': round_val(depth, 2)}
                            mapped = True

        # --- LFO → Osc Level ---
        elif 'lfo' in src and 'level' in dst and ('osc' in dst or 'sample' in dst):
            lfo_idx = _extract_index(src)
            osc_idx = _extract_osc_index(dst) or 1
            if lfo_idx:
                lfo = _get_lfo(preset, lfo_idx)
                if lfo and lfo.sync_type >= 2:
                    result[f'osc_{osc_idx}_level_env'] = True
                    mapped = True
                elif lfo and lfo.sync_type < 2:
                    freq = _get_lfo_frequency(lfo)
                    key = f'osc_{osc_idx}_tremolo'
                    if key not in result:
                        result[key] = {'cycles': round_val(freq, 2), 'depth': round_val(abs(amt), 2)}
                        mapped = True

        # --- LFO → Filter Cutoff ---
        elif 'lfo' in src and 'filter' in dst and 'cutoff' in dst:
            lfo_idx = _extract_index(src)
            flt_idx = _extract_index(dst)
            if lfo_idx and flt_idx:
                lfo = _get_lfo(preset, lfo_idx)
                if lfo and lfo.sync_type >= 2:
                    key = f'filter_{flt_idx}_env'
                    if key not in result:
                        decay = 1.0 / max(0.1, lfo.frequency) if lfo.frequency > 0 else 0.5
                        result[key] = {'env_index': 0, 'amount': amt, 'decay': min(decay, 2.0)}
                        mapped = True
                else:
                    # Looping LFO → filter cutoff: add average boost to cutoff
                    # This approximates the midpoint of the LFO sweep
                    # Store as normalized 0-1 value (will be multiplied by 128 later)
                    key = f'filter_{flt_idx}_cutoff_boost'
                    result[key] = result.get(key, 0) + abs(amt) * 0.5
                    mapped = True

        # --- LFO → volume → global tremolo ---
        elif 'lfo' in src and dst == 'volume':
            lfo_idx = _extract_index(src)
            if lfo_idx:
                lfo = _get_lfo(preset, lfo_idx)
                if lfo and lfo.sync_type < 2:
                    freq = _get_lfo_frequency(lfo)
                    if 'global_tremolo' not in result:
                        result['global_tremolo'] = {'cycles': round_val(freq, 2), 'depth': round_val(abs(amt), 2)}
                        mapped = True
                else:
                    mapped = True  # envelope mode volume, skip

        # --- Velocity/ModWheel/Aftertouch/Note → skip (performance controls) ---
        elif src in ('velocity', 'aftertouch', 'mod_wheel', 'pitch_wheel', 'note',
                     'stereo', 'lift', 'slide'):
            mapped = True

        # --- Macro → try to apply initial value ---
        elif 'macro_control' in src:
            macro_idx = _extract_index(src)
            if macro_idx and macro_idx <= 4:
                macro_val = preset.macros[macro_idx - 1]
                if macro_val > 0.01:
                    effective = amt * macro_val
                    mapped = _try_apply_macro(result, dst, effective, preset)
                else:
                    mapped = True

        # --- Env → other targets (effects, levels) → skip ---
        elif 'env' in src:
            if 'level' in dst and 'osc' in dst:
                # Envelope → osc level: mark as level_env so gain isn't 0
                osc_idx = _extract_osc_index(dst) or 1
                result[f'osc_{osc_idx}_level_env'] = True
                mapped = True
            elif any(x in dst for x in ['level', 'volume', 'mix', 'dry_wet', 'drive',
                                       'wave_frame', 'distortion', 'spectral', 'pan']):
                mapped = True

        # --- Random sources → can't map ---
        elif 'random' in src:
            pass  # will be reported as unmapped

        if not mapped:
            desc = f"{src} → {dst} (amount: {round_val(amt)})"
            result['unmapped'].append(desc)

    return result


def _try_apply_macro(result: dict, dst: str, effective_amount: float, preset: VitalPreset) -> bool:
    """Try to apply a macro→destination modulation. Returns True if handled."""
    if 'filter' in dst and 'cutoff' in dst:
        flt_idx = _extract_index(dst)
        if flt_idx:
            key = f'filter_{flt_idx}_cutoff_boost'
            result[key] = result.get(key, 0) + effective_amount
            return True
    if any(x in dst for x in ['dry_wet', 'mix', 'level', 'wave_frame', 'detune',
                               'drive', 'feedback', 'pan', 'transpose',
                               'distortion', 'spectral', 'volume']):
        return True
    return False


def _extract_index(name: str) -> Optional[int]:
    match = re.search(r'_(\d+)', name)
    return int(match.group(1)) if match else None


def _extract_osc_index(name: str) -> Optional[int]:
    match = re.search(r'osc_(\d+)', name)
    return int(match.group(1)) if match else None


def _get_lfo(preset: VitalPreset, lfo_idx: int) -> Optional[LFO]:
    for lfo in preset.lfos:
        if lfo.index == lfo_idx:
            return lfo
    return None


def _get_lfo_frequency(lfo: LFO) -> float:
    if lfo.sync:
        period = TEMPO_TO_SECONDS.get(lfo.tempo, 1.0)
        return 1.0 / period if period > 0 else 1.0
    else:
        return max(0.01, lfo.frequency)


# ============================================================
# Strudel Code Generation
# ============================================================

def generate_strudel_code(preset: VitalPreset, base_url: str, slug: str) -> str:
    """Generate Strudel JavaScript code from a parsed VitalPreset."""

    # Get active oscillators
    active_oscs = [o for o in preset.oscillators if o.enabled and o.wavetable_frames]
    if not active_oscs:
        active_oscs = [o for o in preset.oscillators if o.enabled]
    if not active_oscs and preset.oscillators:
        active_oscs = [preset.oscillators[0]]

    # Analyze modulations
    mod_analysis = _analyze_modulations(preset)

    lines = []
    lines.append(f"// Vital Preset: {preset.name}")
    lines.append("// Auto-generated by vital2strudel")
    lines.append("")

    # Wavetable loading
    wt_oscs = [o for o in active_oscs if o.wavetable_frames]
    if wt_oscs:
        lines.append("// Load wavetables")
        lines.append(f'await samples({{')
        lines.append(f'  "_base": "{base_url}",')
        for osc in wt_oscs:
            key = f"{slug}_osc{osc.index + 1}"
            lines.append(f'  "{key}": ["{key}.wav"],')
        lines.append('})')
        lines.append("")

    # Pattern
    lines.append("// Pattern — change the notes to taste!")
    if len(active_oscs) > 1:
        lines.append("stack(")
        for oi, osc in enumerate(active_oscs):
            osc_lines = _gen_osc_code(preset, osc, slug, mod_analysis)
            code = "\n".join(osc_lines)
            indented = "  " + code.replace("\n", "\n  ")
            if oi < len(active_oscs) - 1:
                indented += ","
            lines.append(indented)
        lines.append(")")
    elif active_oscs:
        osc_lines = _gen_osc_code(preset, active_oscs[0], slug, mod_analysis)
        lines.extend(osc_lines)
    else:
        lines.append('note("c3 e3 g3 b3").s("triangle")')

    # Unmapped modulations
    unmapped = mod_analysis.get('unmapped', [])
    if unmapped:
        lines.append("")
        lines.append("// === Unmapped modulations (Vital-specific) ===")
        for desc in unmapped:
            lines.append(f"// {desc}")

    return "\n".join(lines) + "\n"


def _gen_osc_code(preset: VitalPreset, osc: Oscillator, slug: str, mod_analysis: dict) -> List[str]:
    """Generate code lines for one oscillator."""
    lines = []

    # Determine base MIDI for note pattern
    base_midi = 60 + int(osc.transpose)
    notes = _gen_notes(base_midi)
    lines.append(f'note("{notes}")')

    # Sound source
    if osc.wavetable_frames:
        key = f"{slug}_osc{osc.index + 1}"
        lines.append(f'  .s("{key}")')
    else:
        lines.append('  .s("sawtooth")')

    # Wavetable position via .begin()
    if osc.wave_frame > 0.5 and osc.num_frames > 1:
        pos = round_val(min(1.0, osc.wave_frame / 255.0), 3)
        lines.append(f'  .begin({pos})')

    # Unison
    if osc.unison_voices > 1:
        lines.append(f'  .unison({osc.unison_voices})')
        if osc.unison_detune > 0.1:
            lines.append(f'  .detune({round_val(osc.unison_detune, 3)})')
        if abs(osc.unison_blend - 0.8) > 0.05:
            lines.append(f'  .spread({round_val(osc.unison_blend, 3)})')

    # Gain
    # If there's a level envelope mod or tremolo and static level is near 0,
    # the osc is still active — use preset.volume instead
    has_level_env = mod_analysis.get(f'osc_{osc.index + 1}_level_env', False)
    has_level_tremolo = mod_analysis.get(f'osc_{osc.index + 1}_tremolo', None)
    if (has_level_env or has_level_tremolo) and osc.level < 0.01:
        gain = round_val(preset.volume, 3)
    else:
        gain = round_val(osc.level * preset.volume, 3)
    gain = max(0.01, min(1.0, gain))
    if gain != 1.0:
        lines.append(f'  .gain({gain})')

    # Amplitude envelope
    env1 = preset.envelopes[0] if preset.envelopes else Envelope()
    env_lines = _gen_amp_env(env1)
    if env_lines:
        lines.append('  // envelope')
        lines.extend(env_lines)

    # Filter
    flt_lines = _gen_filter(preset, osc, mod_analysis)
    if flt_lines:
        lines.append('  // filter')
        lines.extend(flt_lines)

    # Pitch envelope
    penv_lines = _gen_pitch_env(preset, osc, mod_analysis)
    if penv_lines:
        lines.append('  // pitch')
        lines.extend(penv_lines)

    # Vibrato
    vib_lines = _gen_vibrato(preset, osc, mod_analysis)
    if vib_lines:
        lines.extend(vib_lines)

    # Tremolo
    trem_lines = _gen_tremolo(preset, osc, mod_analysis)
    if trem_lines:
        lines.extend(trem_lines)

    # Effects
    fx_lines = _gen_effects(preset)
    if fx_lines:
        lines.append('  // effects')
        lines.extend(fx_lines)

    return lines


def _gen_notes(base_midi: int) -> str:
    """Generate a 4-note chord pattern."""
    if base_midi < 24:
        base_midi = 36 + (base_midi % 12)
    elif base_midi > 96:
        base_midi = 72 + (base_midi % 12)

    intervals = [0, 4, 7, 11]  # major 7th
    notes = [midi_to_note_name(base_midi + iv) for iv in intervals]
    return " ".join(notes)


def _gen_amp_env(env: Envelope) -> List[str]:
    parts = []
    if env.attack > 0.005:
        parts.append(f'  .attack({round_val(env.attack)})')
    if env.decay < 0.99:
        parts.append(f'  .decay({round_val(env.decay)})')
    if env.sustain < 0.995:
        parts.append(f'  .sustain({round_val(env.sustain)})')
    if env.release > 0.01 and abs(env.release - 0.3) > 0.01:
        parts.append(f'  .release({round_val(env.release)})')
    return parts


def _gen_filter(preset: VitalPreset, osc: Oscillator, mod_analysis: dict) -> List[str]:
    parts = []

    dest = osc.destination
    if dest == 3:  # direct, no filter
        return parts

    flt_indices = [0] if dest == 0 else [1] if dest == 1 else [0, 1] if dest == 2 else []
    if not flt_indices:
        return parts

    flt = preset.filters[flt_indices[0]] if flt_indices[0] < len(preset.filters) else None
    if not flt or not flt.enabled:
        return parts

    # Cutoff in Hz (with possible boost from macro modulation)
    cutoff_midi = flt.cutoff
    boost = mod_analysis.get(f'filter_{flt.index + 1}_cutoff_boost', 0)
    if boost:
        # Boost is normalized 0-1 amount * full range (~128 MIDI notes)
        cutoff_midi += boost * 128
    cutoff_hz = midi_to_hz(cutoff_midi)
    cutoff_hz = max(20, min(20000, cutoff_hz))

    # Determine filter type
    ftype = _get_filter_type(flt)

    if ftype == 'lp':
        parts.append(f'  .lpf({int(cutoff_hz)})')
        if flt.resonance > 0.01:
            parts.append(f'  .lpq({round_val(vital_resonance_to_q(flt.resonance), 1)})')
    elif ftype == 'hp':
        parts.append(f'  .hpf({int(cutoff_hz)})')
        if flt.resonance > 0.01:
            parts.append(f'  .hpq({round_val(vital_resonance_to_q(flt.resonance), 1)})')
    elif ftype == 'bp':
        parts.append(f'  .bpf({int(cutoff_hz)})')
        if flt.resonance > 0.01:
            parts.append(f'  .bpq({round_val(vital_resonance_to_q(flt.resonance), 1)})')

    # Strudel ftype
    strudel_ftype = _get_strudel_ftype(flt)
    if strudel_ftype:
        parts.append(f'  .ftype("{strudel_ftype}")')

    # Filter envelope
    fenv = mod_analysis.get(f'filter_{flt.index + 1}_env', None)
    if fenv:
        env_idx = fenv['env_index']
        amount = fenv['amount']
        lpenv_octaves = round_val(amount * 8.0, 1)

        if abs(lpenv_octaves) >= 0.5:
            parts.append(f'  .lpenv({lpenv_octaves})')

            if env_idx > 0 and env_idx <= len(preset.envelopes):
                env = preset.envelopes[env_idx - 1]
                if env.attack > 0.005:
                    parts.append(f'  .lpattack({round_val(env.attack)})')
                if env.decay < 0.99:
                    parts.append(f'  .lpdecay({round_val(env.decay)})')
                if env.sustain < 0.995:
                    parts.append(f'  .lpsustain({round_val(env.sustain)})')
                if env.release > 0.01:
                    parts.append(f'  .lprelease({round_val(env.release)})')
            elif 'decay' in fenv:
                # LFO envelope mode — use the computed decay
                parts.append(f'  .lpdecay({round_val(fenv["decay"])})')
                parts.append(f'  .lpsustain(0)')

    return parts


def _get_filter_type(flt: Filter) -> str:
    """LP, HP, or BP from Vital model/blend.
    Vital filter models: 0=Analog, 1=Dirty, 2=Ladder, 3=Digital, 4=Formant, 5=Comb, 6=Phaser"""
    if flt.model in (2, 5):  # Ladder or Comb → LP
        return 'lp'
    if flt.model in (4, 6):  # Formant or Phaser → BP approximation
        return 'bp'
    # For standard models (0=Analog, 1=Dirty, 3=Digital), use blend
    blend = flt.blend
    if blend < 0.25:
        return 'lp'
    elif blend < 0.75:
        return 'bp'
    elif blend < 1.25:
        return 'hp'
    return 'lp'


def _get_strudel_ftype(flt: Filter) -> str:
    if flt.model in (2, 5):  # Ladder
        return "ladder"
    elif flt.model in (1, 3):  # Dirty or Digital
        return "ladder"
    elif flt.model == 0 and flt.style == 1:  # Analog 24dB
        return "24db"
    return ""


def _gen_pitch_env(preset: VitalPreset, osc: Oscillator, mod_analysis: dict) -> List[str]:
    parts = []
    pmod = mod_analysis.get(f'osc_{osc.index + 1}_pitch_env', None)
    if not pmod:
        return parts

    if 'semitones' in pmod:
        semitones = round_val(pmod['semitones'], 1)
    else:
        semitones = round_val(pmod['amount'] * 60.0, 1)

    if abs(semitones) < 0.5:
        return parts

    parts.append(f'  .penv({semitones})')

    env_idx = pmod['env_index']
    if env_idx > 0 and env_idx <= len(preset.envelopes):
        env = preset.envelopes[env_idx - 1]
        if env.attack > 0.005:
            parts.append(f'  .pattack({round_val(env.attack)})')
        if env.decay < 0.99:
            parts.append(f'  .pdecay({round_val(env.decay)})')
        if env.release > 0.01:
            parts.append(f'  .prelease({round_val(env.release)})')
    elif 'decay' in pmod:
        parts.append(f'  .pdecay({round_val(pmod["decay"])})')

    # Use exponential curve for kicks/percussion-like pitch drops
    if semitones > 12:
        parts.append(f'  .pcurve(1)')

    return parts


def _gen_vibrato(preset: VitalPreset, osc: Oscillator, mod_analysis: dict) -> List[str]:
    parts = []
    vmod = mod_analysis.get(f'osc_{osc.index + 1}_vibrato', None)
    if not vmod:
        return parts
    freq = vmod['frequency']
    depth = vmod['depth']
    if freq > 0 and depth > 0.05:
        parts.append(f'  .vib({freq})')
        if abs(depth - 1.0) > 0.1:
            parts.append(f'  .vibmod({depth})')
    return parts


def _gen_tremolo(preset: VitalPreset, osc: Oscillator, mod_analysis: dict) -> List[str]:
    parts = []
    tmod = mod_analysis.get(f'osc_{osc.index + 1}_tremolo', None)
    if not tmod:
        tmod = mod_analysis.get('global_tremolo', None)
    if not tmod:
        return parts
    parts.append(f'  .tremolosync({tmod["cycles"]})')
    if tmod['depth'] != 1.0:
        parts.append(f'  .tremolodepth({tmod["depth"]})')
    return parts


def _gen_effects(preset: VitalPreset) -> List[str]:
    parts = []
    fx = preset.effects

    # Reverb
    if fx.reverb_on and fx.reverb_dry_wet > 0.01:
        parts.append(f'  .room({round_val(fx.reverb_dry_wet)})')
        if abs(fx.reverb_size - 0.5) > 0.05:
            parts.append(f'  .roomsize({round_val(fx.reverb_size)})')

    # Delay
    if fx.delay_on and fx.delay_dry_wet > 0.01:
        parts.append(f'  .delay({round_val(fx.delay_dry_wet)})')
        if fx.delay_sync:
            dt = tempo_to_delaytime(fx.delay_tempo)
            parts.append(f'  .delaytime({round_val(dt)})')
        else:
            if fx.delay_frequency > 0:
                dt = min(1.0 / fx.delay_frequency, 2.0)
                parts.append(f'  .delaytime({round_val(dt)})')
        if abs(fx.delay_feedback - 0.5) > 0.05:
            parts.append(f'  .delayfeedback({round_val(fx.delay_feedback)})')

    # Distortion
    if fx.distortion_on and fx.distortion_mix > 0.01:
        drive = fx.distortion_drive
        if fx.distortion_type in (0, 1):  # soft/hard clip
            shape = max(0, min(1, (drive + 10) / 30.0))
            if shape > 0.01:
                parts.append(f'  .shape({round_val(shape)})')
        elif fx.distortion_type == 4:  # bit crush
            crush = max(1, min(16, int(16 - drive / 2)))
            parts.append(f'  .crush({crush})')
        elif fx.distortion_type == 5:  # downsample
            coarse = max(1, min(32, int(drive / 2 + 8)))
            parts.append(f'  .coarse({coarse})')
        else:  # fold, etc
            dist = max(0, (drive + 10) / 10.0)
            if dist > 0.01:
                parts.append(f'  .distort({round_val(dist)})')

    # Phaser
    if fx.phaser_on and fx.phaser_dry_wet > 0.01:
        speed = round_val(max(0.1, abs(fx.phaser_frequency)), 2)
        parts.append(f'  .phaser({speed})')
        depth_norm = round_val(fx.phaser_mod_depth / 48.0, 2)
        if abs(depth_norm - 0.5) > 0.05:
            parts.append(f'  .phaserdepth({depth_norm})')

    # Compressor (simple)
    if fx.compressor_on and fx.compressor_mix > 0.5:
        parts.append(f'  .compressor("-10:20:10:.002:.02")')

    return parts


# ============================================================
# Prepare Wavetables
# ============================================================

def prepare_wavetables(preset: VitalPreset):
    """Generate basic waveform for oscillators without wavetable data."""
    # Check which oscillators have level modulations (so static level=0 is OK)
    level_modulated = set()
    for mod in preset.modulations:
        if 'level' in mod.destination and 'osc' in mod.destination:
            osc_idx = _extract_osc_index(mod.destination)
            if osc_idx:
                level_modulated.add(osc_idx - 1)  # convert to 0-indexed

    for osc in preset.oscillators:
        if osc.enabled and not osc.wavetable_frames:
            # Generate basic sawtooth if level > 0 OR level is modulated
            if osc.level > 0.001 or osc.index in level_modulated:
                frame = []
                for i in range(FRAME_SIZE):
                    t = i / FRAME_SIZE
                    frame.append(2.0 * t - 1.0)
                osc.wavetable_frames = struct.pack(f'<{FRAME_SIZE}f', *frame)
                osc.num_frames = 1


# ============================================================
# Main
# ============================================================

def main():
    parser = argparse.ArgumentParser(
        description="Convert Vital preset to Strudel live coding pattern"
    )
    parser.add_argument("preset", help="Path to .vital preset file")
    parser.add_argument("--output-dir", "-o", default="./output")
    parser.add_argument("--base-url", "-u", default="/vital-wavetables/")

    args = parser.parse_args()

    print(f"Loading: {args.preset}")
    raw = load_vital_preset(args.preset)
    name = Path(args.preset).stem
    preset = parse_preset(raw, name_override=name)
    slug = slugify(preset.name)

    print(f"  Name: {preset.name} → {slug}")
    print(f"  Oscillators: {sum(1 for o in preset.oscillators if o.enabled)}/3 active")
    print(f"  Modulations: {len(preset.modulations)}")

    output = Path(args.output_dir)
    output.mkdir(parents=True, exist_ok=True)

    prepare_wavetables(preset)

    for osc in preset.oscillators:
        if osc.enabled and osc.wavetable_frames:
            wav_name = f"{slug}_osc{osc.index + 1}.wav"
            wav_path = output / wav_name
            if export_wavetable_wav(osc, str(wav_path)):
                print(f"  WAV: {wav_name} ({osc.num_frames} frames)")

    code = generate_strudel_code(preset, args.base_url, slug)
    code_path = output / f"{slug}.js"
    code_path.write_text(code)
    print(f"  Code: {slug}.js")
    print()
    print(code)

    return 0


if __name__ == "__main__":
    sys.exit(main())
