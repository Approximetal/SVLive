/**
 * Music Translator — LLM-based musical intent extraction + Vital preset matching
 *
 * Pipeline:
 *   自然语言 → LLM提取音乐术语 → 匹配Vital标签库 → 注入推荐音色 → 生成代码
 *
 * Replaces the regex-based analyzeIntent() with semantic understanding
 * for genre, BPM, key, mood, instrument types, and sound character tags.
 */

// JSON Schema for the translator LLM output
const MUSIC_TERMS_SCHEMA = {
  type: 'object',
  properties: {
    genre: {
      type: 'string',
      description: 'Primary music genre: hyperpop, house, techno, trance, dnb, dubstep, trap, lofi, ambient, synthwave, jazz, classical, funk, hiphop, reggae, latin, garage',
    },
    bpm: {
      type: ['number', 'null'],
      description: 'Suggested tempo (40-300), or null if genuinely ambiguous',
    },
    key: {
      type: ['string', 'null'],
      description: 'Key in "Note:mode" format (e.g. "C:minor", "A:major"), or null',
    },
    mood: {
      type: 'array',
      items: { type: 'string' },
      description: 'Mood tags: bright, dark, chill, energetic, melancholic, minimal, complex, psychedelic, aggressive, gentle, nostalgic, dreamy',
    },
    instruments: {
      type: 'array',
      items: { type: 'string' },
      description: 'Instrument types: bass, lead, pad, pluck, bell, keys, chord, drum, arp, fx, string, brass, world, vocal',
    },
    soundTags: {
      type: 'array',
      items: { type: 'string' },
      description: 'Sound character: warm, bright, dark, aggressive, soft, punchy, cinematic, retro, space, dreamy, clean, analog, digital, lofi, wide, evolving',
    },
    description: {
      type: 'string',
      description: 'One concise sentence capturing the musical intent (5-15 words)',
    },
  },
  required: ['genre', 'mood', 'instruments', 'soundTags'],
  additionalProperties: false,
};

const TRANSLATOR_SYSTEM_PROMPT = `You are a music theory expert and sound designer. Given a natural language description, extract structured musical parameters.

## Rules
1. **genre**: Pick the most specific matching genre. Map synonyms (e.g., "bubblegum bass"→hyperpop, "liquid"→dnb, "chillhop"→lofi). Default to house if truly vague.
2. **bpm**: Estimate from genre convention if not explicit. Ambient/chill→60-80, house→120-130, dnb→170-180, hiphop→80-100. Return null only if completely ambiguous.
3. **key**: "Note:mode" format. Default: minor for dark/energetic, major for bright/happy. Use standard modes: minor, major, dorian, phrygian, lydian, mixolydian, aeolian, locrian.
4. **mood**: 1-3 most relevant mood tags from the user's description. Be specific.
5. **instruments**: What instrument types does this music need? For electronic: bass+lead+pad+drum. For ambient: pad+fx. For classical: string+keys. Include all plausible types.
6. **soundTags**: Sonic character keywords. Extract from the user's words or infer from genre/mood. Always include at least 2-3.
7. **description**: 5-15 word musical essence in English.`;

/** Fallback default when translation fails completely */
const DEFAULT_TERMS = {
  genre: 'house',
  bpm: 124,
  key: 'C:minor',
  mood: ['energetic'],
  instruments: ['bass', 'lead', 'pad', 'drum', 'pluck'],
  soundTags: ['warm', 'clean'],
  description: 'Energetic house track',
};

/**
 * Translate natural language prompt to structured musical terms via LLM.
 * @param {import('@anthropic-ai/sdk').default} client
 * @param {string} userPrompt
 * @param {string} [modelId] - model identifier, falls back to default
 * Returns enriched terms object (superset of the regex analyzer's output).
 */
export async function translatePrompt(client, userPrompt, modelId) {
  const response = await client.beta.messages.create({
    model: modelId || 'claude-sonnet-4-6',
    max_tokens: 600,
    betas: ['structured-outputs-2025-11-13'],
    system: TRANSLATOR_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
    output_format: {
      type: 'json_schema',
      schema: MUSIC_TERMS_SCHEMA,
    },
  });

  const block = response.content?.[0];
  if (!block) throw new Error('Translator returned empty content');

  // Try structured input first, then text fallback
  let result;
  if (block.input != null && typeof block.input === 'object') {
    result = block.input;
  } else {
    const raw = String(block.text || '').trim();
    if (!raw) throw new Error('Translator returned empty text');
    // Try to extract JSON from markdown fences
    const fenceRe = /^```(?:json|javascript|js)?\s*\r?\n?([\s\S]*?)\r?\n?```\s*$/i;
    const match = fenceRe.exec(raw);
    const candidate = match ? match[1].trim() : raw;
    try {
      result = JSON.parse(candidate);
    } catch {
      // Model returned prose instead of JSON — extract what we can with regex
      console.warn('[MusicTranslator] Structured output failed, attempting regex extraction from:', raw.slice(0, 200));
      result = extractFromText(raw);
    }
  }

  /**
   * Fallback: when the model ignores the JSON schema and returns natural language,
   * try to extract key fields with regex.
   */
  function extractFromText(text) {
    const lower = text.toLowerCase();
    const genreMatch = text.match(/genre[：:]\s*["']?(\w+)["']?/i)
      || text.match(/\b(hyperpop|house|techno|trance|dnb|dubstep|trap|lofi|ambient|synthwave|jazz|classical|funk|hiphop|reggae|latin)\b/i);
    const bpmMatch = text.match(/bpm[：:]\s*(\d{2,3})/i) || text.match(/\b(\d{2,3})\s*bpm\b/i);
    const keyMatch = text.match(/key[：:]\s*["']?([A-G][#b]?\s*:\s*\w+)["']?/i);
    return {
      genre: genreMatch ? genreMatch[1].toLowerCase() : DEFAULT_TERMS.genre,
      bpm: bpmMatch ? parseInt(bpmMatch[1]) : null,
      key: keyMatch ? keyMatch[1].replace(/\s+/g, '') : null,
      mood: ['energetic'],
      instruments: ['bass', 'lead', 'pad', 'drum'],
      soundTags: ['warm'],
      description: text.slice(0, 80),
    };
  }

  // Merge with defaults for safety
  return {
    genre: result.genre || DEFAULT_TERMS.genre,
    bpm: (typeof result.bpm === 'number' && result.bpm >= 40 && result.bpm <= 300)
      ? result.bpm : null,
    key: (typeof result.key === 'string' && result.key.includes(':'))
      ? result.key : null,
    mood: Array.isArray(result.mood) ? result.mood.filter(Boolean) : DEFAULT_TERMS.mood,
    instruments: Array.isArray(result.instruments) ? result.instruments.filter(Boolean) : DEFAULT_TERMS.instruments,
    soundTags: Array.isArray(result.soundTags) ? result.soundTags.filter(Boolean) : DEFAULT_TERMS.soundTags,
    description: result.description || userPrompt.slice(0, 80),
  };
}

// ============================================================
// Vital Preset Matching
// ============================================================

/** Base URL for vital-bridge — configurable for different environments */
let vitalBridgeURL = 'http://localhost:8765';

export function setVitalBridgeURL(url) {
  vitalBridgeURL = url;
}

/**
 * Fetch all available preset tags from vital-bridge
 */
async function fetchAvailableTags() {
  try {
    const r = await fetch(`${vitalBridgeURL}/presets/tags`, { signal: AbortSignal.timeout(3000) });
    if (!r.ok) return null;
    const data = await r.json();
    return {
      all: new Set(data.all_tags || []),
      types: data.type_counts || {},
      styles: data.style_counts || {},
    };
  } catch {
    return null;
  }
}

/**
 * Search presets by tags
 */
async function searchPresets(tags, match = 'any') {
  const params = new URLSearchParams({ tag: tags.join(','), match });
  try {
    const r = await fetch(`${vitalBridgeURL}/presets/search?${params}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!r.ok) return [];
    const data = await r.json();
    return data.presets || [];
  } catch {
    return [];
  }
}

/**
 * Match LLM-extracted music terms against Vital preset tag index.
 *
 * Strategy:
 * 1. Fetch all available tags → validate which of our soundTags exist in DB
 * 2. For each instrument type, search presets matching that type + overlapping soundTags
 * 3. Rank by soundTag overlap score → pick top-N per instrument
 *
 * Returns: { presets: { [instrumentType]: [{name, pack, types, styles}] }, matchedSoundTags: string[] }
 */
export async function matchVitalPresets(terms) {
  const { instruments = [], soundTags = [] } = terms;

  // Step 1: Get available tags
  const available = await fetchAvailableTags();
  if (!available) {
    // vital-bridge not running → no presets to recommend
    return { presets: {}, matchedSoundTags: [] };
  }

  // Step 2: Find which soundTags exist in the preset DB
  const matchedSoundTags = soundTags.filter(t => available.all.has(t.toLowerCase()));

  // Step 3: For each instrument type, search and rank presets
  const results = {};
  const seen = new Set(); // deduplicate across instrument types

  for (const instrument of instruments) {
    const instLower = instrument.toLowerCase();

    // Skip if it's not a recognized type in the DB
    if (!available.all.has(instLower)) continue;

    // Build search: instrument type + any matching soundTags
    const searchTags = [instLower, ...matchedSoundTags];
    const presets = await searchPresets(searchTags, 'any');

    // Score presets by soundTag overlap
    const scored = presets
      .filter(p => !seen.has(p.name))
      .map(p => {
        const presetStyleTags = new Set(
          (p.styles || []).concat(p.types || []).map(t => t.toLowerCase())
        );
        const overlap = matchedSoundTags.filter(t => presetStyleTags.has(t)).length;
        return { ...p, _score: overlap };
      })
      .sort((a, b) => b._score - a._score)
      .slice(0, 5);

    if (scored.length > 0) {
      results[instrument] = scored;
      scored.forEach(p => seen.add(p.name));
    }
  }

  return { presets: results, matchedSoundTags };
}

/**
 * Build preset guidance text for injection into the system prompt.
 */
export function buildPresetGuidance(matchResult) {
  const { presets, matchedSoundTags } = matchResult;
  const instrumentNames = Object.keys(presets);

  if (instrumentNames.length === 0) {
    return '';
  }

  let guidance = `\n## 🎛️ Matched Vital Presets\n\n`;
  guidance += `Based on your request, these presets match the desired instrument types`;
  if (matchedSoundTags.length > 0) {
    guidance += ` and sound character (${matchedSoundTags.join(', ')})`;
  }
  guidance += `:\n\n`;

  for (const [instrument, presetList] of Object.entries(presets)) {
    guidance += `### ${instrument.charAt(0).toUpperCase() + instrument.slice(1)} (${presetList.length} presets)\n`;
    for (const p of presetList) {
      const tags = (p.styles || []).concat(p.types || []).join(', ');
      guidance += `- \`${p.name}\` ${tags ? `(${tags})` : ''} — load: \`await vital('${p.name}')\`\n`;
    }
    guidance += '\n';
  }

  guidance += `**Usage**: Each preset is loaded once with \`await vital('Name')\`, then played as \`.s("vital_name")\`.\n`;
  guidance += `Example: \`const bass = await vital('Thicccboi 808');\` then \`n("c2").s("vital_thicccboi_808")\`\n`;
  guidance += `**Drums**: Always use dirt-samples (bd, hh, sn, cp, rim, cr, lt, mt) — NOT Vital for percussion.\n`;

  return guidance;
}
