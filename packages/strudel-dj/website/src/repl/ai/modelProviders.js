/**
 * Model Provider Presets
 * 
 * Defines available AI model providers. API keys are stored in localStorage
 * (never committed). This file contains only non-secret configuration.
 * 
 * To add a new provider, add an entry below. The UI will pick it up automatically.
 */

export const MODEL_PROVIDERS = {
  'yxai88': {
    name: 'yxai88',
    baseURL: 'https://api.yxai88.com',
    authStyle: 'apiKey',
    defaultModel: 'claude-sonnet-4-6',
    description: 'Anthropic-native compatible proxy (api.yxai88.com, x-api-key auth)',
  },
  'deepseek': {
    name: 'DeepSeek',
    baseURL: 'https://api.deepseek.com/anthropic',
    authStyle: 'authToken',
    defaultModel: 'deepseek-v4-pro',
    description: 'DeepSeek V4 Pro via official Anthropic-compatible endpoint (api.deepseek.com/anthropic)',
  },
  'kimi': {
    name: 'Kimi Code',
    baseURL: 'https://api.kimi.com/coding',
    authStyle: 'authToken',
    defaultModel: 'kimi-for-coding',
    description: 'Kimi K2.6 via Anthropic-compatible coding endpoint (api.kimi.com/coding)',
  },
  'claude-official': {
    name: 'Claude Official (Anthropic)',
    baseURL: '',
    authStyle: 'apiKey',
    defaultModel: 'claude-sonnet-4-6',
    description: 'Direct Anthropic API (api.anthropic.com)',
  },
  'custom': {
    name: 'Custom Provider',
    baseURL: '',
    authStyle: 'auto',
    defaultModel: '',
    description: 'Manually configure base URL, auth style, and model',
  },
};

/** Get the list of provider IDs in display order */
export function getProviderList() {
  return Object.keys(MODEL_PROVIDERS);
}

/** Get provider config by ID */
export function getProvider(id) {
  return MODEL_PROVIDERS[id] || null;
}

/** Build storage key for a provider's API key */
export function getProviderKeyStorageId(providerId) {
  return `ai_key_${providerId}`;
}
