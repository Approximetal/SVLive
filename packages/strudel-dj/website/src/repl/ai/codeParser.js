/**
 * Code Parser - Extracts layers, sounds, and structure from Strudel code
 * 
 * Parses existing Strudel code to understand its structure,
 * enabling the alternatives panel to suggest replacements.
 */

/**
 * Parse Strudel code into structured layers
 */
export function parseLayers(code) {
  if (!code || typeof code !== 'string') return [];
  
  const layers = [];
  
  // Try to find a stack() block
  const stackMatch = code.match(/stack\s*\(([\s\S]*)\)\s*$/m);
  if (!stackMatch) {
    // If no stack, treat the whole code as one layer
    return [parseLayerString(code, 0)];
  }
  
  // Split stack contents into individual layers (by top-level commas)
  const layerStrings = splitStackLayers(stackMatch[1]);
  
  layerStrings.forEach((layerStr, index) => {
    if (layerStr.trim()) {
      layers.push(parseLayerString(layerStr.trim(), index));
    }
  });
  
  return layers;
}

/**
 * Split stack() contents by top-level commas, respecting nesting
 */
function splitStackLayers(content) {
  const layers = [];
  let current = '';
  let depth = 0; // tracks ( [ { depth
  let inString = false;
  let stringChar = '';
  
  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    const prev = i > 0 ? content[i-1] : '';
    
    // String handling
    if (!inString && (ch === '"' || ch === "'" || ch === '`') && prev !== '\\') {
      inString = true;
      stringChar = ch;
    } else if (inString && ch === stringChar && prev !== '\\') {
      inString = false;
    }
    
    if (!inString) {
      if (ch === '(' || ch === '[' || ch === '{') depth++;
      else if (ch === ')' || ch === ']' || ch === '}') depth--;
      else if (ch === ',' && depth === 0) {
        layers.push(current);
        current = '';
        continue;
      }
    }
    
    current += ch;
  }
  
  if (current.trim()) layers.push(current);
  return layers;
}

/**
 * Parse a single layer string into structured data
 */
function parseLayerString(str, index) {
  const layer = {
    index,
    raw: str,
    type: detectLayerType(str),
    sound: extractSound(str),
    bank: extractBank(str),
    notes: extractNotes(str),
    scale: extractScale(str),
    effects: extractEffects(str),
    comment: extractComment(str),
    gain: extractGain(str),
  };
  
  return layer;
}

/**
 * Detect what type of layer this is
 */
function detectLayerType(str) {
  const lower = str.toLowerCase();
  
  // Check for drums
  if (/s\(\s*["'`][^"'`]*(?:bd|sd|hh|oh|cp|cr|rd|rim|lt|mt|ht)/i.test(str)) return 'drums';
  if (/\.bank\(/i.test(str)) return 'drums';
  
  // Check comments for hints
  if (/\/\/.*(?:kick|snare|hat|hi-hat|drum|perc|clap|cymbal)/i.test(str)) return 'drums';
  if (/\/\/.*(?:bass|sub|low)/i.test(str)) return 'bass';
  if (/\/\/.*(?:pad|atmosphere|texture|ambient|drone)/i.test(str)) return 'pad';
  if (/\/\/.*(?:lead|melody|arp|sequence)/i.test(str)) return 'melody';
  if (/\/\/.*(?:chord|stab|key|piano|organ)/i.test(str)) return 'chords';
  if (/\/\/.*(?:fx|noise|sweep|riser|effect|texture)/i.test(str)) return 'fx';
  
  // Check sound name
  if (/(?:gm_pad_|gm_string_|gm_synth_strings)/i.test(str)) return 'pad';
  if (/(?:gm_synth_bass|gm_acoustic_bass|gm_electric_bass|gm_fretless)/i.test(str)) return 'bass';
  if (/(?:gm_lead_|supersaw|gm_trumpet|gm_flute|gm_alto_sax)/i.test(str)) return 'melody';
  if (/(?:gm_epiano|piano|gm_drawbar_organ|gm_clavinet)/i.test(str)) return 'chords';
  if (/(?:pink|white|brown|gm_fx_)/i.test(str)) return 'fx';
  
  // Check for bass by octave
  if (/scale\(\s*["'][A-G][#b]?[12]:/i.test(str)) return 'bass';
  if (/note\(\s*["'][a-g][#b]?[12]/i.test(str)) return 'bass';
  
  // Check for sub-bass (sine with very low frequency)
  if (/sound\(\s*["']sine["']\)/i.test(str) && /(?:[A-G][#b]?[12]|\.lpf\(\s*\d{2,3}\))/i.test(str)) return 'bass';
  
  return 'other';
}

/**
 * Extract the main sound/instrument name
 */
function extractSound(str) {
  // .sound("name") or .s("name")
  const soundMatch = str.match(/\.(?:sound|s)\(\s*["'`]([a-zA-Z_][a-zA-Z0-9_]*)["'`]/);
  if (soundMatch) return soundMatch[1];
  
  // s("pattern") at beginning - extract first sound name from pattern
  const sMatch = str.match(/(?:^|\s)s\(\s*["'`]([^"'`]+)["'`]/);
  if (sMatch) {
    // Extract first sound name from mini-notation
    const firstSound = sMatch[1].match(/^([a-zA-Z_][a-zA-Z0-9_]*)/);
    if (firstSound) return firstSound[1];
  }
  
  return null;
}

/**
 * Extract bank name
 */
function extractBank(str) {
  const match = str.match(/\.bank\(\s*["'`]([^"'`]+)["'`]/);
  return match ? match[1] : null;
}

/**
 * Extract note/scale-degree pattern
 */
function extractNotes(str) {
  const match = str.match(/n\(\s*["'`]([^"'`]+)["'`]/);
  return match ? match[1] : null;
}

/**
 * Extract scale
 */
function extractScale(str) {
  const match = str.match(/\.scale\(\s*["'`]([^"'`]+)["'`]/);
  return match ? match[1] : null;
}

/**
 * Extract effects chain
 */
function extractEffects(str) {
  const effects = {};
  
  const patterns = [
    { name: 'lpf', regex: /\.lpf\(([^)]+)\)/ },
    { name: 'hpf', regex: /\.hpf\(([^)]+)\)/ },
    { name: 'room', regex: /\.room\(([^)]+)\)/ },
    { name: 'delay', regex: /\.delay\(([^)]+)\)/ },
    { name: 'shape', regex: /\.shape\(([^)]+)\)/ },
    { name: 'pan', regex: /\.pan\(([^)]+)\)/ },
  ];
  
  for (const { name, regex } of patterns) {
    const match = str.match(regex);
    if (match) effects[name] = match[1];
  }
  
  return effects;
}

/**
 * Extract inline comment
 */
function extractComment(str) {
  const match = str.match(/\/\/\s*(.+?)(?:\n|$)/);
  return match ? match[1].trim() : null;
}

/**
 * Extract gain value
 */
function extractGain(str) {
  const match = str.match(/\.gain\(([^)]+)\)/);
  if (!match) return null;
  const val = parseFloat(match[1]);
  return isNaN(val) ? match[1] : val;
}

/**
 * Detect the genre of existing code
 */
export function detectCodeGenre(code) {
  if (!code) return 'house';
  
  const lower = code.toLowerCase();
  
  // Check BPM
  const bpmMatch = code.match(/setCpm\(\s*(\d+)\s*\/\s*4\s*\)/i);
  const bpm = bpmMatch ? parseInt(bpmMatch[1]) : null;
  
  // Heuristics based on BPM + elements
  if (bpm >= 168) return 'dnb';
  if (bpm >= 136 && bpm <= 145 && /supersaw|gm_pad_sweep/i.test(code)) return 'trance';
  if (bpm >= 128 && bpm <= 140 && /shape|industrial/i.test(lower)) return 'techno';
  if (bpm >= 130 && bpm <= 160 && /tr808|808/i.test(lower)) return 'trap';
  if (bpm >= 120 && bpm <= 130) return 'house';
  if (bpm <= 90 && /gm_acoustic_bass|gm_trumpet|gm_alto_sax/i.test(code)) return 'jazz';
  if (bpm <= 90 && /lofi|gm_vibraphone|gm_epiano/i.test(lower)) return 'lofi';
  if (bpm <= 85 && /gm_pad_|gm_vibraphone|sine.*room/i.test(code)) return 'ambient';
  
  return 'house'; // default
}

/**
 * Extract the scale from existing code
 */
export function detectCodeKey(code) {
  const match = code.match(/\.scale\(\s*["'`]([^"'`]+)["'`]/);
  if (match) return match[1];
  
  // Check for scale variable
  const varMatch = code.match(/(?:const|let|var)\s+scale\s*=\s*["'`]([^"'`]+)["'`]/);
  if (varMatch) return varMatch[1];
  
  return null;
}

/**
 * Extract the BPM from existing code
 */
export function detectCodeBPM(code) {
  const match = code.match(/setCpm\(\s*(\d+)\s*\/\s*4\s*\)/i);
  if (match) return parseInt(match[1]);
  
  const directMatch = code.match(/setCpm\(\s*(\d+)\s*\)/i);
  if (directMatch) return parseInt(directMatch[1]) * 4; // Direct cpm → bpm
  
  return null;
}
