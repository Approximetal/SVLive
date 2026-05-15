/**
 * AI Tools — Function calling definitions for Strudel AI Agent
 *
 * Replaces the JSON output + parse pattern with native Anthropic tool_use.
 * The model calls tools to submit code (validated on-the-spot) and query
 * available sounds (runtime discovery, no hardcoded lists needed).
 */

import { evaluate, State, TimeSpan, isPattern, silence } from '@strudel/core';
import { transpiler } from '@strudel/transpiler';

// ============================================================
// Tool Definitions (Anthropic-compatible schema)
// ============================================================

export const GENERATE_TOOLS = [
  {
    name: 'generate_strudel_code',
    description:
      'Submit your complete Strudel code for immediate validation and execution. ' +
      'The code will be played as soon as it passes validation. ' +
      'ALWAYS use this tool to output your final code — NEVER output raw code in your text response. ' +
      'If the code has errors, the tool will tell you exactly what to fix.',
    input_schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description:
            'Complete Strudel/TidalCycles pattern code. Must be valid JavaScript. ' +
            'Use stack() to layer multiple patterns. ' +
            'Vital presets MUST be loaded at the top with await vital("Name").',
        },
        rationale: {
          type: 'string',
          description:
            'Brief explanation of your musical choices: genre approach, sound selection reasoning, ' +
            'and performance suggestions for the user (1-3 sentences).',
        },
      },
      required: ['code', 'rationale'],
    },
  },
  {
    name: 'list_available_sounds',
    description:
      'Discover what sounds, samples, drum machines, and Vital synthesizer presets are available RIGHT NOW. ' +
      'Call this BEFORE generating code if you are unsure what sounds exist. ' +
      'This queries the live audio engine, so results are always current.',
    input_schema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description:
            'Filter: "drums" (drum machines & samples), "vital_all" (all Vital presets), ' +
            '"vital_bass", "vital_lead", "vital_pad", "vital_pluck", "vital_keys", "vital_fx", ' +
            '"vital_arp", "vital_chord", "vital_bell", "vital_world", ' +
            '"synths" (native oscillators), "all" (everything).',
        },
      },
      required: ['category'],
    },
  },
];

// Cache for list_available_sounds to avoid repeated fetches
let _soundListCache = null;
let _soundListCacheTime = 0;
const SOUND_CACHE_TTL = 30000; // 30 seconds

// ============================================================
// Tool Handlers (executed on client side)
// ============================================================

/**
 * Validate Strudel code by evaluating it against the transpiler.
 * Returns null on success, or an error message string.
 */
// Ensure REPL-injected functions are available during pre-validation.
// These are normally injected by repl.evaluate() → injectPatternMethods() → evalScope(),
// but validateCode() calls the raw evaluate() from @strudel/core which skips that step.
let _prevalStubsInstalled = false;
function ensurePrevalStubs() {
  if (_prevalStubsInstalled) return;
  globalThis.setCpm = (cpm) => silence;
  globalThis.setcpm = (cpm) => silence;
  globalThis.setCps = (cps) => silence;
  globalThis.setcps = (cps) => silence;
  globalThis.hush = () => silence;
  globalThis.all = (fn) => silence;
  globalThis.each = (fn) => silence;
  _prevalStubsInstalled = true;
}

export async function validateCode(code) {
  ensurePrevalStubs();
  try {
    const { pattern } = await evaluate(code, transpiler);
    if (!isPattern(pattern)) {
      if (pattern !== undefined) {
        return `Code returned ${typeof pattern} instead of a Pattern. Did you forget to use s(), n(), or stack()? Make sure the last expression returns a pattern.`;
      }
      return null;
    }
    pattern.query(new State(new TimeSpan(0, 1 / 4)));
    return null;
  } catch (err) {
    return err.message || String(err);
  }
}

/**
 * Handle the generate_strudel_code tool call.
 */
export async function handleGenerateCode(input) {
  const { code, rationale } = input;
  if (!code || typeof code !== 'string' || code.trim().length < 3) {
    return {
      success: false,
      error: 'Code is empty or too short. Provide a complete Strudel pattern with at least one sound source.',
    };
  }
  const validationError = await validateCode(code);
  if (validationError) {
    return {
      success: false,
      error: `Validation failed: ${validationError}\n\nFix the code and call generate_strudel_code again.`,
    };
  }
  return { success: true, code, rationale: rationale || '' };
}

/**
 * Handle the list_available_sounds tool call.
 * Queries superdough soundMap + vital-bridge for available sounds.
 */
export async function handleListSounds(input) {
  const cat = (input.category || 'all').toLowerCase();
  const now = Date.now();

  // Use cache if fresh
  if (cat === 'all' && _soundListCache && (now - _soundListCacheTime) < SOUND_CACHE_TTL) {
    return _soundListCache;
  }

  const parts = [];

  // ── Drum samples (from superdough runtime) ──
  if (cat === 'all' || cat === 'drums') {
    try {
      const { soundMap } = await import('superdough');
      const sounds = soundMap.get();
      const names = Object.keys(sounds);

      const drumPrefixes = [
        'roland', 'tr', 'linn', 'oberheim', 'dmx', 'emu', 'alesis',
        'boss', 'korg', 'simmons', 'casio', 'yamaha', 'akai',
      ];
      const drumElements = ['bd','sd','hh','oh','cp','rim','cb','cr',
        'rd','ht','mt','lt','sh','tb','perc','tom','sn'];

      const drumSounds = names.filter(n => {
        const lower = n.toLowerCase();
        return drumElements.some(e => lower === e || lower.startsWith(e + '_'))
          || drumPrefixes.some(p => lower.includes(p));
      });

      if (drumSounds.length > 0) {
        parts.push('## Drum Samples & Machines');
        parts.push('');
        const elements = drumSounds.filter(n => drumElements.includes(n));
        if (elements.length > 0) {
          parts.push(`Core: ${elements.join(', ')}`);
        }
        const machines = drumSounds.filter(n => !drumElements.includes(n));
        if (machines.length > 0) {
          parts.push(`Machines: ${machines.slice(0,15).join(', ')}${machines.length > 15 ? ' ...' : ''}`);
        }
        parts.push('Usage: s("bd").bank("RolandTR909")');
        parts.push('');
      }
    } catch (e) {
      parts.push('**Drums:** core drums always available: bd, sd, hh, oh, cp, rim, cr, lt, mt, ht');
      parts.push('');
    }
  }

  // ── Vital presets (from vital-bridge) ──
  const vitalCats = ['all','vital_all','vital_bass','vital_lead','vital_pad',
    'vital_pluck','vital_keys','vital_fx','vital_arp','vital_chord','vital_bell','vital_world'];

  if (vitalCats.includes(cat)) {
    try {
      const vitalTag = cat === 'all' || cat === 'vital_all' ? '' : cat.replace('vital_', '');

      if (vitalTag) {
        // Specific category: search for actual preset names
        const r = await fetch(`http://localhost:8765/presets/search?tag=${encodeURIComponent(vitalTag)}`, {
          signal: AbortSignal.timeout(5000),
        });
        if (r.ok) {
          const data = await r.json();
          const names = data.presets.map(p => p.name);
          parts.push(`## Vital ${vitalTag.charAt(0).toUpperCase() + vitalTag.slice(1)} Presets (${names.length})`);
          parts.push('');
          if (names.length <= 30) {
            names.forEach(n => parts.push(`- ${n}`));
          } else {
            names.slice(0, 20).forEach(n => parts.push(`- ${n}`));
            parts.push(`- ... and ${names.length - 20} more`);
          }
          parts.push('');
          parts.push(`Usage: await vital("Preset Name")`);
          parts.push(`Example: await vital("${names[0]}"); note("c3 e3 g3").s("vital_${names[0].toLowerCase().replace(/[^a-z0-9]+/g,'_')}")`);
          parts.push('');
        }
      } else {
        // All: show type counts only (too many to list)
        const r = await fetch('http://localhost:8765/presets/tags', {
          signal: AbortSignal.timeout(3000),
        });
        if (r.ok) {
          const data = await r.json();
          const types = data.type_counts || {};
          parts.push('## Vital Synthesizer Presets (2300 total)');
          parts.push('');
          parts.push('Available categories with top picks:');
          parts.push('');
          const topPicks = {
            bass: '808, BA - 808 Aggressive, BA - Bro Bass',
            lead: 'LD-Supersaw, LD - Future Bass, LD - Hyper Pop',
            pad: 'Analog Pad, PD - Into Lucidity',
            pluck: 'Plucked String, PL - Basic Pluck',
            keys: 'KEYS-Electric Piano, KEYS - Classic Rhodes',
            chord: 'CHORD-House, CHORD - Deep',
            fx: 'Special Glitch Thing',
            arp: 'ARP - Classic',
            bell: 'BELL - Crystal',
          };
          const sortedTypes = Object.entries(types)
            .filter(([t]) => t !== 'other')
            .sort(([,a], [,b]) => b - a);
          for (const [type, count] of sortedTypes) {
            const pick = topPicks[type] ? ` (e.g. ${topPicks[type]})` : '';
            parts.push(`- ${type}: ${count} presets${pick}`);
          }
          parts.push('');
          parts.push('Use list_available_sounds with "vital_bass", "vital_lead", etc. to see exact preset names.');
          parts.push('Load with: await vital("Preset Name")');
          parts.push('');
        }
      }
    } catch (e) {
      parts.push('## Vital Presets: vital-bridge not running.');
      parts.push('Use native synths: sawtooth, sine, triangle, square, supersaw.');
      parts.push('');
    }
  }

  // ── Native synths ──
  if (cat === 'all' || cat === 'synths') {
    parts.push('## Native Synths (always available)');
    parts.push('sine, triangle, square, sawtooth, saw, pulse, supersaw, white, pink, brown, crackle, sbd, bytebeat');
    parts.push('Usage: note("c3 e3 g3").s("sawtooth").lpf(600)');
    parts.push('');
  }

  const result = parts.length > 0 ? parts.join('\n') : `No sounds for "${cat}". Try: drums, vital_all, synths, all.`;

  if (cat === 'all') {
    _soundListCache = result;
    _soundListCacheTime = now;
  }

  return result;
}
