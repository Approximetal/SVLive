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
export function buildEnhancedPrompt(intent, userMessage, baseSystemPrompt) {
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
2. ✅ All sounds are from the VERIFIED list above  
3. ✅ Used \`.scale("${intent.key}")\` for melodic content
4. ✅ Patterns are dense enough for the tempo (e.g., \`s("bd*4")\` not \`s("bd")\`)
5. ✅ Code is wrapped in a single \`stack(...)\` 
6. ✅ Each layer has a comment explaining its role
7. ✅ At least one \`slider()\` for live performance control
`;
}

function getSoundGuidance(intent, genreSounds) {
  let guidance = `## Recommended Sounds for ${intent.genre}\n\n`;
  
  if (genreSounds.drums) {
    guidance += `### Drums\nUse \`s("element").bank("${genreSounds.drums}")\` or sample prefix \`s("${genreSounds.drums}_bd")\`\n`;
    guidance += `Available elements: bd, sd, cp, hh, oh, lt, mt, ht, cr, rd, rim\n\n`;
  }
  
  if (genreSounds.bass) {
    guidance += `### Bass\nChoose from: ${genreSounds.bass.map(s => `\`${s}\``).join(', ')}\n\n`;
  }
  
  if (genreSounds.pads) {
    guidance += `### Pads & Atmosphere\nChoose from: ${genreSounds.pads.map(s => `\`${s}\``).join(', ')}\n\n`;
  }
  
  if (genreSounds.leads) {
    guidance += `### Leads & Melody\nChoose from: ${genreSounds.leads.map(s => `\`${s}\``).join(', ')}\n\n`;
  }
  
  if (genreSounds.keys) {
    guidance += `### Keys & Chords\nChoose from: ${genreSounds.keys.map(s => `\`${s}\``).join(', ')}\n\n`;
  }
  
  if (genreSounds.fx) {
    guidance += `### FX & Texture\nChoose from: ${genreSounds.fx.map(s => `\`${s}\``).join(', ')}\n\n`;
  }
  
  guidance += `### FORBIDDEN: Do NOT use sounds not in the lists above. Common mistakes:\n`;
  guidance += `- ❌ "shaker" → use "hh" with .hpf(8000)\n`;
  guidance += `- ❌ "djembe" → use "cp" or drum sample\n`;
  guidance += `- ❌ "conga" → use "lt" or "mt"\n`;
  guidance += `- ❌ random GM names not in the list\n`;
  
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
export function buildModifyPrompt(intent, currentCode, baseModifyPrompt) {
  return `${baseModifyPrompt}

## Current Context
- Detected genre: ${intent.genre}
- Current BPM: ${intent.bpm}
- Current key: ${intent.key}

## Valid Sounds for Replacements
Bass: ${(GENRE_SOUND_MAP[intent.genre]?.bass || ['gm_synth_bass_1']).join(', ')}
Pads: ${(GENRE_SOUND_MAP[intent.genre]?.pads || ['gm_pad_warm']).join(', ')}
Leads: ${(GENRE_SOUND_MAP[intent.genre]?.leads || ['gm_lead_2_sawtooth']).join(', ')}
Drums: Use s("element") with standard elements (bd, sd, hh, oh, cp, cr, rd, rim, lt, mt, ht)
`;
}
