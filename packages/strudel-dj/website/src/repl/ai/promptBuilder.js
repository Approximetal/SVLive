/**
 * Prompt Builder - Dynamically constructs system prompts based on intent
 * 
 * Injects genre-specific sounds, templates, and composition methodology
 * to produce high-quality, contextually-aware LLM prompts.
 */

import { GENRE_SOUND_MAP, VERIFIED_SYNTHS } from './sounds.js';
import { getExampleForGenre, getAdvancedExampleForGenre } from './templates.js';

/**
 * Build an enhanced system prompt based on analyzed intent
 */
export function buildEnhancedPrompt(intent, userMessage, baseSystemPrompt, presetGuidance = '') {
  const genreSounds = GENRE_SOUND_MAP[intent.genre] || GENRE_SOUND_MAP.house;
  const exampleCode = intent.complexity === 'complex'
    ? getAdvancedExampleForGenre(intent.genre)
    : getExampleForGenre(intent.genre);

  const compositionMethodology = getCompositionMethodology(intent);
  const soundGuidance = getSoundGuidance(intent, genreSounds);
  const mixingGuidance = getMixingGuidance(intent);

  return `${baseSystemPrompt}

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
    guidance += `### Drums (samples only)\n`;
    guidance += `\`s("bd").bank("${genreSounds.drums}")\`, \`s("hh").bank("${genreSounds.drums}")\`\n`;
    guidance += `Elements: bd, sd, cp, hh, oh, lt, mt, ht, cr, rd, rim\n\n`;
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
  // For rhythmic genres, use frequency-layout approach
  // For melodic genres, use anchor framework
  const isRhythmic = ['techno', 'house', 'trap', 'dubstep', 'dnb', 'garage'].includes(intent.genre);
  const isMelodic = ['jazz', 'classical', 'ambient', 'lofi'].includes(intent.genre);
  
  let methodology = `## Composition Methodology\n\n`;
  
  methodology += `### Rule 1: Always declare scale and tempo
\`\`\`javascript
setCpm(${intent.bpm}/4)
// Use .scale("${intent.key}") on all melodic patterns
\`\`\`\n\n`;
  
  methodology += `### Rule 2: Use scale-degree notation
Instead of absolute notes (\`note("c3 e3 g3")\`), use:
\`\`\`javascript
n("0 2 4 6").scale("${intent.key}").sound("...")
\`\`\`
This guarantees all notes are in key. Scale degrees: 0=root, 1=2nd, 2=3rd, 3=4th, 4=5th, 5=6th, 6=7th.\n\n`;
  
  if (isMelodic) {
    methodology += `### Rule 3: Anchor Framework (for melodic music)
Structure your layers so faster patterns harmonize with slower ones:
- **Harmony layer** (slow, 4 steps): Define the chord progression
- **Bass layer** (slow): Follow the root movement
- **Melody layer** (fast, 8-12 steps): Anchor on beats 1 and 3 to chord tones
- **Counter-melody** (fast): Weave between melody anchor points

This creates harmonic coherence even with complex rhythmic interplay.\n\n`;
  }
  
  if (isRhythmic) {
    methodology += `### Rule 3: Frequency Layout Planning (for ${intent.genre})
Build from the bottom up:
1. **Sub (20-60Hz)**: Sine sub or filtered kick tail
2. **Bass (60-250Hz)**: Main bass element with \`.lpf()\` to control harmonics
3. **Low Mids (250-500Hz)**: Toms, bass stabs
4. **Mids (500-2kHz)**: Claps, leads, main melodic content
5. **High Mids (2k-6kHz)**: Hi-hats, percussion
6. **Highs (6k+)**: Cymbals, noise textures, air

Each frequency band should have its own gain/filter space to avoid masking.\n\n`;
  }
  
  methodology += `### Rule 4: Apply syncopation intentionally
NOT every note should be syncopated. Use these sparingly (2-3 notes per pattern):
- \`note\` → \`[~ note]\` (delayed entry - creates groove)
- \`note\` → \`[note ~]\` (early cutoff - creates space)
- \`note note\` → \`note [~ note]\` (push feel)
\n\n`;
  
  methodology += `### Rule 5: Progressive structure
Even in a single snippet, create dynamic interest:
- Vary gain with \`sine.range()\` for movement
- Use \`.slow(N)\` to create longer harmonic phrases
- Apply \`perlin.range()\` for organic filter movement
- Include at least one \`slider()\` for live performance
`;
  
  return methodology;
}

function getMixingGuidance(intent) {
  return `## Mixing Guidelines for ${intent.genre}

### Gain Staging (total should approach but not exceed 1.0 summed)
- **Kick**: gain(0.85-0.95) — loudest element
- **Snare/Clap**: gain(0.6-0.8) — prominent but not overpowering
- **Hi-hats**: gain(0.25-0.45) — support, not dominate
- **Bass**: gain(0.7-0.85) — strong but filtered (\`.lpf(200-600)\`)
- **Pads**: gain(0.25-0.45) — background texture (\`.room(0.4-0.7)\`)
- **Leads**: gain(0.4-0.55) — present but not harsh
- **FX/Texture**: gain(0.03-0.1) — subtle atmosphere

### Spatial Effects
- Use \`.room()\` for reverb (0-1): kick=0, snare=0.1-0.3, pads=0.4-0.7, leads=0.2-0.4
- Use \`.delay()\` sparingly: 0.1-0.25 on melodic elements
- Use \`.pan()\` or \`.pan(perlin.range(0.3, 0.7))\` for width
- Use \`.hpf()\` on everything except kick/bass to clean up low end
`;
}

/**
 * Build a concise prompt for modify mode (no need for full templates)
 */
export function buildModifyPrompt(intent, currentCode, baseModifyPrompt, presetGuidance = '') {
  return `${baseModifyPrompt}

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
