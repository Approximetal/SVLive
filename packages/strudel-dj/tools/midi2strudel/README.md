# midi2strudel — MIDI to Strudel Converter

Convert MIDI files into Strudel live coding patterns, with optional Vital preset sound assignment.

## Features

- **Pure Python** — zero external dependencies (no `mido`, no `pretty_midi`)
- **MIDI Type 0 & 1** — handles single-track and multi-track files
- **Smart quantization** — snaps notes to configurable grid (8th/16th/32nd notes)
- **Drum mapping** — General MIDI drum notes → Strudel sample names (bd, sd, hh, cp...)
- **Chord detection** — simultaneous notes rendered as `[c3,e3,g3]` chord notation
- **Vital preset integration** — replace basic synths with rich wavetable presets
- **Auto-assign mode** — intelligently picks presets based on pitch range and note characteristics

## Quick Start

```bash
# Basic conversion (uses built-in synth sounds)
python3 midi2strudel.py song.mid

# See what tracks are in the file
python3 midi2strudel.py song.mid --list-tracks --suggest

# Auto-assign Vital presets to all melodic tracks  
python3 midi2strudel.py song.mid --auto

# Manual preset assignment
python3 midi2strudel.py song.mid --track 1:jupiter_bass --track 2:space_station

# Fine-tune
python3 midi2strudel.py song.mid --auto --bpm 140 --bars 8 --grid 32 -o output.js
```

## Workflow: MIDI → Vital Presets → AI DJ

This tool is designed for a 3-step creative workflow:

### Step 1: Import & Convert
```bash
python3 midi2strudel.py your_song.mid --auto -o converted.js
```

### Step 2: Customize Sounds
```bash
# Check available presets
python3 midi2strudel.py your_song.mid --list-tracks --suggest

# Re-run with specific preset choices
python3 midi2strudel.py your_song.mid \
  --track 1:jupiter_bass \
  --track 2:strings_section \
  --track 3:digital_roller \
  -o converted.js
```

### Step 3: AI Refinement in strudel-dj
Paste the output into strudel-dj and ask the AI to:
- Add effects (reverb, delay, distortion)
- Add performance sliders
- Modify the arrangement
- Layer in additional elements
- Create variations and breakdowns

## Options

| Flag | Description |
|------|-------------|
| `--list-tracks, -l` | Show track info (channels, note ranges, counts) |
| `--suggest, -s` | Recommend Vital presets per track |
| `--auto, -a` | Auto-assign best preset to each melodic track |
| `--track N:slug, -t` | Manually assign preset (repeatable) |
| `--bpm N` | Override tempo (default: read from MIDI) |
| `--bars N` | Number of bars to convert (default: 4) |
| `--grid N` | Quantization: 8/16/32 (default: 16 = 16th notes) |
| `--output, -o` | Write to file instead of stdout |

## How It Works

1. **MIDI Parsing**: Custom binary parser reads standard MIDI (no dependencies)
2. **Track Separation**: Notes grouped by track and channel
3. **Quantization**: Continuous tick positions → discrete grid slots
4. **Pattern Generation**: Grid slots → Strudel mini-notation with rests, chords, repetitions
5. **Drum Handling**: Channel 10 notes mapped to GM drum sounds (bd, sd, hh, etc.)
6. **Preset Injection**: Vital preset code templates loaded, `note("...")` pattern replaced with MIDI data
7. **Wavetable Bundling**: All needed `.wav` files referenced in `await tables(...)` header

## Available Vital Presets (75 presets)

Run with `--suggest` to see recommendations, or check:
```
../vital2strudel/vital_all_output/catalog.json
```

**Categories**:
- **Bass**: jupiter_bass, big_stomp, banana_wob, honk_wub, growl_bass_sidechain
- **Pads**: space_station, strings_section, analog_pad, float_chords
- **Leads/Pluck**: digital_roller, moog_pluck, super_nice_pluck, ceramic
- **Keys**: chorusy_keys, keystation, easy_mallet
- **Bells**: cinema_bells, crescendo_bells, e4_one_note_metallophone
- **FX**: horror_of_melbourne_1, destruction, metal_head

## Requirements

- Python 3.6+
- No pip packages needed
- Vital presets must be pre-converted (in `../vital2strudel/vital_all_output/`)
