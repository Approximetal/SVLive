/**
 * vital.mjs - Vital synthesizer integration for Strudel
 *
 * Connects to a local vital-bridge server (Vita Python engine)
 * to render .vital preset files as samples for playback.
 *
 * Usage in Strudel patterns:
 *   await vital('Plucked String')
 *   note("c3 e3 g3").s("vital_plucked_string")
 *
 *   // with macro control (re-renders with different timbres)
 *   await vital('Plucked String', { macros: { macro1: 0.8, macro2: 0.3 } })
 *   note("c3 e3 g3").s("vital_plucked_string")
 *
 *   // export as standalone WAV pack (works without server)
 *   await vitalExport('Plucked String')
 *
 * @tags vital, synth, samples
 */

import { registerSound } from './superdough.mjs';
import { onTriggerSample } from './sampler.mjs';
import { getAudioContext } from './audioContext.mjs';
import { logger } from './logger.mjs';

// ============================================================
// Configuration
// ============================================================

const DEFAULT_BRIDGE_URL = 'http://localhost:8765';
let bridgeUrl = DEFAULT_BRIDGE_URL;

// Pre-render notes from C2(36) to C6(84) every 4 semitones = 13 notes
const DEFAULT_NOTE_RANGE = { low: 36, high: 84, step: 4 };
const DEFAULT_VELOCITY = 0.7;
const DEFAULT_NOTE_DUR = 1.0;
const DEFAULT_RENDER_DUR = 4.0;

// State
const vitalPresets = new Map(); // presetName → { hash, notes, bank, status }
let presetList = null; // cached preset list from server

// ============================================================
// Helpers
// ============================================================

async function bridgeFetch(path, options = {}) {
  const url = `${bridgeUrl}${path}`;
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const detail = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(`vital-bridge ${path}: ${detail.detail || res.statusText}`);
    }
    return res;
  } catch (err) {
    if (err.message.includes('fetch')) {
      throw new Error(
        `[vital] Cannot connect to vital-bridge at ${bridgeUrl}. ` +
        `Make sure the server is running: cd vital-bridge && uvicorn server:app --port 8765`
      );
    }
    throw err;
  }
}

function midiToNoteName(midi) {
  const names = ['c', 'cs', 'd', 'ds', 'e', 'f', 'fs', 'g', 'gs', 'a', 'as', 'b'];
  const oct = Math.floor(midi / 12) - 1;
  const note = names[midi % 12];
  return `${note}${oct}`;
}

function sanitizePresetName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function macroSuffix(macros) {
  if (!macros) return '';
  const parts = [];
  for (let i = 1; i <= 4; i++) {
    const val = macros[`macro${i}`] ?? macros[`macro_control_${i}`];
    if (val !== undefined) {
      parts.push(`m${i}_${Math.round(val * 100)}`);
    }
  }
  return parts.length ? '_' + parts.join('_') : '';
}

// ============================================================
// Core API
// ============================================================

/**
 * Set the vital-bridge server URL.
 * @param {string} url - The server URL (default: http://localhost:8765)
 */
export function setVitalBridge(url) {
  bridgeUrl = url.replace(/\/$/, '');
}

/**
 * Check if the vital-bridge server is available.
 * @returns {Promise<boolean>}
 */
export async function vitalHealth() {
  try {
    const res = await bridgeFetch('/health');
    const data = await res.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
}

/**
 * List available .vital presets from the server.
 * @returns {Promise<Array>} Array of preset info objects
 */
export async function vitalPresetList() {
  if (presetList) return presetList;
  const res = await bridgeFetch('/presets');
  const data = await res.json();
  presetList = data.presets;
  return presetList;
}

/**
 * Load a Vital preset and pre-render notes for use in Strudel patterns.
 *
 * @name vital
 * @tags vital, synth
 * @param {string|string[]} presetNameOrNames - Preset name(s) or path(s)
 * @param {object} options - Options for rendering
 * @param {number} options.low - Lowest MIDI note to render (default: 36/C2)
 * @param {number} options.high - Highest MIDI note to render (default: 84/C6)
 * @param {number} options.step - Semitone step between rendered notes (default: 4)
 * @param {number} options.velocity - Velocity for rendering (default: 0.7)
 * @param {number} options.noteDur - Note duration in seconds (default: 1.0)
 * @param {number} options.renderDur - Total render duration in seconds (default: 4.0)
 * @param {object} options.macros - Macro values { macro1: 0.0-1.0, macro2: ..., macro3: ..., macro4: ... }
 *
 * @example
 * await vital('Plucked String')
 * note("c3 e3 g3 c4").s("vital_plucked_string")
 *
 * @example
 * await vital('Banana Wob', { macros: { macro1: 0.8 } })
 * note("c2 c2 c2 c2").s("vital_banana_wob_m1_80")
 *
 * @example
 * await vital('Plucked String', { low: 24, high: 72, step: 2, renderDur: 6 })
 * note("c3 e3 g3 c4").s("vital_plucked_string")
 */
export async function vital(presetNameOrNames, options = {}) {
  // Guard: if user accidentally uses double quotes, the transpiler converts it to a Pattern object
  if (typeof presetNameOrNames !== 'string' && !Array.isArray(presetNameOrNames)) {
    throw new Error(
      `[vital] expected a preset name string, but got ${typeof presetNameOrNames}. ` +
      `Use single quotes: await vital('Preset Name') — double quotes are reserved for mini-notation in strudel.`
    );
  }
  const names = Array.isArray(presetNameOrNames) ? presetNameOrNames : [presetNameOrNames];

  for (const name of names) {
    if (typeof name !== 'string') {
      throw new Error(
        `[vital] preset name must be a string, got ${typeof name}. ` +
        `Use single quotes: await vital('Preset Name')`
      );
    }
    await loadVitalPreset(name, options);
  }
}

/**
 * Load a single vital preset: find it on the server, load it, render notes, register as sound.
 */
async function loadVitalPreset(presetName, options = {}) {
  const {
    low = DEFAULT_NOTE_RANGE.low,
    high = DEFAULT_NOTE_RANGE.high,
    step = DEFAULT_NOTE_RANGE.step,
    velocity = DEFAULT_VELOCITY,
    noteDur = DEFAULT_NOTE_DUR,
    renderDur = DEFAULT_RENDER_DUR,
    macros = null,
  } = options;

  // Sound key includes macro suffix so different macro settings get different sounds
  const baseName = sanitizePresetName(presetName);
  const mSuffix = macroSuffix(macros);
  const soundKey = `vital_${baseName}${mSuffix}`;

  // Skip if already loaded with same parameters
  const existing = vitalPresets.get(soundKey);
  if (existing && existing.status === 'ready') {
    logger(`[vital] "${presetName}" already loaded as ${soundKey}`, 'info');
    return soundKey;
  }

  logger(`[vital] loading "${presetName}"${macros ? ' (macros: ' + JSON.stringify(macros) + ')' : ''}...`, 'load-sample', { url: presetName });

  // 1. Find the preset on the server
  const presets = await vitalPresetList();
  let presetPath = null;

  // Try exact name match first
  const match = presets.find(p =>
    p.name === presetName ||
    p.name.toLowerCase() === presetName.toLowerCase() ||
    p.relative === presetName
  );

  if (match) {
    presetPath = match.path;
  } else {
    // Fuzzy match: check if presetName is a substring
    const fuzzy = presets.find(p =>
      p.name.toLowerCase().includes(presetName.toLowerCase())
    );
    if (fuzzy) {
      presetPath = fuzzy.path;
      logger(`[vital] fuzzy matched "${presetName}" → "${fuzzy.name}"`, 'info');
    }
  }

  if (!presetPath) {
    // Maybe it's a full path already
    presetPath = presetName;
  }

  // 2. Load preset into the engine
  const loadRes = await bridgeFetch('/load', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: presetPath }),
  });
  const loadData = await loadRes.json();
  const presetHash = loadData.hash;

  logger(`[vital] "${loadData.name}" loaded (hash: ${presetHash}), rendering notes...`, 'info');

  // 3. Render batch of notes (with macros if specified)
  const notes = [];
  for (let n = low; n <= high; n += step) {
    notes.push(n);
  }

  const batchBody = {
    notes,
    velocity,
    note_dur: noteDur,
    render_dur: renderDur,
  };
  if (macros) {
    batchBody.macros = macros;
  }

  const batchRes = await bridgeFetch('/render-batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(batchBody),
  });
  const batchData = await batchRes.json();

  // 4. Build note-based sample bank
  // Format: { "c2": ["url"], "e2": ["url"], ... }
  const bank = {};
  for (const noteInfo of batchData.notes) {
    const noteName = midiToNoteName(noteInfo.note);
    bank[noteName] = [`${bridgeUrl}${noteInfo.url}`];
  }

  // 5. Register as a strudel sound
  registerSound(
    soundKey,
    (t, hapValue, onended) => onTriggerSample(t, hapValue, onended, bank),
    {
      type: 'vital',
      samples: bank,
      presetName: loadData.name,
      presetHash,
      macros,
      baseUrl: bridgeUrl,
    }
  );

  // 6. Track state
  vitalPresets.set(soundKey, {
    hash: presetHash,
    name: loadData.name,
    bank,
    status: 'ready',
    noteRange: { low, high, step },
    macros,
  });

  const elapsed = batchData.time_ms;
  logger(
    `[vital] "${loadData.name}" ready as ${soundKey} ` +
    `(${batchData.total} notes, ${batchData.rendered} rendered, ${batchData.cached} cached, ${elapsed}ms)`,
    'loaded-sample',
    { url: presetName }
  );

  return soundKey;
}

/**
 * Upload a .vital file from the browser and register it.
 *
 * @param {File} file - A File object (from file input or drag-and-drop)
 * @param {object} options - Same options as vital()
 * @returns {Promise<string>} The registered sound key
 */
export async function vitalUpload(file, options = {}) {
  const {
    low = DEFAULT_NOTE_RANGE.low,
    high = DEFAULT_NOTE_RANGE.high,
    step = DEFAULT_NOTE_RANGE.step,
    velocity = DEFAULT_VELOCITY,
    noteDur = DEFAULT_NOTE_DUR,
    renderDur = DEFAULT_RENDER_DUR,
    macros = null,
  } = options;

  if (!file.name.endsWith('.vital')) {
    throw new Error('[vital] File must be a .vital preset');
  }

  const presetName = file.name.replace('.vital', '');
  const baseName = sanitizePresetName(presetName);
  const mSuffix = macroSuffix(macros);
  const soundKey = `vital_${baseName}${mSuffix}`;

  logger(`[vital] uploading "${file.name}"...`, 'load-sample');

  // 1. Upload to server
  const formData = new FormData();
  formData.append('file', file);

  const uploadRes = await bridgeFetch('/upload', {
    method: 'POST',
    body: formData,
  });
  const uploadData = await uploadRes.json();

  // 2. Render notes
  const notes = [];
  for (let n = low; n <= high; n += step) {
    notes.push(n);
  }

  const batchBody = {
    notes,
    velocity,
    note_dur: noteDur,
    render_dur: renderDur,
  };
  if (macros) {
    batchBody.macros = macros;
  }

  const batchRes = await bridgeFetch('/render-batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(batchBody),
  });
  const batchData = await batchRes.json();

  // 3. Build bank and register
  const bank = {};
  for (const noteInfo of batchData.notes) {
    const noteName = midiToNoteName(noteInfo.note);
    bank[noteName] = [`${bridgeUrl}${noteInfo.url}`];
  }

  registerSound(
    soundKey,
    (t, hapValue, onended) => onTriggerSample(t, hapValue, onended, bank),
    {
      type: 'vital',
      samples: bank,
      presetName: uploadData.name,
      presetHash: uploadData.hash,
      macros,
      baseUrl: bridgeUrl,
    }
  );

  vitalPresets.set(soundKey, {
    hash: uploadData.hash,
    name: uploadData.name,
    bank,
    status: 'ready',
    noteRange: { low, high, step },
    macros,
  });

  logger(
    `[vital] "${uploadData.name}" ready as ${soundKey} (${batchData.total} notes)`,
    'loaded-sample'
  );

  return soundKey;
}

/**
 * Export a Vital preset as a standalone WAV sample pack (ZIP download).
 * The exported pack works without the vital-bridge server.
 *
 * @name vitalExport
 * @param {string} presetName - Preset name to export
 * @param {object} options - Export options
 * @param {number} options.low - Lowest MIDI note (default: 36/C2)
 * @param {number} options.high - Highest MIDI note (default: 84/C6)
 * @param {number} options.step - Semitone step (default: 4)
 * @param {number} options.velocity - Velocity (default: 0.7)
 * @param {number} options.noteDur - Note duration seconds (default: 1.0)
 * @param {number} options.renderDur - Render duration seconds (default: 4.0)
 * @param {object} options.macros - Macro values { macro1: 0-1, ... }
 *
 * @example
 * await vitalExport('Plucked String')
 * // Downloads plucked_string.zip containing WAV files + strudel.json
 */
export async function vitalExport(presetName, options = {}) {
  if (typeof presetName !== 'string') {
    throw new Error(`[vital] vitalExport: expected preset name string, got ${typeof presetName}. Use single quotes.`);
  }

  const {
    low = DEFAULT_NOTE_RANGE.low,
    high = DEFAULT_NOTE_RANGE.high,
    step = DEFAULT_NOTE_RANGE.step,
    velocity = DEFAULT_VELOCITY,
    noteDur = DEFAULT_NOTE_DUR,
    renderDur = DEFAULT_RENDER_DUR,
    macros = null,
  } = options;

  logger(`[vital] exporting "${presetName}" as WAV pack...`, 'info');

  // Find preset path
  const presets = await vitalPresetList();
  let presetPath = null;
  const match = presets.find(p =>
    p.name === presetName ||
    p.name.toLowerCase() === presetName.toLowerCase()
  );
  if (match) {
    presetPath = match.path;
  } else {
    const fuzzy = presets.find(p => p.name.toLowerCase().includes(presetName.toLowerCase()));
    if (fuzzy) presetPath = fuzzy.path;
  }
  if (!presetPath) presetPath = presetName;

  // Call export endpoint
  const exportBody = {
    preset: presetPath,
    low,
    high,
    step,
    velocity,
    note_dur: noteDur,
    render_dur: renderDur,
  };
  if (macros) {
    exportBody.macros = macros;
  }

  const res = await bridgeFetch('/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(exportBody),
  });

  // Download the ZIP file
  const blob = await res.blob();
  const safeName = sanitizePresetName(presetName);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  const noteCount = res.headers.get('X-Notes-Count') || '?';
  const renderTime = res.headers.get('X-Render-Time-Ms') || '?';
  logger(`[vital] exported "${presetName}" (${noteCount} notes, ${renderTime}ms) — download started`, 'info');

  return safeName;
}

/**
 * Get the status of loaded vital presets.
 * @returns {object} Map of soundKey → status info
 */
export function vitalStatus() {
  const status = {};
  for (const [key, info] of vitalPresets) {
    status[key] = {
      name: info.name,
      status: info.status,
      noteRange: info.noteRange,
      hash: info.hash,
      macros: info.macros,
    };
  }
  return status;
}

/**
 * Clear cached renders on the server.
 */
export async function vitalClearCache() {
  const res = await bridgeFetch('/cache', { method: 'DELETE' });
  const data = await res.json();
  logger(`[vital] cleared ${data.cleared} cached files`, 'info');
  return data;
}
