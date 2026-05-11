/**
 * Model Provider Presets
 * 
 * Defines available AI model providers. API keys are stored in localStorage
 * (never committed). This file contains only non-secret configuration.
 * 
 * To add a new provider, add an entry below. The UI will pick it up automatically.
 */

export const MODEL_PROVIDERS = {
  'claude-code': {
    name: 'Claude Code (Third-party)',
    baseURL: '',
    authStyle: 'authToken',
    defaultModel: 'claude-sonnet-4-6',
    description: 'yxai88 or similar third-party Claude API proxy',
  },
  'deepseek': {
    name: 'DeepSeek',
    baseURL: 'https://api.deepseek.com/anthropic',
    authStyle: 'authToken',
    defaultModel: 'deepseek-chat',
    description: 'DeepSeek V3/R1 via Anthropic-compatible endpoint',
  },
  'kimi': {
    name: 'Kimi (Moonshot)',
    baseURL: 'https://api.moonshot.cn/anthropic',
    authStyle: 'authToken',
    defaultModel: 'kimi-k2-0905-preview',
    description: 'Kimi K2 via Anthropic-compatible endpoint (kimi.com/code/docs)',
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
