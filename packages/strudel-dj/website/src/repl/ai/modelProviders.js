/**
 * Model Provider Presets
 *
 * Built-in providers (no secrets). For local providers with API keys,
 * create modelProviders.local.json in this directory (gitignored).
 * Format: { "providers": { "id": { "name", "baseURL", "authStyle", "model", "apiKey", "verified" } } }
 */

/** Built-in provider presets (no API keys — for reference/config) */
export const BUILTIN_PROVIDERS = {
  'yxai88': {
    name: 'yxai88',
    baseURL: 'https://api.yxai88.com',
    authStyle: 'apiKey',
    model: 'claude-sonnet-4-6',
    description: 'Anthropic-native compatible proxy (api.yxai88.com, x-api-key auth)',
  },
  'deepseek': {
    name: 'DeepSeek',
    baseURL: 'https://api.deepseek.com/anthropic',
    authStyle: 'authToken',
    model: 'deepseek-v4-pro',
    description: 'DeepSeek V4 Pro via official Anthropic-compatible endpoint',
  },
  'kimi': {
    name: 'Kimi Code',
    baseURL: 'https://api.kimi.com/coding',
    authStyle: 'authToken',
    model: 'kimi-for-coding',
    description: 'Kimi K2.6 via Anthropic-compatible coding endpoint (api.kimi.com/coding)',
  },
  'claude-official': {
    name: 'Claude Official (Anthropic)',
    baseURL: '',
    authStyle: 'apiKey',
    model: 'claude-sonnet-4-6',
    description: 'Direct Anthropic API (api.anthropic.com)',
  },
  'custom': {
    name: 'Custom Provider',
    baseURL: '',
    authStyle: 'auto',
    model: '',
    description: 'Manually configure base URL, auth style, and model',
  },
};

/** Load local providers from modelProviders.local.json (if it exists) */
let _localProviders = null;
export async function loadLocalProviders() {
  if (_localProviders) return _localProviders;
  try {
    const resp = await fetch('/src/repl/ai/modelProviders.local.json', { cache: 'no-store' });
    if (!resp.ok) return {};
    const data = await resp.json();
    _localProviders = data.providers || {};
    return _localProviders;
  } catch {
    return {};
  }
}

/** Merge built-in + local providers. Local overrides take precedence. */
export async function getMergedProviders() {
  const local = await loadLocalProviders();
  const merged = {};
  // Built-in first
  for (const [id, p] of Object.entries(BUILTIN_PROVIDERS)) {
    merged[id] = { ...p };
  }
  // Local overrides (adds apiKey, maybe verified)
  for (const [id, p] of Object.entries(local)) {
    if (merged[id]) {
      // Merge: local can override any field and add apiKey
      Object.assign(merged[id], p);
    } else {
      // New provider from local config
      merged[id] = { ...p };
    }
  }
  return merged;
}

/** Get localStorage key for provider-specific API key */
export function getProviderKeyStorageId(providerId) {
  return `ai_provider_key_${providerId}`;
}

/** Get provider config by ID */
export function getProvider(id) {
  return BUILTIN_PROVIDERS[id] || null;
}

/**
 * Dynamically fetch available models from a provider's API.
 * Returns a sorted array of model ID strings, or null on failure.
 * Falls back gracefully — use getStaticModelSuggestions() if fetch fails.
 */
export async function fetchProviderModels(baseURL, apiKey, authStyle) {
  if (!baseURL || !apiKey) return null;

  const base = baseURL.replace(/\/+$/, '');
  const url = `${base}/v1/models`;

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (authStyle === 'authToken') {
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else {
      headers['x-api-key'] = apiKey;
    }

    const resp = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(10000),
    });
    if (!resp.ok) return null;

    const json = await resp.json();
    // Support both Anthropic format { data: [{ id }] } and OpenAI format { data: [{ id }] }
    const items = json.data || json.models || [];
    if (!items.length) return null;

    const modelIds = items
      .map(m => m.id || m.name || '')
      .filter(Boolean)
      .sort();

    return modelIds;
  } catch {
    return null;
  }
}

/**
 * Static model suggestions (fallback when dynamic fetch is unavailable).
 * Covers Anthropic official, yxai88, and common third-party providers.
 */
export function getStaticModelSuggestions(providerId) {
  // Provider-specific models
  const providerModels = {
    deepseek: ['deepseek-v4-pro', 'deepseek-v4-flash', 'deepseek-v3-1'],
    kimi: ['kimi-for-coding', 'kimi-k2.6-thinking', 'kimi-k2.6'],
  };

  if (providerModels[providerId]) {
    return providerModels[providerId];
  }

  // Default: full Anthropic Claude model list
  return [
    'claude-sonnet-4-6',
    'claude-sonnet-4-6-thinking',
    'claude-sonnet-4-5',
    'claude-sonnet-4-5-20250929',
    'claude-sonnet-4-5-20250929-thinking',
    'claude-sonnet-4-20250514',
    'claude-opus-4-7',
    'claude-opus-4-7-thinking',
    'claude-opus-4-7-low',
    'claude-opus-4-7-medium',
    'claude-opus-4-7-high',
    'claude-opus-4-7-xhigh',
    'claude-opus-4-7-max',
    'claude-opus-4-6',
    'claude-opus-4-6-thinking',
    'claude-opus-4-6-low',
    'claude-opus-4-6-medium',
    'claude-opus-4-6-high',
    'claude-opus-4-6-xhigh',
    'claude-opus-4-6-max',
    'claude-opus-4-5-20251101',
    'claude-opus-4-5-20251101-thinking',
    'claude-opus-4-1-20250805',
    'claude-opus-4-20250514',
    'claude-haiku-4-5-20251001',
    'claude-haiku-4-5-20251001-thinking',
    'claude-3-5-sonnet-20241022',
    'claude-3-5-sonnet-20240620',
    'claude-3-5-haiku-20241022',
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307',
  ];
}
