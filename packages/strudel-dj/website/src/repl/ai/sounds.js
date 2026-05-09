/**
 * Verified Sound Library for Strudel AI
 * Source: strudel-llm-docs/docs/sounds/synths.txt & drum-machines.txt
 * 
 * This module provides validated sound names, genre-sound mappings,
 * and validation/replacement utilities to prevent invalid sound usage.
 */

// ============================================================
// VERIFIED SYNTHS & INSTRUMENTS
// ============================================================

export const VERIFIED_SYNTHS = [
  // Basic waveforms
  'sine', 'triangle', 'square', 'sawtooth', 'saw', 'pulse', 'supersaw',
  // Noise
  'white', 'pink', 'brown',
  // Strudel built-in
  'piano',
  // GM Piano & Keys
  'gm_piano', 'gm_epiano1', 'gm_epiano2', 'gm_acoustic_grand_piano',
  'gm_harpsichord', 'gm_clavinet', 'gm_celesta', 'gm_music_box',
  // GM Organ
  'gm_drawbar_organ', 'gm_percussive_organ', 'gm_rock_organ',
  'gm_church_organ', 'gm_reed_organ',
  // GM Guitar
  'gm_acoustic_guitar_nylon', 'gm_acoustic_guitar_steel',
  'gm_electric_guitar_jazz', 'gm_electric_guitar_clean',
  'gm_electric_guitar_muted', 'gm_overdriven_guitar', 'gm_distortion_guitar',
  'gm_guitar_harmonics',
  // GM Bass
  'gm_acoustic_bass', 'gm_electric_bass_finger', 'gm_electric_bass_pick',
  'gm_fretless_bass', 'gm_slap_bass_1', 'gm_slap_bass_2',
  'gm_synth_bass_1', 'gm_synth_bass_2',
  // GM Strings
  'gm_violin', 'gm_viola', 'gm_cello', 'gm_contrabass', 'gm_fiddle',
  'gm_tremolo_strings', 'gm_pizzicato_strings',
  'gm_orchestral_harp', 'gm_timpani',
  'gm_string_ensemble_1', 'gm_string_ensemble_2',
  'gm_synth_strings_1', 'gm_synth_strings_2',
  // GM Brass
  'gm_trumpet', 'gm_trombone', 'gm_tuba', 'gm_muted_trumpet',
  'gm_french_horn', 'gm_brass_section',
  'gm_synth_brass_1', 'gm_synth_brass_2',
  // GM Woodwinds
  'gm_soprano_sax', 'gm_alto_sax', 'gm_tenor_sax', 'gm_baritone_sax',
  'gm_oboe', 'gm_english_horn', 'gm_bassoon',
  'gm_clarinet', 'gm_piccolo', 'gm_flute', 'gm_recorder',
  'gm_pan_flute', 'gm_blown_bottle', 'gm_shakuhachi', 'gm_whistle', 'gm_ocarina',
  // GM Choir & Voice
  'gm_choir_aahs', 'gm_voice_oohs', 'gm_synth_choir',
  // GM Percussion / Tuned
  'gm_vibraphone', 'gm_marimba', 'gm_xylophone', 'gm_glockenspiel',
  'gm_tubular_bells', 'gm_dulcimer', 'gm_kalimba',
  'gm_steel_drums', 'gm_taiko_drum', 'gm_melodic_tom', 'gm_synth_drum',
  'gm_orchestra_hit',
  // GM Leads
  'gm_lead_1_square', 'gm_lead_2_sawtooth', 'gm_lead_3_calliope',
  'gm_lead_4_chiff', 'gm_lead_5_charang', 'gm_lead_6_voice',
  'gm_lead_7_fifths', 'gm_lead_8_bass_lead',
  // GM Pads
  'gm_pad_new_age', 'gm_pad_warm', 'gm_pad_poly', 'gm_pad_choir',
  'gm_pad_bowed', 'gm_pad_metallic', 'gm_pad_halo', 'gm_pad_sweep',
  // GM FX
  'gm_fx_rain', 'gm_fx_soundtrack', 'gm_fx_crystal', 'gm_fx_atmosphere',
  'gm_fx_brightness', 'gm_fx_goblins', 'gm_fx_echoes', 'gm_fx_sci_fi',
  // GM World
  'gm_sitar', 'gm_banjo', 'gm_shamisen', 'gm_koto', 'gm_bagpipe',
  'gm_shanai', 'gm_harmonica', 'gm_accordion', 'gm_bandoneon',
  // GM Sound Effects
  'gm_seashore', 'gm_bird_tweet', 'gm_telephone', 'gm_helicopter',
  'gm_applause', 'gm_gunshot', 'gm_reverse_cymbal',
  // Other Strudel built-ins
  'bytebeat', 'crackle', 'zzfx',
  'z_noise', 'z_sawtooth', 'z_sine', 'z_square', 'z_tan', 'z_triangle',
];

// ============================================================
// VERIFIED DRUM MACHINES (key popular ones with element lists)
// ============================================================

export const VERIFIED_DRUM_MACHINES = {
  // Roland
  'tr909':    ['bd', 'sd', 'cp', 'hh', 'oh', 'lt', 'mt', 'ht', 'cr', 'rd', 'rim'],
  'tr808':    ['bd', 'sd', 'cp', 'hh', 'oh', 'lt', 'mt', 'ht', 'cr', 'rim', 'sh', 'cb', 'perc'],
  'tr707':    ['bd', 'sd', 'cp', 'hh', 'oh', 'lt', 'mt', 'ht', 'cr', 'rim', 'cb', 'tb'],
  'tr606':    ['bd', 'sd', 'hh', 'oh', 'lt', 'ht', 'cr'],
  'tr505':    ['bd', 'sd', 'cp', 'hh', 'oh', 'lt', 'mt', 'ht', 'cr', 'rd', 'rim', 'cb', 'perc'],
  'mc303':    ['bd', 'sd', 'cp', 'hh', 'oh', 'lt', 'mt', 'ht', 'rd', 'rim', 'sh', 'cb', 'perc', 'tb', 'fx', 'misc'],
  // Linn
  'linndrum':  ['bd', 'sd', 'cp', 'hh', 'oh', 'lt', 'mt', 'cr', 'rd', 'rim', 'cb', 'sh', 'tb', 'perc'],
  'linn9000':  ['bd', 'sd', 'hh', 'oh', 'lt', 'mt', 'ht', 'cr', 'rd', 'rim', 'cb', 'perc', 'tb'],
  'linnlm1':   ['bd', 'sd', 'cp', 'hh', 'oh', 'lt', 'ht', 'rim', 'sh', 'cb', 'perc', 'tb'],
  'linnlm2':   ['bd', 'sd', 'cp', 'hh', 'oh', 'lt', 'mt', 'ht', 'cr', 'rd', 'rim', 'sh', 'cb', 'tb'],
  // Oberheim
  'dmx':       ['bd', 'sd', 'cp', 'hh', 'oh', 'lt', 'mt', 'ht', 'cr', 'rd', 'rim', 'sh', 'tb'],
  // Yamaha
  'ry30':      ['bd', 'sd', 'cp', 'hh', 'oh', 'lt', 'mt', 'ht', 'cr', 'rd', 'rim', 'sh', 'cb', 'perc', 'misc', 'tb'],
  'rx5':       ['bd', 'sd', 'hh', 'oh', 'lt', 'rim', 'sh', 'cb', 'fx', 'tb'],
  // Korg
  'korgm1':    ['bd', 'sd', 'cp', 'hh', 'oh', 'lt', 'mt', 'ht', 'cr', 'rd', 'rim', 'sh', 'cb', 'perc', 'misc', 'tb'],
  // E-Mu
  'emusp12':   ['bd', 'sd', 'cp', 'hh', 'oh', 'lt', 'mt', 'ht', 'cr', 'rd', 'rim', 'perc', 'misc'],
  // Generic (dirt-samples)
  'bd': true,
  'sd': true,
  'hh': true,
  'oh': true,
  'cp': true,
  'cr': true,
  'rd': true,
  'rim': true,
  'ht': true,
  'mt': true,
  'lt': true,
  'cb': true,
  'sh': true,
  'tb': true,
};

// Full list of all valid drum sample names (prefixed format: machine_element)
export const ALL_DRUM_PREFIXES = [
  'tr909', 'tr808', 'tr707', 'tr606', 'tr505', 'tr626', 'tr727',
  'rolandtr909', 'rolandtr808', 'rolandtr707', 'rolandtr606', 'rolandtr505',
  'linndrum', 'linn9000', 'linnlm1', 'linnlm2', 'linn',
  'dmx', 'oberheimdmx',
  'mc303', 'rolandmc303', 'mc202', 'rolandmc202',
  'ry30', 'yamahary30', 'rx5', 'yamaharx5', 'rx21', 'yamaharx21',
  'korgm1', 'm1', 'korgkr55', 'kr55', 'korgkpr77', 'kpr77',
  'emusp12', 'sp12', 'akaixr10', 'xr10', 'akaimpc60', 'mpc60', 'mpc1000',
  'jd990', 'rolandjd990', 'd70', 'rolandd70', 'r8', 'rolandr8',
  'alesishr16', 'hr16', 'alesissr16', 'sr16',
  'mfb512', 'drumulator', 'emudrumulator',
  'bossdr110', 'bossdr220', 'bossdr550', 'dr110', 'dr220', 'dr550',
];

// ============================================================
// GENRE → SOUND MAPPING
// ============================================================

export const GENRE_SOUND_MAP = {
  house: {
    drums: 'tr909',
    bass: ['gm_synth_bass_1', 'gm_electric_bass_finger', 'sawtooth'],
    pads: ['gm_pad_warm', 'gm_pad_new_age', 'gm_string_ensemble_1'],
    leads: ['gm_lead_2_sawtooth', 'gm_epiano1', 'supersaw'],
    keys: ['piano', 'gm_epiano1', 'gm_epiano2'],
    bpm: [120, 130],
  },
  techno: {
    drums: 'tr909',
    bass: ['sawtooth', 'gm_synth_bass_1', 'square'],
    pads: ['gm_pad_sweep', 'gm_pad_metallic', 'gm_fx_atmosphere'],
    leads: ['gm_lead_1_square', 'square', 'gm_lead_5_charang'],
    fx: ['gm_fx_atmosphere', 'gm_fx_sci_fi', 'gm_fx_echoes'],
    bpm: [128, 140],
  },
  trance: {
    drums: 'tr909',
    bass: ['supersaw', 'sawtooth', 'gm_synth_bass_1'],
    pads: ['gm_pad_sweep', 'gm_pad_warm', 'gm_pad_halo'],
    leads: ['supersaw', 'gm_lead_2_sawtooth', 'gm_lead_7_fifths'],
    bpm: [136, 145],
  },
  ambient: {
    drums: null,
    bass: ['sine', 'gm_acoustic_bass', 'triangle'],
    pads: ['gm_pad_new_age', 'gm_pad_warm', 'gm_pad_halo', 'gm_pad_choir'],
    leads: ['gm_vibraphone', 'gm_xylophone', 'triangle', 'gm_kalimba'],
    fx: ['gm_fx_atmosphere', 'gm_fx_echoes', 'gm_fx_rain', 'gm_fx_crystal'],
    bpm: [60, 90],
  },
  jazz: {
    drums: 'linndrum',
    bass: ['gm_acoustic_bass', 'gm_electric_bass_finger', 'gm_fretless_bass'],
    pads: ['gm_string_ensemble_1', 'gm_pad_warm'],
    leads: ['gm_trumpet', 'gm_alto_sax', 'gm_flute', 'gm_tenor_sax'],
    keys: ['piano', 'gm_epiano1', 'gm_vibraphone'],
    bpm: [80, 120],
  },
  dnb: {
    drums: 'tr909',
    bass: ['gm_synth_bass_1', 'sawtooth', 'supersaw'],
    pads: ['gm_pad_sweep', 'gm_pad_warm', 'gm_synth_strings_1'],
    leads: ['supersaw', 'gm_lead_2_sawtooth', 'gm_lead_5_charang'],
    bpm: [170, 180],
  },
  hiphop: {
    drums: 'tr808',
    bass: ['gm_synth_bass_1', 'sine', 'gm_electric_bass_finger'],
    pads: ['gm_pad_warm', 'gm_string_ensemble_1'],
    leads: ['gm_epiano1', 'piano', 'gm_vibraphone'],
    keys: ['piano', 'gm_epiano2', 'gm_vibraphone'],
    bpm: [85, 100],
  },
  trap: {
    drums: 'tr808',
    bass: ['sine', 'gm_synth_bass_1'],
    pads: ['gm_pad_warm', 'gm_pad_sweep', 'gm_synth_strings_1'],
    leads: ['gm_lead_2_sawtooth', 'supersaw', 'gm_epiano1'],
    bpm: [130, 160],
  },
  lofi: {
    drums: 'linnlm1',
    bass: ['gm_electric_bass_finger', 'gm_fretless_bass'],
    pads: ['gm_pad_warm', 'gm_string_ensemble_1'],
    leads: ['gm_epiano1', 'piano', 'gm_vibraphone', 'gm_kalimba'],
    keys: ['piano', 'gm_epiano1'],
    bpm: [70, 90],
  },
  classical: {
    drums: null,
    bass: ['gm_contrabass', 'gm_cello', 'gm_timpani'],
    pads: ['gm_string_ensemble_1', 'gm_string_ensemble_2'],
    leads: ['gm_violin', 'gm_flute', 'gm_oboe', 'gm_clarinet'],
    keys: ['piano', 'gm_harpsichord', 'gm_celesta'],
    bpm: [60, 120],
  },
  reggae: {
    drums: 'tr808',
    bass: ['gm_electric_bass_finger', 'gm_acoustic_bass'],
    pads: ['gm_pad_warm'],
    leads: ['gm_electric_guitar_clean', 'gm_trumpet', 'gm_alto_sax'],
    keys: ['gm_drawbar_organ', 'piano'],
    bpm: [70, 90],
  },
  funk: {
    drums: 'linndrum',
    bass: ['gm_slap_bass_1', 'gm_electric_bass_finger', 'gm_electric_bass_pick'],
    pads: ['gm_brass_section'],
    leads: ['gm_electric_guitar_clean', 'gm_trumpet', 'gm_alto_sax'],
    keys: ['gm_clavinet', 'gm_epiano1'],
    bpm: [100, 120],
  },
  dubstep: {
    drums: 'tr808',
    bass: ['sawtooth', 'gm_synth_bass_1', 'square'],
    pads: ['gm_pad_metallic', 'gm_pad_sweep'],
    leads: ['gm_lead_5_charang', 'supersaw'],
    fx: ['gm_fx_sci_fi', 'gm_fx_goblins'],
    bpm: [140, 150],
  },
  garage: {
    drums: 'tr909',
    bass: ['gm_synth_bass_1', 'gm_electric_bass_finger'],
    pads: ['gm_pad_warm', 'gm_synth_strings_1'],
    leads: ['gm_choir_aahs', 'gm_voice_oohs'],
    bpm: [130, 140],
  },
};

// ============================================================
// SOUND VALIDATION
// ============================================================

/**
 * Check if a sound name is valid in Strudel
 */
export function isValidSound(name) {
  if (!name || typeof name !== 'string') return false;
  const n = name.trim().toLowerCase();
  
  // Check synths (case-insensitive for gm_ sounds)
  if (VERIFIED_SYNTHS.some(s => s.toLowerCase() === n)) return true;
  
  // Check raw drum elements (bd, sd, hh, etc.)
  if (VERIFIED_DRUM_MACHINES[n] === true) return true;
  
  // Check prefixed drum samples (e.g., tr909_bd, linndrum_sd)
  const underscoreIdx = n.lastIndexOf('_');
  if (underscoreIdx > 0) {
    const prefix = n.slice(0, underscoreIdx);
    const element = n.slice(underscoreIdx + 1);
    if (ALL_DRUM_PREFIXES.includes(prefix)) {
      // Check element is a known drum element type
      const knownElements = ['bd', 'sd', 'cp', 'hh', 'oh', 'lt', 'mt', 'ht', 'cr', 'rd', 'rim', 'cb', 'sh', 'tb', 'perc', 'misc', 'fx'];
      if (knownElements.includes(element)) return true;
    }
  }
  
  // Check .bank() drum machine names
  if (Object.keys(VERIFIED_DRUM_MACHINES).includes(n) && typeof VERIFIED_DRUM_MACHINES[n] !== 'boolean') return true;
  
  return false;
}

/**
 * Extract all sound names from Strudel code
 */
export function extractSoundsFromCode(code) {
  const sounds = new Set();
  
  // Match s("...") patterns - extract individual sounds from mini-notation
  const sMatches = code.matchAll(/(?:\.s|^s)\(\s*["'`]([^"'`]+)["'`]/gm);
  for (const m of sMatches) {
    // Split mini-notation: "bd*4, hh*8" → ["bd", "hh"]
    const tokens = m[1].replace(/[*\[\]<>@~|!?{}()\d.]/g, ' ').split(/[\s,]+/);
    tokens.forEach(t => { if (t && /^[a-z_]/i.test(t)) sounds.add(t.trim()); });
  }
  
  // Match .sound("...") patterns
  const soundMatches = code.matchAll(/\.sound\(\s*["'`]([^"'`]+)["'`]/gm);
  for (const m of soundMatches) {
    sounds.add(m[1].trim());
  }
  
  // Match .bank("...") - these are drum machine bank names, validate separately
  const bankMatches = code.matchAll(/\.bank\(\s*["'`]([^"'`]+)["'`]/gm);
  for (const m of bankMatches) {
    sounds.add(`bank:${m[1].trim()}`);
  }
  
  return [...sounds];
}

/**
 * Find invalid sounds in code and suggest replacements
 */
export function findInvalidSounds(code) {
  const sounds = extractSoundsFromCode(code);
  const invalid = [];
  
  for (const sound of sounds) {
    if (sound.startsWith('bank:')) {
      // Validate bank name
      const bankName = sound.slice(5).toLowerCase();
      const validBanks = ['rolandtr909', 'rolandtr808', 'rolandtr707', 'rolandtr606', 'rolandtr505',
        'linndrum', 'linn9000', 'linnlm1', 'linnlm2', 'akailinn',
        'oberheimdmx', 'dmx', ...Object.keys(VERIFIED_DRUM_MACHINES)];
      if (!validBanks.some(b => b.toLowerCase() === bankName)) {
        invalid.push({ sound: sound.slice(5), type: 'bank', suggestion: 'RolandTR909' });
      }
    } else if (!isValidSound(sound)) {
      // Try to suggest a replacement
      const suggestion = suggestReplacement(sound);
      invalid.push({ sound, type: 'sample', suggestion });
    }
  }
  
  return invalid;
}

/**
 * Suggest a replacement for an invalid sound
 */
function suggestReplacement(invalidSound) {
  const n = invalidSound.toLowerCase();
  
  // Common mistakes → corrections
  const commonFixes = {
    'shaker': 'hh',
    'djembe': 'cp',
    'conga': 'lt',
    'bongo': 'mt',
    'maracas': 'sh',
    'cowbell': 'cb',
    'cymbal': 'cr',
    'snare': 'sd',
    'kick': 'bd',
    'hihat': 'hh',
    'hi-hat': 'hh',
    'clap': 'cp',
    'ride': 'rd',
    'tom': 'lt',
    'bass_drum': 'bd',
    'bass_synth': 'gm_synth_bass_1',
    'pad': 'gm_pad_warm',
    'strings': 'gm_string_ensemble_1',
    'brass': 'gm_brass_section',
    'flute_synth': 'gm_flute',
    'organ': 'gm_drawbar_organ',
    'electric_piano': 'gm_epiano1',
    'rhodes': 'gm_epiano1',
    'wurlitzer': 'gm_epiano2',
    'pluck': 'gm_kalimba',
    'bell': 'gm_tubular_bells',
    'gong': 'gm_tubular_bells',
    'choir': 'gm_choir_aahs',
    'voice': 'gm_voice_oohs',
    'sitar_synth': 'gm_sitar',
  };
  
  if (commonFixes[n]) return commonFixes[n];
  
  // Try partial match with GM sounds
  const gmMatch = VERIFIED_SYNTHS.find(s => s.includes(n) || n.includes(s.replace('gm_', '')));
  if (gmMatch) return gmMatch;
  
  // Default fallback based on suspected type
  if (n.includes('bass')) return 'gm_synth_bass_1';
  if (n.includes('pad') || n.includes('string')) return 'gm_pad_warm';
  if (n.includes('lead') || n.includes('synth')) return 'gm_lead_2_sawtooth';
  if (n.includes('drum') || n.includes('perc')) return 'bd';
  
  return 'sine'; // ultimate fallback
}

/**
 * Apply sound replacements to code
 */
export function fixInvalidSounds(code) {
  const invalids = findInvalidSounds(code);
  let fixed = code;
  
  for (const { sound, type, suggestion } of invalids) {
    if (type === 'bank') {
      // Replace bank name
      fixed = fixed.replace(new RegExp(`\\.bank\\(\\s*["'\`]${escapeRegExp(sound)}["'\`]`, 'g'), `.bank("${suggestion}"`);
    } else {
      // Replace sound name in s() or .sound() - be careful with mini-notation
      // Only replace whole-word matches
      const regex = new RegExp(`(?<=[("'\`\\s,])${escapeRegExp(sound)}(?=[*\\s"'\`\\),\\[<@~])`, 'g');
      fixed = fixed.replace(regex, suggestion);
    }
  }
  
  return { code: fixed, replacements: invalids };
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
