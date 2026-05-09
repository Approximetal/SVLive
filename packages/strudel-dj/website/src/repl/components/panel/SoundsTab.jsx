import useEvent from '@src/useEvent.mjs';
import { useStore } from '@nanostores/react';
import { getAudioContext, soundMap, connectToDestination } from '@strudel/webaudio';
import { useEffect, useMemo, useRef, useState } from 'react';
import { settingsMap, soundFilterType, useSettings } from '../../../settings.mjs';
import { ButtonGroup } from './Forms.jsx';
import ImportSoundsButton from './ImportSoundsButton.jsx';
import { Textbox } from '../textbox/Textbox.jsx';
import { ActionButton } from '../button/action-button.jsx';
import { confirmDialog } from '@src/repl/util.mjs';
import { clearIDB, userSamplesDBConfig } from '@src/repl/idbutils.mjs';
import { prebake } from '@src/repl/prebake.mjs';

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
  const [activePreset, setActivePreset] = useState(null);
  const [packFilter, setPackFilter] = useState('all');
  const [bridgeStatus, setBridgeStatus] = useState('checking'); // 'checking' | 'online' | 'offline'
  const [error, setError] = useState(null);
  const [previewingPreset, setPreviewingPreset] = useState(null);
  const previewSourceRef = useRef(null);

  const BRIDGE_URL = 'http://localhost:8765';

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
        if (data) setPresets(data.presets);
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
    return list;
  }, [presets, packFilter, search]);

  const handleLoadPreset = async (preset) => {
    if (!context?.editorRef?.current) return;
    setLoading(true);
    setLoadingPreset(preset.name);
    setError(null);

    try {
      // Generate strudel code that uses vital()
      // IMPORTANT: use single quotes for vital() argument — double quotes are transformed to mini-notation by the transpiler!
      const sanitizedName = preset.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
      const code = `// Vital: ${preset.name} (${preset.pack})
await vital('${preset.name}')

note("c3 e3 g3 c4")
  .s("vital_${sanitizedName}")
  .release(0.5)
  .gain(0.8)`;

      const editor = context.editorRef.current;
      editor.setCode(code);
      editor.evaluate();
      setActivePreset(preset.name);
    } catch (err) {
      console.error('[Vital] Failed to load preset:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingPreset(null);
    }
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
  .gain(0.8)`;

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

  // Preview a preset (render a single note and play it without changing editor)
  const handlePreview = async (preset, e) => {
    e.stopPropagation(); // Don't trigger the parent onClick (handleLoadPreset)

    // Stop any currently playing preview
    if (previewSourceRef.current) {
      try { previewSourceRef.current.stop(); } catch {}
      previewSourceRef.current = null;
    }

    // If we're already previewing this preset, just stop
    if (previewingPreset === preset.name) {
      setPreviewingPreset(null);
      return;
    }

    setPreviewingPreset(preset.name);
    setError(null);

    try {
      // 1. Load the preset
      await fetch(`${BRIDGE_URL}/load`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: preset.path }),
      });

      // 2. Render a single note (C3 = MIDI 60) — returns raw WAV bytes
      const renderRes = await fetch(`${BRIDGE_URL}/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: 60, velocity: 0.7, note_dur: 1.0, render_dur: 3.0 }),
      });
      if (!renderRes.ok) throw new Error('Render failed');

      // 3. Decode and play the WAV
      const arrayBuffer = await renderRes.arrayBuffer();
      const ctx = getAudioContext();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      connectToDestination(source);
      source.start(ctx.currentTime);
      source.onended = () => {
        setPreviewingPreset(null);
        previewSourceRef.current = null;
      };
      previewSourceRef.current = source;
    } catch (err) {
      console.error('[Vital] Preview failed:', err);
      setError(`Preview failed: ${err.message}`);
      setPreviewingPreset(null);
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

      {/* Preset count & status */}
      <div className="text-xs text-white/40 shrink-0">
        {filteredPresets.length} presets
        {loading && <span className="ml-2 text-yellow-400">⏳ rendering {loadingPreset}...</span>}
        {previewingPreset && !loading && <span className="ml-2 text-purple-400">🔊 previewing {previewingPreset}</span>}
        {error && <span className="ml-2 text-red-400">❌ {error}</span>}
      </div>

      {/* Preset list */}
      <div className="overflow-auto grow min-h-0">
        {filteredPresets.map((preset) => (
          <div
            key={preset.path}
            onClick={() => handleLoadPreset(preset)}
            className={`cursor-pointer p-2 rounded mb-1 border transition-colors ${
              activePreset === preset.name
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
              {loadingPreset === preset.name && (
                <span className="text-xs animate-pulse">⏳</span>
              )}
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
        ))}
      </div>
    </div>
  );
}
