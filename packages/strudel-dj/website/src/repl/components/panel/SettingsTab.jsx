import { useState, useEffect, useCallback } from 'react';
import { defaultSettings, settingsMap, useSettings } from '../../../settings.mjs';
import { themes } from '@strudel/codemirror';
import { Textbox } from '../textbox/Textbox.jsx';
import { isUdels } from '../../util.mjs';
import { ButtonGroup } from './Forms.jsx';
import { AudioDeviceSelector } from './AudioDeviceSelector.jsx';
import { AudioEngineTargetSelector } from './AudioEngineTargetSelector.jsx';
import { confirmDialog } from '../../util.mjs';
import { DEFAULT_MAX_POLYPHONY, setMaxPolyphony, setMultiChannelOrbits } from '@strudel/webaudio';
import cx from '@src/cx.mjs';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/16/solid';
import { MODEL_PROVIDERS, getProviderKeyStorageId } from '../../ai/modelProviders.js';

// === Reusable Form Components ===

function Checkbox({ label, value, onChange, disabled = false }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer hover:opacity-80">
      <input disabled={disabled} type="checkbox" checked={value} onChange={onChange} className="rounded" />
      <span className="text-sm">{label}</span>
    </label>
  );
}

function SelectInput({ value, options, onChange }) {
  return (
    <select
      className="p-2 bg-background rounded-md text-foreground border border-foreground/20 text-sm"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {Object.entries(options).map(([k, label]) => (
        <option key={k} className="bg-background" value={k}>
          {label}
        </option>
      ))}
    </select>
  );
}

function NumberSlider({ value, onChange, step = 1, ...rest }) {
  return (
    <div className="flex space-x-2 gap-1">
      <input
        className="p-2 grow"
        type="range"
        value={value}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        {...rest}
      />
      <input
        type="number"
        value={value}
        step={step}
        className="w-16 bg-background rounded-md text-sm"
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function FormItem({ label, children }) {
  return (
    <div className="grid gap-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      {children}
    </div>
  );
}

// === Collapsible Section ===

function Section({ title, defaultOpen = false, children, icon }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-foreground/10 rounded-md overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 p-3 bg-lineHighlight/50 hover:bg-lineHighlight transition-colors text-left cursor-pointer"
      >
        {isOpen ? (
          <ChevronDownIcon className="w-4 h-4 text-foreground/60" />
        ) : (
          <ChevronRightIcon className="w-4 h-4 text-foreground/60" />
        )}
        {icon && <span>{icon}</span>}
        <span className="text-sm font-medium">{title}</span>
      </button>
      {isOpen && (
        <div className="p-4 space-y-4 border-t border-foreground/10">
          {children}
        </div>
      )}
    </div>
  );
}

// === Constants ===

const DEFAULT_ANTHROPIC_MODEL = 'claude-sonnet-4-6';
const ANTHROPIC_MODEL_SUGGESTIONS = [
  DEFAULT_ANTHROPIC_MODEL,
  'claude-sonnet-4-5',
  'claude-sonnet-4-6-thinking',
  'claude-sonnet-4-5-20250929',
  'claude-opus-4-7',
  'claude-opus-4-7-thinking',
  'claude-opus-4-6',
  'claude-opus-4-6-thinking',
  'claude-opus-4-5-20251101',
  'claude-haiku-4-5-20251001',
  'claude-3-5-sonnet-20241022',
  'claude-3-5-haiku-20241022',
  'claude-3-opus-20240229',
];

const themeOptions = Object.fromEntries(Object.keys(themes).map((k) => [k, k]));
const fontFamilyOptions = {
  monospace: 'monospace',
  Courier: 'Courier',
  CutiePi: 'CutiePi',
  JetBrains: 'JetBrains',
  Hack: 'Hack',
  FiraCode: 'FiraCode',
  'FiraCode-SemiBold': 'FiraCode SemiBold',
  teletext: 'teletext',
  tic80: 'tic80',
  mode7: 'mode7',
  BigBlueTerminal: 'BigBlueTerminal',
  x3270: 'x3270',
  Monocraft: 'Monocraft',
  PressStart: 'PressStart2P',
  'we-come-in-peace': 'we-come-in-peace',
  galactico: 'galactico',
};

const RELOAD_MSG = 'Changing this setting requires the window to reload itself. OK?';

// === Main Component ===

export function SettingsTab({ started }) {
  const {
    theme,
    keybindings,
    isBracketClosingEnabled,
    isBracketMatchingEnabled,
    isLineNumbersDisplayed,
    isPatternHighlightingEnabled,
    isActiveLineHighlighted,
    isAutoCompletionEnabled,
    isTooltipEnabled,
    isFlashEnabled,
    isButtonRowHidden,
    isCSSAnimationDisabled,
    isSyncEnabled,
    isLineWrappingEnabled,
    fontSize,
    fontFamily,
    panelPosition,
    audioDeviceName,
    audioEngineTarget,
    togglePanelTrigger,
    maxPolyphony,
    multiChannelOrbits,
    isTabIndentationEnabled,
    isMultiCursorEnabled,
    patternAutoStart,
  } = useSettings();

  const shouldAlwaysSync = isUdels();
  const canChangeAudioDevice = AudioContext.prototype.setSinkId != null;

  // AI API settings from localStorage
  const [aiProvider, setAiProvider] = useState(() => {
    const saved = localStorage.getItem('ai_provider');
    return saved && MODEL_PROVIDERS[saved] ? saved : 'claude-code';
  });
  const [aiBaseURL, setAiBaseURL] = useState(() => localStorage.getItem('anthropic_base_url') || '');
  const [aiApiKey, setAiApiKey] = useState(() => {
    const provider = localStorage.getItem('ai_provider') || 'yxai88';
    const savedKey = localStorage.getItem(getProviderKeyStorageId(provider));
    if (savedKey) return savedKey;
    return localStorage.getItem('anthropic_api_key') || '';
  });
  const [aiAuthStyle, setAiAuthStyle] = useState(() => localStorage.getItem('anthropic_auth_style_pref') || 'auto');
  const [aiModel, setAiModel] = useState(() => localStorage.getItem('anthropic_model') || DEFAULT_ANTHROPIC_MODEL);
  const [aiVerifyStatus, setAiVerifyStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [aiVerifyMsg, setAiVerifyMsg] = useState('');

  const updateAiSetting = (key, value, setter) => {
    setter(value);
    localStorage.setItem(key, value);
    window.dispatchEvent(new CustomEvent('ai-settings-changed'));
  };

  // Apply provider preset: fills baseURL, authStyle, model (not API key)
  const applyProviderPreset = (providerId) => {
    const preset = MODEL_PROVIDERS[providerId];
    if (!preset) return;
    setAiProvider(providerId);
    localStorage.setItem('ai_provider', providerId);
    updateAiSetting('anthropic_base_url', preset.baseURL, setAiBaseURL);
    updateAiSetting('anthropic_auth_style_pref', preset.authStyle, setAiAuthStyle);
    updateAiSetting('anthropic_model', preset.defaultModel, setAiModel);
    // Load saved API key for this provider
    const savedKey = localStorage.getItem(getProviderKeyStorageId(providerId)) || '';
    setAiApiKey(savedKey);
    localStorage.setItem('anthropic_api_key', savedKey);
    setAiVerifyStatus(null);
    setAiVerifyMsg('');
  };

  // Verify API connectivity
  const verifyApiConnection = async () => {
    setAiVerifyStatus('loading');
    setAiVerifyMsg('Testing connection...');
    try {
      const base = (aiBaseURL || '').trim();
      const apiKey = (aiApiKey || '').trim();
      if (!apiKey) throw new Error('No API key configured');
      const style = aiAuthStyle === 'apiKey' ? 'apiKey'
        : aiAuthStyle === 'authToken' ? 'authToken'
        : base ? 'authToken' : 'apiKey';
      const headers = { 'Content-Type': 'application/json' };
      if (style === 'authToken') {
        headers['Authorization'] = `Bearer ${apiKey}`;
      } else {
        headers['x-api-key'] = apiKey;
      }
      // Try to list models (lightweight check)
      const modelsURL = base ? `${base.replace(/\/$/, '')}/v1/models` : 'https://api.anthropic.com/v1/models';
      const res = await fetch(modelsURL, { method: 'GET', headers, signal: AbortSignal.timeout(10000) });
      if (res.ok) {
        setAiVerifyStatus('success');
        setAiVerifyMsg('Connection verified ✓');
      } else {
        const text = await res.text().catch(() => '');
        setAiVerifyStatus('error');
        setAiVerifyMsg(`HTTP ${res.status}: ${text.slice(0, 80)}`);
      }
    } catch (err) {
      setAiVerifyStatus('error');
      setAiVerifyMsg(err.message || 'Connection failed');
    }
  };

  // Save API key per provider when it changes
  const handleApiKeyChange = (value) => {
    setAiApiKey(value);
    localStorage.setItem('anthropic_api_key', value);
    localStorage.setItem(getProviderKeyStorageId(aiProvider), value);
    setAiVerifyStatus(null);
    setAiVerifyMsg('');
    window.dispatchEvent(new CustomEvent('ai-settings-changed'));
  };

  return (
    <div className="text-foreground p-4 space-y-3 w-full overflow-auto" style={{ fontFamily }}>
      {/* === AI API Configuration === */}
      <Section title="AI Configuration" icon="🤖" defaultOpen={!aiApiKey}>
        {/* Provider preset selector */}
        <FormItem label="Model Provider">
          <select
            value={aiProvider}
            onChange={(e) => applyProviderPreset(e.target.value)}
            className="w-full p-2 bg-background border border-foreground/20 rounded-md focus:ring-1 focus:ring-foreground outline-none text-sm"
          >
            {Object.entries(MODEL_PROVIDERS).map(([id, preset]) => (
              <option key={id} value={id}>
                {preset.name} — {preset.description}
              </option>
            ))}
          </select>
          <p className="text-xs text-foreground/40 mt-1">{MODEL_PROVIDERS[aiProvider]?.description || ''}</p>
        </FormItem>

        <FormItem label="API Base URL（可选，第三方代理）">
          <input
            type="text"
            value={aiBaseURL}
            onChange={(e) => updateAiSetting('anthropic_base_url', e.target.value, setAiBaseURL)}
            placeholder="留空则使用官方 https://api.anthropic.com"
            className="w-full p-2 bg-background border border-foreground/20 rounded-md focus:ring-1 focus:ring-foreground outline-none font-mono text-sm"
          />
        </FormItem>

        <FormItem label="认证方式">
          <select
            value={aiAuthStyle}
            onChange={(e) => updateAiSetting('anthropic_auth_style_pref', e.target.value, setAiAuthStyle)}
            className="w-full p-2 bg-background border border-foreground/20 rounded-md focus:ring-1 focus:ring-foreground outline-none text-sm"
          >
            <option value="auto">自动（填了 Base URL 时用 Bearer，否则用官方 API Key）</option>
            <option value="authToken">第三方 Bearer（authToken）</option>
            <option value="apiKey">官方 x-api-key</option>
          </select>
        </FormItem>

        <FormItem label="模型 ID">
          <input
            type="text"
            value={aiModel}
            onChange={(e) => updateAiSetting('anthropic_model', e.target.value, setAiModel)}
            list="settings-model-suggestions"
            placeholder={DEFAULT_ANTHROPIC_MODEL}
            className="w-full p-2 bg-background border border-foreground/20 rounded-md focus:ring-1 focus:ring-foreground outline-none font-mono text-sm"
          />
          <datalist id="settings-model-suggestions">
            {ANTHROPIC_MODEL_SUGGESTIONS.map((id) => (
              <option key={id} value={id} />
            ))}
          </datalist>
        </FormItem>

        <FormItem label="API Key / 第三方令牌">
          <input
            type="password"
            value={aiApiKey}
            onChange={(e) => handleApiKeyChange(e.target.value)}
            placeholder="sk-ant-... 或代理下发的令牌"
            className="w-full p-2 bg-background border border-foreground/20 rounded-md focus:ring-1 focus:ring-foreground outline-none text-sm"
          />
        </FormItem>

        {/* Verify button */}
        <div className="flex items-center gap-2">
          <button
            onClick={verifyApiConnection}
            disabled={aiVerifyStatus === 'loading'}
            className={cx(
              'px-3 py-1.5 rounded text-xs border transition-colors',
              aiVerifyStatus === 'loading'
                ? 'border-white/10 text-foreground/30 cursor-wait'
                : 'border-foreground/20 text-foreground/60 hover:border-foreground/40 hover:text-foreground/80'
            )}
          >
            {aiVerifyStatus === 'loading' ? '⏳ Verifying...' : '🔍 Verify Connection'}
          </button>
          {aiVerifyStatus === 'success' && (
            <span className="text-xs text-green-400">{aiVerifyMsg}</span>
          )}
          {aiVerifyStatus === 'error' && (
            <span className="text-xs text-red-400">{aiVerifyMsg}</span>
          )}
        </div>

        <p className="text-xs text-foreground/50 leading-relaxed">
          API keys are stored locally in your browser. Switch providers via the dropdown above.
        </p>
      </Section>

      {/* === Audio === */}
      <Section title="Audio" icon="🔊" defaultOpen={false}>
        {canChangeAudioDevice && (
          <FormItem label="Audio Output Device">
            <AudioDeviceSelector
              isDisabled={started}
              audioDeviceName={audioDeviceName}
              onChange={(audioDeviceName) => {
                confirmDialog(RELOAD_MSG).then((r) => {
                  if (r == true) {
                    settingsMap.setKey('audioDeviceName', audioDeviceName);
                    return window.location.reload();
                  }
                });
              }}
            />
          </FormItem>
        )}
        <FormItem label="Audio Engine Target">
          <AudioEngineTargetSelector
            target={audioEngineTarget}
            onChange={(target) => {
              confirmDialog(RELOAD_MSG).then((r) => {
                if (r == true) {
                  settingsMap.setKey('audioEngineTarget', target);
                  return window.location.reload();
                }
              });
            }}
          />
        </FormItem>
        <FormItem label="Maximum Polyphony">
          <Textbox
            min={1}
            max={Infinity}
            onBlur={(e) => {
              let v = parseInt(e.target.value);
              v = isNaN(v) ? DEFAULT_MAX_POLYPHONY : v;
              setMaxPolyphony(v);
              settingsMap.setKey('maxPolyphony', v);
            }}
            onChange={(v) => {
              v = Math.max(1, parseInt(v));
              settingsMap.setKey('maxPolyphony', isNaN(v) ? undefined : v);
            }}
            type="number"
            placeholder=""
            value={maxPolyphony ?? ''}
          />
        </FormItem>
        <Checkbox
          label="Multi Channel Orbits"
          onChange={(cbEvent) => {
            const val = cbEvent.target.checked;
            confirmDialog(RELOAD_MSG).then((r) => {
              if (r == true) {
                settingsMap.setKey('multiChannelOrbits', val);
                setMultiChannelOrbits(val);
                return window.location.reload();
              }
            });
          }}
          value={multiChannelOrbits}
        />
      </Section>

      {/* === Appearance === */}
      <Section title="Appearance" icon="🎨" defaultOpen={false}>
        <FormItem label="Theme">
          <SelectInput options={themeOptions} value={theme} onChange={(theme) => settingsMap.setKey('theme', theme)} />
        </FormItem>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormItem label="Font Family">
            <SelectInput
              options={fontFamilyOptions}
              value={fontFamily}
              onChange={(fontFamily) => settingsMap.setKey('fontFamily', fontFamily)}
            />
          </FormItem>
          <FormItem label="Font Size">
            <NumberSlider
              value={fontSize}
              onChange={(fontSize) => settingsMap.setKey('fontSize', fontSize)}
              min={10}
              max={40}
              step={2}
            />
          </FormItem>
        </div>
        <FormItem label="Panel Position">
          <ButtonGroup
            value={panelPosition}
            onChange={(value) => settingsMap.setKey('panelPosition', value)}
            items={{ bottom: 'Bottom', right: 'Right' }}
          />
        </FormItem>
        <FormItem label="Open Panel on:">
          <ButtonGroup
            value={togglePanelTrigger}
            onChange={(value) => settingsMap.setKey('togglePanelTrigger', value)}
            items={{ click: 'Click', hover: 'Hover' }}
          />
        </FormItem>
        <Checkbox
          label="Hide top buttons"
          onChange={(cbEvent) => settingsMap.setKey('isButtonRowHidden', cbEvent.target.checked)}
          value={isButtonRowHidden}
        />
        <Checkbox
          label="Disable CSS Animations"
          onChange={(cbEvent) => settingsMap.setKey('isCSSAnimationDisabled', cbEvent.target.checked)}
          value={isCSSAnimationDisabled}
        />
      </Section>

      {/* === Editor === */}
      <Section title="Editor" icon="📝" defaultOpen={false}>
        <FormItem label="Keybindings">
          <ButtonGroup
            value={keybindings}
            onChange={(keybindings) => settingsMap.setKey('keybindings', keybindings)}
            items={{ codemirror: 'Codemirror', vim: 'Vim', emacs: 'Emacs', vscode: 'VSCode' }}
          />
        </FormItem>
        <Checkbox
          label="Enable bracket matching"
          onChange={(cbEvent) => settingsMap.setKey('isBracketMatchingEnabled', cbEvent.target.checked)}
          value={isBracketMatchingEnabled}
        />
        <Checkbox
          label="Auto close brackets"
          onChange={(cbEvent) => settingsMap.setKey('isBracketClosingEnabled', cbEvent.target.checked)}
          value={isBracketClosingEnabled}
        />
        <Checkbox
          label="Display line numbers"
          onChange={(cbEvent) => settingsMap.setKey('isLineNumbersDisplayed', cbEvent.target.checked)}
          value={isLineNumbersDisplayed}
        />
        <Checkbox
          label="Highlight active line"
          onChange={(cbEvent) => settingsMap.setKey('isActiveLineHighlighted', cbEvent.target.checked)}
          value={isActiveLineHighlighted}
        />
        <Checkbox
          label="Highlight events in code"
          onChange={(cbEvent) => settingsMap.setKey('isPatternHighlightingEnabled', cbEvent.target.checked)}
          value={isPatternHighlightingEnabled}
        />
        <Checkbox
          label="Enable auto-completion"
          onChange={(cbEvent) => settingsMap.setKey('isAutoCompletionEnabled', cbEvent.target.checked)}
          value={isAutoCompletionEnabled}
        />
        <Checkbox
          label="Enable tooltips on Ctrl and hover"
          onChange={(cbEvent) => settingsMap.setKey('isTooltipEnabled', cbEvent.target.checked)}
          value={isTooltipEnabled}
        />
        <Checkbox
          label="Enable line wrapping"
          onChange={(cbEvent) => settingsMap.setKey('isLineWrappingEnabled', cbEvent.target.checked)}
          value={isLineWrappingEnabled}
        />
        <Checkbox
          label="Enable Tab indentation"
          onChange={(cbEvent) => settingsMap.setKey('isTabIndentationEnabled', cbEvent.target.checked)}
          value={isTabIndentationEnabled}
        />
        <Checkbox
          label="Enable Multi-Cursor (Cmd/Ctrl+Click)"
          onChange={(cbEvent) => settingsMap.setKey('isMultiCursorEnabled', cbEvent.target.checked)}
          value={isMultiCursorEnabled}
        />
        <Checkbox
          label="Enable flashing on evaluation"
          onChange={(cbEvent) => settingsMap.setKey('isFlashEnabled', cbEvent.target.checked)}
          value={isFlashEnabled}
        />
        <Checkbox
          label="Auto-start pattern on pattern change"
          onChange={(cbEvent) => settingsMap.setKey('patternAutoStart', cbEvent.target.checked)}
          value={patternAutoStart}
        />
      </Section>

      {/* === Vital Cache === */}
      <Section title="Vital Preset Cache" icon="💾" defaultOpen={false}>
        <VitalCachePanel />
      </Section>

      {/* === Sync & Advanced === */}
      <Section title="Advanced" icon="⚙️" defaultOpen={false}>
        <Checkbox
          label="Sync across Browser Tabs / Windows"
          onChange={(cbEvent) => {
            const newVal = cbEvent.target.checked;
            confirmDialog(RELOAD_MSG).then((r) => {
              if (r) {
                settingsMap.setKey('isSyncEnabled', newVal);
                window.location.reload();
              }
            });
          }}
          disabled={shouldAlwaysSync}
          value={isSyncEnabled}
        />
        <FormItem label="Zen Mode">
          <p className="text-sm text-foreground/60">Try clicking the logo in the top left!</p>
        </FormItem>
        <FormItem label="Reset Settings">
          <button
            className="bg-background p-2 max-w-[300px] rounded-md hover:opacity-50 border border-red-500/30 text-red-400 text-sm"
            onClick={() => {
              confirmDialog('Sure? This will reset all settings to defaults.').then((r) => {
                if (r) {
                  const { userPatterns } = settingsMap.get();
                  settingsMap.set({ ...defaultSettings, userPatterns });
                }
              });
            }}
          >
            Restore Default Settings
          </button>
        </FormItem>
      </Section>
    </div>
  );
}

// ============================================================
// Vital Cache Panel
// ============================================================

const BRIDGE_URL = 'http://localhost:8765';

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function VitalCachePanel() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clearing, setClearing] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BRIDGE_URL}/cache/stats`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStats(data);
    } catch (e) {
      setError(e.message);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleClear = useCallback(async () => {
    const ok = await confirmDialog(
      `Clear all ${stats ? stats.count : ''} cached Vital renders? (${stats ? formatBytes(stats.size_bytes) : ''})`
    );
    if (!ok) return;
    setClearing(true);
    try {
      const res = await fetch(`${BRIDGE_URL}/cache`, { method: 'DELETE' });
      const data = await res.json();
      setStats({ count: 0, size_bytes: 0, size_mb: 0, freed_mb: data.freed_mb });
    } catch (e) {
      setError(e.message);
    } finally {
      setClearing(false);
    }
  }, [stats]);

  return (
    <div className="space-y-3">
      {loading && !stats && (
        <div className="text-sm text-foreground/60">Fetching cache stats...</div>
      )}
      {error && (
        <div className="text-sm text-red-400">
          vital-bridge not reachable: {error}
          <button onClick={fetchStats} className="ml-2 underline text-blue-400">Retry</button>
        </div>
      )}
      {stats && (
        <>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white/5 rounded p-3">
              <div className="text-foreground/60 text-xs">Cached Files</div>
              <div className="text-lg font-mono">{stats.count}</div>
            </div>
            <div className="bg-white/5 rounded p-3">
              <div className="text-foreground/60 text-xs">Total Size</div>
              <div className="text-lg font-mono">{formatBytes(stats.size_bytes)}</div>
            </div>
          </div>
          <p className="text-xs text-foreground/40">
            Preset audio is rendered on first use and cached locally.
            Clear cache to free disk space — presets will re-render when needed.
          </p>
          <button
            onClick={handleClear}
            disabled={clearing || stats.count === 0}
            className={cx(
              'w-full p-2 rounded text-sm border transition-colors',
              stats.count === 0
                ? 'border-white/10 text-foreground/30 cursor-not-allowed'
                : 'border-red-500/30 text-red-400 hover:bg-red-500/10'
            )}
          >
            {clearing ? '⏳ Clearing...' : '\u{1F5D1}️ Clear All Cached Renders'}
          </button>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="w-full p-2 rounded text-xs text-foreground/50 hover:text-foreground/80 bg-white/5 hover:bg-white/10 transition-colors"
          >
            {'\u{1F504} Refresh'}
          </button>
        </>
      )}
    </div>
  );
}
