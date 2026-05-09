#!/usr/bin/env python3
"""
convert_all.py — Convert ALL Vital presets (factory + third-party packs) to Strudel.

Usage:
    python convert_all.py /path/to/Vital/ --output-dir ./vital_all_output
"""

import json
import gzip
import argparse
import sys
import os
from pathlib import Path

# Import from main converter
from vital2strudel import (
    load_vital_preset,
    parse_preset,
    prepare_wavetables,
    export_wavetable_wav,
    generate_strudel_code,
    slugify,
)


def main():
    parser = argparse.ArgumentParser(
        description="Convert all Vital presets to Strudel format"
    )
    parser.add_argument("vital_dir", help="Root Vital directory with preset packs")
    parser.add_argument("--output-dir", "-o", default="./vital_all_output")
    parser.add_argument("--base-url", "-u",
                       default="https://strudel.cc/vital-wavetables/")

    args = parser.parse_args()

    vital_root = Path(args.vital_dir)
    output = Path(args.output_dir)
    wav_dir = output / "wavetables"
    code_dir = output / "code"

    output.mkdir(parents=True, exist_ok=True)
    wav_dir.mkdir(exist_ok=True)
    code_dir.mkdir(exist_ok=True)

    print(f"🎹 Vital → Strudel Batch Converter")
    print(f"   Source: {vital_root}")
    print(f"   Output: {output}")
    print()

    # Find all .vital files
    vital_files = sorted(vital_root.glob("**/*.vital"))
    print(f"Found {len(vital_files)} preset files\n")

    results = []
    all_wavetables = {}  # slug → wav filename

    for vital_path in vital_files:
        # Determine pack/category from path
        rel = vital_path.relative_to(vital_root)
        pack = rel.parts[0] if len(rel.parts) > 1 else "General"
        name = vital_path.stem

        try:
            raw = load_vital_preset(str(vital_path))
        except Exception as e:
            print(f"  ❌ [{pack}] {name}: load error: {e}")
            results.append({"name": name, "pack": pack, "error": str(e)})
            continue

        try:
            preset = parse_preset(raw, name_override=name)
            slug = slugify(preset.name)

            # Prepare wavetables (generates basic waveform wavetables for oscillators that need them)
            prepare_wavetables(preset)

            # Determine which oscillators have level modulation
            osc_has_level_mod = set()
            for mod in preset.modulations:
                dest = mod.destination
                if "level" in dest:
                    for on in ["1", "2", "3"]:
                        if f"osc_{on}" in dest:
                            osc_has_level_mod.add(int(on) - 1)

            # Export wavetables
            wavs_exported = 0
            for osc in preset.oscillators:
                if osc.enabled and (osc.level > 0.01 or osc.index in osc_has_level_mod) and osc.wavetable_frames:
                    wav_name = f"{slug}_osc{osc.index + 1}.wav"
                    wav_path = wav_dir / wav_name
                    if export_wavetable_wav(osc, str(wav_path)):
                        wavs_exported += 1
                        all_wavetables[f"{slug}_osc{osc.index + 1}"] = wav_name

            # Generate code
            code = generate_strudel_code(preset, args.base_url, slug)
            code_path = code_dir / f"{slug}.js"
            code_path.write_text(code)

            size_total = sum(
                (wav_dir / all_wavetables[f"{slug}_osc{o.index + 1}"]).stat().st_size
                for o in preset.oscillators
                if o.enabled and (o.level > 0.01 or o.index in osc_has_level_mod) and o.wavetable_frames
                and f"{slug}_osc{o.index + 1}" in all_wavetables
            )

            print(f"  ✅ [{pack:20s}] {name:35s} → {slug}.js | wt:{wavs_exported} | {size_total/1024:.0f}KB")
            results.append({
                "name": preset.name,
                "slug": slug,
                "pack": pack,
                "wavetables": wavs_exported,
                "file": f"code/{slug}.js",
            })

        except Exception as e:
            print(f"  ❌ [{pack}] {name}: convert error: {e}")
            results.append({"name": name, "pack": pack, "error": str(e)})

    # Generate strudel.json index for wavetable loading
    strudel_index = {"_base": args.base_url}
    for key, wav_name in sorted(all_wavetables.items()):
        strudel_index[key] = [wav_name]

    index_path = wav_dir / "strudel.json"
    index_path.write_text(json.dumps(strudel_index, indent=2))

    # Generate combined preset catalog
    catalog = {
        "base_url": args.base_url,
        "presets": [r for r in results if "error" not in r],
        "errors": [r for r in results if "error" in r],
    }
    catalog_path = output / "catalog.json"
    catalog_path.write_text(json.dumps(catalog, indent=2))

    # Generate a handy JS knowledge file for AI integration
    generate_ai_knowledge(output, code_dir, results)

    # Summary
    success = [r for r in results if "error" not in r]
    errors = [r for r in results if "error" in r]

    print(f"\n{'═' * 60}")
    print(f"✅ Conversion complete!")
    print(f"   Success: {len(success)}/{len(results)}")
    print(f"   Errors:  {len(errors)}")
    print(f"   Wavetables: {len(all_wavetables)} files")
    wav_total_mb = sum(f.stat().st_size for f in wav_dir.glob("*.wav")) / 1024 / 1024
    print(f"   Total WAV size: {wav_total_mb:.1f} MB")
    print()

    # Group by pack
    packs = {}
    for r in success:
        packs.setdefault(r["pack"], []).append(r)
    print(f"📦 By pack:")
    for pack, presets in sorted(packs.items()):
        print(f"   {pack}: {len(presets)} presets")

    print(f"\n📁 Output structure:")
    print(f"   {output}/")
    print(f"   ├── wavetables/     ({len(all_wavetables)} .wav files + strudel.json)")
    print(f"   ├── code/           ({len(success)} .js preset files)")
    print(f"   ├── catalog.json    (full preset metadata)")
    print(f"   └── ai_knowledge.js (for AI integration)")

    return 0


def generate_ai_knowledge(output_dir: Path, code_dir: Path, results: list):
    """Generate a JS module with all preset knowledge for AI."""
    success = [r for r in results if "error" not in r]

    lines = []
    lines.append("// Vital Preset Knowledge Base for Strudel DJ AI")
    lines.append("// Auto-generated — do not edit manually")
    lines.append(f"// {len(success)} presets from {len(set(r['pack'] for r in success))} packs")
    lines.append("")
    lines.append("export const vitalPresets = {")

    for r in success:
        slug = r["slug"]
        js_path = code_dir / f"{slug}.js"
        if js_path.exists():
            code = js_path.read_text()
            # Extract just the pattern code (skip wavetable loading block)
            pattern_lines = []
            in_pattern = False
            for line in code.split('\n'):
                if line.startswith('// Pattern') or line.startswith('note(') or line.startswith('stack('):
                    in_pattern = True
                if in_pattern:
                    pattern_lines.append(line)

            pattern_code = '\n'.join(pattern_lines)
            escaped = pattern_code.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')

            lines.append(f'  "{slug}": {{')
            lines.append(f'    name: "{r["name"]}",')
            lines.append(f'    pack: "{r["pack"]}",')
            lines.append(f'    wavetables: {r["wavetables"]},')
            lines.append(f'    code: `{escaped}`')
            lines.append(f'  }},')

    lines.append("};")
    lines.append("")
    lines.append("// Preset names by category for quick lookup")
    lines.append("export const presetsByPack = {")

    packs = {}
    for r in success:
        packs.setdefault(r["pack"], []).append(r["slug"])
    for pack, slugs in sorted(packs.items()):
        lines.append(f'  "{pack}": {json.dumps(slugs)},')
    lines.append("};")

    knowledge_path = output_dir / "ai_knowledge.js"
    knowledge_path.write_text('\n'.join(lines))


if __name__ == "__main__":
    sys.exit(main())
