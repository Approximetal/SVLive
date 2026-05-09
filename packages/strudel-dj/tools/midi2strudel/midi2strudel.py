#!/usr/bin/env python3
"""
midi2strudel.py — Convert MIDI files to Strudel live coding format.

Features:
- Parses standard MIDI files (Type 0 and Type 1)
- Separates tracks by channel
- Quantizes to musical grid
- Outputs Strudel mini-notation with note names
- Supports Vital preset integration for sound assignment

Usage:
    python3 midi2strudel.py input.mid [--vital-preset bass_preset] [--bpm 120]
    python3 midi2strudel.py input.mid --list-tracks
    python3 midi2strudel.py input.mid --track 0:space_station --track 1:digital_roller
"""

import struct
import argparse
import json
import re
import sys
import os
from pathlib import Path
from collections import Counter
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from fractions import Fraction


# ============================================================
# MIDI Parser (no external dependencies)
# ============================================================

@dataclass
class MidiNote:
    """A single MIDI note event."""
    pitch: int          # MIDI note number (0-127)
    velocity: int       # 0-127
    start_tick: int     # Absolute tick position
    duration_ticks: int # Duration in ticks
    channel: int        # MIDI channel (0-15)


@dataclass 
class MidiTrack:
    """A parsed MIDI track."""
    name: str = ""
    notes: List[MidiNote] = field(default_factory=list)
    channel: int = 0


@dataclass
class MidiFile:
    """A parsed MIDI file."""
    format_type: int = 0
    num_tracks: int = 0
    ticks_per_beat: int = 480
    tempo: int = 500000  # microseconds per beat (default 120 BPM)
    tracks: List[MidiTrack] = field(default_factory=list)
    
    @property
    def bpm(self) -> float:
        return 60_000_000 / self.tempo


def read_variable_length(data: bytes, offset: int) -> Tuple[int, int]:
    """Read a MIDI variable-length quantity. Returns (value, new_offset)."""
    value = 0
    while True:
        if offset >= len(data):
            break
        byte = data[offset]
        offset += 1
        value = (value << 7) | (byte & 0x7F)
        if not (byte & 0x80):
            break
    return value, offset


def parse_midi_file(filepath: str) -> MidiFile:
    """Parse a standard MIDI file."""
    with open(filepath, 'rb') as f:
        data = f.read()
    
    midi = MidiFile()
    offset = 0
    
    # --- Header chunk ---
    header_id = data[offset:offset+4]
    if header_id != b'MThd':
        raise ValueError(f"Not a valid MIDI file (header: {header_id})")
    offset += 4
    
    header_length = struct.unpack('>I', data[offset:offset+4])[0]
    offset += 4
    
    midi.format_type = struct.unpack('>H', data[offset:offset+2])[0]
    offset += 2
    midi.num_tracks = struct.unpack('>H', data[offset:offset+2])[0]
    offset += 2
    midi.ticks_per_beat = struct.unpack('>H', data[offset:offset+2])[0]
    offset += 2
    
    # Skip any remaining header bytes (MThd(4) + length(4) + data(header_length))
    offset = 8 + header_length
    
    # --- Track chunks ---
    for track_idx in range(midi.num_tracks):
        if offset >= len(data):
            break
            
        track_id = data[offset:offset+4]
        if track_id != b'MTrk':
            next_mtrk = data.find(b'MTrk', offset)
            if next_mtrk == -1:
                break
            offset = next_mtrk
            track_id = data[offset:offset+4]
        offset += 4
        
        track_length = struct.unpack('>I', data[offset:offset+4])[0]
        offset += 4
        
        track_end = offset + track_length
        track = MidiTrack()
        
        # Parse track events
        absolute_tick = 0
        running_status = 0
        active_notes = {}  # (pitch, channel) -> MidiNote
        
        while offset < track_end:
            # Delta time
            delta, offset = read_variable_length(data, offset)
            absolute_tick += delta
            
            if offset >= track_end:
                break
                
            # Status byte
            byte = data[offset]
            
            if byte & 0x80:
                status = byte
                offset += 1
            else:
                status = running_status
            
            event_type = status & 0xF0
            channel = status & 0x0F
            
            if event_type == 0x90:  # Note On
                running_status = status
                if offset + 1 >= len(data):
                    break
                pitch = data[offset]
                velocity = data[offset + 1]
                offset += 2
                
                if velocity > 0:
                    note = MidiNote(
                        pitch=pitch,
                        velocity=velocity,
                        start_tick=absolute_tick,
                        duration_ticks=0,
                        channel=channel
                    )
                    active_notes[(pitch, channel)] = note
                else:
                    key = (pitch, channel)
                    if key in active_notes:
                        note = active_notes.pop(key)
                        note.duration_ticks = absolute_tick - note.start_tick
                        track.notes.append(note)
                        
            elif event_type == 0x80:  # Note Off
                running_status = status
                if offset + 1 >= len(data):
                    break
                pitch = data[offset]
                velocity = data[offset + 1]
                offset += 2
                
                key = (pitch, channel)
                if key in active_notes:
                    note = active_notes.pop(key)
                    note.duration_ticks = absolute_tick - note.start_tick
                    track.notes.append(note)
                    
            elif event_type == 0xA0:  # Polyphonic aftertouch
                running_status = status
                offset += 2
            elif event_type == 0xB0:  # Control change
                running_status = status
                offset += 2
            elif event_type == 0xC0:  # Program change
                running_status = status
                offset += 1
            elif event_type == 0xD0:  # Channel aftertouch
                running_status = status
                offset += 1
            elif event_type == 0xE0:  # Pitch bend
                running_status = status
                offset += 2
            elif status == 0xFF:  # Meta event
                if offset >= len(data):
                    break
                meta_type = data[offset]
                offset += 1
                length, offset = read_variable_length(data, offset)
                meta_data = data[offset:offset+length]
                offset += length
                
                if meta_type == 0x03:  # Track name
                    track.name = meta_data.decode('latin-1', errors='replace').strip()
                elif meta_type == 0x51:  # Tempo
                    if len(meta_data) >= 3:
                        midi.tempo = (meta_data[0] << 16) | (meta_data[1] << 8) | meta_data[2]
                elif meta_type == 0x2F:  # End of track
                    break
            elif status == 0xF0 or status == 0xF7:  # SysEx
                length, offset = read_variable_length(data, offset)
                offset += length
            else:
                offset += 1
        
        # Close any remaining active notes
        for note in active_notes.values():
            note.duration_ticks = absolute_tick - note.start_tick
            track.notes.append(note)
        
        # Determine dominant channel
        if track.notes:
            channels = [n.channel for n in track.notes]
            track.channel = max(set(channels), key=channels.count)
        
        track.notes.sort(key=lambda n: (n.start_tick, n.pitch))
        midi.tracks.append(track)
        offset = track_end
    
    return midi


# ============================================================
# MIDI -> Strudel Conversion
# ============================================================

NOTE_NAMES = ['c', 'cs', 'd', 'ds', 'e', 'f', 'fs', 'g', 'gs', 'a', 'as', 'b']


def midi_to_note_name(midi_num: int) -> str:
    """Convert MIDI note number to Strudel note name."""
    octave = (midi_num // 12) - 1
    note = NOTE_NAMES[midi_num % 12]
    return f"{note}{octave}"


# General MIDI drum map -> Strudel sample names
GM_DRUM_MAP = {
    35: "bd", 36: "bd",    # Bass Drum
    37: "rim", 38: "sd",   # Snare
    39: "cp", 40: "sd",    # Clap / Snare 2
    41: "lt", 42: "hh",    # Low Tom / Closed Hat
    43: "lt", 44: "hh",    # Low Tom 2 / Pedal Hat
    45: "mt", 46: "oh",    # Mid Tom / Open Hat
    47: "mt", 48: "ht",    # Mid Tom 2 / High Tom
    49: "cr", 50: "ht",    # Crash / High Tom 2
    51: "rd", 52: "cr",    # Ride / China
    53: "cb", 54: "cb",    # Ride Bell / Tambourine
    55: "cr", 56: "cb",    # Splash / Cowbell
    57: "cr", 58: "sh",    # Crash 2 / Vibraslap
    59: "rd", 60: "cb",    # Ride 2 / Hi Bongo
    61: "lt", 62: "mt",    # Low Bongo / Mute Conga
    63: "mt", 64: "ht",    # Open Conga / Low Conga
    69: "sh", 70: "sh",    # Cabasa / Maracas
    75: "rim", 76: "rim",  # Claves / Hi Wood Block
}


def drum_notes_to_strudel(notes: List[MidiNote], ticks_per_beat: int,
                          bars: int = 4, grid: int = 16) -> str:
    """Convert drum track notes to separate Strudel sample patterns per instrument."""
    ticks_per_bar = ticks_per_beat * 4
    total_ticks = ticks_per_bar * bars
    total_slots = grid * bars

    # Group notes by drum instrument
    drum_groups: Dict[str, List[MidiNote]] = {}
    for note in notes:
        if note.start_tick >= total_ticks:
            continue
        sample = GM_DRUM_MAP.get(note.pitch, "cp")
        drum_groups.setdefault(sample, []).append(note)

    if not drum_groups:
        return '  s("~")'

    parts = []
    for sample, group_notes in sorted(drum_groups.items(), key=lambda x: x[0]):
        # Build pattern grid
        grid_events = [False] * total_slots
        for note in group_notes:
            slot = quantize_tick_to_slot(note.start_tick, ticks_per_beat, grid, bars)
            grid_events[slot] = True

        # Build per-bar patterns
        bar_patterns = []
        for bar_idx in range(bars):
            bar_start = bar_idx * grid
            bar_end = bar_start + grid
            tokens = []
            for slot_active in grid_events[bar_start:bar_end]:
                tokens.append(sample if slot_active else "~")
            bar_patterns.append(compress_bar(tokens))

        # Remove trailing empty bars
        while len(bar_patterns) > 1 and bar_patterns[-1] == "~":
            bar_patterns.pop()

        unique = list(dict.fromkeys(bar_patterns))
        if len(unique) == 1:
            pattern = unique[0]
        else:
            pattern = " | ".join(bar_patterns)

        parts.append(f'  s("{pattern}").gain(0.8)')

    if len(parts) == 1:
        return parts[0]
    return '  stack(\n' + ',\n'.join(f'  {p}' for p in parts) + '\n  )'

def quantize_tick_to_slot(tick: int, ticks_per_beat: int, grid: int, total_bars: int) -> int:
    """Quantize a tick to its nearest slot index."""
    ticks_per_bar = ticks_per_beat * 4
    total_ticks = ticks_per_bar * total_bars
    total_slots = grid * total_bars
    
    if total_ticks == 0:
        return 0
    
    # Position as fraction of total
    frac = tick / total_ticks
    slot = round(frac * total_slots)
    return max(0, min(slot, total_slots - 1))


def notes_to_mini_notation(notes: List[MidiNote], ticks_per_beat: int,
                           bars: int = 4, grid: int = 16) -> str:
    """Convert notes to Strudel mini-notation.
    
    Grid = subdivisions per bar (16 = 16th notes per bar).
    """
    ticks_per_bar = ticks_per_beat * 4
    total_ticks = ticks_per_bar * bars
    total_slots = grid * bars
    
    # Filter notes within range
    bar_notes = [n for n in notes if n.start_tick < total_ticks]
    if not bar_notes:
        return "~"
    
    # Build grid: each slot -> list of note names
    grid_events: List[List[str]] = [[] for _ in range(total_slots)]
    
    for note in bar_notes:
        slot = quantize_tick_to_slot(note.start_tick, ticks_per_beat, grid, bars)
        name = midi_to_note_name(note.pitch)
        if name not in grid_events[slot]:
            grid_events[slot].append(name)
    
    # Convert to mini-notation per bar
    bar_patterns = []
    for bar_idx in range(bars):
        bar_start = bar_idx * grid
        bar_end = bar_start + grid
        bar_slots = grid_events[bar_start:bar_end]
        
        tokens = []
        for slot in bar_slots:
            if not slot:
                tokens.append("~")
            elif len(slot) == 1:
                tokens.append(slot[0])
            else:
                # Chord
                tokens.append(f"[{','.join(sorted(slot))}]")
        
        bar_patterns.append(compress_bar(tokens))
    
    # Remove trailing empty bars
    while len(bar_patterns) > 1 and bar_patterns[-1] == "~":
        bar_patterns.pop()

    # If all bars identical, use one
    unique_bars = list(dict.fromkeys(bar_patterns))
    if len(unique_bars) == 1:
        return unique_bars[0]

    # Use <bar1 | bar2 | ...> slow pattern if bars differ
    return " | ".join(bar_patterns)


def compress_bar(tokens: List[str]) -> str:
    """Compress a bar's tokens into concise mini-notation."""
    # Remove trailing rests
    while tokens and tokens[-1] == "~":
        tokens.pop()
    if not tokens:
        return "~"
    
    # Try to find the smallest useful subdivision
    # If only first half has content, use half the grid
    result_parts = []
    i = 0
    while i < len(tokens):
        token = tokens[i]
        # Count consecutive same tokens
        run = 1
        while i + run < len(tokens) and tokens[i + run] == token:
            run += 1
        
        if token == "~":
            if run >= 4:
                result_parts.append("~")
            else:
                for _ in range(run):
                    result_parts.append("~")
        elif run > 1:
            result_parts.append(f"{token}*{run}")
        else:
            result_parts.append(token)
        i += run
    
    return " ".join(result_parts)


def track_to_strudel(track: MidiTrack, ticks_per_beat: int,
                     bars: int = 4, grid: int = 16,
                     sound: Optional[str] = None,
                     vital_preset: Optional[str] = None,
                     vital_code: Optional[str] = None) -> str:
    """Convert a MIDI track to Strudel code.

    Args:
        vital_preset: Name of a Vital wavetable to use as .s()
        vital_code: Full Vital preset code snippet (from ai_knowledge.js) to use as template
    """
    if not track.notes:
        return f'// Track "{track.name}" — empty'

    pitches = [n.pitch for n in track.notes]
    avg_pitch = sum(pitches) / len(pitches)
    is_drum = track.channel == 9  # MIDI channel 10 = drums

    # Auto-assign sound based on pitch range
    if not sound and not vital_preset and not vital_code:
        if is_drum:
            sound = "__drum__"  # Special marker
        elif avg_pitch < 40:
            sound = "sine"
        elif avg_pitch < 52:
            sound = "sawtooth"
        elif avg_pitch < 65:
            sound = "triangle"
        elif avg_pitch < 80:
            sound = "square"
        else:
            sound = "triangle"

    # Build code
    lines = []
    name_comment = f' — {track.name}' if track.name else ''
    lines.append(f'  // Track {track.channel + 1}{name_comment}')

    if is_drum and not vital_preset and not vital_code:
        # Convert drum track to sample-based pattern
        drum_pattern = drum_notes_to_strudel(track.notes, ticks_per_beat, bars, grid)
        lines.append(drum_pattern)
        return '\n'.join(lines)

    # Generate note pattern
    pattern = notes_to_mini_notation(track.notes, ticks_per_beat, bars, grid)

    if vital_code:
        # Use the Vital preset code as template, replacing note pattern
        code = vital_code
        # Replace the default note pattern with our MIDI pattern
        code = re.sub(r'note\("[^"]*"\)', f'note("{pattern}")', code)
        # Indent
        for line in code.split('\n'):
            if line.strip():
                lines.append(f'  {line}')
    elif vital_preset:
        lines.append(f'  note("{pattern}")')
        lines.append(f'    .s("{vital_preset}")')
        # Add basic sound shaping
        if avg_pitch < 52:
            lines.append(f'    .cutoff(800).decay(0.8).sustain(0.3)')
        else:
            lines.append(f'    .cutoff(3000).attack(0.05).release(0.5)')
    else:
        lines.append(f'  note("{pattern}")')
        lines.append(f'    .s("{sound}")')
        # Auto sound design
        if avg_pitch < 40:
            lines.append('    .cutoff(200).decay(0.5).sustain(0)')
        elif avg_pitch < 52:
            lines.append('    .warp(0.5).warpmode("fold")')
            lines.append('    .cutoff(800).resonance(5).decay(0.8).sustain(0.3).shape(0.2)')
        elif avg_pitch < 65:
            lines.append('    .unison(5).detune(2).spread(0.6)')
            lines.append('    .cutoff(2000).attack(0.1).decay(1).release(0.5)')
        elif avg_pitch < 80:
            lines.append('    .unison(3).detune(2)')
            lines.append('    .cutoff(3000).attack(0.05).decay(0.8).sustain(0.4)')
        else:
            lines.append('    .cutoff(4000).decay(0.6).sustain(0).release(0.8)')
            lines.append('    .room(0.3).roomsize(0.5)')

    return '\n'.join(lines)


def get_vital_preset_code(preset_slug: str) -> Optional[str]:
    """Load the full code for a Vital preset from the knowledge base."""
    code_path = (Path(__file__).parent.parent / "vital2strudel" / 
                 "vital_all_output" / "code" / f"{preset_slug}.js")
    if code_path.exists():
        code = code_path.read_text()
        # Extract just the pattern part (skip wavetable loading and comments at end)
        lines = code.split('\n')
        pattern_lines = []
        in_pattern = False
        for line in lines:
            if line.startswith('note(') or line.startswith('stack('):
                in_pattern = True
            if in_pattern:
                if line.startswith('// ==='):
                    break
                pattern_lines.append(line)
        return '\n'.join(pattern_lines).rstrip()
    return None


def midi_to_strudel(midi: MidiFile, bars: int = 4, grid: int = 16,
                    track_presets: Optional[Dict[int, str]] = None,
                    bpm_override: Optional[float] = None) -> str:
    """Convert entire MIDI file to Strudel code."""
    bpm = bpm_override or midi.bpm
    track_presets = track_presets or {}
    
    lines = []
    lines.append(f'// MIDI → Strudel (auto-converted)')
    lines.append(f'// BPM: {bpm:.0f}, Bars: {bars}, Grid: {grid}th notes')
    lines.append(f'')
    lines.append(f'setCpm({bpm/4:.1f})')
    lines.append(f'')
    
    # Collect wavetable loading for vital presets
    vital_wavetables = set()
    for track_idx, preset_slug in track_presets.items():
        # Check what wavetables this preset needs
        code_path = (Path(__file__).parent.parent / "vital2strudel" /
                     "vital_all_output" / "code" / f"{preset_slug}.js")
        if code_path.exists():
            code = code_path.read_text()
            for match in re.finditer(r'"([^"]+_osc\d+)":\s*\["([^"]+\.wav)"\]', code):
                vital_wavetables.add((match.group(1), match.group(2)))
    
    if vital_wavetables:
        lines.append('// Load Vital wavetables')
        lines.append('await tables("https://strudel.cc/vital-wavetables/", 2048, {')
        lines.append('  "_base": "https://strudel.cc/vital-wavetables/",')
        for name, wav in sorted(vital_wavetables):
            lines.append(f'  "{name}": ["{wav}"],')
        lines.append('})')
        lines.append('')
    
    # Convert tracks
    active_tracks = [(i, t) for i, t in enumerate(midi.tracks) if t.notes]
    
    if not active_tracks:
        lines.append('// No notes found in MIDI file')
        return '\n'.join(lines)
    
    track_codes = []
    for i, track in active_tracks:
        preset_slug = track_presets.get(i)
        vital_code = None
        vital_preset = None
        
        if preset_slug:
            # Try to load full preset code
            vital_code = get_vital_preset_code(preset_slug)
            if not vital_code:
                # Fallback: just use the slug as wavetable name
                vital_preset = preset_slug
        
        code = track_to_strudel(
            track, midi.ticks_per_beat, bars, grid,
            vital_preset=vital_preset,
            vital_code=vital_code
        )
        track_codes.append(code)
    
    if len(track_codes) == 1:
        lines.append(track_codes[0])
    else:
        lines.append('stack(')
        for i, code in enumerate(track_codes):
            lines.append(code)
            if i < len(track_codes) - 1:
                lines.append(',')
        lines.append(')')
    
    return '\n'.join(lines)


# ============================================================
# Preset Suggestion
# ============================================================

def get_available_presets() -> Dict[str, dict]:
    """Load available presets from catalog."""
    catalog_path = (Path(__file__).parent.parent / "vital2strudel" /
                    "vital_all_output" / "catalog.json")
    if not catalog_path.exists():
        return {}
    with open(catalog_path) as f:
        catalog = json.load(f)
    return {p["slug"]: p for p in catalog.get("presets", [])}


def suggest_presets_for_track(track: MidiTrack, presets: Dict[str, dict]) -> List[str]:
    """Suggest Vital presets based on track characteristics."""
    if not track.notes:
        return []

    # Drum tracks (channel 10) - no melodic presets
    if track.channel == 9:
        return ["(use drum samples: bd, sd, hh, cp, rim)"]

    pitches = [n.pitch for n in track.notes]
    avg_pitch = sum(pitches) / len(pitches)
    durations = [n.duration_ticks for n in track.notes]
    avg_duration = sum(durations) / len(durations) if durations else 0

    # Detect chords: multiple notes at same tick
    ticks = [n.start_tick for n in track.notes]
    tick_counts = Counter(ticks)
    has_chords = any(c >= 3 for c in tick_counts.values())

    suggestions = []

    # If chords detected, prioritize pad/chord presets regardless of pitch
    if has_chords:
        suggestions = ["space_station", "strings_section", "analog_pad",
                      "float_chords", "a_happy_ending_of_the_world",
                      "chorusy_keys"]
    elif avg_pitch < 45:
        suggestions = ["jupiter_bass", "big_stomp", "banana_wob", "honk_wub",
                      "horror_of_melbourne_1", "boot_scre3n"]
    elif avg_pitch < 55:
        suggestions = ["growl_bass_sidechain", "feeder", "vlt_future_gun",
                      "thunk", "fm_drum_circle"]
    elif avg_pitch < 70:
        if has_chords or avg_duration > 400:  # Chords or long notes = pad
            suggestions = ["space_station", "strings_section", "analog_pad",
                          "float_chords", "a_happy_ending_of_the_world",
                          "chorusy_keys"]
        else:  # Short notes = lead/pluck
            suggestions = ["digital_roller", "ceramic", "chorusy_keys",
                          "moog_pluck", "super_nice_pluck"]
    else:
        suggestions = ["cinema_bells", "super_nice_pluck", "crescendo_bells",
                      "easy_mallet", "e4_one_note_metallophone"]

    return [s for s in suggestions if s in presets][:5]


# ============================================================
# Main
# ============================================================

def main():
    parser = argparse.ArgumentParser(
        description="Convert MIDI files to Strudel live coding format",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Basic conversion (auto sound design with built-in synths)
  python3 midi2strudel.py song.mid

  # Auto-assign best Vital presets to all tracks
  python3 midi2strudel.py song.mid --auto

  # List tracks and get preset suggestions
  python3 midi2strudel.py song.mid --list-tracks --suggest

  # Assign Vital presets to specific tracks
  python3 midi2strudel.py song.mid --track 0:space_station --track 1:jupiter_bass

  # Override BPM and use finer grid
  python3 midi2strudel.py song.mid --bpm 140 --grid 32 --bars 8

  # Auto presets + output to file
  python3 midi2strudel.py song.mid --auto -o output.js
"""
    )
    parser.add_argument("midi_file", help="Path to .mid/.midi file")
    parser.add_argument("--list-tracks", "-l", action="store_true",
                       help="List tracks with info")
    parser.add_argument("--suggest", "-s", action="store_true",
                       help="Suggest Vital presets for each track")
    parser.add_argument("--auto", "-a", action="store_true",
                       help="Auto-assign best Vital preset to each melodic track")
    parser.add_argument("--track", "-t", action="append", default=[],
                       help="Assign preset: TRACK_NUM:preset_slug (repeatable)")
    parser.add_argument("--bpm", type=float, default=None,
                       help="Override BPM (default: from MIDI file)")
    parser.add_argument("--bars", type=int, default=4,
                       help="Number of bars to convert (default: 4)")
    parser.add_argument("--grid", type=int, default=16,
                       help="Quantization: 8/16/32 (default: 16)")
    parser.add_argument("--output", "-o", default=None,
                       help="Output file (default: stdout)")
    
    args = parser.parse_args()
    
    # Parse MIDI
    try:
        midi = parse_midi_file(args.midi_file)
    except Exception as e:
        print(f"❌ Error parsing MIDI: {e}", file=sys.stderr)
        return 1
    
    # List tracks mode
    if args.list_tracks or args.suggest:
        print(f"🎹 MIDI: {args.midi_file}")
        print(f"   Format Type {midi.format_type} | BPM: {midi.bpm:.1f} | Ticks/beat: {midi.ticks_per_beat}")
        print()
        
        presets = get_available_presets() if args.suggest else {}
        
        for i, track in enumerate(midi.tracks):
            if not track.notes:
                continue
            pitches = [n.pitch for n in track.notes]
            avg_p = sum(pitches) / len(pitches)
            print(f"  Track {i}: {track.name or '(unnamed)'} [ch.{track.channel + 1}]")
            print(f"    {len(track.notes)} notes | {midi_to_note_name(min(pitches))}–{midi_to_note_name(max(pitches))} (avg: {midi_to_note_name(int(avg_p))})")
            
            if args.suggest and presets:
                suggestions = suggest_presets_for_track(track, presets)
                if suggestions:
                    print(f"    💡 Presets: {', '.join(suggestions)}")
            print()
        
        if not args.suggest:
            print("  Tip: add --suggest to get Vital preset recommendations")
        return 0
    
    # Parse track assignments
    track_presets = {}
    for assignment in args.track:
        parts = assignment.split(':', 1)
        if len(parts) == 2:
            try:
                track_presets[int(parts[0])] = parts[1]
            except ValueError:
                print(f"⚠️  Invalid: '{assignment}' (use TRACK_NUM:preset_name)", file=sys.stderr)

    # Auto-assign presets if requested
    if args.auto:
        presets = get_available_presets()
        if presets:
            for i, track in enumerate(midi.tracks):
                if i in track_presets:
                    continue  # Don't override manual assignments
                if not track.notes or track.channel == 9:
                    continue  # Skip empty tracks and drum tracks
                suggestions = suggest_presets_for_track(track, presets)
                real_suggestions = [s for s in suggestions if not s.startswith("(")]
                if real_suggestions:
                    track_presets[i] = real_suggestions[0]
                    print(f"  🎹 Track {i} ({track.name}): → {real_suggestions[0]}",
                          file=sys.stderr)
    
    # Convert
    code = midi_to_strudel(
        midi, bars=args.bars, grid=args.grid,
        track_presets=track_presets, bpm_override=args.bpm
    )
    
    if args.output:
        Path(args.output).write_text(code)
        print(f"✅ Written to {args.output}", file=sys.stderr)
    else:
        print(code)
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
