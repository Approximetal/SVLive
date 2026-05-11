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
