#!/usr/bin/env python3
"""
batch_convert.py — Convert all .vital presets in a directory to Strudel code.

Usage:
    python batch_convert.py ./my_presets/ --output-dir ./output --base-url https://your-host.com/wt/

This also generates a strudel.json index file for use with tables("github:...").
"""

import argparse
import json
import os
import sys
from pathlib import Path

from vital2strudel import (
    load_vital_preset,
    parse_preset,
    export_wavetable_wav,
    generate_strudel_code,
    slugify,
)


def main():
    parser = argparse.ArgumentParser(description="Batch convert .vital presets")
    parser.add_argument("input_dir", help="Directory containing .vital files")
    parser.add_argument("--output-dir", "-o", default="./output")
    parser.add_argument("--base-url", "-u",
                       default="https://raw.githubusercontent.com/YOUR_REPO/main/wavetables/")
    parser.add_argument("--strudel-json", action="store_true", default=True,
                       help="Generate strudel.json index (default: true)")
    
    args = parser.parse_args()
    
    input_dir = Path(args.input_dir)
    output_dir = Path(args.output_dir)
    wav_dir = output_dir / "wavetables"
    code_dir = output_dir / "code"
    
    output_dir.mkdir(parents=True, exist_ok=True)
    wav_dir.mkdir(exist_ok=True)
    code_dir.mkdir(exist_ok=True)
    
    # Find all .vital files
    vital_files = sorted(input_dir.glob("**/*.vital"))
    if not vital_files:
        print(f"❌ No .vital files found in {input_dir}")
        return 1
    
    print(f"📂 Found {len(vital_files)} .vital preset(s) in {input_dir}")
    print()
    
    # Index for strudel.json
    strudel_index = {"_base": args.base_url}
    
    # Summary
    results = []
    
    for vital_path in vital_files:
        try:
            raw = load_vital_preset(str(vital_path))
            preset = parse_preset(raw)
            slug = slugify(preset.name or vital_path.stem)
            
            print(f"  🎹 {vital_path.name} → {slug}")
            
            # Export wavetables
            wavs_exported = 0
            for osc in preset.oscillators:
                if osc.enabled and osc.wavetable_frames:
                    wav_name = f"{slug}_osc{osc.index + 1}.wav"
                    wav_path = wav_dir / wav_name
                    if export_wavetable_wav(osc, str(wav_path)):
                        wavs_exported += 1
                        strudel_index[f"{slug}_osc{osc.index + 1}"] = [wav_name]
            
            # Generate code
            code = generate_strudel_code(preset, args.base_url, slug)
            code_path = code_dir / f"{slug}.js"
            code_path.write_text(code)
            
            results.append({
                "name": preset.name,
                "slug": slug,
                "source": vital_path.name,
                "wavetables": wavs_exported,
                "oscillators": sum(1 for o in preset.oscillators if o.enabled),
                "has_filter": any(f.enabled for f in preset.filters),
            })
            
            print(f"     ✅ {wavs_exported} wavetable(s), code → {code_path.name}")
            
        except Exception as e:
            print(f"     ❌ Error: {e}")
            results.append({"name": vital_path.name, "error": str(e)})
    
    # Write strudel.json
    if args.strudel_json:
        index_path = wav_dir / "strudel.json"
        index_path.write_text(json.dumps(strudel_index, indent=2))
        print(f"\n📋 strudel.json index: {index_path}")
    
    # Write summary
    summary_path = output_dir / "summary.json"
    summary_path.write_text(json.dumps(results, indent=2))
    
    # Print summary
    success = [r for r in results if "error" not in r]
    failed = [r for r in results if "error" in r]
    
    print(f"\n{'=' * 50}")
    print(f"✅ Converted: {len(success)}/{len(vital_files)} presets")
    if failed:
        print(f"❌ Failed: {len(failed)}")
    total_wavs = sum(r.get("wavetables", 0) for r in success)
    print(f"🔊 Total wavetables exported: {total_wavs}")
    print(f"📁 Output: {output_dir}")
    print()
    print("Next steps:")
    print(f"  1. Host {wav_dir}/ at {args.base_url}")
    print(f"  2. Or use: await tables('github:YOUR_USER/YOUR_REPO')")
    print(f"  3. Paste any .js file from {code_dir}/ into Strudel")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
