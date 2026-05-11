import React, { useState, useEffect, useRef, useCallback } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import { evaluate, State, TimeSpan, isPattern, logger } from '@strudel/core';
import { transpiler } from '@strudel/transpiler';
import { useSettings } from '../../../settings.mjs';
import cx from '@src/cx.mjs';
import { CheckIcon, XMarkIcon, PlayIcon, StopIcon, SparklesIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/16/solid';

// === AI Enhancement Modules ===
import { fixInvalidSounds, findInvalidSounds, GENRE_SOUND_MAP } from '../../ai/sounds.js';
import { getExampleForGenre, getAdvancedExampleForGenre } from '../../ai/templates.js';
import { analyzeIntent } from '../../ai/intentAnalyzer.js';
import { translatePrompt, matchVitalPresets, buildPresetGuidance } from '../../ai/musicTranslator.js';
import { buildEnhancedPrompt, buildModifyPrompt } from '../../ai/promptBuilder.js';
import { parseLayers, detectCodeGenre, detectCodeKey, detectCodeBPM } from '../../ai/codeParser.js';
import { generateAlternatives, generateRhythmVariants, generateHarmonyVariants, applyAlternative } from '../../ai/alternatives.js';

/** @typedef {'auto' | 'apiKey' | 'authToken'} AuthStylePref */

/** 默认模型：Sonnet 4.6 在多数中转分组下有路由；若你仍 503，请在界面或 anthropic.provider.json 改成后台「模型广场」里可用的 ID */
const DEFAULT_ANTHROPIC_MODEL = 'claude-sonnet-4-6';

/**
 * 常见模型 ID（datalist 点选）；含 yxai88 文档「第六节 · 支持的模型清单」中的主 ID，
 * 具体以令牌分组 + 后台「模型广场」为准，也可在输入框里任意填写。
 * @see https://yxai88.com/docs/
 */
const ANTHROPIC_MODEL_SUGGESTIONS = [
  DEFAULT_ANTHROPIC_MODEL,
  'claude-sonnet-4-5',
  // Sonnet 4.x（yxai88 文档 · 性价比线）
  'claude-sonnet-4-6-thinking',
  'claude-sonnet-4-5-20250929',
  'claude-sonnet-4-5-20250929-thinking',
  'claude-sonnet-4-20250514',
  // Opus 4.7（含 thinking 档位，文档列出的命名）
  'claude-opus-4-7',
  'claude-opus-4-7-thinking',
  'claude-opus-4-7-low',
  'claude-opus-4-7-medium',
  'claude-opus-4-7-high',
  'claude-opus-4-7-xhigh',
  'claude-opus-4-7-max',
  // Opus 4.6
  'claude-opus-4-6',
  'claude-opus-4-6-thinking',
  'claude-opus-4-6-low',
  'claude-opus-4-6-medium',
  'claude-opus-4-6-high',
  'claude-opus-4-6-xhigh',
  'claude-opus-4-6-max',
  // Opus 4.5 / 旧 Opus 4
  'claude-opus-4-5-20251101',
  'claude-opus-4-5-20251101-thinking',
  'claude-opus-4-1-20250805',
  'claude-opus-4-20250514',
  // Haiku 4.5
  'claude-haiku-4-5-20251001',
  'claude-haiku-4-5-20251001-thinking',
  // Claude 3.x（官方或其它代理常用）
  'claude-3-5-sonnet-20241022',
  'claude-3-5-sonnet-20240620',
  'claude-3-5-haiku-20241022',
  'claude-3-opus-20240229',
  'claude-3-sonnet-20240229',
  'claude-3-haiku-20240307',
];

/**
 * beta.messages + structured output：官方返回 content[0].input；
 * 部分中转只返回 markdown 包裹的 JSON，需去掉 ```json 围栏再 parse。
 */
function parseBetaContentBlock(block) {
  if (!block) {
    throw new Error('模型返回空 content');
  }
  if (block.input != null && typeof block.input === 'object') {
    return block.input;
  }
  const raw = block.text;
  if (raw == null || String(raw).trim() === '') {
    console.error('[Strudel AI] 无 text/input 的块:', block);
    throw new Error('模型未返回可解析的 JSON 字段（中转可能未支持 structured outputs）');
  }
  let s = String(raw).trim();

  // Strip markdown code fences — accept json, javascript, js, or bare ```
  const fenceRe = /^```(?:json|javascript|js)?\s*\r?\n?([\s\S]*?)\r?\n?```\s*$/i;
  const fenceFull = s.match(fenceRe);
  if (fenceFull) {
    s = fenceFull[1].trim();
  } else {
    // Try inner fence (model sometimes wraps JSON in text before/after)
    const fenceInnerRe = /```(?:json|javascript|js)?\s*([\s\S]*?)```/i;
    const fenceInner = s.match(fenceInnerRe);
    if (fenceInner) s = fenceInner[1].trim();
  }
  // Extract JSON object: find first '{' and last '}'
  const i0 = s.indexOf('{');
  const i1 = s.lastIndexOf('}');
  if (i0 !== -1 && i1 > i0) {
    s = s.slice(i0, i1 + 1);
  }

  try {
    return JSON.parse(s);
  } catch (e) {
    // Last resort: strip everything before first '{' more aggressively
    // (handles cases like "Here's the JSON: {...}")
    const jsonStart = s.search(/\{\s*"/);
    if (jsonStart > 0) {
      const retry = s.slice(jsonStart);
      try { return JSON.parse(retry); } catch (_) { /* fall through */ }
    }
    console.error('[Strudel AI] JSON.parse failed, raw:', s.slice(0, 500));
    console.error('[Strudel AI] Full response:', raw?.slice(0, 1000));
    throw new Error(
      `响应不是合法 JSON（常见于中转把内容包在 markdown 里）。${e.message}`,
    );
  }
}

/** Classify API errors into brief human-readable codes */
function briefError(err) {
  const msg = err.message || String(err);
  if (msg === 'TIMEOUT') return 'timed out';
  // Extract error type from JSON body if present
  const typeMatch = msg.match(/"type"\s*:\s*"([^"]+)"/);
  if (typeMatch) {
    const t = typeMatch[1];
    if (t === 'new_api_error') return 'unavailable (model/group)';
    if (t === 'authentication_error') return 'auth failed';
  }
  if (msg.includes('401')) return 'auth failed (401)';
  if (msg.includes('403')) return 'forbidden (403)';
  if (msg.includes('429')) return 'rate limited (429)';
  if (msg.includes('503')) return 'unavailable (503)';
  if (msg.includes('timeout') || msg.includes('timed out')) return 'timed out';
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) return 'offline';
  // Truncate long messages
  return msg.length > 60 ? msg.slice(0, 60) + '…' : msg;
}

/**
 * Quick preflight check: minimal API call to verify connectivity before the heavy request.
 * Uses raw fetch (bypasses SDK) to isolate auth/config vs SDK issues.
 * Returns true on success, or an error description string.
 */
async function quickPreflight(secret, baseURL, authStyle, model) {
  if (!secret) return 'no API key';
  const base = (baseURL || 'https://api.anthropic.com').replace(/\/+$/, '');
  const url = `${base}/v1/messages`;
  const headers = {
    'Content-Type': 'application/json',
    ...(authStyle === 'apiKey' || (!authStyle && !base)
      ? { 'x-api-key': secret }
      : { Authorization: `Bearer ${secret}` }),
  };
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: model || 'claude-sonnet-4-6',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'p' }],
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (res.ok) return true;
    const body = await res.text().catch(() => '');
    // Extract short error
    const short = body.length > 100 ? body.slice(0, 100) + '…' : body;
    return `${res.status} ${short}`;
  } catch (err) {
    return err.message === 'Failed to fetch' ? 'network unreachable' : err.message;
  }
}

function createAnthropicClient(secret, baseURL, authStylePref) {
  const base = (baseURL || '').trim();
  const sec = (secret || '').trim();
  const style =
    authStylePref === 'apiKey' || authStylePref === 'authToken'
      ? authStylePref
      : base
        ? 'authToken'
        : 'apiKey';
  // Diagnostic: log masked config to help debug auth issues
  const masked = sec ? `${sec.slice(0, 6)}...${sec.slice(-4)}` : '(empty)';
  console.info(`[AI] Auth: ${style} | base=${base || '(default)'} | key=${masked} | length=${sec.length}`);
  if (!sec) {
    console.warn('[AI] ⚠️  No API key configured — requests will fail with 401');
  }

  // Route through vital-bridge proxy to avoid CORS blocks in browser.
  // The bridge's /api-proxy endpoint forwards to the real provider (X-Proxy-Target header).
  const BRIDGE_URL = 'http://localhost:8765';
  const realBase = base || 'https://api.anthropic.com';

  return new Anthropic({
    baseURL: `${BRIDGE_URL}/api-proxy`,
    defaultHeaders: { 'x-proxy-target': realBase },
    ...(style === 'authToken' ? { authToken: sec } : { apiKey: sec }),
    dangerouslyAllowBrowser: true,
    timeout: 180_000, // 3 min — proxy adds slight overhead
  });
}

async function validateCode(code) {
  try {
    const { pattern } = await evaluate(code, transpiler);
    if (!isPattern(pattern)) {
      // If it's not a pattern, it might be just setup code, which is allowed.
      // But if it returns something that isn't a pattern (and isn't undefined), that's suspicious.
      if (pattern !== undefined) {
        return `Code returned ${typeof pattern} instead of a Pattern. Did you forget to use s() or stack()?`;
      }
      return null;
    }
    // Try to query the pattern to check for runtime errors
    // We use a dummy state with a small timespan
    pattern.query(new State(new TimeSpan(0, 1/4)));
    return null;
  } catch (err) {
    return err.message;
  }
}

const SYSTEM_PROMPT = `# Strudel Expert DJ Prompt

You are an expert live-coding DJ specializing in Strudel/TidalCycles. Your task is to create **rich, layered, and immersive** electronic music with professional sound design.

## ⚠️ CRITICAL: Sound Source Rules (READ FIRST)

### ✅ REQUIRED: Use Vital Presets for ALL melodic/harmonic/textural sounds
This environment has **2300+ Vital synthesizer presets** that produce professional, rich sounds. You MUST use them for every non-drum element.

**Loading & Playing:**
\`\`\`javascript
await vital('Preset Name');  // Load once at top of code
n("c3 e3 g3").s("vital_preset_name")  // Play with lowercase+underscores
\`\`\`

**Category reference** (2300+ presets, pick by instrument type):
| Type  | Count | Top Picks |
|-------|-------|-----------|
| Bass  | 324   | \`Thicccboi 808\`, \`Psytrance Bass\`, \`BA - Rubber Bounciness\`, \`BA - Deep House\`, \`BA - Neurofunk\`, \`808 Bass 4\` |
| Lead  | 152   | \`Super Pluck\`, \`LD - Supersaw\`, \`LD - Future Bass\`, \`LD - Trap Lead\`, \`LD - Acid\` |
| Pad   | 178   | \`DRONE Floating\`, \`Analog Pad\`, \`PD - Warm Pad\`, \`PD - Lush\`, \`PD - Cinematic\`, \`PD - Dark\` |
| Pluck | 184   | \`Plucked String\`, \`PL - Future Bass\`, \`PL - Bright\`, \`PL - Soft\` |
| Keys  | 142   | \`KEYS - Electric Piano\`, \`KEYS - Organ\`, \`KEYS - FM Bell\` |
| Bell  | 61    | \`BELL Koto Bell\`, \`Digital Mallets\`, \`BELL - Glass\` |
| Chord | 52    | \`CHORD - House\`, \`CHORD - Deep\`, \`CHORD - Stab\` |
| FX    | 32    | \`Special Glitch Thing\`, \`FX - Riser\`, \`FX - Downer\`, \`FX - Noise Sweep\` |
| Arp   | 27    | \`ARP - Classic\`, \`ARP - Plucky\`, \`ARP - Trance\` |
| World | 20+   | \`Sitar\`, \`PL - Eastern\`, \`BELL - Koto\`, \`Ethnic Flute\` |

**Style tags** you can target: warm, dark, bright, ambient, aggressive, cinematic, retro, acid, analog, digital, clean, dirty, space, dreamy, lo-fi, wide, punchy, soft, evolving, classic, modern.

### ❌ FORBIDDEN: Native synth sounds (these sound "plastic" and cheap)
**NEVER use these sound names:** \`sawtooth\`, \`sine\`, \`triangle\`, \`square\`, \`supersaw\`, \`pulse\`, \`noise\`, \`gm_synth_bass_1\`, \`gm_lead_2_sawtooth\`, \`gm_pad_warm\`, or any \`gm_*\` sound.
**Instead:** find the matching Vital preset from the table above.

### ✅ Drums & Percussion: Use dirt-samples
Drums are the ONLY exception — use sample-based percussion:
\`s("bd")\`, \`s("hh")\`, \`s("sd")\`, \`s("cp")\`, \`s("rim")\`, \`s("cr")\`, \`s("lt")\`, \`s("mt")\`, \`s("ht")\`, \`s("oh")\`
With banks: \`s("bd").bank("808")\`, \`s("bd").bank("909")\`, etc.

### How a Correct Track Looks:
\`\`\`javascript
// 1. Load Vital presets at the top
await vital('Thicccboi 808');
await vital('Super Pluck');
await vital('PD - Warm Pad');

stack(
  // Drums (samples)
  s("bd*4").bank("808").shape(0.6).o(0),
  s("hh*8").bank("808").o(3),
  s("sd").bank("808").o(1),

  // Bass (Vital)
  n("c2").s("vital_thicccboi_808").lpf(400).o(2),

  // Lead (Vital)
  n("<[0 3]@2 [2 5]>").scale("c:minor")
    .s("vital_super_pluck").o(4),

  // Pad (Vital)
  n("c3'min").s("vital_pd_warm_pad")
    .room(0.6).gain(0.3).o(5)
)
\`\`\`

## Core Philosophy

You create **dense, professional-quality compositions** with:
- Multiple complementary layers (typically 8-15 elements)
- Carefully crafted frequency spectrum coverage (sub, bass, mids, highs)
- Dynamic stereo field utilization
- Evolving textures and atmospheres
- Professional mixing techniques (EQ separation, ducking, spatial effects)

## Critical Helper Functions

You MUST include these helper functions at the top of your code if you use them (which is recommended for sophisticated effects). They provide essential DSP and pattern capabilities.

\`\`\`javascript
register('o', (orbit, pat) => pat.orbit(orbit))
setGainCurve(x => Math.pow(x, 2))

// Fills gaps in patterns to create legato lines
register('fill', function (pat) {
  return new Pattern(function (state) {
    const lookbothways = 1;
    const haps = pat.query(state.withSpan(span => new TimeSpan(span.begin.sub(lookbothways), span.end.add(lookbothways))));
    const onsets = haps.map(hap => hap.whole.begin)
      .sort((a, b) => a.compare(b))
      .filter((x, i, arr) => i == (arr.length - 1) || x.ne(arr[i + 1]));
    const newHaps = [];
    for (const hap of haps) {
      if (hap.part.begin.gte(state.span.end)) { continue; }
      const next = onsets.find(onset => onset.gte(hap.whole.end));
      if (next.lte(state.span.begin)) { continue; }
      const whole = new TimeSpan(hap.whole.begin, next);
      const part = new TimeSpan(hap.part.begin.max(state.span.begin), next.min(state.span.end));
      newHaps.push(new Hap(whole, part, hap.value, hap.context, hap.stateful));
    }
    return newHaps;
  });
});

// Random rhythmic gating effect
register('trancegate', (density, seed, length, x) => {
  return x.struct(rand.mul(density).round().seg(16).rib(seed, length)).fill().clip(.7)
})

// Quantizes notes to a specific scale
    register('grab', function (scale, pat) {
      scale = (Array.isArray(scale) ? scale.flat() : [scale]).flatMap((val) =>
        typeof val === 'number' ? val : noteToMidi(val) - 48
      );
      return pat.withHap((hap) => {
        const isObject = typeof hap.value === 'object';
        let note = isObject ? hap.value.n : hap.value;
        if (typeof note === 'number') { note = note; }
        if (typeof note === 'string') { note = noteToMidi(note); }
        if (isObject) { delete hap.value.n; }
        const octave = (note / 12) >> 0;
        const transpose = octave * 12;
        const goal = note - transpose;
        note = scale.reduce((prev, curr) => {
            return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev;
          }) + transpose;
        return hap.withValue(() => (isObject ? { ...hap.value, note } : note));
      });
    });
    
    setDefault('gain', 1)
    
    // Multi-orbit panner
    register('mpan', (orbits, amount, pat) => {
      const index = Math.round(amount * (orbits.length - 1))
      const orbit = orbits[index]
      const pamt = (amount * orbits.length) % 1
      return pat.orbit(orbit).pan(pamt)
    })
    
    // Resonant filters mapped for slider usage
    register('rlpf', (x, pat) => { return pat.lpf(pure(x).mul(12).pow(4)) })
    register('rhpf', (x, pat) => { return pat.hpf(pure(x).mul(12).pow(4)) })
    
    // Acid envelope helper
    register('acidenv', (x, pat) => pat.rlpf(.25).lpenv(x * 9).lps(.2).lpd(.15))

    // Beat sequencer helper (prevents crashes)
    register('beat', (onsets, length, pat) => pat)
    \`\`\`
    
    ## Advanced Techniques for "Alive" Tracks
    
    1. **Polyrhythmic Mini-Notation**: Use \`@\` for duration changes and complex nesting.
       - Example: \`n("<[3 5]@2 [4 6] [7 5]@2 [6 4]>*2")\`
    2. **Thick Voicings**: Add offsets to note patterns to create chords without using \`stack\` for every note.
       - Example: \`n("c3 g3").add("0, 7, 12")\` (adds octaves and fifths)
    3. **Alive Modulation**: Use \`perlin\` and \`time\` for organic movement.
       - Example: \`pan(perlin.range(0.3, 0.7))\` or \`fm(time.mul(2))\`
    4. **Granular Textures**: Use \`scrub\` with random segments for glitchy backgrounds.
       - Example: \`s("techno:4").scrub(rand.seg(16).rib(46, 2))\`
    
    ## IMPORTANT: Valid Code Rules

1. **Scale Syntax**: You MUST use colons instead of spaces for scale names.
   - BAD: \`.scale("C:minor pentatonic")\` (causes "incomplete scale name" error)
   - GOOD: \`.scale("C:minor:pentatonic")\`
   - BAD: \`.scale("C4 minor")\`
   - GOOD: \`.scale("C:minor")\` (control octave with \`n\` or \`transpose\`, not in scale name)

2. **Pattern Arithmetic**: NEVER use JavaScript arithmetic operators (+, -, *, /) on patterns.
   - BAD: \`slider(1) + 10\`
   - GOOD: \`slider(1).add(10)\`
   - BAD: \`lpf(slider(0.5) * 1000)\`
   - GOOD: \`lpf(slider(0.5).mul(1000))\`

3. **Tempo and Rhythm**: \`setCpm(X)\` sets cycles per minute. Strudel patterns default to **1 cycle = 1 measure (4 beats)**.
   - To achieve X BPM in 4/4 time, use \`setCpm(X/4)\`.
   - **CRITICAL**: If you use \`setCpm(X/4)\`, you MUST write patterns that fill the cycle with 4 beats of content.
   - If you write sparse patterns (e.g. \`s("bd")\` which is 1 event per cycle), and use \`setCpm(X/4)\`, it will sound 4x too slow (quarter note speed).
   - **Correct Techno Kick**: \`s("bd*4")\` (4 kicks per cycle) at \`setCpm(130/4)\` = 130 kicks/min.
   - **Incorrect Techno Kick**: \`s("bd")\` (1 kick per cycle) at \`setCpm(130/4)\` = 32.5 kicks/min (Too Slow).

4. **Sound Loading & Samples**:
   - You MUST ensure sounds are loaded before using them.
   - **Default Samples**: \`casio\`, \`crow\`, \`insect\`, \`wind\`, \`jazz\`, \`metal\`, \`east\`, \`space\`, \`numbers\`, \`num\`, \`piano\` (synth), \`vcsl\` (instruments).
   - **Tidal Samples**: To use standard Tidal sounds, you MUST load them:
     \`\`\`javascript
     samples('github:tidalcycles/dirt-samples');
     \`\`\`
   - **FORBIDDEN SAMPLES (Do NOT Use)**:
     - \`shaker\` (NOT available. Use \`hh\` or \`odx:2\`).
     - \`gtr-nylon\` (NOT available. Use \`gtr\`).
     - \`djembe\` (NOT available).
   - **VERIFIED \`dirt-samples\` KEYS**: \`808\`, \`909\`, \`ade\`, \`amencutup\`, \`arpy\`, \`auto\`, \`bass\`, \`bd\`, \`bend\`, \`birds\`, \`bleep\`, \`blip\`, \`breaks125\`, \`bubble\`, \`can\`, \`casio\`, \`clak\`, \`click\`, \`coins\`, \`cp\`, \`cr\`, \`crow\`, \`d\`, \`dist\`, \`drum\`, \`drumtraks\`, \`east\`, \`electro1\`, \`feel\`, \`feelfx\`, \`fire\`, \`flick\`, \`fm\`, \`future\`, \`gab\`, \`glitch\`, \`gretsch\`, \`gtr\`, \`h\`, \`hand\`, \`hardcore\`, \`haw\`, \`hc\`, \`hh\`, \`hit\`, \`ho\`, \`house\`, \`incoming\`, \`industrial\`, \`insect\`, \`invaders\`, \`jazz\`, \`jungbass\`, \`jungle\`, \`juno\`, \`kurt\`, \`latibro\`, \`linnhats\`, \`made\`, \`mash\`, \`metal\`, \`moog\`, \`mouth\`, \`mp3\`, \`msg\`, \`mt\`, \`newnotes\`, \`noise\`, \`numbers\`, \`oc\`, \`odx\`, \`off\`, \`pad\`, \`padlong\`, \`perc\`, \`peri\`, \`pluck\`, \`popkick\`, \`print\`, \`proc\`, \`rave\`, \`rm\`, \`rs\`, \`sax\`, \`sd\`, \`sequential\`, \`sf\`, \`short\`, \`sid\`, \`sitar\`, \`sn\`, \`space\`, \`speakspell\`, \`speech\`, \`stab\`, \`stomp\`, \`sundance\`, \`tabla\`, \`tech\`, \`techno\`, \`tink\`, \`tok\`, \`toys\`, \`trump\`, \`ul\`, \`v\`, \`voodoo\`, \`wind\`, \`wobble\`, \`world\`, \`xmas\`, \`yeah\`.


## Slider Usage Guide for Maximum Control

Sliders are CRITICAL for live performance. You must provide sliders that allow the user to control the energy and timbre of the track.

**Rules:**
1.  **Never use \`pure()\` around a slider.** Sliders return patterns.
2.  **Use sliders for expression.** Filter cutoffs, decay times, reverb amounts, FM indices.
3.  **Combine sliders.** One slider can control multiple parameters to create macro controls (e.g., "Energy" slider increases cutoff and reverb size simultaneously).

**Example:**
\`\`\`javascript
const energy = slider(0.5); // 0 to 1
const cutoff = energy.mul(1000).add(200); // Map to 200-1200Hz
s("sawtooth").lpf(cutoff).decay(energy.mul(0.5).add(0.1))
\`\`\`

## Genre Examples (ALL using Vital presets)

### 1. Trance / Hard Techno (Peak Time)
Focus on huge supersaw stacks, rhythmic gating, and driving percussion.
\`\`\`javascript
await vital('Super Pluck');
await vital('Psytrance Bass');
await vital('PD - Cinematic');

stack(
  // Driving Lead with Trancegate (Vital)
  n("<[0 3]@2 [2 5] [-2 0]@2 [3 7]>*2".add("-12,-19"))
    .scale("g:minor")
    .s("vital_super_pluck")
    .trancegate(2.2, 45, 1).o(1)
    .rlpf(slider(0.8)).lpenv(2.5).shape(0.5).gain(0.8),

  // Acid Bass (Vital)
  n("g1").add("<0 12 0 7>").scale("g:minor")
    .s("vital_psytrance_bass").acidenv(slider(0.5)).o(2),

  // Atmosphere Pad (Vital)
  n("g3'min").s("vital_pd_cinematic")
    .room(0.7).gain(0.25).o(4),

  // Rumble Kick (sample)
  s("bd*4").bank("909").shape(0.6).lpf(200).o(0),
  s("hh*8").bank("909").o(3)
)
\`\`\`

### 2. Drum & Bass (Liquid/Tech)
Focus on fast breaks (170bpm), deep bass, and airy pads.
\`\`\`javascript
setCpm(174/4)
await vital('BA - Neurofunk');
await vital('PD - Lush');

stack(
  // Break (sample)
  s("amen:0").loop(2).cut(1).hpf(slider(0)).o(1),

  // Neuro Bass (Vital)
  n("f1").s("vital_ba_neurofunk")
    .lpf(400).shape(0.5).duck("1").o(2),

  // Lush Pad (Vital)
  n("f2'min").s("vital_pd_lush")
    .room(0.8).gain(0.3).o(3)
)
\`\`\`

### 3. Ambient / Drone
Focus on long evolving pads, random modulation, and generative textures.
\`\`\`javascript
await vital('DRONE Floating');
await vital('PD - Warm Pad');

n(irand(12).segment(8)).grab("c:minor")
  .s("vital_drone_floating").decay(2).delay(1).room(0.9).o(1)
\`\`\`

### 4. Hyperpop / Bubblegum Bass
Bright, energetic, with punchy bass and playful plucks.
\`\`\`javascript
await vital('BA - Rubber Bounciness');
await vital('Plucked String');
await vital('PD - Bright');

stack(
  s("bd*4").bank("808").shape(0.5).o(0),
  s("hh*8").speed(1.5).o(3),

  // Bouncy Bass (Vital)
  n("c2 [c2 ~] c2 [c2 ~]").s("vital_ba_rubber_bounciness")
    .lpf(600).gain(0.8).o(1),

  // Bright Pluck (Vital)
  n("<0 2 4 5>").scale("c:major")
    .s("vital_plucked_string").decay(0.3).o(2)
)
\`\`\`

### 5. Lo-Fi / Chillhop
Warm, relaxed, dusty textures.
\`\`\`javascript
await vital('KEYS - Electric Piano');
await vital('PD - Warm Pad');
await vital('PL - Soft');

stack(
  s("bd").bank("808").o(0),
  s("hh*4").speed(0.8).o(1),

  // Warm Keys (Vital)
  n("<0 2 3 5>").scale("d:minor")
    .s("vital_keys_electric_piano").room(0.3).o(2),

  // Soft Pad (Vital)
  n("d3'min").s("vital_pd_warm_pad")
    .room(0.6).gain(0.25).o(3)
)
\`\`\``

## Output Format

You must output a JSON object with:
1.  **code**: The complete, runnable Strudel code. CRITICAL: The code string MUST be formatted with newline characters (\`\\n\`), proper indentation (2 spaces), and spacing. DO NOT output a single line string.
2.  **rationale**: A detailed commentary (2-3 paragraphs) explaining:
    *   **Sonic Concept**: The mood and journey.
    *   **Technical Choices**: Why you used specific helpers (e.g., \`trancegate\` for rhythmic gating) or sound design techniques.
    *   **Performance Guide**: Specific instructions for the DJ on how to use the generated sliders to build tension and release (e.g., "Start with the 'Energy' slider at 0 for a muffled intro, then slowly raise to 0.8 for the drop").

`;

const MODIFY_SYSTEM_PROMPT = `# Strudel AI Modification Expert

You are an expert Strudel/TidalCycles live-coder. Your task is to modify existing code based on user requests by generating minimal, precise patches.

## Output Format

You must output a JSON object with:
1. "reasoning": A high-level explanation of the changes.
2. "patches": An array of patch objects, where each object contains:
    - "target": A short name for the component being modified.
    - "search": The EXACT string snippet to find in the original code. Must be unique enough to find the correct location.
    - "replace": The EXACT string replacement.
    - "intent": Why this specific change is being made.
   
## IMPORTANT: Valid Code Rules

1. **Scale Syntax**: You MUST use colons instead of spaces for scale names.
   - BAD: \`.scale("C:minor pentatonic")\` (causes "incomplete scale name" error)
   - GOOD: \`.scale("C:minor:pentatonic")\`
   - BAD: \`.scale("C4 minor")\`
   - GOOD: \`.scale("C:minor")\` (control octave with \`n\` or \`transpose\`, not in scale name)

2. **Pattern Arithmetic**: NEVER use JavaScript arithmetic operators (+, -, *, /) on patterns.
   - BAD: \`slider(1) + 10\`
   - GOOD: \`slider(1).add(10)\`
   - BAD: \`lpf(slider(0.5) * 1000)\`
   - GOOD: \`lpf(slider(0.5).mul(1000))\`

3. **Tempo and Rhythm**: \`setCpm(X)\` sets cycles per minute. Strudel patterns default to **1 cycle = 1 measure (4 beats)**.
   - To achieve X BPM in 4/4 time, use \`setCpm(X/4)\`.
   - **CRITICAL**: If you use \`setCpm(X/4)\`, you MUST ensure your patterns are dense enough (e.g. \`s("bd*4")\` for 4-on-the-floor) so it doesn't sound like X/4 BPM.

4. **Sound Loading & Samples**:
   - You MUST ensure sounds are loaded before using them.
   - **Default Samples**: \`casio\`, \`crow\`, \`insect\`, \`wind\`, \`jazz\`, \`metal\`, \`east\`, \`space\`, \`numbers\`, \`num\`, \`piano\` (synth), \`vcsl\` (instruments).
   - **Tidal Samples**: To use standard Tidal sounds, you MUST load them:
     \`\`\`javascript
     samples('github:tidalcycles/dirt-samples');
     \`\`\`
   - **FORBIDDEN SAMPLES (Do NOT Use)**:
     - \`shaker\` (NOT available. Use \`hh\` or \`odx:2\`).
     - \`gtr-nylon\` (NOT available. Use \`gtr\`).
     - \`djembe\` (NOT available).
   - **VERIFIED \`dirt-samples\` KEYS**: \`808\`, \`909\`, \`ade\`, \`amencutup\`, \`arpy\`, \`auto\`, \`bass\`, \`bd\`, \`bend\`, \`birds\`, \`bleep\`, \`blip\`, \`breaks125\`, \`bubble\`, \`can\`, \`casio\`, \`clak\`, \`click\`, \`coins\`, \`cp\`, \`cr\`, \`crow\`, \`d\`, \`dist\`, \`drum\`, \`drumtraks\`, \`east\`, \`electro1\`, \`feel\`, \`feelfx\`, \`fire\`, \`flick\`, \`fm\`, \`future\`, \`gab\`, \`glitch\`, \`gretsch\`, \`gtr\`, \`h\`, \`hand\`, \`hardcore\`, \`haw\`, \`hc\`, \`hh\`, \`hit\`, \`ho\`, \`house\`, \`incoming\`, \`industrial\`, \`insect\`, \`invaders\`, \`jazz\`, \`jungbass\`, \`jungle\`, \`juno\`, \`kurt\`, \`latibro\`, \`linnhats\`, \`made\`, \`mash\`, \`metal\`, \`moog\`, \`mouth\`, \`mp3\`, \`msg\`, \`mt\`, \`newnotes\`, \`noise\`, \`numbers\`, \`oc\`, \`odx\`, \`off\`, \`pad\`, \`padlong\`, \`perc\`, \`peri\`, \`pluck\`, \`popkick\`, \`print\`, \`proc\`, \`rave\`, \`rm\`, \`rs\`, \`sax\`, \`sd\`, \`sequential\`, \`sf\`, \`short\`, \`sid\`, \`sitar\`, \`sn\`, \`space\`, \`speakspell\`, \`speech\`, \`stab\`, \`stomp\`, \`sundance\`, \`tabla\`, \`tech\`, \`techno\`, \`tink\`, \`tok\`, \`toys\`, \`trump\`, \`ul\`, \`v\`, \`voodoo\`, \`wind\`, \`wobble\`, \`world\`, \`xmas\`, \`yeah\`.

5. **Visual Feedback**

  Enhance the performance with reactive visualizations:
  - **Standard**: \`._scope()\` (waveform), \`._spectrum()\` (frequency)
  - **Radial (New)**: \`._rscope()\` (circular waveform), \`._rspectrum()\` (circular frequency)

  \`\`\`javascript
  // Attach to master or specific layers
  stack(
    kick, 
    bass
  )._rscope({ color: "cyan", scale: 0.5 })
  \`\`\`

5. **Vital Presets (SVLive)** — Load with \`await vital('Name')\`. Play with \`.s("vital_name")\`. Available: 2300+ presets (bass, pad, lead, pluck, bell, world, fx). Use for synths; keep drums as Tidal samples.

## Rules
- Keep changes minimal. Do not rewrite the whole file.
- Ensure "search" strings exactly match existing code (whitespace and all).
- Ensure "replace" strings are valid Strudel code that fits into the context.
`;

const DJ_SYSTEM_PROMPT = `# Strudel AI DJ Agent

You are an autonomous AI DJ performing live. Your goal is to "perform" the track by evolving the code over time.

## Performance Strategy
You are in the middle of a set. Look at the current code and decide on the next moves to keep the audience engaged.
Do NOT simply rewrite the track. Perform **actions** on it.

**Queue your changes**: You can specify a delay for each patch to create a sequence of events (e.g., drop the bass in 4 seconds, then bring in the hi-hats 8 seconds later).

### Valid Actions (Choose 1-2 sequences per turn):
1. **Variation**: Change the rhythm or melody of an existing layer.
2. **Texture**: Add effects (reverb, delay, distortion) or change synth parameters (cutoff, decay).
3. **Arrangement**: Mute/unmute parts, add a new layer, or remove a layer.
4. **Dynamics**: Manipulate sliders or gain to build tension or release.
5. **Transition**: Prepare for a drop or a breakdown.

## Output Format
Return a JSON object with:
1. "reasoning": A concise thought process.
2. "patches": An array of patch objects:
    - "target": Component name
    - "search": EXACT code to replace
    - "replace": New code
    - "intent": Description of the change
    - "delay": (Optional) Number of seconds to wait before applying this patch (default 0). Use this to queue changes!

## Rules
- **Be Incremental**: Small changes are better than big ones.
- **Plan Ahead**: Use the 'delay' field to line up changes.
- **Maintain Continuity**: Don't change the BPM or key unless it's a deliberate transition.
- **Valid Code**: Ensure all changes result in valid Strudel code.
`;

const modifySchema = {
  type: "object",
  properties: {
    reasoning: { type: "string", description: "A high-level explanation of the changes." },
    patches: {
      type: "array",
      items: {
        type: "object",
        properties: {
            target: { type: "string", description: "Target component name" },
            search: { type: "string", description: "Exact code string to find" },
            replace: { type: "string", description: "Exact code string to replace with" },
            intent: { type: "string", description: "Explanation for this specific patch" },
            delay: { type: "number", description: "Seconds to wait before applying this patch (0 for immediate)" }
        },
        required: ["target", "search", "replace", "intent"],
        additionalProperties: false
      }
    }
  },
  required: ["reasoning", "patches"],
  additionalProperties: false
};

export function AITab({ context }) {
  const [apiKey, setApiKey] = useState('');
  const [baseURL, setBaseURL] = useState('');
  const [authStylePref, setAuthStylePref] = useState(/** @type {AuthStylePref} */ ('auto'));
  const [modelId, setModelId] = useState(DEFAULT_ANTHROPIC_MODEL);
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState('generate'); // 'generate', 'modify', 'dj', or 'alternatives'
  const [isLoading, setIsLoading] = useState(false);
  const [processingHint, setProcessingHint] = useState('');
  const [streamingText, setStreamingText] = useState(''); // Real-time streaming output
  const [error, setError] = useState(null);
  const [rationale, setRationale] = useState(null);
  const [pendingPatches, setPendingPatches] = useState([]); // Store patches for approval
  const [isDJMode, setIsDJMode] = useState(false);
  const [djInterval, setDjInterval] = useState(15000); // 15 seconds default
  const { fontFamily } = useSettings();

  // Alternatives panel state
  const [alternatives, setAlternatives] = useState(null); // { layers, rhythmVariants, harmonyVariants }
  const [altLoading, setAltLoading] = useState(false);

  // DJ Mode state
  const [djStatus, setDjStatus] = useState('idle'); // 'idle', 'thinking', 'queued'
  const [queuedPatches, setQueuedPatches] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    (async () => {
      let file = null;
      try {
        const r = await fetch('/anthropic.provider.json', { cache: 'no-store' });
        if (r.ok) file = await r.json();
      } catch (_) {
        /* ignore */
      }

      let secret = localStorage.getItem('anthropic_api_key') || '';
      let base = localStorage.getItem('anthropic_base_url') || '';
      let pref = /** @type {AuthStylePref} */ (
        localStorage.getItem('anthropic_auth_style_pref') || 'auto'
      );
      let model = localStorage.getItem('anthropic_model')?.trim() || '';

      if (file && typeof file === 'object') {
        // baseURL / auth always sync from file
        if (typeof file.baseURL === 'string' && file.baseURL.trim()) base = file.baseURL.trim();
        const lsKey = secret;
        if (typeof file.authToken === 'string' && file.authToken.trim()) secret = file.authToken.trim();
        else if (typeof file.apiKey === 'string' && file.apiKey.trim()) secret = file.apiKey.trim();
        if (file.authStyle === 'authToken') pref = 'authToken';
        else if (file.authStyle === 'apiKey') pref = 'apiKey';
        // Diagnostic
        if (secret !== lsKey) {
          const maskedOld = lsKey ? `${lsKey.slice(0, 4)}...${lsKey.slice(-4)}` : '(empty)';
          const maskedNew = `${secret.slice(0, 6)}...${secret.slice(-4)}`;
          console.info(`[AI] Key source: provider.json (${maskedNew}) overrides localStorage (${maskedOld})`);
        }
        // Model: only use file as fallback when user hasn't explicitly set one
        if (!model) {
          if (typeof file.model === 'string' && file.model.trim()) model = file.model.trim();
          else if (typeof file.modelId === 'string' && file.modelId.trim()) model = file.modelId.trim();
        }
      }
      if (!model) model = DEFAULT_ANTHROPIC_MODEL;

      // yxai88 等分组常无 claude-sonnet-4-5；浏览器里若仍存 4.5 会反复 503，迁到默认 4.6
      if (model === 'claude-sonnet-4-5' && base.includes('yxai88')) {
        model = DEFAULT_ANTHROPIC_MODEL;
        localStorage.setItem('anthropic_model', model);
      }

      setBaseURL(base);
      setApiKey(secret);
      setAuthStylePref(pref === 'apiKey' || pref === 'authToken' || pref === 'auto' ? pref : 'auto');
      setModelId(model);
    })();
  }, []);

  // Re-sync from localStorage when settings tab updates (same-window workaround)
  useEffect(() => {
    const syncFromStorage = () => {
      setApiKey(localStorage.getItem('anthropic_api_key') || '');
      setBaseURL(localStorage.getItem('anthropic_base_url') || '');
      setAuthStylePref(localStorage.getItem('anthropic_auth_style_pref') || 'auto');
      setModelId(localStorage.getItem('anthropic_model') || DEFAULT_ANTHROPIC_MODEL);
    };
    // Listen for storage events (cross-tab) and custom event (same-tab)
    window.addEventListener('storage', syncFromStorage);
    window.addEventListener('ai-settings-changed', syncFromStorage);
    return () => {
      window.removeEventListener('storage', syncFromStorage);
      window.removeEventListener('ai-settings-changed', syncFromStorage);
    };
  }, []);

  const handleApiKeyChange = (e) => {
    const key = e.target.value;
    setApiKey(key);
    localStorage.setItem('anthropic_api_key', key);
  };

  const handleModelIdChange = (e) => {
    const v = e.target.value;
    setModelId(v);
    localStorage.setItem('anthropic_model', v);
  };

  const getCurrentCode = () => {
    if (context.editorRef?.current?.view) {
      return context.editorRef.current.view.state.doc.toString();
    }
    return context.activeCode || '';
  };

  // === Claude Code (local CLI) mode ===
  const [ccOutput, setCcOutput] = useState('');
  const BRIDGE_URL = 'http://localhost:8765';

  // === Console logging helper — outputs to both browser console and Strudel Console tab ===
  const log = useCallback((message, type = '') => {
    const prefix = '[AI]';
    console.info(`${prefix} ${message}`);
    try {
      // logger() is a function that dispatches a CustomEvent on document
      logger(`${prefix} ${message}`, type || undefined, {});
    } catch (_) { /* ignore */ }
  }, []);

  // === Elapsed time counter ===
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);
  const elapsedSecRef = useRef(0);  // ref for stable access in closures

  const startTimer = useCallback(() => {
    setElapsed(0);
    elapsedSecRef.current = 0;
    const start = Date.now();
    timerRef.current = setInterval(() => {
      const sec = Math.round((Date.now() - start) / 1000);
      elapsedSecRef.current = sec;
      setElapsed(sec);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  useEffect(() => () => stopTimer(), [stopTimer]);

  const runClaudeCode = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setProcessingHint('Running Claude Code...');
    setError(null);
    setRationale(null);
    setPendingPatches([]);
    setCcOutput('');

    try {
      const currentCode = getCurrentCode();
      const res = await fetch(`${BRIDGE_URL}/claude/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: currentCode,
          request: prompt,
          mode: mode === 'generate' ? 'generate' : 'modify',
        }),
        signal: AbortSignal.timeout(190000), // 190s, server has 180s
      });

      const data = await res.json();
      setCcOutput(data.output || '');

      if (data.ok && data.changed) {
        // Apply the modified code to editor
        context.editorRef.current.setCode(data.code);
        context.editorRef.current.evaluate();
        setRationale('Claude Code applied changes. Check the editor for modifications.');
      } else if (data.ok && !data.changed && mode === 'generate') {
        context.editorRef.current.setCode(data.code);
        context.editorRef.current.evaluate();
        setRationale('Claude Code generated new code. Check the editor.');
      } else if (!data.ok) {
        setError(data.error || 'Claude Code failed');
      } else {
        setRationale('No changes were made.');
      }
    } catch (err) {
      setError(err.message === 'Failed to fetch'
        ? 'vital-bridge not running. Start: uvicorn server:app --port 8765'
        : err.message);
    } finally {
      setIsLoading(false);
      setProcessingHint('');
    }
  };

  const generateResponse = async (isAutoDJ = false) => {
    if (!apiKey) {
      setError('Please enter an API Key');
      return;
    }
    if (!prompt.trim() && !isAutoDJ) {
      setError('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setProcessingHint('Connecting...');
    setStreamingText('');
    startTimer();
    const resolvedModel = (modelId || '').trim() || DEFAULT_ANTHROPIC_MODEL;
    log(`Starting ${mode} request → ${resolvedModel} @ ${baseURL || 'api.anthropic.com'}`);
    setError(null);
    if (!isAutoDJ) {
      setRationale(null);
      setPendingPatches([]);
    }

    try {
      const client = createAnthropicClient(apiKey, baseURL, authStylePref);

      const currentCode = getCurrentCode();

      // === Module A: Intent Analysis (LLM-based translation + preset matching) ===
      let intent, presetGuidance = '';
      try {
        setProcessingHint('Analyzing musical intent...');
        // Time-box translation to 15s — if API is down, we fall back fast
        const terms = await Promise.race([
          translatePrompt(client, prompt || '', resolvedModel),
          new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 15000)),
        ]);
        // BPM defaults per genre (same as intentAnalyzer's DEFAULT_BPMS)
        const genreBPM = { house:124, techno:133, trance:140, ambient:70, jazz:95, dnb:174, hiphop:90, trap:145, lofi:78, dubstep:140, reggae:80, funk:110, garage:134, classical:80, hyperpop:160, synthwave:100, latin:110 };
        intent = {
          genre: terms.genre,
          bpm: terms.bpm || genreBPM[terms.genre] || 120,
          key: terms.key || 'C:minor',
          mood: terms.mood?.[0] || 'energetic',
          complexity: 'medium',
        };
        log(`Intent: ${terms.genre} | ${terms.bpm || '?'}bpm | ${(terms.mood || []).join(', ')} | ${terms.description}`);

        // === Module A2: Preset Matching ===
        setProcessingHint('Finding matching sounds...');
        const matchResult = await matchVitalPresets(terms);
        const instrumentCount = Object.keys(matchResult.presets).length;
        if (instrumentCount > 0) {
          log(`Matched presets for ${instrumentCount} instrument types (${matchResult.matchedSoundTags.join(', ') || 'no style tags'})`);
          presetGuidance = buildPresetGuidance(matchResult);
        } else {
          log('No Vital presets matched — model will choose sounds freely');
        }
      } catch (transErr) {
        // Fast path: regex analyzer when LLM translate is unavailable
        const reason = briefError(transErr);
        intent = analyzeIntent(prompt || '');
        log(`Intent (local): ${intent.genre} | ${intent.bpm}bpm | ${intent.mood} (LLM translate: ${reason})`);
      }

      let userMessage = prompt;
      // === Module B: Dynamic Prompt Building ===
      let systemPrompt = buildEnhancedPrompt(intent, prompt || '', SYSTEM_PROMPT, presetGuidance);
      let schema = {
        type: "object",
        properties: {
          code: { type: "string", description: "The complete valid Strudel code snippet. MUST contain newline characters (\\n) for proper formatting and readability." },
          rationale: { type: "string", description: "Commentary on the music and performance suggestions" }
        },
        required: ["code", "rationale"],
        additionalProperties: false
      };

      if (mode === 'modify' || isAutoDJ) {
        const request = isAutoDJ
          ? (prompt || "Evolve the track musically. Surprise me, but keep it coherent.")
          : prompt;

        userMessage = `Here is the current strudel code:\n\n\`\`\`javascript\n${currentCode}\n\`\`\`\n\nRequest: ${request}\n\nIf the code is empty or the request cannot be fulfilled with patches, please explain why in the reasoning and return an empty patches array.`;
        // === Module B: Enhanced modify/DJ prompts ===
        systemPrompt = isAutoDJ
          ? DJ_SYSTEM_PROMPT + presetGuidance
          : buildModifyPrompt(intent, currentCode, MODIFY_SYSTEM_PROMPT, presetGuidance);
        schema = modifySchema;
      }

      let messages = [
          {
            role: "user",
            content: userMessage
          }
      ];

      let retries = 0;
      const maxRetries = 3;

      while (retries < maxRetries) {
        const resolvedModel = (modelId || '').trim() || DEFAULT_ANTHROPIC_MODEL;
        const attemptMsg = retries > 0 ? ` (retry ${retries}/${maxRetries})` : '';
        log(`Streaming request → ${resolvedModel}${attemptMsg}`, 'info');
        setProcessingHint('Streaming...');
        setStreamingText('');

        // ── Streaming: real-time text deltas from the model ──
        // Note: uses messages.stream() (not beta.messages) for broader SDK compatibility.
        // Structured output (output_format) is not used in stream mode — the system
        // prompt already instructs the model to output JSON.
        const stream = await client.messages.stream({
          model: resolvedModel,
          max_tokens: 20000,
          system: systemPrompt,
          messages: messages,
        });

        let fullText = '';
        let lastUpdate = 0;
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta?.text) {
            fullText += event.delta.text;
            // Throttle re-renders to ~100ms intervals (except first 500 chars)
            const now = Date.now();
            if (now - lastUpdate > 100 || fullText.length < 500) {
              setStreamingText(fullText);
              lastUpdate = now;
            }
          }
        }
        setStreamingText(fullText); // Final update

        const finalMessage = await stream.finalMessage();
        const tokens = finalMessage.usage;
        log(`Stream complete — input: ${tokens?.input_tokens || '?'} tokens, output: ${tokens?.output_tokens || '?'} tokens (${fullText.length} chars)`);
        setProcessingHint('Parsing response...');

        // Parse from accumulated streaming text (more reliable than finalMessage.content
        // which may have different block structures in streaming mode)
        let result;
        try {
          result = parseBetaContentBlock({ text: fullText });
        } catch (parseErr) {
          // JSON parse failed — retry with format instruction
          log(`JSON parse failed: ${parseErr.message}`, 'error');
          console.error('[Strudel AI] parseBetaContentBlock failed, sample:', fullText.slice(0, 300));
          retries++;
          // Push the failed response so model can self-correct
          messages.push({
            role: 'assistant',
            content: JSON.stringify({ _raw: String(fullText).slice(0, 500) }),
          });
          messages.push({
            role: 'user',
            content: 'Your last response was NOT valid JSON (it was wrapped in markdown or contained extra text). Please respond with ONLY a raw JSON object, NO markdown fences, NO backticks, JUST the JSON.',
          });
          continue;
        }
        
        let validationError = null;
        if (result) {
          if (mode === 'generate' && !isAutoDJ && result.code) {
             validationError = await validateCode(result.code);
          } else if (isAutoDJ && result.patches) {
              // Validate DJ patches
              // Note: Future patches might fail validation now if they depend on previous patches
              // For now, we assume they are independent or cumulative and try our best.
              if (result.patches.length > 0) {
                 // We can't easily validate a sequence of future patches without simulating time.
                 // So we'll just validate the syntax of the first one if immediate.
                 // Or just trust the model more for DJ mode to avoid stopping the flow.
                 // Let's do a light check on the first immediate patch if exists.
                 const immediate = result.patches.find(p => !p.delay || p.delay === 0);
                 if (immediate) {
                    let tempCode = getCurrentCode();
                     if (tempCode.includes(immediate.search)) {
                         tempCode = tempCode.replace(immediate.search, immediate.replace);
                         validationError = await validateCode(tempCode);
                     }
                 }
              } else {
                 if (result.patches.length > 0) {
                    // validationError = "Could not find code to patch. Code may have changed.";
                    // Actually, let's not error here, just log it.
                 }
              }
          }
        }
        
        if (!validationError) {
          if (result) {
            if (mode === 'modify' && !isAutoDJ && result.patches) {
              log(`Done! ${result.patches.length} patches generated (${elapsedSecRef.current}s)`, 'highlight');
              setRationale(result.reasoning);
              setPendingPatches(result.patches.map(p => ({ ...p, status: 'pending' })));
            } else if (isAutoDJ && result.patches) {
               log(`DJ patch generated (${elapsedSecRef.current}s)`, 'highlight');
               setRationale(result.reasoning);
               schedulePatches(result.patches);
            } else {
                if (result.code) {
                  // === Module C: Post-generation Sound Validation ===
                  const { code: validatedCode, replacements } = fixInvalidSounds(result.code);
                  if (replacements.length > 0) {
                    console.info('[Strudel AI] Fixed invalid sounds:', replacements);
                    const fixNote = replacements.map(r => `${r.original} → ${r.replacement}`).join(', ');
                    setRationale(prev => (prev || '') + `\n\n🔧 Auto-fixed sounds: ${fixNote}`);
                  }
                  context.editorRef.current.setCode(validatedCode);
                  log(`Code applied! ${validatedCode.length} chars (${elapsedSecRef.current}s)`, 'highlight');
                }
                if (result.rationale) {
                  setRationale(result.rationale);
                }
            }
          }
          break;
        }

        // Validation failed
        retries++;
        console.warn(`AI Code Validation Failed (Attempt ${retries}/${maxRetries}):`, validationError);
        
        if (retries >= maxRetries) {
          setError(`Failed to generate valid code after ${maxRetries} attempts. Last error: ${validationError}`);
          break;
        }

        // Add history for retry
        messages.push({
          role: "assistant",
          content: JSON.stringify(result)
        });
        messages.push({
          role: "user",
          content: `The code you generated is invalid. Error: ${validationError}\n\nPlease fix the code.`
        });
      }

    } catch (err) {
      const errName = err.name || 'Error';
      const errMsg = err.message || String(err);
      const errStatus = err.status || '';
      const statusText = errStatus ? ` HTTP ${errStatus}` : '';

      // Classify error for better UX
      let displayMsg = errMsg;
      if (errName === 'APIConnectionError' || errMsg.includes('Connection error')) {
        displayMsg = `Connection failed${statusText}. Check if the provider is reachable and your API key is valid.`;
      } else if (errName === 'AuthenticationError' || errStatus === 401 || errStatus === 403) {
        displayMsg = `Authentication failed${statusText}. Check your API key.`;
      } else if (errStatus === 429) {
        displayMsg = 'Rate limited (429). Wait and try again.';
      } else if (errMsg.includes('timeout') || errMsg.includes('timed out')) {
        displayMsg = `Request timed out. The model may be overloaded — try a smaller prompt or a different provider.`;
      }

      log(`FAILED [${errName}${statusText}]: ${errMsg} (${elapsedSecRef.current}s)`, 'error');
      console.error('[Strudel AI] Request failed:', err);
      setError(`${displayMsg} (after ${elapsedSecRef.current}s)`);
    } finally {
      stopTimer();
      setIsLoading(false);
      setProcessingHint('');
      setStreamingText('');
      if (isAutoDJ) setDjStatus('idle');
    }
  };

  const schedulePatches = (patches) => {
    const now = Date.now();
    const newQueue = patches.map(p => ({
      ...p,
      status: 'queued',
      executeAt: now + ((p.delay || 0) * 1000),
      id: Math.random().toString(36).substr(2, 9)
    }));
    
    setQueuedPatches(prev => [...prev, ...newQueue].sort((a, b) => a.executeAt - b.executeAt));
  };

  // Queue processor
  useEffect(() => {
    if (queuedPatches.length === 0) return;

    const checkQueue = setInterval(() => {
      const now = Date.now();
      const ready = queuedPatches.filter(p => p.executeAt <= now && p.status === 'queued');
      
      if (ready.length > 0) {
        // Apply ready patches
        let tempCode = getCurrentCode();
        let appliedIds = [];
        let failedIds = [];

        ready.forEach(patch => {
           if (tempCode.includes(patch.search)) {
             tempCode = tempCode.replace(patch.search, patch.replace);
             appliedIds.push(patch.id);
           } else {
             failedIds.push(patch.id);
           }
        });

        if (appliedIds.length > 0) {
          context.editorRef.current.setCode(tempCode);
          if (context.handleEvaluate) context.handleEvaluate();
        }

        // Update queue status
        setQueuedPatches(prev => prev.filter(p => !appliedIds.includes(p.id) && !failedIds.includes(p.id)));
      }
    }, 500); // Check every 500ms

    return () => clearInterval(checkQueue);
  }, [queuedPatches]);

  const applyPatch = (patch, index) => {
    const currentCode = getCurrentCode();
    if (currentCode.includes(patch.search)) {
      const newCode = currentCode.replace(patch.search, patch.replace);
      context.editorRef.current.setCode(newCode);
      
      setPendingPatches(prev => prev.map((p, i) => 
        i === index ? { ...p, status: 'applied' } : p
      ));
    } else {
      setPendingPatches(prev => prev.map((p, i) => 
        i === index ? { ...p, status: 'error', error: 'Code segment not found' } : p
      ));
    }
  };

  const discardPatch = (index) => {
    setPendingPatches(prev => prev.map((p, i) => 
        i === index ? { ...p, status: 'discarded' } : p
    ));
  };
  
  const cancelQueuedPatch = (id) => {
      setQueuedPatches(prev => prev.filter(p => p.id !== id));
  };

  // DJ Loop
  useEffect(() => {
    if (isDJMode && !isLoading) {
      const tick = async () => {
        setDjStatus('thinking');
        await generateResponse(true);
      };

      // Initial run? Maybe wait for interval first to give user time to settle.
      // Or run immediately if they just clicked start. 
      // Let's run after 1s to allow UI to update, then interval.
      
      intervalRef.current = setInterval(tick, djInterval);
      
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (!isDJMode) setDjStatus('idle');
    }
  }, [isDJMode, djInterval, apiKey, baseURL, authStylePref, modelId, prompt, isLoading]);

  const toggleDJMode = () => {
      const newMode = !isDJMode;
      setIsDJMode(newMode);
      if (newMode) {
          setMode('dj');
      } else {
          setQueuedPatches([]); // Clear queue when stopping? Or let them finish? Let's clear for safety.
      }
  };

  // === Module E: Alternatives Panel Logic ===
  const refreshAlternatives = useCallback(() => {
    const code = getCurrentCode();
    if (!code || !code.trim()) {
      setAlternatives(null);
      return;
    }
    setAltLoading(true);
    try {
      const layers = generateAlternatives(code);
      const rhythmVariants = generateRhythmVariants(code);
      const currentKey = detectCodeKey(code);
      const harmonyVariants = generateHarmonyVariants(code, currentKey);
      setAlternatives({ layers, rhythmVariants, harmonyVariants });
    } catch (err) {
      console.warn('[Strudel AI] Alternatives generation error:', err);
      setAlternatives(null);
    } finally {
      setAltLoading(false);
    }
  }, []);

  const handleApplyAlternative = useCallback((alternative) => {
    const code = getCurrentCode();
    const newCode = applyAlternative(code, alternative);
    if (newCode !== code) {
      context.editorRef.current.setCode(newCode);
      if (context.handleEvaluate) context.handleEvaluate();
      // Refresh alternatives after applying
      setTimeout(refreshAlternatives, 100);
    }
  }, [refreshAlternatives]);

  return (
    <div className="h-full flex flex-col p-4 space-y-4 overflow-auto text-foreground" style={{ fontFamily }}>
      {/* Compact API status indicator */}
      {!apiKey && mode !== 'claude' && (
        <div className="p-2 rounded-md bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs flex items-center justify-between">
          <span>⚠️ API Key 未设置 — AI 功能不可用</span>
          <span className="text-foreground/50">在 Settings → AI Configuration 中配置</span>
        </div>
      )}
      {mode === 'claude' && (
        <div className="p-2 rounded-md bg-orange-500/10 border border-orange-500/30 text-orange-300 text-xs">
          Claude Code 模式：使用本地 claude CLI + MCP 工具进行精确编辑。需要安装 <code className="bg-orange-500/20 px-1 rounded">@anthropic-ai/claude-code</code>
        </div>
      )}

      <div className="flex space-x-2 p-1 bg-lineHighlight rounded-md">
        <button
          onClick={() => { setMode('generate'); setIsDJMode(false); }}
          className={cx(
            'flex-1 py-1 px-2 rounded-sm text-sm transition-colors',
            mode === 'generate' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
          )}
        >
          Generate
        </button>
        <button
          onClick={() => { setMode('modify'); setIsDJMode(false); }}
          className={cx(
            'flex-1 py-1 px-2 rounded-sm text-sm transition-colors',
            mode === 'modify' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
          )}
        >
          Modify
        </button>
        <button
          onClick={() => { setMode('dj'); }}
          className={cx(
            'flex-1 py-1 px-2 rounded-sm text-sm transition-colors flex items-center justify-center space-x-1',
            mode === 'dj' ? 'bg-background shadow-sm text-purple-400' : 'hover:bg-background/50'
          )}
        >
           <SparklesIcon className="w-3 h-3" />
           <span>AI DJ</span>
        </button>
        <button
          onClick={() => { setMode('alternatives'); setIsDJMode(false); refreshAlternatives(); }}
          className={cx(
            'flex-1 py-1 px-2 rounded-sm text-sm transition-colors flex items-center justify-center space-x-1',
            mode === 'alternatives' ? 'bg-background shadow-sm text-cyan-400' : 'hover:bg-background/50'
          )}
        >
           <ArrowPathIcon className="w-3 h-3" />
           <span>Alt</span>
        </button>
        <button
          onClick={() => { setMode('claude'); setIsDJMode(false); }}
          className={cx(
            'flex-1 py-1 px-2 rounded-sm text-sm transition-colors flex items-center justify-center space-x-1',
            mode === 'claude' ? 'bg-background shadow-sm text-orange-400' : 'hover:bg-background/50'
          )}
        >
           <span>CC</span>
        </button>
      </div>

      {mode === 'dj' && (
          <div className="p-4 rounded-md border border-purple-500/30 bg-purple-500/10 space-y-4">
              <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                      <span className="font-bold text-purple-400">Auto-DJ Active</span>
                      {djStatus === 'thinking' && <span className="animate-pulse text-xs text-purple-300">Thinking...</span>}
                  </div>
                  <button 
                    onClick={toggleDJMode}
                    className={cx(
                        "p-2 rounded-full transition-colors",
                        isDJMode ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                    )}
                  >
                      {isDJMode ? <StopIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
                  </button>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs opacity-70">
                    <span>Evolution Speed</span>
                    <span>{djInterval / 1000}s</span>
                </div>
                <input 
                    type="range" 
                    min="5000" 
                    max="60000" 
                    step="1000" 
                    value={djInterval} 
                    onChange={(e) => setDjInterval(Number(e.target.value))}
                    className="w-full accent-purple-500"
                />
              </div>
              
               {queuedPatches.length > 0 && (
                  <div className="space-y-2 mt-4 pt-4 border-t border-purple-500/20">
                      <div className="text-xs uppercase tracking-wider opacity-70 font-bold flex items-center gap-1">
                          <ClockIcon className="w-3 h-3" />
                          Upcoming Changes
                      </div>
                      <div className="space-y-2">
                          {queuedPatches.map(patch => {
                              const secondsLeft = Math.max(0, Math.ceil((patch.executeAt - Date.now()) / 1000));
                              return (
                                  <div key={patch.id} className="bg-black/20 p-2 rounded text-xs flex justify-between items-center border border-purple-500/10">
                                      <div className="flex-1 overflow-hidden">
                                          <div className="font-medium truncate">{patch.target}</div>
                                          <div className="opacity-60 truncate">{patch.intent}</div>
                                      </div>
                                      <div className="flex items-center gap-2 ml-2">
                                          <span className="font-mono bg-purple-500/20 px-1 rounded text-purple-300">
                                              {secondsLeft}s
                                          </span>
                                          <button 
                                            onClick={() => cancelQueuedPatch(patch.id)}
                                            className="hover:text-red-400"
                                          >
                                              <XMarkIcon className="w-3 h-3" />
                                          </button>
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                  </div>
               )}

              <div className="text-xs opacity-70 italic">
                  The AI will continuously listen and evolve the track based on your prompt below.
              </div>
          </div>
      )}

      {/* === Alternatives Panel (Module E) === */}
      {mode === 'alternatives' && (
        <div className="p-4 rounded-md border border-cyan-500/30 bg-cyan-500/5 space-y-4 overflow-y-auto max-h-[60vh]">
          <div className="flex items-center justify-between">
            <span className="font-bold text-cyan-400 text-sm">🎛️ Sound & Rhythm Alternatives</span>
            <button
              onClick={refreshAlternatives}
              disabled={altLoading}
              className="p-1.5 rounded hover:bg-cyan-500/20 text-cyan-400 transition-colors"
              title="Refresh Alternatives"
            >
              <ArrowPathIcon className={cx("w-4 h-4", altLoading && "animate-spin")} />
            </button>
          </div>

          {altLoading && <div className="text-xs text-cyan-300 animate-pulse">Analyzing code...</div>}

          {!altLoading && !alternatives && (
            <div className="text-xs text-foreground/60 italic">
              No code found. Generate or write some Strudel code first, then switch to this tab to see alternatives.
            </div>
          )}

          {!altLoading && alternatives && (
            <>
              {/* Per-layer sound alternatives */}
              {alternatives.layers && alternatives.layers.length > 0 && (
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-wider opacity-70 font-bold">Layer Alternatives</div>
                  {alternatives.layers.map((layer, li) => (
                    <div key={li} className="bg-black/20 rounded p-2 space-y-1.5 border border-cyan-500/10">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-foreground">
                          {layer.type || 'layer'}: <span className="text-cyan-400">{layer.sound || layer.bank || '?'}</span>
                        </span>
                      </div>
                      {layer.alternatives && layer.alternatives.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {layer.alternatives.map((alt, ai) => (
                            <button
                              key={ai}
                              onClick={() => handleApplyAlternative(alt)}
                              className="text-xs px-2 py-0.5 rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/30 hover:text-white transition-colors"
                              title={alt.description || alt.label || alt.sound}
                            >
                              {alt.label || alt.sound || `Alt ${ai + 1}`}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Rhythm variants */}
              {alternatives.rhythmVariants && alternatives.rhythmVariants.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-cyan-500/20">
                  <div className="text-xs uppercase tracking-wider opacity-70 font-bold">Rhythm Variants</div>
                  <div className="flex flex-wrap gap-1">
                    {alternatives.rhythmVariants.map((rv, ri) => (
                      <button
                        key={ri}
                        onClick={() => handleApplyAlternative(rv)}
                        className="text-xs px-2 py-1 rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/30 hover:text-white transition-colors"
                        title={rv.description}
                      >
                        {rv.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Harmony variants */}
              {alternatives.harmonyVariants && alternatives.harmonyVariants.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-cyan-500/20">
                  <div className="text-xs uppercase tracking-wider opacity-70 font-bold">Harmony Variants</div>
                  <div className="flex flex-wrap gap-1">
                    {alternatives.harmonyVariants.map((hv, hi) => (
                      <button
                        key={hi}
                        onClick={() => handleApplyAlternative(hv)}
                        className="text-xs px-2 py-1 rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/30 hover:text-white transition-colors"
                        title={hv.description}
                      >
                        {hv.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {mode !== 'alternatives' && (
      <div className="space-y-2 flex-1 flex flex-col">
        <label className="block text-sm font-medium">
          {mode === 'generate' ? 'Describe the music you want...' :
           mode === 'dj' ? 'Vibe / Direction (Optional)' :
           mode === 'claude' ? 'What should Claude Code change?' :
           'How should the code be changed?'}
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
              mode === 'generate' ? "Dark techno at 130bpm..." :
              mode === 'claude' ? "Make the kick pattern more syncopated. Add a filter sweep to the bass..." :
              mode === 'modify' ? "Add more reverb to the snare..." :
              "Keep it dark and driving, add some percussion..."
          }
          className="w-full flex-1 p-2 bg-background border border-foreground rounded-md resize-none focus:ring-1 focus:ring-foreground outline-none min-h-[100px]"
        />
      </div>
      )}

      {rationale && (
        <div className="bg-lineHighlight p-3 rounded-md text-sm space-y-2 border-l-4 border-green-500">
          <div className="font-bold text-xs uppercase tracking-wider opacity-70">AI Rationale</div>
          <div className="whitespace-pre-wrap leading-relaxed">{rationale}</div>
        </div>
      )}

      {ccOutput && mode === 'claude' && (
        <div className="bg-lineHighlight p-3 rounded-md text-sm space-y-2 border-l-4 border-orange-500 max-h-48 overflow-auto">
          <div className="font-bold text-xs uppercase tracking-wider opacity-70">Claude Code Output</div>
          <pre className="whitespace-pre-wrap leading-relaxed text-xs font-mono opacity-70">{ccOutput}</pre>
        </div>
      )}

      {pendingPatches.length > 0 && mode === 'modify' && (
        <div className="space-y-3">
           <div className="font-bold text-xs uppercase tracking-wider opacity-70">Proposed Changes</div>
           {pendingPatches.map((patch, i) => (
             <div key={i} className={cx(
                "p-3 rounded-md border bg-background/50 text-sm flex flex-col gap-2",
                patch.status === 'applied' ? 'border-green-500/50 opacity-50' : 
                patch.status === 'discarded' ? 'border-red-500/50 opacity-50' :
                'border-foreground/20'
             )}>
               <div className="flex justify-between items-start">
                  <div className="font-medium text-foreground">{patch.target}</div>
                  <div className="flex space-x-1">
                    {patch.status === 'pending' && (
                        <>
                          <button onClick={() => applyPatch(patch, i)} className="p-1 hover:bg-green-500/20 rounded text-green-500" title="Apply Change">
                            <CheckIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => discardPatch(i)} className="p-1 hover:bg-red-500/20 rounded text-red-500" title="Discard">
                             <XMarkIcon className="w-4 h-4" />
                          </button>
                        </>
                    )}
                    {patch.status === 'applied' && <span className="text-xs text-green-500 font-bold">APPLIED</span>}
                    {patch.status === 'discarded' && <span className="text-xs text-red-500 font-bold">DISCARDED</span>}
                    {patch.status === 'error' && <span className="text-xs text-red-500 font-bold">ERROR: {patch.error}</span>}
                  </div>
               </div>
               <div className="text-foreground/70 text-xs italic">{patch.intent}</div>
               {patch.status === 'pending' && (
                  <div className="grid grid-cols-1 gap-1 mt-1 font-mono text-xs bg-black/20 p-2 rounded overflow-x-auto">
                    <div className="text-red-400">- {patch.search}</div>
                    <div className="text-green-400">+ {patch.replace}</div>
                  </div>
               )}
             </div>
           ))}
        </div>
      )}

      {error && (
        <div className="text-red-500 text-sm p-2 border border-red-500 rounded-md bg-red-500/10">
          {error}
        </div>
      )}

      {isLoading && processingHint && (
        <div className="text-xs text-foreground/70 font-mono px-1 flex items-center gap-2">
          <span className="animate-pulse">●</span>
          <span>{processingHint}</span>
          {elapsed > 0 && <span className="opacity-50">({elapsed}s)</span>}
        </div>
      )}
      {/* Streaming text preview — shows real-time model output */}
      {isLoading && streamingText && (
        <div className="mx-1 mt-1 mb-2 p-2 bg-lineHighlight rounded border border-lineHighlight max-h-48 overflow-y-auto">
          <pre className="text-[11px] text-foreground/60 font-mono whitespace-pre-wrap break-all leading-relaxed">
            {streamingText.slice(-2000)}
          </pre>
        </div>
      )}
      {!isLoading && (
        <p className="text-[11px] text-foreground/50 leading-snug px-1">
          日志输出：打开 <strong>Console</strong> 标签页查看实时 AI 请求进度。
        </p>
      )}

      {mode !== 'dj' && mode !== 'alternatives' && (
          <button
            onClick={() => mode === 'claude' ? runClaudeCode() : generateResponse(false)}
            disabled={isLoading || (!apiKey && mode !== 'claude')}
            className={cx(
              "w-full py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center space-x-2",
              isLoading || (mode !== 'claude' && !apiKey)
                ? "bg-gray-600 cursor-not-allowed opacity-50"
                : mode === 'claude'
                ? "bg-orange-500 text-white hover:bg-orange-400"
                : "bg-foreground text-background hover:opacity-90"
            )}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{processingHint || 'Processing…'}</span>
              </>
            ) : (
              <span>{mode === 'generate' ? 'Generate Code' : mode === 'claude' ? 'Run Claude Code' : 'Suggest Changes'}</span>
            )}
          </button>
      )}
    </div>
  );
}
