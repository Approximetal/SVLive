#!/usr/bin/env python3
"""
fetch_vital_factory.py — Download free Vital factory presets for testing.

Vital's factory presets are included in the free tier and stored in known paths.
This script helps locate them on your system.
"""

import os
import sys
import shutil
from pathlib import Path

# Known Vital preset locations by platform
VITAL_PRESET_DIRS = {
    "darwin": [  # macOS
        Path.home() / "Music" / "Vital" / "Presets",
        Path.home() / "Library" / "Audio" / "Presets" / "Vital",
        Path("/Library/Audio/Presets/Vital"),
    ],
    "linux": [
        Path.home() / ".local" / "share" / "vital" / "presets",
        Path.home() / "Documents" / "Vital" / "Presets",
        Path("/usr/share/vital/presets"),
    ],
    "win32": [
        Path.home() / "Documents" / "Vital" / "Presets",
        Path(os.environ.get("PROGRAMDATA", "C:/ProgramData")) / "Vital" / "Presets",
    ],
}


def find_vital_presets() -> list:
    """Find Vital preset directories on this system."""
    platform = sys.platform
    dirs = VITAL_PRESET_DIRS.get(platform, [])
    
    found = []
    for d in dirs:
        if d.exists():
            vital_files = list(d.glob("**/*.vital"))
            if vital_files:
                found.append((d, vital_files))
    
    return found


def main():
    print("🔍 Searching for Vital presets on your system...")
    print()
    
    found = find_vital_presets()
    
    if not found:
        print("❌ No Vital presets found.")
        print()
        print("Possible reasons:")
        print("  • Vital is not installed")
        print("  • Presets are in a non-standard location")
        print()
        print("You can:")
        print("  1. Install Vital (free): https://vital.audio/")
        print("  2. Download free preset packs from:")
        print("     - https://vital.audio/ (factory presets)")
        print("     - https://www.reddit.com/r/VitalSynth/")
        print("     - https://vitalpresets.com/ (some free)")
        print()
        print("Then run this script again, or use vital2strudel.py directly:")
        print("  python vital2strudel.py /path/to/preset.vital")
        return 1
    
    total_presets = 0
    for directory, files in found:
        total_presets += len(files)
        print(f"📁 {directory}")
        print(f"   {len(files)} preset(s)")
        
        # Show categories
        categories = set()
        for f in files:
            rel = f.relative_to(directory)
            if len(rel.parts) > 1:
                categories.add(rel.parts[0])
        if categories:
            print(f"   Categories: {', '.join(sorted(categories))}")
        print()
    
    print(f"✅ Total: {total_presets} presets found")
    print()
    print("To convert all presets:")
    for directory, _ in found:
        print(f"  python batch_convert.py '{directory}' -o ./output")
    print()
    print("To convert a single preset:")
    if found:
        sample = found[0][1][0]
        print(f"  python vital2strudel.py '{sample}'")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
