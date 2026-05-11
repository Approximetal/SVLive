# SVLive — Strudel Vital Live

AI-powered live coding music environment. Strudel pattern language + Vital synthesizer + 2300+ presets.

## Project Structure

```
packages/
  strudel-dj/          # Web frontend (Vite + React + CodeMirror REPL)
    website/src/repl/
      ai/              # AI client: modelProviders.js, alternatives.js
      components/panel/ # UI tabs: AITab, SoundsTab, SettingsTab, MidiTab
  vital-bridge/        # Python FastAPI backend (:8765)
    server.py          # Vital rendering, preset search, proxy endpoints
    preset_tags.json   # 2300 presets × 101 auto-generated tags
  mcp/                 # MCP server for browser automation
reference/
  strudel/             # Upstream Strudel core
  strudel-llm-docs/    # Strudel knowledge base (docs, compositions, skills)
  vital/               # Vital synthesizer source
```

## Stack

- **Backend**: vital-bridge (FastAPI, Vita engine, httpx proxy)
- **Frontend**: strudel-dj (Vite, React, CodeMirror 6, Tone.js)
- **AI Providers**: yxai88, DeepSeek, Kimi, Claude Official, Custom (Anthropic-compatible endpoints)
- **Key**: `anthropic_base_url`, `anthropic_api_key`, `anthropic_auth_style_pref`, `ai_provider` in localStorage

## Vital Presets

- 2300 presets tagged with type/style/mood (see `preset_tags.json`)
- Query: `GET /presets/tags` (all tags), `GET /presets/search?q=drone+dark` (search)
- Load in code: `await vital('Preset Name')` → play with `.s("vital_preset_name")`
- Sound ID pattern: `vital_` + lowercase name with underscores (e.g. `vital_drone_floating`)

## Strudel Syntax — Quick Reference

### Mini-notation
```
s("bd hh bd hh")     # sequence
s("bd*4")            # repeat 4x
s("[bd hh] sn")      # subdivide: 2 events in one step
s("bd(3,8)")         # Euclidean: 3 hits over 8 steps
s("<bd sn>")         # alternate per cycle
s("bd!4")            # ? alternate randomly
```

### Functions
```
.cpm(n/4)            # tempo (BPM/4)
.gain(0.8)           # volume
.lpf(cutoff)         # low-pass filter
.hpf(cutoff)         # high-pass filter
.room(size)          # reverb
.delay(time)         # delay
.pan(pos)            # stereo position
.release(dur)        # envelope release
.slow(n) / .fast(n)  # time scaling
.rev()               # reverse
.ply(n)              # subdivide n times
.sometimesBy(p, fn)  # probability-based transform
.every(n, fn)        # periodic transform
```

### Scales
```
.scale("C:minor")           # C minor scale
.scale("C4:minor")          # C4 minor (with octave)
.scale("C:minor:pentatonic") # pentatonic
```

## Strudel Knowledge Base

For complete Strudel documentation, refer to:
- `reference/strudel-llm-docs/docs/basics_and_getting_started.md`
- `reference/strudel-llm-docs/docs/patterns_and_notation.md`
- `reference/strudel-llm-docs/docs/audio_and_synthesis.md`
- `reference/strudel-llm-docs/docs/samples_and_sounds.md`
- `reference/strudel-llm-docs/docs/musical_theory.md`
- `reference/strudel-llm-docs/docs/advanced_features.md`
- `reference/strudel-llm-docs/docs/recipes_and_examples.md`

## Code Modification Rules

When modifying existing Strudel code:
1. **Use minimal, targeted edits.** Do NOT regenerate the entire composition.
2. **Identify the specific layer** (stack index / `.o(n)` orbit) to modify.
3. **Preserve all other layers** exactly as-is.
4. **For drum changes**: only touch the drum layers (`.o(0)`, `.o(1)`, `.o(2)`).
5. **For melody changes**: only touch the melodic layers (`.o(3)`, `.o(6)`, etc.).

### Scale Syntax Must Use Colons
- CORRECT: `.scale("C:minor")`, `.scale("C:minor:pentatonic")`
- WRONG: `.scale("C minor")`, `.scale("C4 minor")`

### Pattern Arithmetic Must Use Methods (not operators)
- CORRECT: `sine.range(0.3, 0.7).slow(3)` , `gain(0.5).add(0.1)`
- WRONG: `0.5 + 0.1` on patterns
