/**
 * Intent Analyzer - Extracts genre, BPM, key, and mood from user prompts
 * 
 * Runs entirely on the client side (no API calls needed).
 * Parses natural language prompts to determine musical intent.
 */

import { GENRE_SOUND_MAP } from './sounds.js';

// Genre detection patterns (ordered by specificity)
const GENRE_PATTERNS = [
  // Electronic - specific subgenres first (order matters!)
  { pattern: /drum\s*(?:and|&|n)\s*bass|dnb|d&b|liquid\s*dnb/i, genre: 'dnb' },
  { pattern: /dubstep|brostep|riddim/i, genre: 'dubstep' },
  { pattern: /uk\s*garage|2[\s-]?step|speed\s*garage/i, genre: 'garage' },
  { pattern: /trance|uplifting|psytrance|goa/i, genre: 'trance' },
  { pattern: /trap(?!\s*soul)/i, genre: 'trap' },
  { pattern: /lo[\s-]?fi|lofi|chillhop|study\s*beats/i, genre: 'lofi' },
  { pattern: /bubblegum\s*bass|pc\s*music|hyperpop|digicore|glitch\s*core|nightcore/i, genre: 'hyperpop' },
  { pattern: /techno|industrial|acid/i, genre: 'techno' },
  { pattern: /house|deep\s*house|progressive\s*house|disco\s*house/i, genre: 'house' },
  { pattern: /ambient|drone|meditation|atmospheric|soundscape/i, genre: 'ambient' },
  { pattern: /breakbeat|break\s*core|jungle|footwork/i, genre: 'dnb' },
  { pattern: /synth[\s-]?wave|retro[\s-]?wave|vapor[\s-]?wave|outrun/i, genre: 'synthwave' },
  { pattern: /house/ }, // catch-all house must come after more specific patterns
  // Traditional
  { pattern: /jazz|swing|bebop|modal|bossa\s*nova|blues/i, genre: 'jazz' },
  { pattern: /classical|orchestral|symphony|baroque|romantic/i, genre: 'classical' },
  { pattern: /reggae|dub(?!step)|ska|dancehall/i, genre: 'reggae' },
  { pattern: /funk|groove|disco|boogie/i, genre: 'funk' },
  // Hip Hop
  { pattern: /hip[\s-]?hop|boom\s*bap|rap/i, genre: 'hiphop' },
  // Latin / World
  { pattern: /latin|salsa|bossa|samba|afrobeat/i, genre: 'latin' },
  // Chinese genre keywords (must come after specific patterns)
  { pattern: /电子|舞曲/i, genre: 'house' },
  { pattern: /嘻哈|说唱/i, genre: 'hiphop' },
  { pattern: /爵士/i, genre: 'jazz' },
  { pattern: /古典|交响/i, genre: 'classical' },
  { pattern: /放克|疯克/i, genre: 'funk' },
  { pattern: /雷鬼/i, genre: 'reggae' },
  { pattern: /氛围|环境音乐/i, genre: 'ambient' },
  { pattern: /拉丁|桑巴|波萨/i, genre: 'latin' },
];

// BPM defaults per genre
const DEFAULT_BPMS = {
  house: 124,
  techno: 133,
  trance: 140,
  ambient: 70,
  jazz: 95,
  dnb: 174,
  hiphop: 90,
  trap: 145,
  lofi: 78,
  dubstep: 140,
  reggae: 80,
  funk: 110,
  garage: 134,
  classical: 80,
  hyperpop: 160,
  synthwave: 100,
  latin: 110,
};

// Key/mode detection
const KEY_PATTERNS = [
  // "C minor", "D# major", "F dorian", etc.
  { pattern: /\b([A-G][#b♯♭]?)\s*(minor|major|min|maj|dorian|phrygian|lydian|mixolydian|aeolian|locrian)\b/i,
    extract: (m) => `${normalizeKey(m[1])}:${normalizeMode(m[2])}` },
  // "C:minor" style
  { pattern: /\b([A-G][#b♯♭]?)\s*:\s*(minor|major|dorian|phrygian|lydian|mixolydian|aeolian|locrian)\b/i,
    extract: (m) => `${normalizeKey(m[1])}:${normalizeMode(m[2])}` },
  // Just a key mention: "in C", "key of G"
  { pattern: /(?:in|key\s*(?:of)?)\s+([A-G][#b♯♭]?)\b/i,
    extract: (m) => `${normalizeKey(m[1])}:minor` },
];

// Default keys per genre (for when no key is specified)
const DEFAULT_KEYS = {
  house: 'C:minor',
  techno: 'A:minor',
  trance: 'A:minor',
  ambient: 'F:lydian',
  jazz: 'D:dorian',
  dnb: 'A:minor',
  hiphop: 'G:minor',
  trap: 'F#:minor',
  lofi: 'C:minor',
  dubstep: 'E:minor',
  reggae: 'G:major',
  funk: 'E:minor',
  garage: 'C:minor',
  classical: 'D:minor',
  hyperpop: 'C:major',
  synthwave: 'A:minor',
  latin: 'G:minor',
};

// Mood/energy detection
const MOOD_PATTERNS = [
  { pattern: /dark|evil|sinister|menacing|aggressive|heavy|hard|暗黑|黑暗|凶恶|攻击/i, mood: 'dark' },
  { pattern: /bright|happy|uplifting|euphoric|cheerful|joyful|轻快|轻(?:松|盈)|明(?:亮|快)|欢乐|愉悦|开心|抓耳|入耳/i, mood: 'bright' },
  { pattern: /chill|relaxed|mellow|calm|peaceful|gentle|soft|温柔|舒缓|放松|宁静|平和|安静|柔和/i, mood: 'chill' },
  { pattern: /energetic|driving|intense|powerful|pumping|banging|活力|能量|激烈|强劲|动感|燃/i, mood: 'energetic' },
  { pattern: /melancholic|sad|emotional|moody|nostalgic|伤感|悲伤|忧郁|怀旧|深情|惆怅/i, mood: 'melancholic' },
  { pattern: /minimal|sparse|stripped|bare|极简|简约|稀疏|干净/i, mood: 'minimal' },
  { pattern: /complex|intricate|detailed|layered|rich|lush|复杂|层次|丰富|华丽|细腻/i, mood: 'complex' },
  { pattern: /psychedelic|trippy|spacey|weird|experimental|迷幻|太空|怪异|实验/i, mood: 'psychedelic' },
];

/**
 * Main analysis function - extracts intent from user prompt
 */
export function analyzeIntent(userPrompt) {
  if (!userPrompt || typeof userPrompt !== 'string') {
    return { genre: 'house', bpm: 124, key: 'C:minor', mood: 'energetic', complexity: 'medium' };
  }
  
  const prompt = userPrompt.trim();
  
  // Detect genre
  const genre = detectGenre(prompt);
  
  // Detect BPM (explicit or default)
  const bpm = detectBPM(prompt, genre);
  
  // Detect key/scale
  const key = detectKey(prompt, genre);
  
  // Detect mood
  const mood = detectMood(prompt);
  
  // Detect complexity preference
  const complexity = detectComplexity(prompt);
  
  return { genre, bpm, key, mood, complexity };
}

function detectGenre(prompt) {
  for (const { pattern, genre } of GENRE_PATTERNS) {
    if (pattern.test(prompt)) return genre;
  }
  // Fallback: check if prompt mentions any genre from GENRE_SOUND_MAP
  const lowerPrompt = prompt.toLowerCase();
  for (const g of Object.keys(GENRE_SOUND_MAP)) {
    if (lowerPrompt.includes(g)) return g;
  }
  return 'house'; // default
}

function detectBPM(prompt, genre) {
  // Try explicit BPM mention
  const bpmMatch = prompt.match(/(\d{2,3})\s*bpm/i);
  if (bpmMatch) {
    const bpm = parseInt(bpmMatch[1]);
    if (bpm >= 40 && bpm <= 300) return bpm;
  }
  
  // Try "at X" pattern
  const atMatch = prompt.match(/at\s+(\d{2,3})/i);
  if (atMatch) {
    const bpm = parseInt(atMatch[1]);
    if (bpm >= 40 && bpm <= 300) return bpm;
  }
  
  return DEFAULT_BPMS[genre] || 120;
}

function detectKey(prompt, genre) {
  for (const { pattern, extract } of KEY_PATTERNS) {
    const match = prompt.match(pattern);
    if (match) return extract(match);
  }
  return DEFAULT_KEYS[genre] || 'C:minor';
}

function detectMood(prompt) {
  const moods = [];
  for (const { pattern, mood } of MOOD_PATTERNS) {
    if (pattern.test(prompt)) moods.push(mood);
  }
  return moods.length > 0 ? moods[0] : 'energetic';
}

function detectComplexity(prompt) {
  if (/simple|basic|easy|minimal|stripped|简单|基础|极简/i.test(prompt)) return 'simple';
  if (/complex|advanced|intricate|detailed|rich|layered|many|big|复杂|高级|层次|丰富/i.test(prompt)) return 'complex';
  return 'medium';
}

// Helper: normalize key name
function normalizeKey(key) {
  return key.replace('♯', '#').replace('♭', 'b');
}

// Helper: normalize mode name
function normalizeMode(mode) {
  const m = mode.toLowerCase();
  if (m === 'min') return 'minor';
  if (m === 'maj') return 'major';
  return m;
}
