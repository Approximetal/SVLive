/**
 * MidiImportDialog.jsx — MIDI file import with preset selection
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { parseMidiFile, getMidiBpm } from './midiParser';
import { getTrackInfo, suggestPresetsForTrack, midiToStrudel } from './midiToStrudel';
import { PRESET_CATEGORIES, slugToDisplayName } from './vitalPresets';
import cx from '@src/cx.mjs';

/**
 * Fetch live preset list from vital-bridge server.
 * Falls back to hardcoded PRESET_CATEGORIES if server is unavailable.
 */
async function fetchServerPresets() {
  try {
    const res = await fetch('http://localhost:8765/presets');
    if (!res.ok) return null;
    const data = await res.json();
    return data.presets; // [{name, pack, path, relative}, ...]
  } catch {
    return null;
  }
}

export function MidiImportButton({ context }) {
  const [isOpen, setIsOpen] = useState(false);
  const [midi, setMidi] = useState(null);       // parsed data for track info UI
  const [rawBuffer, setRawBuffer] = useState(null); // raw ArrayBuffer for @tonejs/midi
  const [fileName, setFileName] = useState('');
  const [trackInfos, setTrackInfos] = useState([]);
  const [trackPresets, setTrackPresets] = useState({});
  const [barLimit, setBarLimit] = useState(0); // 0 = no limit
  const [notesPerBar, setNotesPerBar] = useState(16); // quantization resolution
  const [bpmOverride, setBpmOverride] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [guessInstrument, setGuessInstrument] = useState(true);
  const [flatMode, setFlatMode] = useState(false);
  const [serverPresets, setServerPresets] = useState(null); // live preset list from server
  const fileInputRef = useRef(null);

  // Fetch server presets on first open
  useEffect(() => {
    if (isOpen && !serverPresets) {
      fetchServerPresets().then(setServerPresets);
    }
  }, [isOpen, serverPresets]);

  const handleFileSelect = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      setRawBuffer(buffer);  // store for @tonejs/midi conversion
      const parsed = parseMidiFile(buffer);
      setMidi(parsed);
      setFileName(file.name);
      const infos = getTrackInfo(parsed);
      setTrackInfos(infos);

      // Auto-suggest presets for melodic tracks
      // Drum tracks default to drum samples (no preset)
      const presets = {};
      for (const info of infos) {
        if (!info.isDrum) {
          const suggestions = suggestPresetsForTrack(info);
          if (suggestions.length > 0) {
            presets[info.index] = suggestions[0];
          }
        }
      }
      setTrackPresets(presets);
      setIsOpen(true);
    } catch (err) {
      console.error('[MIDI Import] Parse error:', err);
      alert(`MIDI 解析失败: ${err.message}`);
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!midi) return;
    setIsGenerating(true);

    try {
      // Build preset name mapping (slug → display name for vital() calls)
      const presetNames = {};
      for (const [, slug] of Object.entries(trackPresets)) {
        if (slug) {
          // Try to find the real display name from server presets
          if (serverPresets) {
            const match = serverPresets.find(
              (p) => p.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') === slug
            );
            if (match) {
              presetNames[slug] = match.name;
              continue;
            }
          }
          // Fallback: convert slug to title case
          presetNames[slug] = slugToDisplayName(slug);
        }
      }

      const code = await midiToStrudel(rawBuffer, {
        bars: barLimit,
        notesPerBar,
        bpm: bpmOverride ? Number(bpmOverride) : undefined,
        trackPresets,
        presetNames,
        flat: flatMode,
      });

      // Insert into editor and evaluate
      const editor = context.editorRef.current;
      editor.setCode(code);
      editor.evaluate();
      setIsOpen(false);
    } catch (err) {
      console.error('[MIDI Import] Generation error:', err);
      alert(`生成失败: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  }, [rawBuffer, barLimit, notesPerBar, bpmOverride, trackPresets, context, serverPresets, flatMode]);

  const setPresetForTrack = (trackIndex, presetSlug) => {
    setTrackPresets((prev) => ({ ...prev, [trackIndex]: presetSlug }));
  };

  const clearPresetForTrack = (trackIndex) => {
    setTrackPresets((prev) => {
      const next = { ...prev };
      delete next[trackIndex];
      return next;
    });
  };

  // Allow re-opening the dialog to change presets (without re-selecting file)
  const handleReopen = useCallback(() => {
    if (midi) {
      setIsOpen(true);
    } else {
      fileInputRef.current?.click();
    }
  }, [midi]);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={handleReopen}
        title={midi ? `MIDI: ${fileName} (click to edit presets)` : 'Import MIDI'}
        className="hover:opacity-50 p-2 flex items-center space-x-1"
      >
        <span>{midi ? '🎹✓' : '🎹'} MIDI</span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".mid,.midi"
        className="hidden"
        onChange={handleFileSelect}
        onClick={(e) => { e.target.value = ''; }}
      />

      {/* Dialog */}
      {isOpen && midi && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-lg shadow-2xl w-[700px] max-w-[90vw] max-h-[85vh] overflow-auto p-6 text-foreground">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">🎹 MIDI Import</h2>
              <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white text-xl">✕</button>
            </div>

            {/* File info */}
            <div className="text-sm text-white/60 mb-4 p-2 bg-white/5 rounded flex items-center justify-between">
              <div>
                <span className="font-mono">{fileName}</span>
                <span className="mx-2">|</span>
                <span>BPM: {Math.round(getMidiBpm(midi))}</span>
                <span className="mx-2">|</span>
                <span>{trackInfos.length} tracks</span>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs px-2 py-1 bg-white/10 rounded hover:bg-white/20"
              >
                📂 换文件
              </button>
            </div>

            {/* Settings row */}
            <div className="flex gap-3 mb-4 text-sm flex-wrap">
              <label className="flex items-center gap-1">
                <span className="text-white/60">Bars:</span>
                <select value={barLimit} onChange={(e) => setBarLimit(Number(e.target.value))}
                  className="bg-white/10 rounded px-2 py-1 text-white">
                  <option value={0}>All</option>
                  {[1, 2, 4, 8, 16, 32].map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-1">
                <span className="text-white/60">Res:</span>
                <select value={notesPerBar} onChange={(e) => setNotesPerBar(Number(e.target.value))}
                  className="bg-white/10 rounded px-2 py-1 text-white">
                  {[16, 32, 64, 128].map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-1">
                <span className="text-white/60">BPM:</span>
                <input
                  type="number"
                  placeholder={String(Math.round(getMidiBpm(midi)))}
                  value={bpmOverride}
                  onChange={(e) => setBpmOverride(e.target.value)}
                  className="bg-white/10 rounded px-2 py-1 text-white w-16"
                />
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" checked={guessInstrument} onChange={(e) => setGuessInstrument(e.target.checked)}
                  className="accent-blue-500" />
                <span className="text-white/60">Guess Instrument</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" checked={flatMode} onChange={(e) => setFlatMode(e.target.checked)}
                  className="accent-blue-500" />
                <span className="text-white/60">Flat Mode</span>
              </label>
            </div>

            {/* Track list */}
            <div className="space-y-2 mb-4">
              <h3 className="text-sm font-semibold text-white/80">Tracks & Presets</h3>
              <p className="text-xs text-white/40 mb-1">
                点击右侧按钮选择 Vital 音色。鼓轨默认使用内置鼓采样。
              </p>
              {trackInfos.map((info) => (
                <TrackRow
                  key={info.index}
                  info={info}
                  preset={trackPresets[info.index] || ''}
                  onSetPreset={(slug) => setPresetForTrack(info.index, slug)}
                  onClearPreset={() => clearPresetForTrack(info.index)}
                  serverPresets={serverPresets}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-2 border-t border-white/10">
              <div className="text-xs text-white/40">
                {serverPresets
                  ? (() => {
                      const jekCount = serverPresets.filter(p => p.source === 'jek').length;
                      const defCount = serverPresets.length - jekCount;
                      return `🟢 vital-bridge: ${defCount} default${jekCount ? ` + ${jekCount} Jek's` : ''} presets`;
                    })()
                  : '⚠️ vital-bridge offline (will use default synth)'}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className={cx(
                    'px-4 py-2 rounded text-sm font-semibold',
                    isGenerating
                      ? 'bg-blue-500/30 text-blue-300 cursor-wait'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  )}
                >
                  {isGenerating ? '⏳ Generating...' : '🚀 Generate Strudel Code'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Track row with preset selector
 */
function TrackRow({ info, preset, onSetPreset, onClearPreset, serverPresets }) {
  const [showPicker, setShowPicker] = useState(false);
  const [searchText, setSearchText] = useState('');
  const suggestions = suggestPresetsForTrack(info);

  const categoryIcon = {
    drums: '🥁',
    bass: '🎸',
    chords: '🎹',
    lead: '✨',
    melody: '🎵',
  }[info.category] || '🎵';

  // Build the full list of presets for the picker
  // Combine server presets (live) with hardcoded categories
  const allPickerPresets = React.useMemo(() => {
    if (serverPresets && serverPresets.length > 0) {
      // Group server presets by pack, with source indicator for Jek presets
      const byPack = {};
      for (const p of serverPresets) {
        const pack = p.pack || 'Other';
        const sourceTag = p.source === 'jek' ? '🅹 ' : '';
        const label = sourceTag + pack;
        if (!byPack[label]) byPack[label] = [];
        const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
        byPack[label].push({ slug, name: p.name });
      }
      return byPack;
    }
    // Fallback: use hardcoded categories
    const result = {};
    for (const [, { label, presets }] of Object.entries(PRESET_CATEGORIES)) {
      result[label] = presets.map((slug) => ({ slug, name: slugToDisplayName(slug) }));
    }
    return result;
  }, [serverPresets]);

  // Filter presets by search
  const filteredPresets = React.useMemo(() => {
    if (!searchText) return allPickerPresets;
    const q = searchText.toLowerCase();
    const result = {};
    for (const [group, presets] of Object.entries(allPickerPresets)) {
      const filtered = presets.filter(
        (p) => p.name.toLowerCase().includes(q) || p.slug.includes(q)
      );
      if (filtered.length > 0) result[group] = filtered;
    }
    return result;
  }, [allPickerPresets, searchText]);

  return (
    <div className="flex items-center gap-2 p-2 bg-white/5 rounded text-sm">
      {/* Track info */}
      <span className="text-lg">{categoryIcon}</span>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{info.name}</div>
        <div className="text-xs text-white/40">
          {info.noteCount} notes | {info.range} | ch.{info.channel + 1}
        </div>
      </div>

      {/* Preset selector */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className={cx(
            'px-2 py-1 rounded text-xs border max-w-[180px] truncate',
            preset
              ? 'border-blue-500/50 bg-blue-500/20 text-blue-300'
              : info.isDrum
                ? 'border-green-500/30 bg-green-500/10 text-green-300'
                : 'border-white/20 bg-white/5 text-white/60 hover:border-white/40'
          )}
        >
          {preset
            ? `🎵 ${slugToDisplayName(preset)}`
            : info.isDrum
              ? '🥁 Drum Samples ▾'
              : '🔊 Default Synth ▾'
          }
        </button>

        {showPicker && (
          <div className="absolute right-0 top-full mt-1 z-50 bg-[#1a1a2e] border border-white/20 rounded-lg shadow-xl w-72 max-h-72 overflow-hidden flex flex-col">
            {/* Search */}
            <div className="p-2 border-b border-white/10">
              <input
                type="text"
                placeholder="🔍 Search presets..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full bg-white/10 rounded px-2 py-1 text-xs text-white placeholder:text-white/30 outline-none"
                autoFocus
              />
            </div>

            <div className="overflow-auto flex-1 p-2">
              {/* Suggestions (only if no search text) */}
              {!searchText && suggestions.length > 0 && (
                <div className="mb-2">
                  <div className="text-xs text-white/40 mb-1 px-1">⭐ Recommended for {info.category}</div>
                  {suggestions.map((slug) => (
                    <button
                      key={slug}
                      onClick={() => { onSetPreset(slug); setShowPicker(false); setSearchText(''); }}
                      className={cx(
                        'block w-full text-left px-2 py-1 rounded text-xs hover:bg-white/10',
                        preset === slug ? 'text-blue-400 bg-blue-500/10' : 'text-white/80'
                      )}
                    >
                      ⭐ {slugToDisplayName(slug)}
                    </button>
                  ))}
                  <div className="border-t border-white/10 mt-1 mb-1" />
                </div>
              )}

              {/* All presets grouped */}
              {Object.entries(filteredPresets).map(([group, presets]) => (
                <div key={group} className="mb-2">
                  <div className="text-xs text-white/40 mb-1 px-1 font-semibold">{group}</div>
                  {presets.map(({ slug, name }) => (
                    <button
                      key={slug}
                      onClick={() => { onSetPreset(slug); setShowPicker(false); setSearchText(''); }}
                      className={cx(
                        'block w-full text-left px-2 py-1 rounded text-xs hover:bg-white/10',
                        preset === slug ? 'text-blue-400 bg-blue-500/10' : 'text-white/80'
                      )}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              ))}

              {Object.keys(filteredPresets).length === 0 && (
                <div className="text-xs text-white/30 text-center py-4">
                  No presets found for "{searchText}"
                </div>
              )}
            </div>

            {/* Clear / Use default */}
            <div className="p-2 border-t border-white/10">
              {preset ? (
                <button
                  onClick={() => { onClearPreset(); setShowPicker(false); setSearchText(''); }}
                  className="block w-full text-left px-2 py-1 rounded text-xs text-red-400 hover:bg-red-500/10"
                >
                  ✕ Remove preset → {info.isDrum ? 'use drum samples' : 'use default synth'}
                </button>
              ) : (
                <div className="text-xs text-white/30 px-2 py-1">
                  {info.isDrum ? '🥁 Currently using built-in drum samples' : '🔊 Currently using default synth'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MidiImportButton;
