/**
 * Prompt Builder - Dynamically constructs system prompts based on intent
 *
 * Injects genre-specific sounds, templates, composition methodology, and runtime
 * editor state + available sounds discovery to produce high-quality LLM prompts.
 */

import { GENRE_SOUND_MAP, VERIFIED_SYNTHS } from './sounds.js';
import { getExampleForGenre, getAdvancedExampleForGenre } from './templates.js';

// Cache for sound list to avoid repeated queries
let _soundListCache = null;
let _soundListCacheTime = 0;
const SOUND_CACHE_TTL = 60000; // 60 seconds

/**
 * Build the "Available Sounds" section by querying the live audio engine
 * and vital-bridge server. Injected into system prompt so the model doesn't
 * need a separate list_available_sounds tool call for common cases.
 */
async function buildSoundListSection() {
  const now = Date.now();
  if (_soundListCache && (now - _soundListCacheTime) < SOUND_CACHE_TTL) {
    return _soundListCache;
  }

  const parts = [];

  // ── Drum sounds (from superdough runtime) ──
  try {
    const { soundMap } = await import('superdough');
    const sounds = soundMap.get();
    const names = Object.keys(sounds);

    const drumElements = ['bd','sd','hh','oh','cp','rim','cb','cr',
      'rd','ht','mt','lt','sh','tb','perc','tom','sn', 'clap'];
    const drumSounds = names.filter(n => drumElements.includes(n));

    // Find drum machine banks
    const bankSet = new Set();
    for (const n of names) {
      const lower = n.toLowerCase();
      if (lower.includes('roland') || lower.includes('tr') || lower.includes('linn') ||
          lower.includes('oberheim') || lower.includes('emu') || lower.includes('alesis') ||
          lower.includes('boss') || lower.includes('korg') || lower.includes('yamaha') ||
          lower.includes('akai') || lower.includes('casio') || lower.includes('simmons') ||
          lower.includes('dmx')) {
        bankSet.add(n);
      }
    }

    if (drumSounds.length > 0) {
      parts.push('## Available Drum Sounds');
      parts.push(`Core elements: ${drumSounds.sort().join(', ')}`);
      if (bankSet.size > 0) {
        const banks = [...bankSet].sort().slice(0, 12);
        parts.push(`Drum machines: ${banks.join(', ')}${bankSet.size > 12 ? ' ...' : ''}`);
      }
      parts.push('Usage: s("bd").bank("RolandTR909"), s("[bd hh] sd")');
      parts.push('');
    }
  } catch (e) {
    parts.push('## Available Drum Sounds');
    parts.push('Core: bd, sd, hh, oh, cp, rim, cr, lt, mt, ht, clap');
    parts.push('Machines: RolandTR909, RolandTR808, LinnDrum, OberheimDMX');
    parts.push('');
  }

  // ── Vital presets (from vital-bridge) ──
  try {
    const r = await fetch('http://localhost:8765/presets/tags', {
      signal: AbortSignal.timeout(3000),
    });
    if (r.ok) {
      const data = await r.json();
      const types = data.type_counts || {};
      parts.push('## Available Vital Synth Presets (2300 total)');
      parts.push('All melodic/harmonic sounds MUST use Vital presets. Load with: await vital("Preset Name")');
      parts.push('');
      const topPicks = {
        bass: '808, BA - 808 Aggressive, BA - Bro Bass, Jupiter Bass',
        lead: 'LD-Supersaw, LD - Future Bass, LD - Hyper Pop, Super Pluck',
        pad: 'Analog Pad, PD - Into Lucidity, DRONE Floating',
        keys: 'KEYS-Electric Piano, KEYS - Classic Rhodes',
        pluck: 'Plucked String, PL - Basic Pluck',
        chord: 'CHORD-House, CHORD - Deep',
        fx: 'Special Glitch Thing, Destruction',
        arp: 'ARP - Classic',
        bell: 'BELL - Crystal, Cinema Bells',
        world: 'Sitar, Kalimba',
      };
      const sortedTypes = Object.entries(types)
        .filter(([t]) => t !== 'other')
        .sort(([,a], [,b]) => b - a);
      for (const [type, count] of sortedTypes) {
        const pick = topPicks[type] ? ` — try: "${topPicks[type]}"` : '';
        parts.push(`- ${type}: ${count} presets${pick}`);
      }
      parts.push('');
      parts.push('IMPORTANT: Use list_available_sounds("vital_bass") etc. to see exact preset names if needed.');
      parts.push('');
    }
  } catch (e) {
    // vital-bridge not running — skip
  }

  // ── Native synths (fallback) ──
  parts.push('## Native Synths (fallback, use ONLY if Vital unavailable)');
  parts.push('sine, triangle, square, sawtooth, supersaw, pulse, white, pink, brown');
  parts.push('');

  const result = parts.join('\n');
  _soundListCache = result;
  _soundListCacheTime = now;
  return result;
}

/**
 * Build editor context section — tells the model what the user currently has.
 */
function buildEditorContextSection(editorContext) {
  if (!editorContext) return '';

  const parts = ['## Current Editor State'];

  if (editorContext.isPlaying !== undefined) {
    parts.push(`- Playing: ${editorContext.isPlaying ? 'YES' : 'no (stopped)'}`);
  }

  if (editorContext.currentCode) {
    const code = editorContext.currentCode;
    const trimmed = code.length > 800
      ? code.slice(0, 800) + `\n// ... (${code.length - 800} more chars, ${code.split('\n').length} lines total)`
      : code;
    parts.push(`- Current code (${code.length} chars):`);
    parts.push('```javascript');
    parts.push(trimmed);
    parts.push('```');
  }

  if (editorContext.evalError) {
    parts.push(`- ⚠️ Eval Error: ${editorContext.evalError}`);
    parts.push('  The current code has an error. Your generated code should fix it (or be completely new).');
  }

  if (!editorContext.currentCode) {
    parts.push('- Editor is empty — generate a fresh composition.');
  }

  parts.push('');
  return parts.join('\n');
}

/**
 * Build an enhanced system prompt based on analyzed intent.
 * Also injects live sound list + editor state for context-aware generation.
 */
export async function buildEnhancedPrompt(intent, userMessage, baseSystemPrompt, presetGuidance = '', editorContext = null) {
  const genreSounds = GENRE_SOUND_MAP[intent.genre] || GENRE_SOUND_MAP.house;
  const exampleCode = intent.complexity === 'complex'
    ? getAdvancedExampleForGenre(intent.genre)
    : getExampleForGenre(intent.genre);

  const compositionMethodology = getCompositionMethodology(intent);
  const soundGuidance = getSoundGuidance(intent, genreSounds);
  const mixingGuidance = getMixingGuidance(intent);

  // Fetch live sound list (cached, fast on subsequent calls)
  const soundListSection = await buildSoundListSection();

  // Build editor context section
  const editorContextSection = buildEditorContextSection(editorContext);

  return `${baseSystemPrompt}

${soundListSection}
${editorContextSection}
## ═══════════════════════════════════════════════
## CONTEXT-SPECIFIC GUIDANCE FOR THIS REQUEST
## ═══════════════════════════════════════════════

## Current Task Context
- **Genre**: ${intent.genre}
- **BPM**: ${intent.bpm} (use \`setCpm(${intent.bpm}/4)\`)
- **Key/Scale**: ${intent.key}
- **Mood**: ${intent.mood}
- **Complexity**: ${intent.complexity}

${soundGuidance}

${presetGuidance}

${compositionMethodology}

${mixingGuidance}

## Reference Example (${intent.genre} style)
Study this example for correct syntax, structure, and sound choices:
\`\`\`javascript
${exampleCode}
\`\`\`

## User Request
"${userMessage}"

## Final Checklist Before Output
1. ✅ Used \`setCpm(${intent.bpm}/4)\` for tempo
2. ✅ **ALL melodic/harmonic/texture sounds use Vital presets** (loaded with \`await vital()\`, played with \`vital_*\`)
3. ✅ **NO native synth sounds** (sawtooth, sine, supersaw, triangle, square, gm_*)
4. ✅ Only drums/percussion use dirt-samples (bd, hh, sd, cp, etc.)
5. ✅ Used \`.scale("${intent.key}")\` for melodic content
6. ✅ Patterns are dense enough for the tempo (e.g., \`s("bd*4")\` not \`s("bd")\`)
7. ✅ Code is wrapped in a single \`stack(...)\`
8. ✅ Each layer has a comment explaining its role
9. ✅ At least one \`slider()\` for live performance control
`;
}

function getSoundGuidance(intent, genreSounds) {
  let guidance = `## Sound Selection for ${intent.genre}\n\n`;

  guidance += `### ⚠️ ALL melodic/harmonic sounds MUST use Vital presets (not native synths)\n`;
  guidance += `Load: \`await vital('Preset Name')\` → Play: \`.s("vital_preset_name")\`\n\n`;

  if (genreSounds.drums) {
    guidance += `### Drums (samples only) — LESS IS MORE\n`;
    guidance += `Bank: \`s("bd").bank("${genreSounds.drums}")\`\n`;
    guidance += `Elements: bd, sd, cp, hh, oh, lt, mt, ht, cr, rd, rim, sh, cb\n`;
    guidance += `**Drum Programming Rules:**\n`;
    guidance += `- NEVER fill every slot — use ~ rests. 50% density > 100% density.\n`;
    guidance += `- Use ? for probability: s("hh*4?") = organic variation\n`;
    guidance += `- Sparse patterns: "bd ~ bd ~" not "bd*4". "hh ~ hh ~" not "hh*8".\n`;
    guidance += `- Velocity variation: .gain(perlin.range(0.5, 1.0)) on hi-hats\n`;
    guidance += `- Each drum gets spatial: kick=room(0), snare=room(0.2), hats=room(0.1).hpf(6000)\n`;
    guidance += `Available machines: RolandTR909(punchy/house), RolandTR808(boomy/hiphop), RolandTR707(crisp/80s), RolandTR606(lofi/minimal), LinnDrum(punchy/80s), OberheimDMX(fat/old-school), YamahaRY30(clean/techno), KorgM1(90s house), EmuSP12(gritty/hiphop), AlesisHR16(clean/all-round), BossDR110(lofi/charming)\n\n`;
  }

  guidance += `### Bass (Vital presets)\n`;
  guidance += `Pick from: \`Thicccboi 808\`, \`BA - Rubber Bounciness\`, \`BA - Deep House\`, \`Psytrance Bass\`, \`808 Bass 4\`\n\n`;

  guidance += `### Pads & Atmosphere (Vital presets)\n`;
  guidance += `Pick from: \`DRONE Floating\`, \`Analog Pad\`, \`PD - Warm Pad\`, \`PD - Lush\`, \`PD - Cinematic\`\n\n`;

  guidance += `### Leads & Melody (Vital presets)\n`;
  guidance += `Pick from: \`Super Pluck\`, \`LD - Supersaw\`, \`LD - Future Bass\`, \`Plucked String\`, \`KEYS - FM Bell\`\n\n`;

  guidance += `### FORBIDDEN sounds:\n`;
  guidance += `- ❌ sawtooth, sine, supersaw, triangle, square, pulse, noise\n`;
  guidance += `- ❌ Any gm_* sound (gm_synth_bass_1, gm_lead_2_sawtooth, etc.)\n`;
  guidance += `- ❌ "shaker" → use "hh" with .hpf(8000)\n`;

  return guidance;
}

function getCompositionMethodology(intent) {
  const isRhythmic = ['techno', 'house', 'trap', 'dubstep', 'dnb', 'garage'].includes(intent.genre);
  const isMelodic = ['jazz', 'classical', 'ambient', 'lofi'].includes(intent.genre);

  let methodology = `## Composition Methodology — Progressive Layering with arrange()\n\n`;

  methodology += `### ⚠️ CRITICAL: ALL layers must NOT start at the same time!\n`;
  methodology += `The #1 mistake AI makes: putting all instruments in a single \`stack()\` that starts simultaneously.\n`;
  methodology += `Instead, use \`arrange()\` to introduce layers GRADUALLY across the timeline:\n\n`;

  methodology += `### The arrange() System — How Professional Strudel Tracks Are Built\n\n`;

  methodology += `**Step 1: Define pattern VARIATIONS** (create at least 2 versions of each part)\n`;
  methodology += `\`\`\`javascript
const drums_a = s("bd*4, [~ sd]*2, hh*8").bank("808")
const drums_b = s("bd*4, [~ cp]*2, [hh oh]*4").bank("808")  // variation
const bass_a = n("0 0 4 0").scale("${intent.key}").s("vital_jupiter_bass").lpf(400)
const bass_b = n("0 0 2 4").scale("${intent.key}").s("vital_jupiter_bass").lpf(600) // variation
const fill = s("bd bd bd bd -").bank("808").gain(1.2)  // transition fill
\`\`\`\n\n`;

  methodology += `**Step 2: Assemble NAMED SECTIONS from instruments**\n`;
  methodology += `Each section is a \`stack()\` of instruments — START SPARSE, BUILD PROGRESSIVELY:\n`;
  methodology += `\`\`\`javascript
// ── Instrument definitions (from Step 1) ──
const kick   = s("bd*4").bank("808")
const drums  = stack(kick, s("[~ sd]*2").bank("808"), s("hh*8").bank("808"))
const bass   = n("0 0 4 0").scale("c:minor").s("vital_jupiter_bass").lpf(400)
const lead   = n("0 2 4 5").scale("c:minor").s("vital_super_pluck")
const pad    = n("0 2 4").scale("c:minor").s("vital_analog_pad").room(0.6)

// ── SECTION ASSEMBLY (progressive: 1 → 3 → 4 → 5 → 2 → 1 instruments) ──
const intro    = kick                                // 1 instrument, sparse
const build    = stack(drums, bass)                  // +2, groove established
const verse    = stack(drums, bass, lead)            // +1, melodic content
const chorus   = stack(drums, bass, lead, pad)       // ALL instruments, peak!
const bridge   = stack(bass, pad)                    // strip back (contrast)
const outro    = kick                                // 1 instrument, fade

// Use .mask() for micro-dynamics within sections:
const verse_dyn = stack(
  drums.mask("<1 [1 1 1 [1 0]]>/4"),  // drop drums on last beat
  bass.mask("<1 1 1 [1 0]>/4"),       // bass breathes occasionally
  lead
)
\`\`\`\n\n`;

  methodology += `**Step 3: Master arrange() — your SONG MAP**\n`;
  methodology += `The master arrange() sequences WHOLE SECTIONS (not per-instrument):\n`;
  methodology += `Sparse sections FIRST, full sections MIDDLE, fade back at END:\n`;
  methodology += `\`\`\`javascript
arrange(
  [4, intro],          // 0-4:   Just kick — establish tempo
  [8, build],          // 4-12:  Drums + bass enter — energy rising
  [16, verse_dyn],     // 12-28: Full arrangement with mask dynamics
  [16, chorus],        // 28-44: PEAK — everything hits, max energy
  [8, bridge],         // 44-52: Contrast — strip back, build tension
  [16, chorus],        // 52-68: Return to peak (BIGGER than first time!)
  [8, outro]           // 68-76: Fade — only kick remains
)  // Total: 76 cycles — a complete song with emotional arc
\`\`\`\n\n`;

  methodology += `### Section Structure for ${intent.genre} (${intent.bpm} BPM)\n\n`;
  methodology += buildArrangementGuidance(intent);

  methodology += `### Key Principles\n\n`;
  methodology += `**1. Section-Based Progressive Layering**:\n`;
  methodology += `Each section adds instruments — never all at once:\n`;
  methodology += `- Intro (1-2 instruments): kick only, maybe pad. ENERGY LEVEL: 2/10\n`;
  methodology += `- Build (+1-2 instruments): add percussion, bass enters. ENERGY LEVEL: 4/10\n`;
  methodology += `- Verse (+1): full rhythm section + melody. ENERGY LEVEL: 6/10\n`;
  methodology += `- Chorus (ALL instruments): everything hits. ENERGY LEVEL: 9/10\n`;
  methodology += `- Bridge (remove layers): strip back for contrast. ENERGY LEVEL: 5/10\n`;
  methodology += `- Outro (1-2 instruments): fade to sparse. ENERGY LEVEL: 3/10 → 0\n`;
  methodology += `**The arc**: Intro → Build → Peak → Contrast → Return → Fade.\n`;
  methodology += `Contrast is EVERYTHING — sparse before dense, slow before fast, low before high.\n\n`;

  methodology += `**2. .mask() Creates Movement Within Sections**:\n`;
  methodology += `- \`drums.mask("<1 [1 1 1 [1 0]]>/4")\` — drums drop on last beat, creates "breathing"\n`;
  methodology += `- \`lead.mask("<1 1 [1 0] 1>/4")\` — lead drops on beat 3, call-response feel\n`;
  methodology += `- \`pad.mask("<0 0 1 1>/4")\` — pad enters in second half of cycle\n`;
  methodology += `- .mask() reads a pattern of 1s and 0s: 1=play, 0=mute\n`;
  methodology += `- Use mask on at least 2 instruments for micro-dynamics\n\n`;

  methodology += `**3. Pattern Variation via Inner arrange()**:\n`;
  methodology += `Each instrument definition uses its own \`arrange()\` for internal variation:\n`;
  methodology += `\`\`\`javascript
const bass = arrange(
  [2, "pattern_a"],  // main pattern, 2 cycles
  [1, "pattern_b"],  // variation, 1 cycle
  [1, "pattern_c"]   // another variation, 1 cycle
).note().s("vital_jupiter_bass").lpf(400)
\`\`\`\n`;
  methodology += `- This creates evolving patterns within a single instrument definition\n`;
  methodology += `- Variation prevents monotony — the same loop for 50 cycles IS boring\n\n`;

  methodology += `**4. Filter Automation for Movement**:\n`;
  methodology += `Use patterned \`.lpf()\` values to create "opening up" effects:\n`;
  methodology += `\`\`\`javascript
bass.lpf("<20000 [20000 20000 20000 500]>/4")  // opens on beat 4
pad.lpf(sine.range(200, 2000).slow(8))         // sweeping LFO
\`\`\`\n`;
  methodology += `- Static filters sound dead — automated filters create LIFE\n`;
  methodology += `- Use \`sine.range(min, max).slow(N)\` for smooth sweeps\n`;
  methodology += `- Use mini-notation patterns for rhythmic filter opening\n\n`;

  methodology += `**5. Target 50-90+ cycles total.** A 4-cycle loop is not a song.\n`;
  methodology += `- Minimum viable structure: Intro(4) → Verse(16) → Chorus(16) → Outro(4) = 40 cycles\n`;
  methodology += `- Good structure: Intro(4) → Build(8) → Verse(16) → Chorus(16) → Bridge(8) → Chorus(16) → Outro(8) = 76 cycles\n\n`;

  methodology += `**6. Tempo & Scale: Always declare FIRST**\n`;
  methodology += `\`\`\`javascript
setCpm(${intent.bpm}/4)
// Use .scale("${intent.key}") on all melodic patterns
\`\`\`\n\n`;

  methodology += `**7. Scale-degree notation** (not absolute notes):\n`;
  methodology += `\`\`\`javascript
n("0 2 4 6").scale("${intent.key}").s("vital_...")
\`\`\`\n`;
  methodology += `Scale degrees: 0=root, 1=2nd, 2=3rd, 3=4th, 4=5th, 5=6th, 6=7th.\n\n`;

  if (isMelodic) {
    methodology += `**8. Anchor Framework** (for melodic music):\n`;
    methodology += `- Harmony layer (slow, 4 steps): chord progression\n`;
    methodology += `- Bass layer (slow): root movement, octave lower\n`;
    methodology += `- Melody layer (fast, 8-12 steps): anchor on beats 1/3 to chord tones\n`;
    methodology += `- Counter-melody (fast): weave between melody anchor points\n\n`;
  }

  if (isRhythmic) {
    methodology += `**8. Frequency Layout** (for ${intent.genre}):\n`;
    methodology += `- Sub (20-60Hz): Sine sub or filtered kick tail\n`;
    methodology += `- Bass (60-250Hz): Main bass, \`.lpf()\` to control harmonics\n`;
    methodology += `- Mids (500-2kHz): Leads, main melodic content\n`;
    methodology += `- Highs (6k+): Hi-hats, cymbals, noise textures\n`;
    methodology += `- Each band needs its own space — use \`.hpf()\` / \`.lpf()\` to avoid masking\n\n`;
  }

  methodology += `**9. Slider for live control**: Always include at least one \`slider()\`:\n`;
  methodology += `\`\`\`javascript
const energy = slider(0.7)
// Use across multiple instruments: gain(energy), lpf(energy.mul(800).add(200))
\`\`\`\n`;

  return methodology;
}

function buildArrangementGuidance(intent) {
  const plans = {
    house: `| 0-8: Kick-only intro | 8-16: + Hi-hats | 16-32: + Bass | 32-48: Full groove | 48-56: Break (drums only) | 56-72: Return full | 72-80: Outro fade |`,
    techno: `| 0-16: Kick + rumble intro | 16-32: + Percussion layer | 32-48: + Bass + synth stab | 48-56: Breakdown (remove kick) | 56-72: Build back + full | 72-80: Outro |`,
    trap: `| 0-8: 808 + hi-hats | 8-16: + Snare | 16-32: + Synth melody | 32-40: Bridge (bass only) | 40-56: Full | 56-64: Outro |`,
    dubstep: `| 0-8: Atmosphere intro | 8-16: + Drums build | 16-24: + Bass wobble | 24-32: DROP (all in) | 32-40: Breakdown | 40-48: Second drop | 48-56: Outro |`,
    dnb: `| 0-8: Atmospheric intro | 8-16: Build (adds percussion) | 16-32: Full + Amen break | 32-40: Breakdown | 40-56: Second drop | 56-64: Outro |`,
    jazz: `| 0-8: Drums intro (brushes) | 8-16: + Bass walking | 16-32: + Piano comping | 32-48: Full (solo section) | 48-56: Head out | 56-64: Fade |`,
    ambient: `| 0-16: Drone + texture layer | 16-32: + Bass pad | 32-48: + Melodic fragment | 48-64: Peak texture | 64-80: Fade to silence |`,
    lofi: `| 0-8: Vinyl noise + kick | 8-16: + Hi-hats | 16-32: + Bass + chords | 32-48: Full groove | 48-56: Bridge (chords only) | 56-72: Return | 72-80: Outro |`,
    default: `| 0-8: Intro (drums only) | 8-16: + Bass | 16-32: + Melody (full) | 32-40: Bridge (sparse) | 40-56: Chorus (full) | 56-64: Outro |`,
  };

  const plan = plans[intent.genre] || plans.default;
  const planNotes = plan;

  // Build detailed section notes
  const sectionNotes = buildSectionNotes(intent);

  return `**Recommended arrangement (${intent.bpm} BPM, target 50-90+ cycles):**\n${planNotes}\n\n${sectionNotes}`;
}

function buildSectionNotes(intent) {
  const bpm = intent.bpm;
  const key = intent.key;
  const isRhy = ['techno', 'house', 'trap', 'dubstep', 'dnb', 'garage'].includes(intent.genre);

  let notes = `**Section Design with ENERGY MAPPING (1-10 scale):**

`;
  notes += `| Section | Cycles | Energy | Instruments | Dynamic Strategy |
`;
  notes += `|---------|--------|--------|-------------|-----------------|
`;
  notes += `| Intro   | 4-8   | 2-3/10 | 1-2 instruments | ${bpm < 110 ? 'Atmospheric, sparse. Kick or pad only.' : 'Kick only, establish pulse.'} |
`;
  notes += `| Build   | 8-16  | 4-6/10 | +1-2 instruments | Add hi-hats, then bass. Energy RISES. |
`;
  notes += `| Verse   | 16-24 | 6-7/10 | 3-4 instruments | Main content. Use .mask() for dynamics. Leave space for chorus. |
`;
  notes += `| Chorus  | 16-24 | 8-10/10 | ALL instruments | PEAK energy. Open filters, full layers. This hits hardest. |
`;
  notes += `| Bridge  | 8-12  | 4-6/10 | 2-3 instruments | CONTRAST — remove layers, shift harmony, create tension. |
`;
  notes += `| Outro   | 4-8   | 3→0/10 | 1-2 instruments | Fade layers. End with silence or single element. |

`;

  notes += `**Energy Arc**: Intro(2-3) ➚ Build(4-6) ➚ Verse(6-7) ➚ Chorus(8-10) ➘ Bridge(4-6) ➚ Chorus(9-10) ➘ Outro(3→0)
`;
  notes += `**Golden Rule**: The chorus only hits hard because the verse held back. Contrast is EVERYTHING.

`;

  if (isRhy) {
    notes += `**Rhythm Technique — Euclidean Patterns**:
`;
    notes += `Strudel's \`euclid(k, n)\` creates complex rhythms by distributing k hits across n steps:
`;
    notes += `- \`euclid(3, 8)\` → Tresillo (Cuban/Caribbean clave)
`;
    notes += `- \`euclid(5, 8)\` → Cumbia / West African groove
`;
    notes += `- \`euclid(5, 16)\` → Bossa Nova clave
`;
    notes += `- \`euclid(7, 16)\` → Complex polyrhythm
`;
    notes += `Combine in stack: \`stack(euclid(3,8).s("bd"), euclid(5,8).s("hh"))\` for instant polyrhythms!

`;
  }

  notes += `**Total minimum**: 48 cycles. **Good target**: 64-80 cycles. **Great target**: 72-88 cycles.`;
  return notes;
}

function getMixingGuidance(intent) {
  return `## Mixing Guidelines for ${intent.genre}

### ⚠️ MANDATORY: Reverb & Space — Your Track Must BREATHE
**Dry = amateur. Every layer needs spatial treatment. NO exceptions.**

| Element | Reverb | Other |
|---------|--------|-------|
| Kick | .room(0) | Keep TIGHT. Never add reverb to kick. |
| Snare/Clap | .room(0.15-0.3) | .delay(0.15).delaytime(0.2) for width |
| Hi-hats | .room(0.1-0.2) | .hpf(6000) to remove mud |
| Bass | .room(0.05-0.1) | .lpf(200-600).shape(0.05) |
| Leads | .room(0.3-0.5) | .delay(0.2).delaytime(0.3).delayfeedback(0.3) |
| Pads | .room(0.5-0.8) | FLOAT in the background |
| FX | .room(0.7-1.0) | Full atmosphere |

**Global shortcut**: \`all(x=>x.room(0.35).shape(0.1))\` applies reverb+presence to everything.

**ALSO mandatory**: \`.shape(0.05-0.15)\` on every element — adds warmth and presence (soft saturation).

### Gain Staging
- **Kick**: gain(0.85-0.95) — loudest element
- **Snare/Clap**: gain(0.6-0.8) — prominent
- **Hi-hats**: gain(0.2-0.35) — support, NEVER dominate
- **Bass**: gain(0.7-0.85) — strong but filtered
- **Pads**: gain(0.2-0.4) — background texture
- **Leads**: gain(0.35-0.5) — present but not harsh
- **FX/Texture**: gain(0.03-0.1) — subtle atmosphere

### Drum-Specific EQ
- \`.hpf(200)\` on everything except kick/bass — cleans low end
- \`.hpf(6000)\` on hi-hats — removes mud, keeps sparkle
- \`.lpf(8000)\` on kick — keeps sub, removes harsh highs
- Use \`.pan(perlin.range(0.3, 0.7))\` for organic stereo movement
`;
}

/**
 * Build a concise prompt for modify mode (no need for full templates)
 */

/**
 * Build an enhanced prompt from an Essentia style profile (audio analysis).
 * 
 * This bypasses the text-based intent analysis entirely — the style profile
 * comes from actual audio analysis via Essentia, providing authoritative
 * genre, BPM, key, mood, instrument, and sound character data.
 * 
 * @param {object} profile - Essentia style profile
 * @param {string} userMessage - Original user message (optional)
 * @param {string} baseSystemPrompt - Base system prompt (system-generate.txt)
 * @param {object} editorContext - Editor state
 * @param {object} extra - { styleGuidanceBuilder, drumBankRecommender }
 */
export async function buildStyleEnhancedPrompt(profile, userMessage, baseSystemPrompt, editorContext = null, extra = {}) {
  const { styleProfileToIntent, buildStyleGuidance, getDrumBankRecommendation } = extra.styleProfile || {};

  // Convert profile to intent format for use with existing functions
  let intent;
  if (styleProfileToIntent) {
    intent = styleProfileToIntent(profile);
  } else {
    // Manual conversion (fallback)
    const genreBPM = {
      house: 124, techno: 133, trance: 140, ambient: 70, jazz: 95,
      dnb: 174, hiphop: 90, trap: 145, lofi: 78, dubstep: 140,
      reggae: 80, funk: 110, garage: 134, classical: 80, hyperpop: 160,
      synthwave: 100, latin: 110,
    };
    intent = {
      genre: profile.genre?.primary || 'house',
      bpm: profile.bpm?.value || genreBPM[profile.genre?.primary] || 120,
      key: profile.key?.value || 'C:minor',
      mood: profile.mood?.primary || 'energetic',
      complexity: (profile.instruments?.length || 4) >= 5 ? 'complex' : 'medium',
    };
  }

  const genreSounds = (await import('./sounds.js').then(m => m.GENRE_SOUND_MAP))[intent.genre] || 
                     (await import('./sounds.js').then(m => m.GENRE_SOUND_MAP)).house;

  const exampleCode = intent.complexity === 'complex'
    ? (await import('./templates.js')).getAdvancedExampleForGenre(intent.genre)
    : (await import('./templates.js')).getExampleForGenre(intent.genre);

  const compositionMethodology = getCompositionMethodologyWithProfile(intent, profile);
  const soundGuidance = getSoundGuidanceWithProfile(intent, genreSounds, profile);
  const mixingGuidance = getMixingGuidance(intent);

  // Build style guidance section
  let styleGuidance = '';
  if (buildStyleGuidance) {
    styleGuidance = buildStyleGuidance(profile);
  } else if (profile.description) {
    styleGuidance = `## 🎧 Audio Analysis Reference
${profile.description}

Generate music matching this exact style profile.`;
  }

  // Drum bank recommendation
  let drumBankNote = '';
  if (getDrumBankRecommendation) {
    const rec = getDrumBankRecommendation(profile);
    drumBankNote = `
**Drum machine**: ${rec.primary} — ${rec.reason}
`;
  }

  // Fetch live sound list
  const soundListSection = '';
  try {
    const { soundMap } = await import('superdough');
    // Quick drum list for the prompt
  } catch (_) {}

  const editorContextSection = buildEditorContextSection(editorContext);

  return `${baseSystemPrompt}

## ═══════════════════════════════════════════════
## 🎧 STYLE-PROFILE-GUIDED GENERATION
## ═══════════════════════════════════════════════
## This prompt is guided by actual audio analysis (Essentia) of a reference track.
## The goal is to generate music that MATCHES the reference track's style profile.

## Style Reference Analysis
- **Genre**: ${intent.genre} (Essentia confidence: ${((profile.genre?.confidence || 0) * 100).toFixed(0)}%)
${profile.genre?.top3 ? '- **Similar to**: ' + profile.genre.top3.slice(1).map(a => a.genre).join(', ') : ''}
- **BPM**: ${intent.bpm} (use \`setCpm(${intent.bpm}/4)\`)
- **Key/Scale**: ${intent.key} (use \`.scale("${intent.key}")\`)
- **Mood**: ${intent.mood} | Arousal: ${profile.mood?.arousal || '?'} | Valence: ${profile.mood?.valence || '?'}
- **Instruments**: ${(profile.instruments || []).join(', ')}
- **Sound Character**: ${(profile.soundTags || []).join(', ')}
${profile.danceability ? `- **Danceability**: ${profile.danceability.danceable ? 'Danceable' : 'Not danceable'} (${((profile.danceability.probability || 0) * 100).toFixed(0)}%)` : ''}
${profile.voice ? `- **Vocals**: ${profile.voice.voice_present ? 'Present' : 'Instrumental'}` : ''}${drumBankNote}

${styleGuidance}

${soundGuidance}

${compositionMethodology}

${mixingGuidance}

## Reference Example (${intent.genre} style)
Study this example for correct syntax, structure, and sound choices:
\`\`\`javascript
${exampleCode}
\`\`\`

## User Request
"${userMessage || 'Generate a track in the style of the reference audio'}"

## Final Checklist Before Output
1. ✅ Used \`setCpm(${intent.bpm}/4)\` for tempo
2. ✅ **ALL melodic/harmonic/texture sounds use Vital presets** (loaded with \`await vital()\`, played with \`vital_*\`)
3. ✅ **NO native synth sounds** (sawtooth, sine, supersaw, triangle, square, gm_*)
4. ✅ Only drums/percussion use dirt-samples (bd, hh, sd, cp, etc.)
5. ✅ Used \`.scale("${intent.key}")\` for melodic content
6. ✅ Patterns are dense enough for the tempo
7. ✅ Code is wrapped in a single \`stack(...)\` with \`arrange()\` for section structure
8. ✅ Each layer has a comment explaining its role
9. ✅ At least one \`slider()\` for live performance control
10. ✅ **Match the reference track's energy level and instrument balance**`;
}

/**
 * Build composition methodology enhanced with style profile data.
 */
function getCompositionMethodologyWithProfile(intent, profile) {
  const base = getCompositionMethodology(intent);

  // Add style-profile-specific arrangement guidance
  let addon = `
### Style-Profile-Specific Arrangement

`;

  const arousal = profile.mood?.arousal || 0.5;
  const valence = profile.mood?.valence || 0.5;

  if (arousal > 0.7) {
    addon += `- **High-energy track**: Start with a short intro (2-4 cycles), add layers quickly. Chorus should dominate (60%+ of runtime).
`;
  } else if (arousal < 0.3) {
    addon += `- **Low-energy / ambient track**: Extended intro (8-16 cycles), gradual layer addition. Focus on texture evolution, not beat drops.
`;
  } else {
    addon += `- **Mid-energy track**: Standard intro→build→peak→fade arc. Balance sections evenly.
`;
  }

  if (valence > 0.6) {
    addon += `- **Positive valence**: Use major key or bright minor. Open filters. Wide stereo field.
`;
  } else if (valence < 0.4) {
    addon += `- **Negative/dark valence**: Use minor key, chromatic movement. Tight, focused mixing. Dark timbres.
`;
  }

  if (profile.danceability?.danceable) {
    addon += `- **Dance-oriented rhythm**: Strong 4/4 kick pattern. Consistent hi-hat groove. Sidechain compression feel via .mask().
`;
  }

  if (profile.voice?.voice_present) {
    addon += `- **Vocal-style arrangement**: Leave upper-mid range open for vocal presence. Don't overfill 1-4kHz.
`;
  }

  return base + addon;
}

/**
 * Build sound guidance enhanced with style profile instrument/soundTag data.
 */
function getSoundGuidanceWithProfile(intent, genreSounds, profile) {
  const base = getSoundGuidance(intent, genreSounds);

  // Add profile-specific sound recommendations
  let addon = `
### Style-Profile Sound Recommendations

`;

  if (profile.soundTags && profile.soundTags.length > 0) {
    addon += `The reference track has these sonic characteristics: **${profile.soundTags.join(', ')}**.
`;
    addon += `Match these when choosing Vital presets:
`;
    for (const tag of profile.soundTags.slice(0, 4)) {
      const match = getVitalTagMatch(tag);
      if (match) addon += `- "${tag}" → ${match}
`;
    }
  }

  if (profile.instruments && profile.instruments.length > 0) {
    addon += `
Instrument types to include: **${profile.instruments.join(', ')}**.
`;
  }

  return base + addon;
}

/**
 * Map sound character tags to Vital preset selection guidance.
 */
function getVitalTagMatch(tag) {
  const map = {
    warm: 'analog-style presets, low-pass filtering, saturation (use .shape())',
    bright: 'bright supersaws, open filters, high-frequency presence',
    dark: 'filtered, subdued presets. Close filters. Deep bass focus.',
    punchy: 'tight envelopes, short attack. Transient-heavy drum sounds.',
    aggressive: 'distortion-ready presets, heavy basses, industrial textures',
    soft: 'gentle attack, pad-like sustain. Plucked or bell-like tones.',
    dreamy: 'heavy reverb (.room(0.7+)), long release, evolving pads',
    retro: 'vintage-style presets, 80s character. Consider OberheimDMX drums.',
    analog: 'warm saturation, slight detune. Think vintage synths.',
    digital: 'clean, precise, modern. FM-style bells and glassy tones.',
    clean: 'minimal processing, transparent effects, gentle EQ',
    lofi: 'bit-crushed, noisy, tape-worn character. Use .shape() for grit.',
    wide: 'stereo spread, chorus/delay. Use .pan(sine) for movement.',
    evolving: 'slow modulation, filter sweeps, morphing textures',
    cinematic: 'orchestral pads, dramatic swells, large spaces',
    groovy: 'swing rhythms, syncopated patterns, human feel',
    hypnotic: 'repetitive patterns, gradual evolution, trance-inducing',
    glitch: 'abrupt texture changes, stutter effects, digital artifacts',
  };
  return map[tag] || null;
}

export async function buildModifyPrompt(intent, currentCode, baseModifyPrompt, presetGuidance = '', editorContext = null) {
  const soundListSection = await buildSoundListSection();
  const editorContextSection = buildEditorContextSection(editorContext);

  return `${baseModifyPrompt}

${soundListSection}
${editorContextSection}
## Current Context
- Detected genre: ${intent.genre}
- Current BPM: ${intent.bpm}
- Current key: ${intent.key}

${presetGuidance}

## Valid Sounds for Replacements
⚠️ **MUST use Vital presets for all non-drum sounds.** NEVER replace with native synths (sawtooth, sine, supersaw, etc.)
- **Bass**: Use Vital presets — \`Thicccboi 808\`, \`BA - Rubber Bounciness\`, \`BA - Deep House\`, \`Psytrance Bass\`
- **Pads**: Use Vital presets — \`DRONE Floating\`, \`Analog Pad\`, \`PD - Warm Pad\`, \`PD - Lush\`
- **Leads**: Use Vital presets — \`Super Pluck\`, \`LD - Supersaw\`, \`Plucked String\`, \`KEYS - FM Bell\`
- **Drums**: Use dirt-samples — s("bd"), s("hh"), s("sd"), s("oh"), s("cp"), s("cr"), s("rim"), s("lt"), s("mt"), s("ht")
`;
}
