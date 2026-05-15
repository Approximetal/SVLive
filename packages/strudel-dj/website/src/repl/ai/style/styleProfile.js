/**
 * Style Profile Translator
 * 
 * Converts Essentia audio analysis output → structured musical intent + prompt guidance.
 * This is the bridge between "what Essentia heard" and "what the AI needs to generate".
 * 
 * Pipeline:
 *   Audio File → [Essentia Python Service] → Style Profile JSON
 *   → styleProfileToIntent() → existing intent format (genre, bpm, key, mood)
 *   → buildStyleGuidance() → prompt injection text
 *   → promptBuilder → final system prompt
 */

const BRIDGE_URL = 'http://localhost:8765';

/**
 * Send an audio file to the Essentia service for analysis.
 * 
 * @param {File|Blob} audioFile - Audio file to analyze
 * @returns {Promise<object>} Style profile from Essentia
 */
export async function analyzeAudioFile(audioFile) {
  const formData = new FormData();
  formData.append('file', audioFile, audioFile.name || 'audio.wav');

  const response = await fetch(`${BRIDGE_URL}/essentia/analyze`, {
    method: 'POST',
    body: formData,
    signal: AbortSignal.timeout(60000), // 60s timeout for large files + models
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(`Essentia analysis failed: ${response.status} ${errBody}`);
  }

  const data = await response.json();
  
  if (data.status !== 'ok') {
    throw new Error(`Essentia analysis error: ${data.error || 'unknown error'}`);
  }

  return data;
}

/**
 * Check if the Essentia service is available and which models are loaded.
 * 
 * @returns {Promise<object>} Status info { essentia_installed, models_count, models_missing }
 */
export async function checkEssentiaStatus() {
  try {
    const resp = await fetch(`${BRIDGE_URL}/essentia/status`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!resp.ok) return { available: false, error: `HTTP ${resp.status}` };
    const data = await resp.json();
    return { available: true, ...data };
  } catch (err) {
    return { available: false, error: err.message };
  }
}

/**
 * Convert Essentia style profile → existing intent format (used by promptBuilder).
 * 
 * This maps Essentia's rich analysis output into the compact { genre, bpm, key, mood, complexity }
 * format that the existing prompt building pipeline expects.
 * 
 * @param {object} profile - Essentia analysis output
 * @returns {object} Intent object { genre, bpm, key, mood, complexity }
 */
export function styleProfileToIntent(profile) {
    // BPM default per genre (fallback)
    const genreBPM = {
        house: 124, techno: 133, trance: 140, ambient: 70, jazz: 95,
        dnb: 174, hiphop: 90, trap: 145, lofi: 78, dubstep: 140,
        reggae: 80, funk: 110, garage: 134, classical: 80, hyperpop: 160,
        synthwave: 100, latin: 110,
    };

    const genre = profile.genre?.primary || 'house';
    const bpm = profile.bpm?.value || genreBPM[genre] || 120;
    const key = profile.key?.value || 'C:minor';
    const mood = profile.mood?.primary || 'energetic';
    
    // Complexity heuristic: very fast or very slow → ambiguous
    // Multi-instrument → complex
    const complexity = (profile.instruments?.length || 4) >= 5 ? 'complex' : 'medium';

    return { genre, bpm, key, mood, complexity };
}

/**
 * Build rich style guidance text for injection into the AI prompt.
 * 
 * This translates Essentia's analysis into concrete Strudel code generation
 * instructions: what instruments to use, what energy level, what sound character,
 * what drum style, etc.
 * 
 * @param {object} profile - Essentia analysis output
 * @returns {string} Style guidance text for prompt injection
 */
export function buildStyleGuidance(profile) {
    if (!profile || profile._fallback) {
        return '';
    }

    const parts = [];

    parts.push(`## 🎧 Audio Analysis: Style Reference
The following analysis was extracted from the user's reference track. 
Generate music that MATCHES this style profile as closely as possible.

`);

    // ── Genre ──
    if (profile.genre) {
        const g = profile.genre;
        parts.push(`### Genre: ${g.primary} (confidence: ${(g.confidence * 100).toFixed(0)}%)`);
        if (g.top3 && g.top3.length > 1) {
            const alts = g.top3.slice(1, 3).map(a => a.genre).join(', ');
            parts.push(`- Also similar to: ${alts}`);
        }
        parts.push('');
    }

    // ── BPM ──
    if (profile.bpm) {
        const b = profile.bpm;
        parts.push(`### Tempo: ${b.value} BPM`);
        parts.push(`- Use \`setCpm(${b.value}/4)\``);
        parts.push('');
    }

    // ── Key ──
    if (profile.key) {
        const k = profile.key;
        parts.push(`### Key: ${k.value} (confidence: ${(k.confidence * 100).toFixed(0)}%)`);
        parts.push(`- Use \`.scale("${k.value}")\` on all melodic patterns`);
        parts.push('');
    }

    // ── Mood / Energy ──
    if (profile.mood) {
        const m = profile.mood;
        parts.push(`### Mood: ${m.primary}`);
        parts.push(`- Arousal (energy): ${m.arousal || '?'} / Valence (positivity): ${m.valence || '?'}`);
        
        const moodGuidance = getMoodGuidance(m);
        if (moodGuidance) parts.push(moodGuidance);
        parts.push('');
    }

    // ── Instruments ──
    if (profile.instruments && profile.instruments.length > 0) {
        parts.push(`### Instruments Needed: ${profile.instruments.join(', ')}`);
        parts.push(`- The reference track uses these instrument types — your generation should include them`);
        parts.push('');
    }

    // ── Sound Character ──
    if (profile.soundTags && profile.soundTags.length > 0) {
        parts.push(`### Sound Character: ${profile.soundTags.join(', ')}`);
        parts.push(`- These describe the sonic texture — match them with Vital presets that share these tags`);
        parts.push('- Example: "warm" → analog-style presets, "digital" → clean/modern presets, "retro" → vintage-style presets');
        parts.push('');
    }

    // ── Danceability ──
    if (profile.danceability) {
        const d = profile.danceability;
        parts.push(`### Danceability: ${d.danceable ? 'Danceable' : 'Not danceable'} (${(d.probability * 100).toFixed(0)}%)`);
        if (d.danceable) {
            parts.push('- Emphasize a strong, consistent rhythm section. Use dance-oriented drum patterns.');
        } else {
            parts.push('- Priority is texture/melody over beat. Keep drums sparse and supportive.');
        }
        parts.push('');
    }

    // ── Voice ──
    if (profile.voice) {
        const v = profile.voice;
        if (v.voice_present) {
            parts.push(`### Vocals: Present (${(v.probability * 100).toFixed(0)}% confidence)`);
            parts.push('- If using vocal samples, add them as a texture layer. Strudel supports `s("vox")` with sample slicing.');
        } else {
            parts.push('### Vocals: Not detected — generate a purely instrumental track');
        }
        parts.push('');
    }

    // ── Style Summary (for the AI to internalize) ──
    if (profile.description) {
        parts.push(`### Style Summary
${profile.description}

The generated code should capture this exact musical character.`);
    }

    return parts.join('\n');
}

/**
 * Get detailed mood-specific generation guidance.
 */
function getMoodGuidance(mood) {
    const { primary, arousal, valence } = mood;
    
    const guidance = {
        energetic: `- **Energy Level: 8-10/10** — Maximum intensity
- Use heavy, driving drum patterns with strong kicks
- Open filters wide: .lpf(8000) on leads
- Quick envelope attacks, minimal release
- Dense layering — all instruments in chorus sections`,

        bright: `- **Energy Level: 6-8/10** — Uplifting and positive
- Use bright, wide supersaw leads and plucks
- Major-key leaning (or bright minor progressions)
- Open, spacious mix with generous reverb on pads
- Syncopated rhythms for movement and excitement`,

        dark: `- **Energy Level: 6-8/10** — Intense and aggressive
- Use industrial/noise textures, distorted bass
- Minor key, chromatic movement
- Tight, heavy kicks. Aggressive filter modulation
- Low-pass filters sweeping slowly for tension`,

        chill: `- **Energy Level: 2-4/10** — Relaxed and spacious
- Sparse drum patterns (kick on 1 and 3, soft hi-hats)
- Long attack envelopes on pads (.attack(0.5).sustain(0.8))
- Deep reverb: .room(0.6-0.9) on everything except kick
- LPF filters: .lpf(400-800) for warmth
- Scale: consider dorian or lydian for ambiguous, floating feel`,

        melancholic: `- **Energy Level: 3-5/10** — Emotional and moody
- Minor key progressions, emphasis on 6th and 7th scale degrees
- Warm, analog-style sounds. Gentle filter movement
- Slow attack on pads, long releases
- Bass should be deep and sustained (808 style)
- Leave space between elements — silence is powerful`,
    };

    // Blend modes based on arousal/valence if primary matches a specific profile
    if (guidance[primary]) {
        return guidance[primary];
    }

    // Generic: infer from arousal/valence
    let generic = '';
    if (arousal > 0.7) generic += '- High energy — drive the rhythm section hard\n';
    if (arousal < 0.3) generic += '- Low energy — keep it sparse and atmospheric\n';
    if (valence > 0.6) generic += '- Positive valence — major key or bright minor\n';
    if (valence < 0.4) generic += '- Negative valence — dark, minor, tense\n';
    return generic;
}

/**
 * Get the drum machine bank recommendation based on style profile.
 */
export function getDrumBankRecommendation(profile) {
    const genre = profile.genre?.primary || 'house';
    const soundTags = profile.soundTags || [];
    const danceability = profile.danceability?.danceable ?? true;
    
    const recommendations = {
        house: { primary: 'RolandTR909', reason: 'Punchy, classic house sound' },
        techno: { primary: 'RolandTR909', reason: 'Tight, driving techno punch' },
        trance: { primary: 'RolandTR909', reason: 'Clean, energetic' },
        dnb: { primary: 'RolandTR909', reason: 'Tight, fast punch; pair with Amen breaks' },
        dubstep: { primary: 'RolandTR808', reason: 'Heavy booming kicks, deep subs' },
        garage: { primary: 'RolandTR707', reason: 'Crisp, bright percussion for UKG' },
        ambient: { primary: 'BossDR110', reason: 'Soft, organic, lo-fi character' },
        trap: { primary: 'RolandTR808', reason: 'The definitive trap 808 sound' },
        synthwave: { primary: 'OberheimDMX', reason: 'Vintage 80s character' },
        lofi: { primary: 'EmuSP12', reason: 'Gritty, dusty hip-hop character' },
        hyperpop: { primary: 'RolandTR909', reason: 'Clean and punchy for hyperpop' },
        hiphop: { primary: 'RolandTR808', reason: 'The classic hip-hop drum machine' },
        jazz: { primary: 'BossDR110', reason: 'Subtle, tasteful, organic' },
        classical: { primary: 'BossDR110', reason: 'Minimal percussion support' },
        funk: { primary: 'LinnDrum', reason: 'Tight, punchy 80s funk' },
        reggae: { primary: 'RolandTR808', reason: 'Warm, round tones for dub/reggae' },
        latin: { primary: 'RolandTR707', reason: 'Crisp percussion for latin rhythms' },
    };

    return recommendations[genre] || { primary: 'RolandTR909', reason: 'Versatile all-rounder' };
}
