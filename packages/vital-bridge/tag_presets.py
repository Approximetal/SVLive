#!/usr/bin/env python3
"""
Auto-tag Vital presets based on naming conventions and keywords.
Generates preset_tags.json with type/style/mood tags for searchable index.
"""

import json
import re
import os
from pathlib import Path
from collections import defaultdict

# === Tag Rules ===
# Each rule: (regex_pattern, type_tag, [style_tags])

RULES = [
    # Prefix-based (highest priority)
    (r'^BA\s*-\s*', 'bass', []),
    (r'^BS\s*-\s*', 'bass', []),
    (r'^BASS\s*-\s*', 'bass', []),
    (r'^LD\s*-\s*', 'lead', []),
    (r'^LEAD\s*-\s*', 'lead', []),
    (r'^PD\s*-\s*', 'pad', []),
    (r'^PAD\s*-\s*', 'pad', []),
    (r'^PL\s*-\s*', 'pluck', []),
    (r'^PLUCK\s*-\s*', 'pluck', []),
    (r'^SYN\s*-\s*', 'synth', []),
    (r'^SEQ\s*-\s*', 'sequence', []),
    (r'^SQ\s*-\s*', 'sequence', []),
    (r'^ARP\s*-\s*', 'arp', []),
    (r'^FX\s*-\s*', 'fx', []),
    (r'^SFX\s*-\s*', 'fx', []),
    (r'^CH\s*-\s*', 'chord', []),
    (r'^CHORD\s*-\s*', 'chord', []),
    (r'^KEYS\s*-\s*', 'keys', []),
    (r'^KEY\s*-\s*', 'keys', []),
    (r'^KY\s*-\s*', 'keys', []),
    (r'^DR\s*-\s*', 'drum', []),
    (r'^DRUM\s*-\s*', 'drum', []),
    (r'^PERC\s*-\s*', 'percussion', []),
    (r'^GT\s*-\s*', 'guitar', []),
    (r'^BRASS\s*-\s*', 'brass', []),
    (r'^STR\s*-\s*', 'strings', []),
    (r'^VOX\s*-\s*', 'vocal', []),

    # Keyword-based type detection
    (r'\bBass\b', 'bass', []),
    (r'\bSub\b', 'bass', ['deep', 'low']),
    (r'\b808\b', 'bass', ['deep', 'trap']),
    (r'\bReese\b', 'bass', ['dark', 'aggressive']),
    (r'\bGrowl\b', 'bass', ['aggressive', 'dubstep']),
    (r'\bWobble\b', 'bass', ['dubstep']),

    (r'\bLead\b', 'lead', []),
    (r'\bSolo\b', 'lead', []),

    (r'\bPad\b', 'pad', []),
    (r'\bDrone\b', 'pad', ['drone', 'dark']),
    (r'\bAtmos\b', 'pad', ['ambient']),
    (r'\bAmbient\b', 'pad', ['ambient']),
    (r'\bWash\b', 'pad', ['ambient']),

    (r'\bPluck\b', 'pluck', []),
    (r'\bPlucked\b', 'pluck', []),
    (r'\bPizz\b', 'pluck', []),
    (r'\bHarp\b', 'pluck', []),

    (r'\bArp\b', 'arp', []),
    (r'\bArpeggio\b', 'arp', []),
    (r'\bSequence\b', 'sequence', []),

    (r'\bKeys?\b', 'keys', []),
    (r'\bPiano\b', 'keys', ['acoustic']),
    (r'\bRhodes?\b', 'keys', ['electric', 'vintage']),
    (r'\bWurlitzer\b', 'keys', ['electric', 'vintage']),
    (r'\bOrgan\b', 'keys', ['organ']),

    (r'\bSynth\b', 'synth', []),
    (r'\bSaw\b', 'synth', ['analog']),
    (r'\bWavetable\b', 'synth', ['wavetable']),

    (r'\bBell\b', 'bell', []),
    (r'\bBells\b', 'bell', []),
    (r'\bMallet\b', 'bell', []),
    (r'\bXylophone\b', 'bell', []),
    (r'\bMarimba\b', 'bell', []),
    (r'\bKalimba\b', 'bell', ['world']),
    (r'\bMusic\s*Box\b', 'bell', ['delicate']),
    (r'\bGlock\b', 'bell', []),
    (r'\bVibraphone\b', 'bell', []),
    (r'\bGlass\b', 'bell', ['glass']),
    (r'\bMetal\b', 'bell', ['metallic']),

    (r'\bKick\b', 'drum', []),
    (r'\bSnare\b', 'drum', []),
    (r'\bHat\b', 'drum', []),
    (r'\bClap\b', 'drum', []),
    (r'\bDrum\b', 'drum', []),
    (r'\bPerc\b', 'percussion', []),
    (r'\bShaker\b', 'percussion', []),
    (r'\bTabla\b', 'percussion', ['world']),

    (r'\bChord\b', 'chord', []),
    (r'\bStab\b', 'chord', ['stab']),

    (r'\bBrass\b', 'brass', []),
    (r'\bHorn\b', 'brass', []),
    (r'\bTrumpet\b', 'brass', []),
    (r'\bSax\b', 'brass', []),

    (r'\bString\b', 'strings', []),
    (r'\bViolin\b', 'strings', []),
    (r'\bCello\b', 'strings', []),
    (r'\bOrchest\b', 'orchestral', []),

    (r'\bGuitar\b', 'guitar', []),

    (r'\bVocal\b', 'vocal', []),
    (r'\bVoice\b', 'vocal', []),
    (r'\bChoir\b', 'vocal', ['choir']),
    (r'\bChant\b', 'vocal', ['world']),

    (r'\bFlute\b', 'wind', []),
    (r'\bWind\b', 'wind', []),

    (r'\bSitar\b', 'world', ['india', 'raga']),
    (r'\bEastern\b', 'world', ['oriental']),
    (r'\bOriental\b', 'world', ['oriental']),
    (r'\bEthnic\b', 'world', []),
    (r'\bTribal\b', 'world', ['tribal']),
    (r'\bExotic\b', 'world', []),

    (r'\bGlitch\b', 'fx', ['glitch']),
    (r'\bNoise\b', 'fx', ['noise']),
    (r'\bRiser\b', 'fx', ['riser']),
    (r'\bDownlifter\b', 'fx', ['downlifter']),
    (r'\bImpact\b', 'fx', ['impact']),
    (r'\bSweep\b', 'fx', ['sweep']),
    (r'\bTexture\b', 'texture', []),
    (r'\bGranular\b', 'texture', ['granular']),

    # Style/Mood tags (type=None means style-only, no type change)
    (r'\bWarm\b', None, ['warm']),
    (r'\bDark\b', None, ['dark']),
    (r'\bBright\b', None, ['bright']),
    (r'\bSoft\b', None, ['soft']),
    (r'\bHard\b', None, ['hard']),
    (r'\bDeep\b', None, ['deep']),
    (r'\bClean\b', None, ['clean']),
    (r'\bDirty\b', None, ['dirty']),
    (r'\bAggressive\b', None, ['aggressive']),
    (r'\bSmooth\b', None, ['smooth']),
    (r'\bHarsh\b', None, ['harsh']),
    (r'\bLush\b', None, ['lush']),
    (r'\bFat\b', None, ['fat']),
    (r'\bThicc\b', None, ['fat']),
    (r'\bPhat\b', None, ['fat']),
    (r'\bHuge\b', None, ['huge']),
    (r'\bEpic\b', None, ['epic']),
    (r'\bCinematic\b', None, ['cinematic']),
    (r'\bRetro\b', None, ['retro']),
    (r'\bVintage\b', None, ['vintage', 'retro']),
    (r'\bModern\b', None, ['modern']),
    (r'\bFuture\b', None, ['future']),
    (r'\bAnalog\b', None, ['analog']),
    (r'\bDigital\b', None, ['digital']),
    (r'\bFM\b', None, ['fm']),
    (r'\bLo.?fi\b', None, ['lofi']),
    (r'\bLoFi\b', None, ['lofi']),
    (r'\bClassic\b', None, ['classic']),
    (r'\bDubstep\b', None, ['dubstep']),
    (r'\bTrap\b', None, ['trap']),
    (r'\bHouse\b', None, ['house']),
    (r'\bTechno\b', None, ['techno']),
    (r'\bTrance\b', None, ['trance']),
    (r'\bPsy\b', None, ['psytrance']),
    (r'\bDnB\b', None, ['dnb']),
    (r'\bHip.?hop\b', None, ['hiphop']),
    (r'\bEDM\b', None, ['edm']),
    (r'\bPop\b', None, ['pop']),
    (r'\bFunk\b', None, ['funk']),
    (r'\bDisco\b', None, ['disco']),
    (r'\bJazz\b', None, ['jazz']),
    (r'\bSoul\b', None, ['soul']),
    (r'\bRnB\b', None, ['rnb']),
    (r'\bIDM\b', None, ['idm']),

    # Mood/character
    (r'\bHappy\b', None, ['happy']),
    (r'\bSad\b', None, ['sad']),
    (r'\bAngry\b', None, ['aggressive']),
    (r'\bScary\b', None, ['dark', 'scary']),
    (r'\bHorror\b', None, ['dark', 'horror']),
    (r'\bSpooky\b', None, ['dark', 'spooky']),
    (r'\bGhost\b', None, ['dark', 'haunting']),
    (r'\bDream\b', None, ['dreamy']),
    (r'\bEthereal\b', None, ['ethereal']),
    (r'\bMystic\b', None, ['mystical']),
    (r'\bMagic\b', None, ['magical']),
    (r'\bFantasy\b', None, ['fantasy']),
    (r'\bSci.?fi\b', None, ['scifi']),
    (r'\bCyberpunk\b', None, ['cyberpunk', 'scifi']),

    # Sonic character
    (r'\bSpace\b', None, ['space', 'ambient']),
    (r'\bCosmic\b', None, ['space']),
    (r'\bAlien\b', None, ['alien', 'experimental']),
    (r'\bCrystal\b', None, ['crystal']),
    (r'\bSparkle\b', None, ['sparkle']),
    (r'\bShimmer\b', None, ['shimmer']),
    (r'\bDust\b', None, ['dust', 'lofi']),
    (r'\bTape\b', None, ['tape', 'lofi']),
    (r'\bVinyl\b', None, ['vinyl', 'lofi']),
    (r'\bIce\b', None, ['ice', 'cold']),
    (r'\bCold\b', None, ['cold']),
    (r'\bFrost\b', None, ['cold']),
    (r'\bWinter\b', None, ['cold']),
    (r'\bRain\b', None, ['rain', 'ambient']),
    (r'\bReverse\b', None, ['reversed']),
    (r'\bPing.?Pong\b', None, ['pingpong']),
    (r'\bSidechain\b', None, ['sidechain']),
    (r'\bCrush\b', None, ['crushed']),
    (r'\b8.?bit\b', None, ['8bit', 'retro']),
    (r'\bChiptune\b', None, ['8bit', 'retro']),
    (r'\bRobot\b', None, ['robot']),
]


def tag_preset(name: str, pack: str) -> dict:
    types = set()
    styles = set()

    for pattern, type_tag, style_tags in RULES:
        if re.search(pattern, name, re.IGNORECASE):
            if type_tag:
                types.add(type_tag)
            for s in style_tags:
                styles.add(s)

    styles -= types
    if not types:
        types.add('other')

    return {
        'types': sorted(types),
        'styles': sorted(styles),
        'tags': sorted(types | styles),
    }


def scan_and_tag(base_dir: Path, source: str) -> list:
    results = []
    for vital_file in sorted(base_dir.rglob('*.vital')):
        rel_path = vital_file.relative_to(base_dir)
        parts = rel_path.parts
        pack = parts[0] if len(parts) > 1 else 'Local'
        name = vital_file.stem
        tags = tag_preset(name, pack)
        results.append({
            'name': name,
            'pack': pack,
            'source': source,
            'path': str(vital_file),
            'relative': str(rel_path),
            'types': tags['types'],
            'styles': tags['styles'],
            'tags': tags['tags'],
        })
    return results


def build_inverted_index(presets: list) -> dict:
    index = defaultdict(list)
    for p in presets:
        for tag in p['tags']:
            index[tag].append(p['name'])
    return {k: sorted(v) for k, v in sorted(index.items())}


def main():
    presets_dir = Path(os.environ.get('VITAL_PRESETS_DIR', os.path.expanduser('~/music/Vital')))
    jek_dir = Path(os.environ.get('JEK_PRESETS_DIR', os.path.expanduser("~/music/Jek's Vital Presets")))

    output_file = Path(__file__).parent / 'preset_tags.json'
    all_presets = []

    if presets_dir.exists():
        all_presets.extend(scan_and_tag(presets_dir, 'default'))
    if jek_dir.exists():
        all_presets.extend(scan_and_tag(jek_dir, 'jek'))

    type_counts = defaultdict(int)
    style_counts = defaultdict(int)
    for p in all_presets:
        for t in p['types']:
            type_counts[t] += 1
        for s in p['styles']:
            style_counts[s] += 1

    inverted = build_inverted_index(all_presets)

    result = {
        'total': len(all_presets),
        'type_counts': dict(sorted(type_counts.items(), key=lambda x: -x[1])),
        'style_counts': dict(sorted(style_counts.items(), key=lambda x: -x[1])),
        'inverted_index': inverted,
        'presets': all_presets,
    }

    output_file.write_text(json.dumps(result, indent=2, ensure_ascii=False))
    print(f'Tagged {len(all_presets)} presets -> {output_file}')
    print(f'  Types: {len(type_counts)} categories')
    print(f'  Styles: {len(style_counts)} tags')
    print(f'  Index: {len(inverted)} unique tags')
    print()
    print('Top types:')
    for t, c in sorted(type_counts.items(), key=lambda x: -x[1])[:15]:
        print(f'  {t}: {c}')
    print()
    print('Top styles:')
    for t, c in sorted(style_counts.items(), key=lambda x: -x[1])[:15]:
        print(f'  {t}: {c}')


if __name__ == '__main__':
    main()
