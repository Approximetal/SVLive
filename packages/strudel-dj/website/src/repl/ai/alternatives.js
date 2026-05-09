/**
 * Alternatives Generator - Provides sound and rhythm alternatives for each layer
 * 
 * Given a parsed code structure, generates alternative sounds, rhythm variants,
 * and harmony options that can be applied with one click.
 */

import { GENRE_SOUND_MAP, VERIFIED_SYNTHS, VERIFIED_DRUM_MACHINES } from './sounds.js';
import { parseLayers, detectCodeGenre } from './codeParser.js';

// All available drum machine banks for alternatives
const DRUM_BANK_OPTIONS = [
  { id: 'tr909', label: 'TR-909', style: 'House/Techno' },
  { id: 'tr808', label: 'TR-808', style: 'Hip-Hop/Trap' },
  { id: 'tr707', label: 'TR-707', style: 'Italo/Electro' },
  { id: 'tr606', label: 'TR-606', style: 'Acid' },
  { id: 'linndrum', label: 'LinnDrum', style: 'Pop/Funk' },
  { id: 'dmx', label: 'DMX', style: 'Electro/Hip-Hop' },
  { id: 'ry30', label: 'RY30', style: 'Electronic' },
  { id: 'emusp12', label: 'SP-12', style: 'Hip-Hop' },
  { id: 'mc303', label: 'MC-303', style: 'Rave/Techno' },
];

/**
 * Generate alternatives for all layers in a code snippet
 */
export function generateAlternatives(code) {
  const layers = parseLayers(code);
  const genre = detectCodeGenre(code);
  
  return layers.map(layer => ({
    ...layer,
    alternatives: generateLayerAlternatives(layer, genre),
  }));
}

/**
 * Generate sound alternatives for a specific layer
 */
export function generateLayerAlternatives(layer, genre) {
  const genreSounds = GENRE_SOUND_MAP[genre] || GENRE_SOUND_MAP.house;
  const alternatives = [];
  
  switch (layer.type) {
    case 'drums': {
      // Suggest different drum machines
      const currentBank = layer.bank;
      alternatives.push(...DRUM_BANK_OPTIONS
        .filter(b => b.id !== (currentBank || '').toLowerCase().replace('roland', ''))
        .slice(0, 4)
        .map(b => ({
          type: 'bank',
          label: b.label,
          description: b.style,
          value: b.id,
          apply: (code) => replaceDrumBank(code, layer, b.id),
        }))
      );
      break;
    }
    
    case 'bass': {
      const currentSound = layer.sound;
      const bassOptions = [
        ...(genreSounds.bass || []),
        'gm_synth_bass_1', 'gm_synth_bass_2', 'sawtooth', 'square', 'sine',
        'gm_acoustic_bass', 'gm_electric_bass_finger', 'gm_slap_bass_1',
      ];
      const unique = [...new Set(bassOptions)].filter(s => s !== currentSound);
      alternatives.push(...unique.slice(0, 5).map(s => ({
        type: 'sound',
        label: formatSoundName(s),
        value: s,
        apply: (code) => replaceSound(code, layer, s),
      })));
      break;
    }
    
    case 'pad': {
      const currentSound = layer.sound;
      const padOptions = [
        ...(genreSounds.pads || []),
        'gm_pad_warm', 'gm_pad_new_age', 'gm_pad_sweep', 'gm_pad_choir',
        'gm_pad_halo', 'gm_pad_metallic', 'gm_pad_bowed', 'gm_pad_poly',
        'gm_string_ensemble_1', 'gm_synth_strings_1',
      ];
      const unique = [...new Set(padOptions)].filter(s => s !== currentSound);
      alternatives.push(...unique.slice(0, 5).map(s => ({
        type: 'sound',
        label: formatSoundName(s),
        value: s,
        apply: (code) => replaceSound(code, layer, s),
      })));
      break;
    }
    
    case 'melody': {
      const currentSound = layer.sound;
      const leadOptions = [
        ...(genreSounds.leads || []),
        'gm_lead_1_square', 'gm_lead_2_sawtooth', 'gm_lead_5_charang',
        'gm_lead_7_fifths', 'supersaw', 'gm_trumpet', 'gm_flute',
        'gm_alto_sax', 'gm_vibraphone', 'gm_kalimba',
      ];
      const unique = [...new Set(leadOptions)].filter(s => s !== currentSound);
      alternatives.push(...unique.slice(0, 5).map(s => ({
        type: 'sound',
        label: formatSoundName(s),
        value: s,
        apply: (code) => replaceSound(code, layer, s),
      })));
      break;
    }
    
    case 'chords': {
      const currentSound = layer.sound;
      const chordOptions = [
        ...(genreSounds.keys || []),
        'piano', 'gm_epiano1', 'gm_epiano2', 'gm_clavinet',
        'gm_drawbar_organ', 'gm_harpsichord', 'supersaw',
        'gm_pad_warm', 'gm_string_ensemble_1',
      ];
      const unique = [...new Set(chordOptions)].filter(s => s !== currentSound);
      alternatives.push(...unique.slice(0, 5).map(s => ({
        type: 'sound',
        label: formatSoundName(s),
        value: s,
        apply: (code) => replaceSound(code, layer, s),
      })));
      break;
    }
    
    case 'fx': {
      const fxOptions = [
        'gm_fx_atmosphere', 'gm_fx_echoes', 'gm_fx_rain', 'gm_fx_crystal',
        'gm_fx_brightness', 'gm_fx_sci_fi', 'pink', 'white', 'brown',
      ];
      const currentSound = layer.sound;
      const unique = [...new Set(fxOptions)].filter(s => s !== currentSound);
      alternatives.push(...unique.slice(0, 4).map(s => ({
        type: 'sound',
        label: formatSoundName(s),
        value: s,
        apply: (code) => replaceSound(code, layer, s),
      })));
      break;
    }
  }
  
  return alternatives;
}

/**
 * Generate rhythm variants for the entire track
 */
export function generateRhythmVariants(code) {
  return [
    { label: 'Original', code, description: 'Current pattern' },
    { label: 'Double-time Hats', code: applyDoubleTimeHats(code), description: 'Double hi-hat speed' },
    { label: 'Half-time Feel', code: applyHalftime(code), description: 'Move snare to beat 3' },
    { label: 'Add Swing', code: applySwing(code), description: 'Shuffle the rhythm' },
    { label: 'Strip Percussion', code: stripPercussion(code), description: 'Remove hi-hats and percussion' },
  ];
}

/**
 * Generate harmony/key variants
 */
export function generateHarmonyVariants(code, currentKey) {
  if (!currentKey) return [];
  
  const [root, mode] = currentKey.split(':');
  const variants = [];
  
  // Parallel mode changes
  if (mode === 'minor') {
    variants.push({ label: 'Major', key: `${root}:major`, description: 'Brighter' });
    variants.push({ label: 'Dorian', key: `${root}:dorian`, description: 'Jazzy minor' });
    variants.push({ label: 'Phrygian', key: `${root}:phrygian`, description: 'Dark/Spanish' });
  } else if (mode === 'major') {
    variants.push({ label: 'Minor', key: `${root}:minor`, description: 'Darker' });
    variants.push({ label: 'Mixolydian', key: `${root}:mixolydian`, description: 'Bluesy' });
    variants.push({ label: 'Lydian', key: `${root}:lydian`, description: 'Dreamy/Bright' });
  } else {
    variants.push({ label: 'Minor', key: `${root}:minor`, description: 'Standard minor' });
    variants.push({ label: 'Major', key: `${root}:major`, description: 'Standard major' });
  }
  
  // Transposition options
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const currentIdx = notes.indexOf(root);
  if (currentIdx >= 0) {
    const up5 = notes[(currentIdx + 7) % 12];
    const down5 = notes[(currentIdx + 5) % 12];
    variants.push({ label: `→ ${up5}`, key: `${up5}:${mode}`, description: 'Up a 5th' });
    variants.push({ label: `→ ${down5}`, key: `${down5}:${mode}`, description: 'Down a 5th' });
  }
  
  return variants.map(v => ({
    ...v,
    apply: (code) => replaceScale(code, currentKey, v.key),
  }));
}

// ============================================================
// APPLICATION FUNCTIONS
// ============================================================

/**
 * Replace drum bank in a layer
 */
function replaceDrumBank(code, layer, newBank) {
  // Capitalize first letter for bank name format
  const bankName = newBank.charAt(0).toUpperCase() + newBank.slice(1);
  const fullBankName = newBank.startsWith('tr') || newBank.startsWith('mc') 
    ? `Roland${bankName.toUpperCase()}` 
    : bankName.charAt(0).toUpperCase() + bankName.slice(1);
  
  // If layer has a .bank() call, replace it
  if (layer.bank) {
    return code.replace(
      new RegExp(`\\.bank\\(\\s*["'\`]${escapeRegExp(layer.bank)}["'\`]\\s*\\)`),
      `.bank("${fullBankName}")`
    );
  }
  
  // Otherwise, add .bank() after s("...")
  const sMatch = layer.raw.match(/s\(\s*["'`][^"'`]+["'`]\s*\)/);
  if (sMatch) {
    return code.replace(sMatch[0], `${sMatch[0]}.bank("${fullBankName}")`);
  }
  
  return code;
}

/**
 * Replace sound in a layer
 */
function replaceSound(code, layer, newSound) {
  if (layer.sound) {
    // Replace .sound("old") with .sound("new")
    const soundRegex = new RegExp(
      `\\.(?:sound|s)\\(\\s*["'\`]${escapeRegExp(layer.sound)}["'\`]\\s*\\)`
    );
    if (soundRegex.test(code)) {
      return code.replace(soundRegex, `.sound("${newSound}")`);
    }
  }
  return code;
}

/**
 * Replace scale in all occurrences
 */
function replaceScale(code, oldScale, newScale) {
  return code.replace(new RegExp(escapeRegExp(oldScale), 'g'), newScale);
}

/**
 * Apply double-time to hi-hats
 */
function applyDoubleTimeHats(code) {
  // Find hh patterns and double them
  return code.replace(
    /s\(\s*["'`]hh\*(\d+)["'`]\s*\)/g,
    (match, num) => `s("hh*${parseInt(num) * 2}")`
  );
}

/**
 * Apply half-time feel (move snare)
 */
function applyHalftime(code) {
  // Replace standard snare pattern with half-time
  return code
    .replace(/s\(\s*["'`]~ sd ~ sd["'`]\s*\)/g, 's("~ ~ sd ~")')
    .replace(/s\(\s*["'`]~ ~ sd ~ ~ ~ sd ~["'`]\s*\)/g, 's("~ ~ ~ ~ sd ~ ~ ~")');
}

/**
 * Apply swing (via .late)
 */
function applySwing(code) {
  // Add .late(0.02) to hi-hat patterns for swing feel
  return code.replace(
    /(s\(\s*["'`]hh[^"'`]*["'`]\s*\))/g,
    '$1.late(0.02)'
  );
}

/**
 * Strip percussion layers (mute hats/percussion)
 */
function stripPercussion(code) {
  // Set gain to 0 on hi-hat and percussion layers
  return code
    .replace(/(s\(\s*["'`]hh[^"'`]*["'`][^,\n]*?)\.gain\([^)]+\)/g, '$1.gain(0)')
    .replace(/(s\(\s*["'`]~?\s*(?:rim|oh)[^"'`]*["'`][^,\n]*?)\.gain\([^)]+\)/g, '$1.gain(0)');
}

// ============================================================
// UTILITIES
// ============================================================

function formatSoundName(sound) {
  return sound
    .replace('gm_', '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Apply a single alternative to code (exported for UI usage)
 */
export function applyAlternative(code, alternative) {
  if (alternative && alternative.apply) {
    return alternative.apply(code);
  }
  return code;
}
