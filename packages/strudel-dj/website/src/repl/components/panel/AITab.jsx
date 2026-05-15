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
import { buildEnhancedPrompt, buildModifyPrompt, buildStyleEnhancedPrompt } from '../../ai/promptBuilder.js';
import { analyzeAudioFile, checkEssentiaStatus, styleProfileToIntent, buildStyleGuidance, getDrumBankRecommendation } from '../../ai/style/styleProfile.js';
import { GENERATE_TOOLS, handleGenerateCode, handleListSounds, validateCode as toolValidateCode } from '../../ai/tools.js';
import { parseLayers, detectCodeGenre, detectCodeKey, detectCodeBPM } from '../../ai/codeParser.js';
import { generateAlternatives, generateRhythmVariants, generateHarmonyVariants, applyAlternative } from '../../ai/alternatives.js';
import SYSTEM_PROMPT from '../../ai/prompts/system-generate.txt?raw';
import MODIFY_SYSTEM_PROMPT from '../../ai/prompts/system-modify.txt?raw';
import DJ_SYSTEM_PROMPT from '../../ai/prompts/system-dj.txt?raw';
import VISUAL_SYSTEM_PROMPT from '../../ai/prompts/system-visual.txt?raw';

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

// SYSTEM_PROMPT, MODIFY_SYSTEM_PROMPT, DJ_SYSTEM_PROMPT are now imported from ../../ai/prompts/*.txt?raw

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
  const [visualMode, setVisualMode] = useState(false); // Hydra visual generation
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

  // Style Profile state (Essentia audio analysis)
  const [styleProfile, setStyleProfile] = useState(null); // Essentia analysis result
  const [styleLoading, setStyleLoading] = useState(false); // Analysis in progress
  const [styleError, setStyleError] = useState(null);
  const [essentiaAvailable, setEssentiaAvailable] = useState(null); // null=unknown, true/false
  const fileInputRef = useRef(null);

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

      // Check if user explicitly selected a provider in Settings
      const explicitProvider = localStorage.getItem('ai_provider');
      const hasLocalBase = !!base;
      const hasLocalKey = !!secret;
      const hasLocalModel = !!model;
      console.info(`[AI] Config init: ai_provider=${explicitProvider || '(none)'} | baseURL=${base || '(none)'} | model=${model || '(none)'} | keyLen=${secret.length}`);

      if (file && typeof file === 'object') {
        // === Provider resolution strategy ===
        // Priority: explicit provider > localStorage config > built-in defaults > file fallback
        // The file (anthropic.provider.json) is ONLY used when nothing else is configured.
        const useFileAsFallback = !explicitProvider;

        if (useFileAsFallback) {
          // No explicit provider saved. Check if user has any config in localStorage.
          if (!hasLocalBase && !hasLocalKey) {
            // Truly fresh session — use built-in deepseek defaults (consistent with Settings UI)
            // instead of the file's yxai88 config. The file's API key is still a fallback.
            base = 'https://api.deepseek.com/anthropic';
            model = model || 'deepseek-v4-pro';
            pref = 'authToken';
            // Persist these defaults so state is consistent across tabs/sessions
            localStorage.setItem('ai_provider', 'deepseek');
            localStorage.setItem('anthropic_base_url', base);
            localStorage.setItem('anthropic_auth_style_pref', pref);
            if (!hasLocalModel) localStorage.setItem('anthropic_model', model);
            console.info('[AI] Fresh session — defaulting to DeepSeek (matches Settings UI)');
          } else {
            // User has some config in localStorage but no explicit provider.
            // Use their saved config, not the file's baseURL.
            console.info('[AI] Using localStorage config (no explicit provider)');
          }
          // API key: only use file key when no key in localStorage at all
          if (!hasLocalKey) {
            const lsKey = secret;
            if (typeof file.authToken === 'string' && file.authToken.trim()) secret = file.authToken.trim();
            else if (typeof file.apiKey === 'string' && file.apiKey.trim()) secret = file.apiKey.trim();
            if (secret !== lsKey) {
              const maskedOld = lsKey ? `${lsKey.slice(0, 4)}...${lsKey.slice(-4)}` : '(empty)';
              const maskedNew = `${secret.slice(0, 6)}...${secret.slice(-4)}`;
              console.info(`[AI] Key source: provider.json (${maskedNew}), no localStorage key found`);
            }
          }
          // Auth style from file: only if localStorage has no preference set
          if (pref === 'auto') {
            if (file.authStyle === 'authToken') pref = 'authToken';
            else if (file.authStyle === 'apiKey') pref = 'apiKey';
          }
          // Model from file: only if no model in localStorage
          if (!model) {
            if (typeof file.model === 'string' && file.model.trim()) model = file.model.trim();
            else if (typeof file.modelId === 'string' && file.modelId.trim()) model = file.modelId.trim();
          }
        } else {
          console.info(`[AI] Provider explicitly set to "${explicitProvider}", ignoring anthropic.provider.json`);
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
      console.info(`[AI] Config resolved: baseURL=${base || '(default)'} | model=${model} | auth=${pref} | explicitProvider=${explicitProvider || '(none)'}`);
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
  const BRIDGE_URL = 'http://localhost:8765';
  const [ccOutput, setCcOutput] = useState('');

  // === LLM Interaction Logging (fire-and-forget to vital-bridge) ===
  const saveLLMLog = useCallback((sysPrompt, usrPrompt, fullResp, thinkingBlocks,
    logMode, logModel, logIntent, logPresetGuidance, logDuration, parseError) => {
    const payload = {
      system_prompt: sysPrompt,
      user_prompt: usrPrompt,
      full_response: fullResp,
      thinking_blocks: (thinkingBlocks || []).map(b => ({
        text: typeof b === 'string' ? b.slice(0, 3000) : (b.text || '').slice(0, 3000),
      })),
      mode: logMode,
      model: logModel,
      intent: logIntent || {},
      preset_guidance: logPresetGuidance || '',
      duration_sec: logDuration || 0,
      translation_error: parseError || '',
    };
    fetch(`${BRIDGE_URL}/log/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    }).then(r => r.json()).then(d => {
      if (d.ok) console.info(`[AI] Log saved: ${d.file}`);
    }).catch(() => {});
  }, [BRIDGE_URL]);

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

  // === Style Profile: Audio Analysis ===
  const handleAudioUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/flac', 'audio/ogg', 'audio/mp4', 'audio/x-m4a', 'audio/x-wav'];
    const validExts = ['.wav', '.mp3', '.flac', '.ogg', '.m4a', '.aac'];
    const ext = (file.name || '').toLowerCase().slice(-4);
    if (!validTypes.includes(file.type) && !validExts.includes(ext) && file.type !== '') {
      setStyleError(`Unsupported format: ${file.type || ext}. Use WAV, MP3, FLAC, OGG, or M4A.`);
      return;
    }

    setStyleLoading(true);
    setStyleError(null);
    setStyleProfile(null);

    log(`Analyzing audio: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
    setProcessingHint('Analyzing audio with Essentia...');

    try {
      const profile = await analyzeAudioFile(file);
      setStyleProfile(profile);

      // Auto-populate the prompt with the style description
      const desc = profile.description || `${profile.genre?.primary || ''} track`;
      if (!prompt.trim()) {
        setPrompt(`Generate a track in the style of this reference: ${desc}`);
      }

      log(`Style analysis complete: ${profile.genre?.primary} | ${profile.bpm?.value || '?'}bpm | ${profile.key?.value || '?'} | ${profile.mood?.primary}`);
      setProcessingHint('');
    } catch (err) {
      const msg = err.message || String(err);
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        setStyleError('vital-bridge not running. Start it with: uvicorn server:app --port 8765');
      } else {
        setStyleError(msg);
      }
      log(`Style analysis failed: ${msg}`, 'error');
      setProcessingHint('');
    } finally {
      setStyleLoading(false);
    }
  };

  // Check Essentia availability on mount
  useEffect(() => {
    checkEssentiaStatus().then(status => {
      setEssentiaAvailable(status.available && status.essentia_installed);
      if (status.available && status.essentia_installed) {
        if (status.models_count > 0) {
          log(`Essentia ready with ${status.models_count} models`);
        } else if (status.models_missing?.length > 0) {
          log(`Essentia installed but ${status.models_missing.length} models missing. Run: mkdir -p ~/essentia_models && download models from essentia.upf.edu`, 'warn');
        }
      }
    }).catch(() => setEssentiaAvailable(false));
  }, []);

  const clearStyleProfile = () => {
    setStyleProfile(null);
    setStyleError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const generateResponse = async (isAutoDJ = false) => {
    // Read directly from localStorage to avoid stale React state after provider switch.
    // React state updates (via syncFromStorage) may not have flushed by the time
    // the user clicks "send", causing wrong API key / baseURL to be used.
    const currentKey = localStorage.getItem('anthropic_api_key') || apiKey;
    const currentBase = localStorage.getItem('anthropic_base_url') || baseURL;
    const currentAuthStyle = (localStorage.getItem('anthropic_auth_style_pref') || authStylePref || 'auto');
    const currentModel = localStorage.getItem('anthropic_model') || modelId;

    if (!currentKey) {
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
    const resolvedModel = (currentModel || '').trim() || DEFAULT_ANTHROPIC_MODEL;
    log(`Starting ${mode} request → ${resolvedModel} @ ${currentBase || 'api.anthropic.com'}`);
    setError(null);
    if (!isAutoDJ) {
      setRationale(null);
      setPendingPatches([]);
    }

    try {
      const client = createAnthropicClient(currentKey, currentBase, currentAuthStyle);

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
      // Build editor context for state-aware generation
      const editorContext = {
        currentCode,
        isPlaying: context.editorRef?.current?.repl?.state?.playing || false,
        evalError: context.editorRef?.current?.repl?.state?.evalError
          ? (context.editorRef.current.repl.state.evalError.message || String(context.editorRef.current.repl.state.evalError))
          : null,
      };
      setProcessingHint('Building context...');
      
      // If we have a style profile from audio analysis, use style-guided prompt building
      let systemPrompt;
      if (styleProfile && !styleProfile._fallback) {
        log('Using style-profile-guided prompt (Essentia audio analysis)');
        systemPrompt = await buildStyleEnhancedPrompt(
          styleProfile,
          prompt || '',
          SYSTEM_PROMPT,
          editorContext,
          {
            styleProfile: {
              styleProfileToIntent,
              buildStyleGuidance,
              getDrumBankRecommendation,
            }
          }
        );
      } else {
        systemPrompt = await buildEnhancedPrompt(intent, prompt || '', SYSTEM_PROMPT, presetGuidance, editorContext);
      }

      if (mode === 'modify' || isAutoDJ) {
        const request = isAutoDJ
          ? (prompt || "Evolve the track musically. Surprise me, but keep it coherent.")
          : prompt;

        userMessage = `Here is the current strudel code:\n\n\`\`\`javascript\n${currentCode}\n\`\`\`\n\nRequest: ${request}\n\nUse the generate_strudel_code tool to submit the modified code.`;
        systemPrompt = isAutoDJ
          ? DJ_SYSTEM_PROMPT + presetGuidance
          : await buildModifyPrompt(intent, currentCode, MODIFY_SYSTEM_PROMPT, presetGuidance, editorContext);
      }

      let messages = [
          {
            role: "user",
            content: userMessage
          }
      ];

      let retries = 0;
      const maxRetries = 3;
      let fullText = '';       // Declared here so catch block can access
      let thinkingBlocks = []; // Same — for error logging

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

        // Detect if the provider supports Anthropic tool_use.
        // Third-party Anthropic-compatible endpoints (DeepSeek, Kimi) may not
        // fully support function calling. For those, fall back to text-based
        // code extraction like strudel.vibelive.club does.
        // Append visual prompt if Hydra mode is enabled
        const finalSystemPrompt = visualMode
          ? systemPrompt + '\n\n' + VISUAL_SYSTEM_PROMPT
          : systemPrompt;

        const isAnthropicProvider = !baseURL || baseURL.includes('api.anthropic.com') || baseURL.includes('api.yxai88.com');
        const streamSystemPrompt = isAnthropicProvider
          ? finalSystemPrompt
          : finalSystemPrompt + '\n\n## Code Output Format\nYou MUST output your Strudel code inside a fenced code block:\n```strudel\n// your complete code here\n```\n\nFirst, explain your approach in 1-2 sentences. Then output the code block.';

        const stream = await client.messages.stream({
          model: resolvedModel,
          max_tokens: 20000,
          system: streamSystemPrompt,
          messages: messages,
          tools: isAnthropicProvider ? GENERATE_TOOLS : undefined,
        });

        fullText = '';
        thinkingBlocks = []; // Capture thinking/reasoning content for logging
        let toolUseBlocks = []; // Track tool_use content blocks
        let thinkingCharCount = 0;
        let lastUpdate = 0;
        for await (const event of stream) {
          // Track tool_use block starts
          if (event.type === 'content_block_start' && event.content_block?.type === 'tool_use') {
            toolUseBlocks.push({
              id: event.content_block.id,
              name: event.content_block.name,
              input_json: '',
            });
            setProcessingHint(`Calling tool: ${event.content_block.name}...`);
          }
          // Capture tool input JSON deltas
          if (event.type === 'content_block_delta' && event.delta?.type === 'input_json_delta') {
            const block = toolUseBlocks[toolUseBlocks.length - 1];
            if (block) block.input_json += (event.delta.partial_json || '');
          }
          // Capture thinking deltas (model's internal reasoning)
          if (event.type === 'content_block_delta' && event.delta?.type === 'thinking_delta') {
            thinkingBlocks.push({ text: event.delta.thinking, ts: Date.now() });
            thinkingCharCount += (event.delta.thinking || '').length;
            setProcessingHint(`Thinking... (${Math.round(thinkingCharCount/1000)}k chars)`);
          }
          // Capture text deltas (the actual output)
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

        // Build tool_use blocks from captured streaming events as fallback
        const capturedToolUses = toolUseBlocks.map(b => {
          try { return { type: 'tool_use', id: b.id, name: b.name, input: JSON.parse(b.input_json || '{}') }; }
          catch { return { type: 'tool_use', id: b.id, name: b.name, input: {} }; }
        });

        let toolUses = [];
        try {
          const finalMessage = await stream.finalMessage();
          const tokens = finalMessage.usage;
          log(`Stream complete — input: ${tokens?.input_tokens || '?'} tokens, output: ${tokens?.output_tokens || '?'} tokens (${fullText.length} chars, ${thinkingBlocks.length} thinking blocks)`);
          toolUses = (finalMessage.content || []).filter(c => c.type === 'tool_use');
        } catch (finalErr) {
          // finalMessage() can throw when the response has only tool_use blocks
          // (no text content). Fall back to tool_use blocks captured from streaming events.
          log(`finalMessage failed (${finalErr.message}), using captured ${capturedToolUses.length} tool_use blocks`, 'warn');
          toolUses = capturedToolUses;
        }
        setProcessingHint('Processing response...');

        if (toolUses.length > 0) {
          log(`Model used ${toolUses.length} tool(s): ${toolUses.map(t => t.name).join(', ')}`);
          setProcessingHint('Executing tools...');

          let shouldContinue = false;
          let toolResults = [];

          for (const toolUse of toolUses) {
            if (toolUse.name === 'generate_strudel_code') {
              const { code, rationale } = toolUse.input || {};
              setProcessingHint('Validating generated code...');

              const genResult = await handleGenerateCode({ code, rationale });

              if (genResult.success) {
                // === Code is valid — apply it ===
                const { code: validatedCode, replacements } = fixInvalidSounds(genResult.code);
                if (replacements.length > 0) {
                  console.info('[Strudel AI] Fixed invalid sounds:', replacements);
                  const fixNote = replacements.map(r => `${r.original} → ${r.replacement}`).join(', ');
                  setRationale(prev => (prev || '') + `\n\n🔧 Auto-fixed sounds: ${fixNote}`);
                }
                context.editorRef.current.setCode(validatedCode);

                // === Post-eval self-correction: check for runtime errors ===
                setProcessingHint('Checking for runtime errors...');
                try {
                  // evaluate with autostart=false to detect errors without starting audio
                  await context.editorRef.current.repl.evaluate(validatedCode, false);
                  const evalError = context.editorRef.current.repl.state.evalError;
                  if (evalError) {
                    const errMsg = evalError.message || String(evalError);
                    log(`Runtime error (self-correcting): ${errMsg}`, 'warn');
                    toolResults.push({
                      type: 'tool_result',
                      tool_use_id: toolUse.id,
                      content: `Code passed pre-validation but produced a runtime error when executed:\n\n${errMsg}\n\nFix the error and call generate_strudel_code again with corrected code.`,
                      is_error: true,
                    });
                    shouldContinue = true;
                    break;
                  }
                } catch (evalErr) {
                  // evaluate() itself threw (unlikely since repl catches internally, but guard)
                  log(`Evaluate threw (self-correcting): ${evalErr.message}`, 'warn');
                  toolResults.push({
                    type: 'tool_result',
                    tool_use_id: toolUse.id,
                    content: `Code evaluation failed: ${evalErr.message}\n\nFix the code and retry.`,
                    is_error: true,
                  });
                  shouldContinue = true;
                  break;
                }

                if (genResult.rationale) setRationale(genResult.rationale);
                log(`Code applied! ${validatedCode.length} chars (${elapsedSecRef.current}s)`, 'highlight');

                // Save success log
                saveLLMLog(systemPrompt, userMessage, fullText, thinkingBlocks,
                  isAutoDJ ? 'dj' : mode, resolvedModel, intent || {}, presetGuidance,
                  elapsedSecRef.current, '');
                // Ensure we exit both loops on success
                shouldContinue = false;
                break;
              } else {
                // Validation failed — report error back to model for retry
                log(`Validation failed: ${genResult.error}`, 'error');
                toolResults.push({
                  type: 'tool_result',
                  tool_use_id: toolUse.id,
                  content: genResult.error,
                  is_error: true,
                });
                shouldContinue = true;
              }
            } else if (toolUse.name === 'list_available_sounds') {
              setProcessingHint('Querying available sounds...');
              const category = toolUse.input?.category || 'all';
              log(`Model queried sounds: ${category}`);

              const soundList = await handleListSounds({ category });

              toolResults.push({
                type: 'tool_result',
                tool_use_id: toolUse.id,
                content: soundList,
              });
              shouldContinue = true;
            } else {
              // Unknown tool
              toolResults.push({
                type: 'tool_result',
                tool_use_id: toolUse.id,
                content: `Unknown tool: ${toolUse.name}`,
                is_error: true,
              });
              shouldContinue = true;
            }
          }

          if (!shouldContinue) break; // generate_strudel_code succeeded — done

          // Detect: model queried sounds but never called generate_strudel_code
          const hasCodeGen = toolUses.some(t => t.name === 'generate_strudel_code');
          const hasSoundQuery = toolUses.some(t => t.name === 'list_available_sounds');

          // Push tool calls + results into conversation for next turn
          retries++;
          if (retries >= maxRetries) {
            const summary = hasCodeGen
              ? toolResults.filter(t => t.is_error).map(t => t.content).join('; ')
              : 'Model only queried sounds but never generated code.';
            setError(`Failed after ${maxRetries} attempts. ${summary}`);
            break;
          }

          messages.push({
            role: 'assistant',
            content: finalMessage.content.filter(c => c.type === 'tool_use' || c.type === 'text'),
          });
          messages.push({
            role: 'user',
            content: toolResults,
          });
          // Nudge: if model only queried sounds, remind it to generate code
          if (hasSoundQuery && !hasCodeGen) {
            messages.push({
              role: 'user',
              content: 'You now have the sound list. Call generate_strudel_code with your complete Strudel pattern code and a rationale.',
            });
          }
          continue;
        }

        // === Fallback: no tool_use — extract code from text response ===
        // Two strategies: legacy JSON parse ({"code": "...", "rationale": "..."}),
        // or markdown fenced code blocks (```strudel / ```javascript / ```js) like strudel.vibelive.club.
        log('No tool_use detected, extracting code from text...');

        let extractedCode = null;
        let extractedRationale = '';

        // Strategy 1: Extract code from fenced ```strudel / ```javascript / ```js block
        const fenceRe = /```(?:strudel|javascript|js)\s*\n?([\s\S]*?)```/i;
        const fenceMatch = fenceRe.exec(fullText);
        if (fenceMatch) {
          extractedCode = fenceMatch[1].trim();
          // Use text before the code block as rationale
          const preBlock = fullText.slice(0, fullText.indexOf(fenceMatch[0])).trim();
          extractedRationale = preBlock.slice(0, 300);
        }

        // Strategy 2: Legacy JSON parse
        if (!extractedCode) {
          try {
            const result = parseBetaContentBlock({ text: fullText });
            if (result && result.code) {
              extractedCode = result.code;
              extractedRationale = result.rationale || '';
            }
          } catch (_) { /* fall through */ }
        }

        if (extractedCode) {
          const validationError = await toolValidateCode(extractedCode);
          if (!validationError) {
            const { code: validatedCode, replacements } = fixInvalidSounds(extractedCode);
            if (replacements.length > 0) {
              const fixNote = replacements.map(r => `${r.original} → ${r.replacement}`).join(', ');
              setRationale(prev => (prev || '') + `\n\n🔧 Auto-fixed sounds: ${fixNote}`);
            }
            context.editorRef.current.setCode(validatedCode);

            // === Post-eval self-correction (same as tool_use path) ===
            setProcessingHint('Checking for runtime errors...');
            try {
              await context.editorRef.current.repl.evaluate(validatedCode, false);
              const evalError = context.editorRef.current.repl.state.evalError;
              if (evalError) {
                const errMsg = evalError.message || String(evalError);
                log(`Runtime error (self-correcting): ${errMsg}`, 'warn');
                retries++;
                if (retries >= maxRetries) {
                  setError(`Failed after ${maxRetries} attempts. Runtime error: ${errMsg}`);
                  break;
                }
                messages.push({ role: 'assistant', content: String(fullText).slice(0, 500) });
                messages.push({ role: 'user', content: `Your code produced this runtime error when evaluated:\n\n${errMsg}\n\nFix the error and output corrected code in a \`\`\`strudel code block.` });
                continue;
              }
            } catch (evalErr) {
              log(`Evaluate threw (self-correcting): ${evalErr.message}`, 'warn');
              retries++;
              if (retries >= maxRetries) {
                setError(`Failed after ${maxRetries} attempts. Eval error: ${evalErr.message}`);
                break;
              }
              messages.push({ role: 'assistant', content: String(fullText).slice(0, 500) });
              messages.push({ role: 'user', content: `Code evaluation failed: ${evalErr.message}\n\nFix and output corrected code in a \`\`\`strudel code block.` });
              continue;
            }

            if (extractedRationale) setRationale(extractedRationale);
            log(`Code applied via text extraction! ${validatedCode.length} chars`, 'highlight');
            saveLLMLog(systemPrompt, userMessage, fullText, thinkingBlocks,
              isAutoDJ ? 'dj' : mode, resolvedModel, intent || {}, presetGuidance,
              elapsedSecRef.current, '');
            break;
          } else {
            retries++;
            if (retries >= maxRetries) {
              setError(`Failed after ${maxRetries} attempts. Last error: ${validationError}`);
              break;
            }
            messages.push({ role: 'assistant', content: String(fullText).slice(0, 500) });
            messages.push({ role: 'user', content: `Code validation error: ${validationError}\n\nFix the error and output corrected code in a \`\`\`strudel code block.` });
            continue;
          }
        }

        // Neither tool_use nor extractable code found
        retries++;
        if (retries >= maxRetries) {
          setError(`Failed after ${maxRetries} attempts. Model did not produce extractable code.`);
          break;
        }
        messages.push({
          role: 'assistant',
          content: String(fullText).slice(0, 500),
        });
        messages.push({
          role: 'user',
          content: 'Output your Strudel code in a ```strudel code block. Include a brief explanation before the block.',
        });
        continue;
      }

    } catch (err) {
      // Save log even on fatal errors (if we have any response text)
      try {
        saveLLMLog(systemPrompt || '', userMessage || prompt || '',
          fullText, thinkingBlocks,
          isAutoDJ ? 'dj' : mode, resolvedModel, intent || {},
          presetGuidance || '', elapsedSecRef.current, err.message || String(err));
      } catch (_) { /* ignore */ }

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

      {/* Visual Mode toggle */}
      <label className="flex items-center gap-2 px-1 cursor-pointer hover:opacity-80">
        <input
          type="checkbox"
          checked={visualMode}
          onChange={(e) => setVisualMode(e.target.checked)}
          className="accent-pink-500 rounded"
        />
        <span className={cx('text-xs', visualMode ? 'text-pink-400 font-medium' : 'text-foreground/50')}>
          🎨 Visual (Hydra)
        </span>
      </label>

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
        {/* ── Style Analysis Section (Audio Upload) ── */}
        {mode === 'generate' && (
          <div className="space-y-2 p-2 rounded-md bg-purple-500/5 border border-purple-500/15">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-purple-400 flex items-center gap-1">
                <SparklesIcon className="w-3 h-3" />
                Audio Style Reference
              </label>
              {styleProfile && (
                <button
                  onClick={clearStyleProfile}
                  className="text-xs text-foreground/40 hover:text-red-400 transition-colors"
                  title="Clear style analysis"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              )}
            </div>

            {!styleProfile && (
              <>
                <label className={cx(
                  "flex items-center justify-center gap-2 p-3 rounded-md border border-dashed cursor-pointer transition-colors text-xs",
                  styleLoading
                    ? "border-purple-500/30 bg-purple-500/10 animate-pulse"
                    : "border-foreground/20 hover:border-purple-400/50 hover:bg-purple-500/5"
                )}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*,.wav,.mp3,.flac,.ogg,.m4a"
                    onChange={handleAudioUpload}
                    disabled={styleLoading}
                    className="hidden"
                  />
                  {styleLoading ? (
                    <>
                      <svg className="animate-spin h-3 w-3 text-purple-400" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="text-purple-300">Analyzing audio...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg">🎵</span>
                      <span className="text-foreground/60">
                        Upload a song to match its style
                      </span>
                    </>
                  )}
                </label>
                {essentiaAvailable === false && (
                  <p className="text-[10px] text-foreground/40 text-center">
                    Essentia not available. Install: <code className="bg-foreground/10 px-1 rounded">pip install essentia-tensorflow</code> in vital-bridge
                  </p>
                )}
              </>
            )}

            {/* Style Profile Display */}
            {styleProfile && (
              <div className="space-y-2 bg-black/10 rounded-md p-2 text-[11px]">
                <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                  <div className="text-foreground/50">Genre</div>
                  <div className="text-purple-300 font-medium">
                    {styleProfile.genre?.primary || '?'}
                    {styleProfile.genre?.confidence ? (
                      <span className="text-foreground/30 ml-1">({(styleProfile.genre.confidence * 100).toFixed(0)}%)</span>
                    ) : null}
                  </div>

                  <div className="text-foreground/50">BPM</div>
                  <div className="text-foreground/80">
                    {styleProfile.bpm ? `${styleProfile.bpm.value} BPM` : '—'}
                  </div>

                  <div className="text-foreground/50">Key</div>
                  <div className="text-foreground/80">
                    {styleProfile.key?.value || '—'}
                  </div>

                  <div className="text-foreground/50">Mood</div>
                  <div className="text-foreground/80 capitalize">
                    {styleProfile.mood?.primary || '—'}
                    {styleProfile.mood?.arousal != null ? (
                      <span className="text-foreground/30 ml-1">
                        (⚡{(styleProfile.mood.arousal * 100).toFixed(0)}% ☻{(styleProfile.mood.valence * 100).toFixed(0)}%)
                      </span>
                    ) : null}
                  </div>

                  {styleProfile.danceability && (
                    <>
                      <div className="text-foreground/50">Danceable</div>
                      <div className="text-foreground/80">
                        {styleProfile.danceability.danceable ? 'Yes' : 'No'} ({(styleProfile.danceability.probability * 100).toFixed(0)}%)
                      </div>
                    </>
                  )}

                  {styleProfile.voice && (
                    <>
                      <div className="text-foreground/50">Vocals</div>
                      <div className="text-foreground/80">
                        {styleProfile.voice.voice_present ? 'Present' : 'Instrumental'}
                      </div>
                    </>
                  )}
                </div>

                {styleProfile.instruments && (
                  <div className="pt-1 border-t border-foreground/10">
                    <span className="text-foreground/50">Instruments: </span>
                    <span className="text-foreground/70">{styleProfile.instruments.join(', ')}</span>
                  </div>
                )}

                {styleProfile.soundTags && (
                  <div>
                    <span className="text-foreground/50">Character: </span>
                    <span className="text-foreground/70">{styleProfile.soundTags.join(', ')}</span>
                  </div>
                )}

                {styleProfile.description && (
                  <p className="text-foreground/50 italic pt-1 border-t border-foreground/10 mt-1">
                    {styleProfile.description}
                  </p>
                )}
              </div>
            )}

            {styleError && (
              <div className="text-red-400 text-[11px] p-1.5 rounded bg-red-500/10 border border-red-500/20">
                {styleError}
              </div>
            )}
          </div>
        )}

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
