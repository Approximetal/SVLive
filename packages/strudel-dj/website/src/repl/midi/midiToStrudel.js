/**
 * midiToStrudel.js — Convert MIDI to Strudel code (browser)
 *
 * Uses @tonejs/midi for accurate MIDI parsing (tempo map, time-in-seconds).
 * Core conversion algorithm from Emanuel-de-Jong/MIDI-To-Strudel (MIT).
 *
 * Output format (v2):
 *   // section comments
 *   let track_t1 = note(\`<[bar0 bar1 ...]>\`).s("sound").gain(0.8);
 *   let track_t2 = stack(s(\`bd\`), s(\`[~ sd]*2\`)).gain(0.8);
 *   stack(track_t1, track_t2).cpm(cpm)
 *
 * Key design rules:
 *   1. All bars within a <> must have identical element count (uniform grid)
 *   2. Drum tracks always route through GM drum map (ch.9 = percussion)
 *   3. Boundary protection: notes at rel > 0.95 pushed to next cycle
 */

// @tonejs/midi loaded dynamically to avoid Vite CJS interop

const NOTE_NAMES = ['c', 'cs', 'd', 'ds', 'e', 'f', 'fs', 'g', 'gs', 'a', 'as', 'b'];

// GM drum map → Strudel sample names
const GM_DRUM_MAP = {
  35: 'bd', 36: 'bd', 37: 'rim', 38: 'sd', 39: 'cp', 40: 'sd',
  41: 'lt', 42: 'hh', 43: 'lt', 44: 'hh', 45: 'mt', 46: 'oh',
  47: 'mt', 48: 'ht', 49: 'cr', 50: 'ht', 51: 'rd', 52: 'cr',
  53: 'cb', 54: 'cb', 55: 'cr', 56: 'cb', 57: 'cr', 58: 'sh',
  59: 'rd', 60: 'cb', 69: 'sh', 70: 'sh', 75: 'rim', 76: 'rim',
};

// GM Program Change → strudel sample names
const GM_SOUNDS = [
  'gm_piano','gm_piano','gm_epiano1','gm_harpsichord','gm_clavinet',
  'gm_celesta','gm_glockenspiel','gm_music_box','gm_vibraphone',
  'gm_marimba','gm_xylophone','gm_tubular_bells','gm_dulcimer',
  'gm_drawbar_organ','gm_percussive_organ','gm_rock_organ',
  'gm_church_organ','gm_reed_organ','gm_accordion','gm_harmonica',
  'gm_bandoneon','gm_acoustic_guitar_nylon','gm_acoustic_guitar_steel',
  'gm_electric_guitar_jazz','gm_electric_guitar_clean',
  'gm_electric_guitar_muted','gm_overdriven_guitar',
  'gm_distortion_guitar','gm_guitar_harmonics',
  'gm_acoustic_bass','gm_electric_bass_finger','gm_electric_bass_pick',
  'gm_fretless_bass','gm_slap_bass_1','gm_slap_bass_2',
  'gm_synth_bass_1','gm_synth_bass_2',
  'gm_violin','gm_viola','gm_cello','gm_contrabass',
  'gm_tremolo_strings','gm_pizzicato_strings','gm_orchestral_harp',
  'gm_timpani','gm_string_ensemble_1','gm_string_ensemble_2',
  'gm_synth_strings_1','gm_synth_strings_2',
  'gm_choir_aahs','gm_voice_oohs','gm_synth_choir','gm_orchestra_hit',
  'gm_trumpet','gm_trombone','gm_tuba','gm_muted_trumpet',
  'gm_french_horn','gm_brass_section','gm_synth_brass_1','gm_synth_brass_2',
  'gm_soprano_sax','gm_alto_sax','gm_tenor_sax','gm_baritone_sax',
  'gm_oboe','gm_english_horn','gm_bassoon','gm_clarinet',
  'gm_piccolo','gm_flute','gm_recorder','gm_pan_flute',
  'gm_blown_bottle','gm_shakuhachi','gm_whistle','gm_ocarina',
  'gm_lead_1_square','gm_lead_2_sawtooth','gm_lead_3_calliope','gm_lead_4_chiff',
  'gm_lead_5_charang','gm_lead_6_voice','gm_lead_7_fifths','gm_lead_8_bass_lead',
  'gm_pad_new_age','gm_pad_warm','gm_pad_poly','gm_pad_choir',
  'gm_pad_bowed','gm_pad_metallic','gm_pad_halo','gm_pad_sweep',
  'gm_fx_rain','gm_fx_soundtrack','gm_fx_crystal','gm_fx_atmosphere',
  'gm_fx_brightness','gm_fx_goblins','gm_fx_echoes','gm_fx_sci_fi',
  'gm_sitar','gm_banjo','gm_shamisen','gm_koto',
  'gm_kalimba','gm_bagpipe','gm_fiddle','gm_shanai',
  'gm_tinkle_bell','gm_agogo','gm_steel_drums','gm_woodblock',
  'gm_taiko_drum','gm_melodic_tom','gm_synth_drum','gm_reverse_cymbal',
  'gm_guitar_fret_noise','gm_breath_noise','gm_seashore',
  'gm_bird_tweet','gm_telephone','gm_helicopter','gm_applause','gm_gunshot',
];

const SOUND_OVERRIDES = { gm_lead_1_square: 'square', gm_lead_2_sawtooth: 'saw' };
const SOUND_FALLBACK = 'triangle';

// ============================================================
// Helpers
// ============================================================

function midiToNoteName(n) {
  return NOTE_NAMES[n % 12] + (Math.floor(n / 12) - 1);
}

/**
 * Quantize + clamp: ensures idx never equals gridSize.
 * Identical to quantizeTime logic but for direct index calculation.
 */
function safeQuantizeIdx(rel, gridSize) {
  const clamped = Math.min(rel, 1 - 1e-9);
  const idx = Math.round(clamped * gridSize);
  return Math.min(idx, gridSize - 1);
}

function quantizeTime(rel, notesPerBar) {
  return Math.min(Math.round(rel * notesPerBar) / notesPerBar, 1 - 1e-9);
}

/**
 * Uniform simplification: ensures all bars for a track share the same grid density.
 * Finds the weakest (least simplification) level that works for ALL bars,
 * then applies that uniform level. This guarantees that within a <> sequence,
 * every bar has identical element count → identical timing.
 */
function uniformSimplify(bars, gridSize) {
  if (!bars.length) return bars;

  // Find the minimum simplification level across non-empty bars.
  // Empty bars (all '-') can be simplified to any density — they don't constrain.
  let minLevel = Infinity;
  for (const bar of bars) {
    if (bar.every(v => v === '-')) continue; // skip empty bars
    let cur = bar;
    let level = 0;
    while (cur.length % 2 === 0 && level < minLevel) {
      const ok = cur.every((v, i) => (i % 2 === 1 ? v === '-' : true));
      if (!ok) break;
      cur = cur.filter((_, i) => i % 2 === 0);
      level++;
    }
    if (level < minLevel) minLevel = level;
  }
  // All bars empty → no constraint, use 0
  if (minLevel === Infinity) minLevel = 0;

  // Apply uniform level to all bars
  return bars.map(bar => {
    let cur = bar;
    for (let i = 0; i < minLevel; i++) {
      cur = cur.filter((_, j) => j % 2 === 0);
    }
    return cur;
  });
}

/**
 * Repeating sequence detection.
 * If bars follow an ABAB... repeating pattern, we can express this more concisely
 * than listing all bars individually.
 */
function detectRepeatingSequence(bars) {
  if (bars.length <= 1) return null;
  // Try sequence lengths from 1 to bars.length/2
  for (let len = 1; len <= Math.floor(bars.length / 2); len++) {
    if (bars.length % len !== 0) continue;
    const base = bars.slice(0, len);
    let matches = true;
    for (let i = 0; i < bars.length; i++) {
      if (bars[i] !== base[i % len]) { matches = false; break; }
    }
    if (matches) return { base, repeats: bars.length / len };
  }
  return null;
}

function getSoundName(track) {
  if (!track.instrument) return SOUND_FALLBACK;
  const num = track.instrument.number;
  if (typeof num !== 'number' || num < 0 || num >= GM_SOUNDS.length) return SOUND_FALLBACK;
  let name = GM_SOUNDS[num];
  if (SOUND_OVERRIDES[name]) return SOUND_OVERRIDES[name];
  return name.startsWith('gm_') ? name.replace('gm_', '') : SOUND_FALLBACK;
}

function presetSlugToSoundKey(slug) {
  return 'vital_' + slug.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

/**
 * Sanitize track name to a valid JS variable name.
 */
function toVarName(name) {
  return 'track_' + name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 't';
}

// ============================================================
// Core conversion
// ============================================================

/**
 * Build bar patterns for one melodic track.
 * Returns { bars, barSize, silentTrail }.
 *   bars        — trimmed pattern strings (trailing silent bars removed)
 *   barSize     — uniform element count per bar
 *   silentTrail — number of trailing empty bars that were trimmed;
 *                 used to wrap the pattern in arrange() when significant.
 */
function trackToBars(notes, cycleLen, notesPerBar, nCycles, flatMode) {
  if (!notes.length) return { bars: [], barSize: notesPerBar, silentTrail: 0 };

  // Push notes >95% into next cycle
  const adj = notes.map((n) => {
    const rel = (n.time % cycleLen) / cycleLen;
    return rel > 0.95 ? { ...n, time: Math.ceil(n.time / cycleLen) * cycleLen } : n;
  });

  // First pass: build full-grid bars (no simplification yet)
  const rawBars = [];
  for (let c = 0; c < nCycles; c++) {
    const start = c * cycleLen;
    const end = start + cycleLen;
    const inCycle = adj.filter((n) => n.time >= start && n.time < end);

    if (!inCycle.length) {
      rawBars.push(Array(notesPerBar).fill('-'));
      continue;
    }

    if (flatMode) {
      const names = inCycle.map((n) => midiToNoteName(n.midi));
      rawBars.push(names); // flat mode: no grid
      continue;
    }

    // Group by quantized position
    const groups = {};
    for (const n of inCycle) {
      const pos = quantizeTime((n.time - start) / cycleLen, notesPerBar);
      const key = Math.round(pos * notesPerBar) / notesPerBar;
      const name = midiToNoteName(n.midi);
      if (!groups[key]) groups[key] = [];
      if (!groups[key].includes(name)) groups[key].push(name);
    }

    const subdiv = Array(notesPerBar).fill('-');
    for (const key of Object.keys(groups).sort((a, b) => Number(a) - Number(b))) {
      const idx = Math.round(Number(key) * notesPerBar);
      if (idx < notesPerBar) {
        const g = groups[key];
        subdiv[idx] = g.length === 1 ? g[0] : `[${g.join(',')}]`;
      }
    }
    rawBars.push(subdiv);
  }

  const origLen = rawBars.length;

  // Uniform simplification: all bars share the same grid density
  const simplified = uniformSimplify(rawBars, notesPerBar);
  const barSize = simplified.length > 0 ? simplified[0].length : notesPerBar;

  // Convert to string format
  let bars = simplified.map(sub => {
    if (sub.every(s => s === '-')) return '-';
    return sub.length === 1 ? sub[0] : `[${sub.join(' ')}]`;
  });

  // Trim trailing empty bars
  while (bars.length > 1 && bars[bars.length - 1] === '-') {
    bars.pop();
  }

  const silentTrail = origLen - bars.length;

  return { bars, barSize, silentTrail };
}

/**
 * Build drum patterns — one s() per instrument.
 * Returns an array of { sample, bars, barSize, silentTrail, activeLen }.
 *   silentTrail — trailing empty cycles trimmed (use arrange if > 4)
 *   activeLen   — number of active cycles (for arrange duration)
 */
function drumToPatterns(notes, cycleLen, nCycles) {
  if (!notes.length) return [];

  const gridSize = 16;

  // Adjust boundary notes
  const adj = notes.map((n) => {
    const rel = (n.time % cycleLen) / cycleLen;
    return rel > 0.95 ? { ...n, time: Math.ceil(n.time / cycleLen) * cycleLen } : n;
  });

  // Group by drum instrument
  const groups = {};
  for (const n of adj) {
    const sample = GM_DRUM_MAP[n.midi] || 'cp';
    (groups[sample] || (groups[sample] = [])).push(n);
  }

  const results = [];
  for (const [sample, ns] of Object.entries(groups).sort()) {
    // First pass: full-grid bars
    const rawBars = [];
    for (let c = 0; c < nCycles; c++) {
      const start = c * cycleLen, end = start + cycleLen;
      const sub = Array(gridSize).fill('-');
      for (const n of ns) {
        if (n.time < start || n.time >= end) continue;
        const rel = (n.time - start) / cycleLen;
        // Boundary protection: clamp rel so idx never hits gridSize
        const idx = safeQuantizeIdx(rel, gridSize);
        sub[idx] = sample;
      }
      rawBars.push(sub);
    }

    // Uniform simplification
    const simplified = uniformSimplify(rawBars, gridSize);
    const barSize = simplified.length > 0 ? simplified[0].length : gridSize;

    // Convert to string
    const bars = simplified.map(sub => {
      if (sub.every(s => s === '-')) return '-';
      return sub.length === 1 ? sub[0] : `[${sub.join(' ')}]`;
    });

    results.push({ sample, bars, barSize });
  }

  // Trim trailing empty bars uniformly across ALL drum instruments.
  // Preserve active/silence boundary for arrange() generation.
  if (results.length > 0) {
    let maxLastActive = -1;
    for (const { bars } of results) {
      for (let i = bars.length - 1; i >= 0; i--) {
        if (bars[i] !== '-') { if (i > maxLastActive) maxLastActive = i; break; }
      }
    }
    const activeLen = Math.max(1, maxLastActive + 1);
    const silentTrail = Math.max(0, nCycles - activeLen);

    for (const r of results) {
      r.bars = r.bars.slice(0, activeLen);
      // Re-trim if the truncated range is all '-' (edge case)
      while (r.bars.length > 1 && r.bars[r.bars.length - 1] === '-') {
        r.bars.pop();
      }
      r.silentTrail = silentTrail;
      r.activeLen = activeLen;
    }
    // Remove instruments that have no hits in the kept range
    const filtered = results.filter(r => r.bars.some(b => b !== '-'));
    return filtered;
  }

  return results;
}

/**
 * Format bars into an angle-bracket `<...>` sequence.
 * Detects repeating patterns and uses `*` notation when possible.
 */
function formatBarSequence(bars) {
  const seq = detectRepeatingSequence(bars);
  if (seq) {
    // Repeating ABAB pattern → format base with *repeats suffix
    const base = seq.base;
    let longest = 0;
    for (const b of base) if (b.length > longest) longest = b.length;
    let perRow = 4;
    if (longest > 0) perRow = Math.max(2, Math.min(4, Math.floor(80 / (longest + 1))));

    const chunks = [];
    for (let i = 0; i < base.length; i += perRow) {
      chunks.push(base.slice(i, i + perRow).join(' '));
    }
    const inner = chunks.join('\n    ');
    if (seq.repeats > 1) {
      return `<${inner}>*${seq.repeats}`;
    }
    return `<${inner}>`;
  }

  // Non-repeating: list all bars
  let longest = 0;
  for (const b of bars) if (b.length > longest) longest = b.length;
  let perRow = 4;
  if (longest > 0) perRow = Math.max(2, Math.min(4, Math.floor(80 / (longest + 1))));

  const chunks = [];
  for (let i = 0; i < bars.length; i += perRow) {
    chunks.push(bars.slice(i, i + perRow).join(' '));
  }
  return '<' + chunks.join('\n    ') + '>';
}

// ============================================================
// Public API
// ============================================================

export function suggestPresetsForTrack(trackInfo) {
  const { avgPitch, hasChords, isDrum, category } = trackInfo;
  if (isDrum) return [];
  if (hasChords || category === 'chords')
    return ['space_station', 'analog_pad', 'strings_section', 'float_chords', 'chorusy_keys'];
  if (avgPitch < 45)
    return ['jupiter_bass', 'banana_wob', 'big_stomp', 'honk_wub', 'growl_bass_sidechain'];
  if (avgPitch < 55)
    return ['jupiter_bass', 'growl_bass_sidechain', 'feeder', 'thunk', 'vlt_future_gun'];
  if (category === 'lead' || avgPitch > 75)
    return ['super_nice_pluck', 'cinema_bells', 'crescendo_bells', 'easy_mallet', 'digital_roller'];
  return ['keystation', 'chorusy_keys', 'moog_pluck', 'ceramic', 'super_nice_pluck', 'easy_mallet'];
}

export function getTrackInfo(midi) {
  const tracks = [];
  for (let i = 0; i < midi.tracks.length; i++) {
    const track = midi.tracks[i];
    if (track.notes.length === 0) continue;

    const pitches = track.notes.map((n) => n.pitch);
    const avgPitch = pitches.reduce((a, b) => a + b, 0) / pitches.length;
    const minPitch = Math.min(...pitches);
    const maxPitch = Math.max(...pitches);
    const isDrum = track.channel === 9;

    const tickCounts = {};
    for (const n of track.notes) tickCounts[n.startTick] = (tickCounts[n.startTick] || 0) + 1;
    const hasChords = Object.values(tickCounts).some((c) => c >= 3);

    let category = 'melody';
    if (isDrum) category = 'drums';
    else if (hasChords) category = 'chords';
    else if (avgPitch < 50) category = 'bass';
    else if (avgPitch > 75) category = 'lead';

    tracks.push({
      index: i,
      name: track.name || `Track ${i + 1}`,
      channel: track.channel,
      noteCount: track.notes.length,
      minPitch, maxPitch, avgPitch,
      isDrum, hasChords, category,
      range: `${midiToNoteName(minPitch)}–${midiToNoteName(maxPitch)}`,
    });
  }
  return tracks;
}

/**
 * Convert MIDI (raw ArrayBuffer) to Strudel code.
 *
 * Output format: section-commented, let-variable based, with uniform grid density
 * for consistent timing across all bars and tracks.
 *
 * @param {ArrayBuffer} rawBuffer - Raw MIDI file bytes
 * @param {object} options
 * @param {number} [options.bars=0] - Max bars (0 = no limit)
 * @param {number} [options.notesPerBar=16] - Quantization resolution
 * @param {number} [options.bpm] - Override BPM
 * @param {Object<number,string>} [options.trackPresets] - Track index → vital preset slug
 * @param {Object<string,string>} [options.presetNames] - slug → display name
 * @param {boolean} [options.flat=false] - Flat mode
 * @returns {Promise<string>}
 */
export async function midiToStrudel(rawBuffer, options = {}) {
  const {
    bars: barLimit = 0,
    notesPerBar = 16,
    bpm: bpmOverride,
    trackPresets = {},
    presetNames = {},
    flat = false,
  } = options;

  // Dynamic import to avoid Vite CJS interop bug
  const MidiModule = await import('@tonejs/midi');
  const { Midi } = MidiModule;

  const midi = new Midi(rawBuffer);
  const bpm = bpmOverride || (midi.header.tempos.length ? midi.header.tempos[0].bpm : 120);
  const cycleLen = (60 / bpm) * 4; // seconds per 4-beat cycle
  const cpm = (bpm / 4).toFixed(1);

  // Global max time across ALL tracks for bar alignment
  const globalMaxTime = midi.tracks.reduce((max, t) => {
    if (!t.notes.length) return max;
    const tMax = Math.max(...t.notes.map((n) => n.time));
    return Math.max(max, tMax);
  }, 0);
  const nCycles = barLimit > 0
    ? Math.min(Math.floor(globalMaxTime / cycleLen) + 1, barLimit)
    : Math.floor(globalMaxTime / cycleLen) + 1;

  // Collect Vital presets
  const usedPresets = new Set();
  for (const [, slug] of Object.entries(trackPresets)) { if (slug) usedPresets.add(slug); }

  // ---- Build output lines ----
  const header = [];
  header.push(`// MIDI → Strudel (auto-converted)`);
  header.push(`// BPM: ${Math.round(bpm)}  |  ${nCycles} cycles  |  grid: ${notesPerBar}/bar`);
  header.push(`let cpm = ${cpm};`);
  header.push('');

  // Load Vital presets
  const vitalLoader = [];
  if (usedPresets.size > 0) {
    vitalLoader.push('// Vital presets');
    for (const slug of [...usedPresets].sort()) {
      const displayName = presetNames[slug]
        || slug.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      vitalLoader.push(`await vital('${displayName}')  // → .s("vital_${slug}")`);
    }
    vitalLoader.push('');
  }

  // ---- Process each track ----
  const trackDefs = [];   // let track_xxx = ...
  const trackRefs = [];   // references for final stack()
  let sectionComment = '';

  midi.tracks.forEach((track, idx) => {
    if (!track.notes.length) return;

    const isDrum = track.channel === 9 || (track.name || '').toLowerCase().includes('drum');
    const presetSlug = trackPresets[idx];
    const chLabel = `ch.${track.channel + 1}`;
    const displayName = track.name || `Track ${idx + 1}`;
    const varName = toVarName(displayName) + `_t${idx}`;

    // ---- Drum track: always route through GM drum map ----
    if (isDrum) {
      const drumResults = drumToPatterns(track.notes, cycleLen, nCycles);
      if (!drumResults.length) return;

      const silentTrail = drumResults[0].silentTrail || 0;
      const activeLen = drumResults[0].activeLen || 0;
      sectionComment = `// ══ Percussion — ${displayName} [${chLabel}] ══`;
      if (silentTrail > 4) {
        sectionComment += `  (stops after cycle ${activeLen})`;
      }

      // Build one let per drum instrument
      const drumVarNames = [];
      const drumLines = [];
      for (const { sample, bars, barSize } of drumResults) {
        const dvName = `${sample}_${varName}`;
        drumVarNames.push(dvName);
        const pattern = formatBarSequence(bars);
        drumLines.push(`let ${dvName} = s(\`${pattern}\`).gain(0.8);`);
      }
      trackDefs.push({ comment: sectionComment, lines: drumLines });

      const drumStack = drumVarNames.length === 1
        ? drumVarNames[0]
        : `stack(${drumVarNames.join(', ')})`;

      // If significant trailing silence, wrap in arrange() so drums stop
      if (silentTrail > 4) {
        const arrangeRef = `arrange([${activeLen}, ${drumStack}], [${silentTrail}, s('~')])`;
        trackRefs.push(`  ${arrangeRef}`);
      } else {
        trackRefs.push(`  ${drumStack}`);
      }
      return;
    }

    // ---- Melodic track ----
    const { bars, barSize, silentTrail } = trackToBars(track.notes, cycleLen, notesPerBar, nCycles, flat);
    if (!bars.length || bars.every((b) => b === '-')) return;

    const pattern = formatBarSequence(bars);

    // Section comment
    const category = presetSlug ? 'synth' : 'melody';
    const soundLabel = presetSlug
      ? `vital_${presetSlug}`
      : getSoundName(track);
    sectionComment = `// ══ ${displayName} — ${chLabel} [${soundLabel}] ══`;
    if (silentTrail > 4) {
      sectionComment += `  (stops after cycle ${bars.length})`;
    }

    // Build the let definition
    const defLines = [];
    defLines.push(`let ${varName} = note(\`${pattern}\`)`);

    if (presetSlug) {
      const soundKey = presetSlugToSoundKey(presetSlug);
      defLines.push(`  .s("${soundKey}")`);
      defLines.push(`  .release(0.5).gain(0.8);`);
    } else {
      defLines.push(`  .s("${soundLabel}").gain(0.8);`);
    }

    trackDefs.push({ comment: sectionComment, lines: defLines });

    // If significant trailing silence, wrap in arrange() so track stops
    if (silentTrail > 4) {
      trackRefs.push(`  arrange([${bars.length}, ${varName}], [${silentTrail}, s('~')])`);
    } else {
      trackRefs.push(`  ${varName}`);
    }
  });

  // ---- Assemble output ----
  const lines = [...header];

  // Vital loader
  if (vitalLoader.length > 1) lines.push(...vitalLoader);

  // Track definitions with section comments
  for (const { comment, lines: defLines } of trackDefs) {
    lines.push(comment);
    lines.push(...defLines);
    lines.push('');
  }

  // Final stack
  if (trackRefs.length === 0) {
    lines.push('// No playable notes found in MIDI file');
  } else if (trackRefs.length === 1) {
    // Single track: just let it play directly
    lines.pop(); // remove trailing blank line
  } else {
    lines.push('stack(');
    lines.push(trackRefs.join(',\n'));
    lines.push(')');
    lines.push(`  .cpm(cpm);`);
  }

  return lines.join('\n');
}
