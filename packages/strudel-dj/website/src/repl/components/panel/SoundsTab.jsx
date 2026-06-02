import useEvent from '@src/useEvent.mjs';
import { useStore } from '@nanostores/react';
import { getAudioContext, soundMap, connectToDestination } from '@strudel/webaudio';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { settingsMap, soundFilterType, useSettings } from '../../../settings.mjs';
import { ButtonGroup } from './Forms.jsx';
import ImportSoundsButton from './ImportSoundsButton.jsx';
import { Textbox } from '../textbox/Textbox.jsx';
import { ActionButton } from '../button/action-button.jsx';
import { confirmDialog } from '@src/repl/util.mjs';
import { clearIDB, userSamplesDBConfig } from '@src/repl/idbutils.mjs';
import { prebake } from '@src/repl/prebake.mjs';
import BRIDGE_URL from '../../bridgeConfig.js';

const getSamples = (samples) =>
  Array.isArray(samples) ? samples.length : typeof samples === 'object' ? Object.values(samples).length : 1;

export function SoundsTab({ context }) {
  const sounds = useStore(soundMap);

  const { soundsFilter } = useSettings();
  const [search, setSearch] = useState('');
  const { BASE_URL } = import.meta.env;
  const baseNoTrailing = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

  const soundEntries = useMemo(() => {
    if (!sounds) {
      return [];
    }

    let filtered = Object.entries(sounds)
      .filter(([key]) => !key.startsWith('_'))
      .sort((a, b) => a[0].localeCompare(b[0]))
      .filter(([name]) => name.toLowerCase().includes(search.toLowerCase()));

    if (soundsFilter === soundFilterType.USER) {
      return filtered.filter(([_, { data }]) => !data.prebake);
    }
    if (soundsFilter === soundFilterType.DRUMS) {
      return filtered.filter(([_, { data }]) => data.type === 'sample' && data.tag === 'drum-machines');
    }
    if (soundsFilter === soundFilterType.SAMPLES) {
      return filtered.filter(([_, { data }]) => data.type === 'sample' && data.tag !== 'drum-machines');
    }
    if (soundsFilter === soundFilterType.SYNTHS) {
      return filtered.filter(([_, { data }]) => ['synth', 'soundfont'].includes(data.type));
    }
    if (soundsFilter === soundFilterType.WAVETABLES) {
      return filtered.filter(([_, { data }]) => data.type === 'wavetable');
    }
    if (soundsFilter === soundFilterType.VITAL) {
      return []; // Vital presets are handled separately
    }
    //TODO: tidy this up, it does not need to be saved in settings
    if (soundsFilter === 'importSounds') {
      return [];
    }
    return filtered;
  }, [sounds, soundsFilter, search]);

  // holds mutable ref to current triggered sound
  const trigRef = useRef();

  // Used to cycle through sound previews on banks with multiple sounds
  let soundPreviewIdx = 0;

  // stop current sound on mouseup
  useEvent('mouseup', () => {
    const ref = trigRef.current;
    trigRef.current = undefined;
    ref?.stop?.(getAudioContext().currentTime + 0.01);
  });
  return (
    <div id="sounds-tab" className="px-4 flex gap-2 flex-col w-full h-full text-foreground">
      <Textbox placeholder="Search" value={search} onChange={(v) => setSearch(v)} />

      <div className=" flex shrink-0 flex-wrap">
        <ButtonGroup
          value={soundsFilter}
          onChange={(value) => settingsMap.setKey('soundsFilter', value)}
          items={{
            samples: 'samples',
            drums: 'drum-machines',
            synths: 'Synths',
            wavetables: 'Wavetables',
            vital: 'Vital',
            importSounds: 'import-sounds',
          }}
        ></ButtonGroup>
      </div>

      {soundsFilter === soundFilterType.USER && soundEntries.length > 0 && (
        <ActionButton
          className="pl-2"
          label="delete-all"
          onClick={async () => {
            try {
              const confirmed = await confirmDialog('Delete all imported user samples?');
              if (confirmed) {
                clearIDB(userSamplesDBConfig.dbName);
                soundMap.set({});
                await prebake();
              }
            } catch (e) {
              console.error(e);
            }
          }}
        />
      )}

      <div className="min-h-0 max-h-full grow overflow-auto  text-sm break-normal bg-background p-2 rounded-md">
        {soundsFilter === soundFilterType.VITAL ? (
          <VitalPresetsPanel context={context} search={search} />
        ) : (
          <>
            {soundEntries.map(([name, { data, onTrigger }]) => {
              return (
                <span
                  key={name}
                  className="cursor-pointer hover:opacity-50"
                  onMouseDown={async () => {
                    const ctx = getAudioContext();
                    const params = {
                      note: ['synth', 'soundfont'].includes(data.type) ? 'a3' : undefined,
                      s: name,
                      n: soundPreviewIdx,
                      clip: 1,
                      release: 0.5,
                      sustain: 1,
                      duration: 0.5,
                    };
                    soundPreviewIdx++;
                    const onended = () => trigRef.current?.node?.disconnect();
                    try {
                      // Pre-load the sample by calling onTrigger with a future time
                      // This triggers the loading but schedules playback for later
                      const time = ctx.currentTime + 0.05;
                      const ref = await onTrigger(time, params, onended);
                      trigRef.current = ref;
                      if (ref?.node) {
                        connectToDestination(ref.node);
                      }
                    } catch (err) {
                      console.warn('Failed to trigger sound:', err);
                    }
                  }}
                >
                  {' '}
                  {name}
                  {data?.type === 'sample' ? `(${getSamples(data.samples)})` : ''}
                  {data?.type === 'wavetable' ? `(${getSamples(data.tables)})` : ''}
                  {data?.type === 'soundfont' ? `(${data.fonts.length})` : ''}
                </span>
              );
            })}
            {!soundEntries.length && soundsFilter === 'importSounds' ? (
              <div className="prose dark:prose-invert min-w-full pt-2 pb-8 px-4">
                <ImportSoundsButton onComplete={() => settingsMap.setKey('soundsFilter', 'user')} />
                <p>
                  To import sounds into strudel, they must be contained{' '}
                  <a href={`${baseNoTrailing}/learn/samples/#from-disk-via-import-sounds-folder`} target="_blank">
                    within a folder or subfolder
                  </a>
                  . The best way to do this is to upload a "samples" folder containing subfolders of individual sounds or
                  soundbanks (see diagram below).{' '}
                </p>
                <pre className="bg-background" key={'sample-diagram'}>
                  {`└─ samples <-- import this folder
   ├─ swoop
   │  ├─ swoopshort.wav
   │  ├─ swooplong.wav
   │  └─ swooptight.wav
   └─ smash
      ├─ smashhigh.wav
      ├─ smashlow.wav
      └─ smashmiddle.wav`}
                </pre>
                <p>
                  The name of a subfolder corresponds to the sound name under the "user" tab. Multiple samples within a
                  subfolder are all labelled with the same name, but can be accessed using ".n( )" - remember sounds are
                  zero-indexed and in alphabetical order!
                </p>
                <p>
                  For more information, and other ways to use your own sounds in strudel,{' '}
                  <a href={`${baseNoTrailing}/learn/samples/#from-disk-via-import-sounds-folder`} target="_blank">
                    check out the docs
                  </a>
                  !
                </p>
                <h3>Preview Sounds</h3>
                <pre className="bg-background" key={'sample-preview'}>
                  n("0 1 2 3 4 5").s("sample-name")
                </pre>
                <p>
                  Paste the line above into the main editor to hear the uploaded folder. Remember to use the name of your
                  sample as it appears under the "user" tab.
                </p>
              </div>
            ) : (
              ''
            )}
            {!soundEntries.length && soundsFilter !== 'importSounds' && soundsFilter !== soundFilterType.VITAL
              ? 'No sounds loaded'
              : ''}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Vital Presets Panel — connects to vital-bridge server to load & render .vital presets
 * Uses the Vita engine backend for 100% accurate sound reproduction
 */
function VitalPresetsPanel({ context, search }) {
  const [presets, setPresets] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingPreset, setLoadingPreset] = useState(null);
  const [packFilter, setPackFilter] = useState('all');
  const [bridgeStatus, setBridgeStatus] = useState('checking'); // 'checking' | 'online' | 'offline'
  const [error, setError] = useState(null);
  const FAVORITES_KEY = 'vital_favorite_presets';
  const [previewingPreset, setPreviewingPreset] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(null); // preset selected for detail preview (no overwrite)
  const [addedPresets, setAddedPresets] = useState(new Set()); // track which presets user has added
  const [favorites, setFavorites] = useState(() => {
    // Load from localStorage on mount
    try {
      const saved = localStorage.getItem(FAVORITES_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });
  const [vitalGain, setVitalGain] = useState(() => {
    try {
      const saved = localStorage.getItem('vital_preview_gain');
      return saved ? parseFloat(saved) : 0.5;
    } catch { return 0.5; }
  });
  const originalCodeRef = useRef(null); // saved editor code for preview restore

  // Check bridge status on mount
  useEffect(() => {
    fetch(`${BRIDGE_URL}/health`, { signal: AbortSignal.timeout(3000) })
      .then((r) => r.json())
      .then((d) => {
        if (d.status === 'ok') {
          setBridgeStatus('online');
          // Fetch presets
          return fetch(`${BRIDGE_URL}/presets`).then((r) => r.json());
        }
      })
      .then((data) => {
        if (data?.presets) {
          // Deduplicate by path (some presets may appear in multiple directories)
          const seen = new Set();
          const deduped = data.presets.filter(p => {
            if (seen.has(p.path)) return false;
            seen.add(p.path);
            return true;
          });
          setPresets(deduped);
        }
      })
      .catch(() => setBridgeStatus('offline'));
  }, []);

  const packs = useMemo(() => {
    if (!presets) return [];
    const packSet = new Set(presets.map((p) => p.pack));
    return ['all', ...Array.from(packSet).sort()];
  }, [presets]);

  const filteredPresets = useMemo(() => {
    if (!presets) return [];
    let list = presets;
    if (packFilter !== 'all') {
      list = list.filter((p) => p.pack === packFilter);
    }
    if (search) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.pack.toLowerCase().includes(search.toLowerCase()),
      );
    }
    // Sort: favorites first, then alphabetical
    return [...list].sort((a, b) => {
      const aFav = favorites.has(a.path) ? 0 : 1;
      const bFav = favorites.has(b.path) ? 0 : 1;
      if (aFav !== bFav) return aFav - bFav;
      return a.name.localeCompare(b.name);
    });
  }, [presets, packFilter, search, favorites]);

  // Toggle favorite and persist to localStorage
  const toggleFavorite = (preset, e) => {
    if (e) e.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(preset.path)) {
        next.delete(preset.path);
      } else {
        next.add(preset.path);
      }
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  // Build the strudel code for a preset
  const buildPresetCode = (preset) => {
    const sanitizedName = preset.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    // Escape single quotes in name to avoid breaking vital('...') string
    const escapedName = preset.name.replace(/'/g, "\\'");
    return {
      loadLine: `await vital('${escapedName}')`,
      playBlock: `note("c3 e3 g3 c4")\n  .s("vital_${sanitizedName}")\n  .release(0.5)\n  .gain(${vitalGain})`,
      fullCode: `// Vital: ${escapedName} (${preset.pack})
await vital('${escapedName}')

note("c3 e3 g3 c4")
  .s("vital_${sanitizedName}")
  .release(0.5)
  .gain(${vitalGain})`,
      sanitizedName,
    };
  };

  // Show detail/preview of a preset — does NOT overwrite the main editor
  const handleSelectPreset = (preset) => {
    setSelectedPreset(selectedPreset?.path === preset.path ? null : preset);
    setError(null);
  };

  // Add preset loading code to the main editor without overwriting existing code
  const handleAddToEditor = (preset, e) => {
    if (e) e.stopPropagation();
    if (!context?.editorRef?.current) return;

    const { loadLine } = buildPresetCode(preset);
    context.editorRef.current.appendCode('\n' + loadLine + '\n');
    setAddedPresets(prev => new Set([...prev, preset.path]));
    setError(null);
  };

  // Upload .vital file handler
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.name.endsWith('.vital')) return;
    if (!context?.editorRef?.current) return;

    setLoading(true);
    setError(null);

    try {
      const sanitizedName = file.name.replace('.vital', '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
      const code = `// Vital: ${file.name} (uploaded)
await vitalUpload(/* file */) // Note: Use drag & drop in editor for file upload

note("c3 e3 g3 c4")
  .s("vital_${sanitizedName}")
  .release(0.5)
  .gain(${vitalGain})`;

      // Actually upload via bridge
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch(`${BRIDGE_URL}/upload`, { method: 'POST', body: formData });
      if (!uploadRes.ok) throw new Error('Upload failed');

      const editor = context.editorRef.current;
      editor.setCode(code);
      editor.evaluate();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Preview a preset — evaluate full code (load + arpeggio loop) in the REPL,
  // saving/restoring the editor's original code so the user's work is preserved.
  const handlePreview = async (preset, e) => {
    e.stopPropagation();

    const editor = context?.editorRef?.current;
    if (!editor?.repl) return;

    // If we're already previewing this preset, stop and restore
    if (previewingPreset === preset.name) {
      editor.repl.scheduler.stop();
      // Restore original code
      if (originalCodeRef.current != null) {
        try { await editor.repl.evaluate(originalCodeRef.current, false); } catch {}
        originalCodeRef.current = null;
      }
      setPreviewingPreset(null);
      return;
    }

    // Stop any currently playing preview before starting a new one
    if (previewingPreset) {
      editor.repl.scheduler.stop();
      if (originalCodeRef.current != null) {
        try { await editor.repl.evaluate(originalCodeRef.current, false); } catch {}
        originalCodeRef.current = null;
      }
    }

    setPreviewingPreset(preset.name);
    setError(null);

    try {
      // Save the user's current code so we can restore it later
      if (originalCodeRef.current == null) {
        originalCodeRef.current = editor.code;
      }

      // Evaluate the full code (load preset + arpeggio loop) in the REPL.
      // This hushes the current pattern and plays the preview loop.
      const { fullCode } = buildPresetCode(preset);
      await editor.repl.evaluate(fullCode, true);

      // Check if evaluation had an error (REPL catches internally, doesn't throw)
      if (editor.repl.state.evalError) {
        throw editor.repl.state.evalError;
      }
    } catch (err) {
      console.error('[Vital] Preview failed:', err);
      setError(`Preview failed: ${err.message}`);
      setPreviewingPreset(null);
      // Restore original code
      if (originalCodeRef.current != null) {
        try { await editor.repl.evaluate(originalCodeRef.current, false); } catch {}
        originalCodeRef.current = null;
      }
    }
  };

  // Export a preset as a standalone WAV pack (ZIP download)
  const handleExport = async (preset) => {
    setError(null);
    setLoading(true);
    setLoadingPreset(preset.name);

    try {
      const res = await fetch(`${BRIDGE_URL}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preset: preset.path,
          low: 36,
          high: 84,
          step: 4,
          velocity: 0.7,
          note_dur: 1.0,
          render_dur: 4.0,
        }),
      });
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const safeName = preset.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${safeName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[Vital] Export failed:', err);
      setError(`Export failed: ${err.message}`);
    } finally {
      setLoading(false);
      setLoadingPreset(null);
    }
  };

  // Offline state
  if (bridgeStatus === 'checking') {
    return <div className="text-white/50 p-2">Connecting to vital-bridge...</div>;
  }

  if (bridgeStatus === 'offline') {
    return (
      <div className="p-3 text-sm space-y-3">
        <div className="text-red-400 font-medium">⚠️ vital-bridge server not running</div>
        <div className="text-white/60 text-xs space-y-1">
          <p>Start the server to use Vital presets:</p>
          <pre className="bg-black/30 p-2 rounded text-xs overflow-x-auto">
{`cd vital-bridge
mamba activate livecoding
uvicorn server:app --port 8765`}
          </pre>
          <p className="text-white/40 mt-2">
            This renders .vital presets using the Vita engine (100% accurate).
          </p>
        </div>
        <button
          onClick={() => {
            setBridgeStatus('checking');
            fetch(`${BRIDGE_URL}/health`, { signal: AbortSignal.timeout(3000) })
              .then((r) => r.json())
              .then((d) => {
                if (d.status === 'ok') {
                  setBridgeStatus('online');
                  return fetch(`${BRIDGE_URL}/presets`).then((r) => r.json());
                }
              })
              .then((data) => { if (data) setPresets(data.presets); })
              .catch(() => setBridgeStatus('offline'));
          }}
          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-500"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 h-full min-h-0">
      {/* Status bar */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
        <span className="text-xs text-white/40">vital-bridge online</span>
        <label className="ml-auto px-2 py-0.5 bg-white/10 text-white/70 rounded text-xs cursor-pointer hover:bg-white/20">
          📁 Upload .vital
          <input type="file" accept=".vital" className="hidden" onChange={handleFileUpload} />
        </label>
      </div>

      {/* Pack filter — scrollable to handle 60+ packs */}
      <div className="shrink-0 overflow-x-auto overflow-y-hidden max-h-16 pb-1">
        <div className="flex flex-wrap gap-1">
          {packs.map((pack) => (
            <button
              key={pack}
              onClick={() => setPackFilter(pack)}
              className={`px-2 py-0.5 rounded text-xs whitespace-nowrap ${
                packFilter === pack
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {pack === 'all' ? '🎵 All' : pack}
            </button>
          ))}
        </div>
      </div>

      {/* Preset count, volume & status */}
      <div className="text-xs text-white/40 shrink-0">
        <div className="flex items-center gap-3">
          <span>{filteredPresets.length} presets</span>
          {favorites.size > 0 && <span className="text-red-400">♥{favorites.size}</span>}
          <label className="flex items-center gap-1 flex-1 justify-end" title="Preview volume">
            <span>🔈</span>
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={vitalGain}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setVitalGain(val);
                localStorage.setItem('vital_preview_gain', String(val));
              }}
              className="w-20 h-3 accent-purple-500 cursor-pointer"
            />
            <span className="w-7 text-right">{Math.round(vitalGain * 100)}%</span>
          </label>
        </div>
        {(loading || previewingPreset || error) && (
          <div className="mt-0.5">
            {loading && <span className="text-yellow-400">⏳ rendering {loadingPreset}...</span>}
            {previewingPreset && !loading && <span className="text-purple-400">🔊 previewing {previewingPreset}</span>}
            {error && <span className="text-red-400">❌ {error}</span>}
          </div>
        )}
      </div>

      {/* Preset list */}
      <div className="overflow-auto grow min-h-0">
        {filteredPresets.map((preset) => {
          const isSelected = selectedPreset?.path === preset.path;
          const isAdded = addedPresets.has(preset.path);
          const code = buildPresetCode(preset);
          return (
          <div key={preset.path}>
            <div
              onClick={() => handleSelectPreset(preset)}
              className={`cursor-pointer p-2 rounded mb-1 border transition-colors ${
                isSelected
                  ? 'border-purple-500/50 bg-purple-500/10'
                  : 'border-transparent hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                {/* Preview/audition button */}
                <button
                  className={`w-6 h-6 rounded flex items-center justify-center text-sm shrink-0 transition-colors ${
                    previewingPreset === preset.name
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                  }`}
                  onClick={(e) => handlePreview(preset, e)}
                  title="Preview sound"
                >
                  {previewingPreset === preset.name ? '■' : '▶'}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{preset.name}</div>
                  <div className="text-xs text-white/40">
                    <span>{preset.pack}</span>
                  </div>
                </div>
                {isAdded && (
                  <span className="text-xs text-green-400 shrink-0" title="Added to editor">✓</span>
                )}
                {loadingPreset === preset.name && (
                  <span className="text-xs animate-pulse">⏳</span>
                )}
                {/* Add to editor button */}
                <button
                  className={`w-6 h-6 rounded flex items-center justify-center text-xs shrink-0 transition-colors ${
                    isAdded
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-white/10 text-white/60 hover:bg-blue-500/30 hover:text-blue-300'
                  }`}
                  onClick={(e) => handleAddToEditor(preset, e)}
                  title={isAdded ? 'Already added to editor' : 'Add to editor'}
                >
                  +
                </button>
                {/* Favorite button */}
                <button
                  className={`w-6 h-6 rounded flex items-center justify-center text-xs shrink-0 transition-colors ${
                    favorites.has(preset.path)
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      : 'bg-white/10 text-white/40 hover:bg-red-500/20 hover:text-red-400'
                  }`}
                  onClick={(e) => toggleFavorite(preset, e)}
                  title={favorites.has(preset.path) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {favorites.has(preset.path) ? '♥' : '♡'}
                </button>
                {/* Export button */}
                <button
                  className="w-6 h-6 rounded flex items-center justify-center text-xs shrink-0 bg-white/10 text-white/40 hover:bg-white/20 hover:text-white transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExport(preset);
                  }}
                  title="Export as WAV pack"
                >
                  ⬇
                </button>
              </div>
            </div>

            {/* Inline detail/preview panel — shown when preset is selected */}
            {isSelected && (
              <div className="mb-2 ml-8 mr-1 p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50 font-mono">
                    {preset.pack} / {preset.name}
                  </span>
                  <button
                    className="px-2 py-0.5 text-xs rounded bg-purple-600/30 text-purple-300 hover:bg-purple-600/50"
                    onClick={() => handleAddToEditor(preset)}
                  >
                    + Add to Editor
                  </button>
                </div>
                <pre className="text-xs bg-black/30 rounded p-2 overflow-x-auto text-green-300 font-mono whitespace-pre-wrap">
{code.fullCode}
                </pre>
                <div className="text-xs text-white/40 mt-1">
                  Sound key: <code className="text-yellow-300">vital_{code.sanitizedName}</code>
                </div>
              </div>
            )}
          </div>
        )})}
      </div>
    </div>
  );
}
