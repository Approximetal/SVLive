#!/usr/bin/env python3
"""
convert_factory.py — Convert the full Vital Factory library to Strudel-compatible format.

This handles both:
  - .vital presets → Strudel code + embedded wavetable .wav
  - .vitaltable files → standalone .wav wavetables for use with tables()

Usage:
    python convert_factory.py /path/to/Vital/Factory --output-dir ./vital_factory_output
"""

import json
import gzip
import struct
import wave
import base64
import argparse
import os
import sys
import math
from pathlib import Path

# Import from main converter
from vital2strudel import (
    load_vital_preset,
    parse_preset,
    export_wavetable_wav,
    generate_strudel_code,
    slugify,
    OscillatorInfo,
)


def parse_vitaltable(path: str) -> dict:
    """Parse a .vitaltable JSON file."""
    with open(path, 'r') as f:
        return json.load(f)


def vitaltable_to_wav(vitaltable_data: dict, output_path: str) -> dict:
    """Convert .vitaltable JSON to a .wav file.

    Supports multiple source types:
      - "Wave Source": raw float32 waveform data (base64)
      - "1" (Line Source): waveform defined by control points
      - "Frequency Amplitude Phase": spectral harmonic data
      - "Audio File Source": external audio reference (skipped)

    Returns metadata dict with frame count, etc.
    """
    groups = vitaltable_data.get('groups', [])
    all_samples = []
    frame_count = 0
    frame_size = 2048

    for group in groups:
        for comp in group.get('components', []):
            comp_type = comp.get('type', '')
            keyframes = comp.get('keyframes', [])

            for kf in keyframes:
                if 'wave_data' in kf:
                    # Wave Source — raw float32 waveform
                    raw = base64.b64decode(kf['wave_data'])
                    num_floats = len(raw) // 4
                    frame_size = num_floats
                    floats = struct.unpack(f'<{num_floats}f', raw)
                    all_samples.extend(floats)
                    frame_count += 1

                elif 'points' in kf:
                    # Line Source (type "1") — control points define waveform
                    points_flat = kf['points']
                    num_points = kf.get('num_points', len(points_flat) // 2)
                    powers = kf.get('powers', [0.0] * num_points)
                    frame = render_line_source(points_flat, num_points, powers, frame_size)
                    all_samples.extend(frame)
                    frame_count += 1

                elif 'line' in kf:
                    # Alternative line format
                    line = kf['line']
                    if isinstance(line, list) and len(line) > 0:
                        frame = interpolate_line_source(line, frame_size)
                        all_samples.extend(frame)
                        frame_count += 1

                elif 'amplitudes' in kf:
                    # Frequency Amplitude Phase — spectral data
                    amps_b64 = kf.get('amplitudes', '')
                    phases_b64 = kf.get('phases', '')
                    if amps_b64:
                        frame = reconstruct_from_spectral(amps_b64, phases_b64, frame_size)
                        all_samples.extend(frame)
                        frame_count += 1

    if not all_samples:
        return None
    
    # Write as 16-bit PCM WAV
    with wave.open(output_path, 'w') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(44100)
        
        int16_data = []
        for s in all_samples:
            clamped = max(-1.0, min(1.0, s))
            int16_data.append(int(clamped * 32767))
        
        wf.writeframes(struct.pack(f'<{len(int16_data)}h', *int16_data))
    
    return {
        'frames': frame_count,
        'frame_size': frame_size,
        'total_samples': len(all_samples),
        'file_size': os.path.getsize(output_path),
    }


def render_line_source(points_flat, num_points, powers, frame_size=2048):
    """Render a Vital Line Source waveform from control points.

    points_flat: [x0, y0, x1, y1, ...] — x in [0,1], y in [-1,1]
    powers: curvature for each segment (0 = linear)
    """
    # Parse points
    points = []
    for i in range(num_points):
        x = points_flat[i * 2] if i * 2 < len(points_flat) else 0
        y = points_flat[i * 2 + 1] if i * 2 + 1 < len(points_flat) else 0
        points.append((x, y))

    # Sort by x
    points.sort(key=lambda p: p[0])

    # Render frame
    frame = []
    for i in range(frame_size):
        x = i / frame_size
        y = 0.0

        # Find segment
        for j in range(len(points) - 1):
            x0, y0 = points[j]
            x1, y1 = points[j + 1]
            if x0 <= x <= x1 or (j == len(points) - 2):
                if x1 == x0:
                    t = 0.0
                else:
                    t = (x - x0) / (x1 - x0)
                t = max(0, min(1, t))

                # Apply power curve if non-zero
                power = powers[j] if j < len(powers) else 0.0
                if abs(power) > 0.001:
                    # Vital uses power to curve the interpolation
                    if power > 0:
                        t = t ** (1.0 + power * 4)
                    else:
                        t = 1.0 - (1.0 - t) ** (1.0 - power * 4)

                y = y0 + t * (y1 - y0)
                break
        else:
            if points:
                y = points[-1][1]

        frame.append(y)

    return frame


def reconstruct_from_spectral(amps_b64, phases_b64, frame_size=2048):
    """Reconstruct waveform from Vital's frequency/amplitude/phase data."""
    try:
        amp_bytes = base64.b64decode(amps_b64)
        num_harmonics = len(amp_bytes) // 4
        amps = struct.unpack(f'<{num_harmonics}f', amp_bytes)

        if phases_b64:
            phase_bytes = base64.b64decode(phases_b64)
            phases = struct.unpack(f'<{num_harmonics}f', phase_bytes)
        else:
            phases = [0.0] * num_harmonics

        # Additive synthesis
        samples = [0.0] * frame_size
        for h in range(1, min(num_harmonics, frame_size // 2)):
            if amps[h] < 0.0001:
                continue
            for i in range(frame_size):
                t = i / frame_size
                samples[i] += amps[h] * math.sin(2 * math.pi * h * t + phases[h])

        # Normalize
        peak = max(abs(s) for s in samples) or 1.0
        samples = [s / peak for s in samples]

        return samples
    except Exception:
        return [0.0] * frame_size


def interpolate_line_source(line_data, frame_size=2048):
    """Interpolate a Vital line source to a fixed number of samples."""
    # Vital line format can be: list of [x, y, power] or {x, y, power}
    points = []
    
    if isinstance(line_data[0], dict):
        points = [(p.get('x', 0), p.get('y', 0)) for p in line_data]
    elif isinstance(line_data[0], (list, tuple)):
        points = [(p[0], p[1]) for p in line_data]
    else:
        # Flat array: x0, y0, x1, y1, ...
        for i in range(0, len(line_data) - 1, 2):
            points.append((line_data[i], line_data[i+1]))
    
    if not points:
        return [0.0] * frame_size
    
    # Sort by x
    points.sort(key=lambda p: p[0])
    
    # Interpolate
    frame = []
    for i in range(frame_size):
        x = i / frame_size
        # Find surrounding points
        y = 0.0
        for j in range(len(points) - 1):
            x0, y0 = points[j]
            x1, y1 = points[j + 1]
            if x0 <= x <= x1:
                t = (x - x0) / (x1 - x0) if x1 != x0 else 0
                y = y0 + t * (y1 - y0)
                break
        else:
            # Beyond last point
            if points:
                y = points[-1][1]
        
        # Vital uses 0-1 range for y, convert to -1 to 1
        frame.append(y * 2 - 1)
    
    return frame


def convert_vital_preset(preset_path: str, wav_dir: Path, code_dir: Path,
                         base_url: str) -> dict:
    """Convert a single .vital preset file."""
    try:
        raw = load_vital_preset(str(preset_path))
    except:
        # Try plain JSON
        with open(preset_path, 'r') as f:
            raw = json.load(f)

    preset = parse_preset(raw)
    # Factory presets often lack preset_name — use filename
    file_stem = Path(preset_path).stem
    if not preset.name or preset.name == "untitled":
        preset.name = file_stem
    slug = slugify(preset.name or file_stem)
    
    # Vital factory presets store wavetables differently —
    # the wavetable data is in the preset's "wavetables" key OR
    # referenced externally. Let's handle the embedded case.
    
    # Also check if the preset references oscillator wavetable data
    # in settings (osc_X_wave_frame indicates wavetable usage)
    settings = raw.get('settings', {})
    
    # For factory presets that don't embed wavetables,
    # we can still generate code using the oscillator params
    # (the user would need to load the wavetable separately)
    
    wavs_exported = 0
    for osc in preset.oscillators:
        if osc.enabled and osc.wavetable_frames:
            wav_name = f"{slug}_osc{osc.index + 1}.wav"
            wav_path = wav_dir / wav_name
            if export_wavetable_wav(osc, str(wav_path)):
                wavs_exported += 1
    
    # Generate code
    code = generate_strudel_code(preset, base_url, slug)
    code_path = code_dir / f"{slug}.js"
    code_path.write_text(code)
    
    return {
        'name': preset.name,
        'slug': slug,
        'source': Path(preset_path).name,
        'wavetables_exported': wavs_exported,
        'code_file': str(code_path),
    }


def main():
    parser = argparse.ArgumentParser(
        description="Convert Vital Factory library to Strudel format"
    )
    parser.add_argument("factory_dir", help="Path to Vital/Factory directory")
    parser.add_argument("--output-dir", "-o", default="./vital_factory_output")
    parser.add_argument("--base-url", "-u",
                       default="https://raw.githubusercontent.com/strudel-dj/vital-wavetables/main/")
    
    args = parser.parse_args()
    
    factory = Path(args.factory_dir)
    output = Path(args.output_dir)
    wav_dir = output / "wavetables"
    code_dir = output / "code"
    
    output.mkdir(parents=True, exist_ok=True)
    wav_dir.mkdir(exist_ok=True)
    code_dir.mkdir(exist_ok=True)
    
    print(f"🎹 Vital Factory Converter")
    print(f"   Source: {factory}")
    print(f"   Output: {output}")
    print()
    
    # ===== 1. Convert .vitaltable files =====
    print("═══ Converting Wavetables (.vitaltable) ═══")
    
    wt_dir = factory / "Wavetables"
    strudel_index = {"_base": args.base_url}
    wt_count = 0
    
    if wt_dir.exists():
        for vitaltable_path in sorted(wt_dir.glob("**/*.vitaltable")):
            rel = vitaltable_path.relative_to(wt_dir)
            category = rel.parts[0] if len(rel.parts) > 1 else "General"
            name = vitaltable_path.stem
            slug = slugify(name)
            
            data = parse_vitaltable(str(vitaltable_path))
            wav_name = f"{slug}.wav"
            wav_path = wav_dir / wav_name
            
            result = vitaltable_to_wav(data, str(wav_path))
            if result:
                wt_count += 1
                strudel_index[slug] = [wav_name]
                size_kb = result['file_size'] / 1024
                print(f"  ✅ [{category}] {name} → {wav_name} "
                      f"({result['frames']} frames, {size_kb:.1f} KB)")
            else:
                print(f"  ⚠️  [{category}] {name} — no wave data found")
    
    print(f"\n   Total: {wt_count} wavetables converted")
    
    # Write strudel.json
    index_path = wav_dir / "strudel.json"
    index_path.write_text(json.dumps(strudel_index, indent=2))
    print(f"   Index: {index_path}")
    
    # ===== 2. Convert .vital presets =====
    print("\n═══ Converting Presets (.vital) ═══")
    
    preset_dir = factory / "Presets"
    preset_results = []
    
    if preset_dir.exists():
        for vital_path in sorted(preset_dir.glob("**/*.vital")):
            try:
                result = convert_vital_preset(
                    str(vital_path), wav_dir, code_dir, args.base_url
                )
                preset_results.append(result)
                print(f"  ✅ {result['source']} → {result['slug']}.js "
                      f"(wt: {result['wavetables_exported']})")
            except Exception as e:
                print(f"  ❌ {vital_path.name}: {e}")
                preset_results.append({'source': vital_path.name, 'error': str(e)})
    
    # ===== 3. Generate combined Strudel loading code =====
    print("\n═══ Generating Strudel Integration Code ═══")
    
    # Generate a single file that loads all wavetables
    loader_code = f'''// Vital Factory Wavetables for Strudel
// Auto-generated by vital2strudel/convert_factory.py
//
// Usage: Copy this block to the top of your Strudel pattern,
// then use .s("wavetable_name") to select sounds.

await tables("{args.base_url}", 2048, {{
  "_base": "{args.base_url}",
{chr(10).join(f'  "{k}": {json.dumps(v)},' for k, v in strudel_index.items() if k != "_base")}
}})

// Available wavetable sounds:
// {", ".join(k for k in strudel_index.keys() if k != "_base")}
//
// Example usage:
// note("c3 e3 g3 b3")
//   .s("basic_shapes")
//   .wt(sine(0.1, 0, 1))  // sweep through wavetable
//   .warp(0.3).warpmode("fold")
//   .unison(4).detune(0.2).spread(0.6)
//   .cutoff(2000).resonance(5)
//   .attack(0.3).decay(0.5).sustain(0.6).release(1.5)
//   .room(0.4).delay(0.2).delaytime(0.125)
'''
    
    loader_path = output / "load_all_wavetables.js"
    loader_path.write_text(loader_code)
    print(f"  📝 {loader_path}")
    
    # Generate preset snippets file
    snippets = []
    for js_file in sorted(code_dir.glob("*.js")):
        snippets.append({
            'name': js_file.stem,
            'file': str(js_file.relative_to(output)),
        })
    
    snippets_path = output / "preset_index.json"
    snippets_path.write_text(json.dumps(snippets, indent=2))
    
    # ===== Summary =====
    print(f"\n{'═' * 50}")
    print(f"✅ Conversion complete!")
    print(f"   Wavetables: {wt_count}")
    print(f"   Presets:    {len([r for r in preset_results if 'error' not in r])}")
    print(f"   Output:     {output}")
    print()
    print(f"📁 Output structure:")
    print(f"   {output}/")
    print(f"   ├── wavetables/          (.wav files + strudel.json)")
    print(f"   ├── code/                (preset .js files)")
    print(f"   ├── load_all_wavetables.js  (copy-paste into Strudel)")
    print(f"   └── preset_index.json")
    print()
    print(f"🚀 Next steps:")
    print(f"   1. Host {wav_dir}/ somewhere with CORS (GitHub, etc.)")
    print(f"   2. Update base_url in load_all_wavetables.js")
    print(f"   3. Paste into Strudel and start making music!")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
