#!/usr/bin/env python3
"""
presets_to_ai_knowledge.py — Convert exported Strudel preset .js files into
a knowledge base that the AI can use when generating music.

This generates a JS module that can be imported into the AI's system prompt,
giving it access to high-quality Vital-derived sound presets.
"""

import argparse
import json
import os
import sys
from pathlib import Path


HEADER = '''/**
 * Vital Preset Library for Strudel AI
 * Auto-generated — do not edit manually.
 *
 * These presets are converted from Vital synthesizer using vital2strudel.
 * Each preset defines a wavetable sound with parameters that produce
 * high-quality timbres beyond basic oscillators.
 *
 * Usage in Strudel:
 *   1. Load wavetables with tables() at the top of your pattern
 *   2. Use .s("preset_name") to select the sound
 *   3. Chain the preset's recommended parameters
 */

export const VITAL_PRESETS = [
'''

FOOTER = '''];

/**
 * Get a preset by name or category.
 */
export function getPreset(name) {
  return VITAL_PRESETS.find(p => p.name === name || p.slug === name);
}

export function getPresetsByCategory(category) {
  return VITAL_PRESETS.filter(p => p.category === category);
}

export const PRESET_CATEGORIES = [...new Set(VITAL_PRESETS.map(p => p.category))];
'''


def categorize_preset(name: str) -> str:
    """Guess a category from preset name."""
    name_lower = name.lower()
    if any(w in name_lower for w in ['pad', 'ambient', 'atmosphere', 'drone', 'ethereal']):
        return 'Pads & Ambient'
    elif any(w in name_lower for w in ['bass', 'sub', 'growl', 'reese']):
        return 'Bass'
    elif any(w in name_lower for w in ['lead', 'mono', 'acid', 'scream']):
        return 'Leads'
    elif any(w in name_lower for w in ['pluck', 'bell', 'key', 'piano', 'stab']):
        return 'Plucks & Keys'
    elif any(w in name_lower for w in ['arp', 'sequence']):
        return 'Arps'
    elif any(w in name_lower for w in ['fx', 'riser', 'sweep', 'noise', 'impact']):
        return 'FX & Risers'
    return 'General'


def main():
    parser = argparse.ArgumentParser(description="Generate AI preset knowledge base")
    parser.add_argument("code_dir", help="Directory containing .js preset files")
    parser.add_argument("--output", "-o", default="vital_presets_library.js")
    parser.add_argument("--base-url", "-u", default="")
    
    args = parser.parse_args()
    
    code_dir = Path(args.code_dir)
    js_files = sorted(code_dir.glob("*.js"))
    
    if not js_files:
        print(f"❌ No .js files found in {code_dir}")
        return 1
    
    entries = []
    for js_path in js_files:
        code = js_path.read_text()
        slug = js_path.stem
        
        # Extract preset name from comment
        name = slug
        for line in code.split('\n'):
            if line.startswith('// Vital Preset:'):
                name = line.replace('// Vital Preset:', '').strip()
                break
        
        category = categorize_preset(name)
        
        # Escape the code for embedding in JS
        escaped_code = code.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
        
        entry = {
            "name": name,
            "slug": slug,
            "category": category,
            "code": escaped_code,
        }
        entries.append(entry)
    
    # Generate output
    output = HEADER
    for i, entry in enumerate(entries):
        comma = ',' if i < len(entries) - 1 else ''
        output += f'  {{\n'
        output += f'    name: {json.dumps(entry["name"])},\n'
        output += f'    slug: {json.dumps(entry["slug"])},\n'
        output += f'    category: {json.dumps(entry["category"])},\n'
        output += f'    code: `{entry["code"]}`,\n'
        output += f'  }}{comma}\n'
    output += FOOTER
    
    output_path = Path(args.output)
    output_path.write_text(output)
    
    print(f"✅ Generated {output_path} with {len(entries)} preset(s)")
    print(f"   Categories: {', '.join(sorted(set(e['category'] for e in entries)))}")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
