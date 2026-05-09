# SVLive — Strudel Vital Live

An AI-powered live coding music environment that brings together the **Strudel** pattern language, the **Vital** synthesizer engine, MIDI import, preset browsing, and Claude AI assistance — all in one monorepo.

## Features

- 🎹 **Vital Preset Browser** — Browse 2,300+ presets (75 factory + 2,225 custom), preview in real-time with a single click, load into the editor with `await vital('Preset Name')`
- 🎵 **MIDI Import** — Drag & drop `.mid` files, auto-generate Strudel code with per-track preset assignment and drum support
- 🤖 **AI-Assisted Composition** — Claude-powered code generation via the AI tab (Anthropic API) or MCP server (Claude Desktop integration)
- 🎛️ **Live Coding REPL** — Full Strudel live coding environment: edit patterns, hear changes instantly, tweak synths and effects on the fly
- 💾 **Lazy Rendering Cache** — Presets render to WAV only on first use; cache stats and one-click clear available in Settings
- 🥁 **Drum Machines** — Built-in classic drum machine samples (TR-808, TR-909, LinnDrum, etc.)
- 🌐 **Multi-Language Patterns** — Write patterns in JavaScript (Strudel) or TidalCycles-style mini-notation

## Getting Started

### Prerequisites

- **Node.js** ≥ 18 + [pnpm](https://pnpm.io/) ≥ 8
- **Python** ≥ 3.10
- **Vital preset files** (`.vital` format) — place them anywhere, configure via environment variables

### Clone with Submodules

```bash
git clone --recurse-submodules https://github.com/YOUR_USERNAME/SVLive.git
cd SVLive
```

### 1. Backend: vital-bridge

The backend renders `.vital` presets to audio via the [Vita](https://github.com/DBraun/Vita) engine.

```bash
cd packages/vital-bridge

# Create Python virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install vita numpy scipy fastapi uvicorn python-multipart

# Configure preset directories (optional; defaults to ~/music/Vital)
export VITAL_PRESETS_DIR="/path/to/your/Vital/presets"
export JEK_PRESETS_DIR="/path/to/your/Jek's Vital Presets"

# Start the server
uvicorn server:app --host 0.0.0.0 --port 8765 --reload
```

Verify: `curl http://localhost:8765/health` → `{"status":"ok"}`

### 2. Frontend: strudel-dj

```bash
cd packages/strudel-dj
pnpm install
pnpm dev
```

Open `http://localhost:5173` in your browser. The REPL connects to vital-bridge on port 8765 automatically.

### Usage Examples

**Load a Vital preset and play a melody:**
```js
await vital('Plucked String')
note("c3 e3 g3 c4").s("vital_plucked_string").release(0.5).gain(0.8)
```

**Import a MIDI file:**
Click the 🎹 MIDI button → select a `.mid` file → assign presets per track → generate code.

**AI-assisted composition (AI tab):**
Configure your Anthropic API key in Settings → AI Configuration, then describe the music you want in natural language.

## Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITAL_PRESETS_DIR` | Factory Vital preset directory | `~/music/Vital` |
| `JEK_PRESETS_DIR` | Custom Jek preset directory | `~/music/Jek's Vital Presets` |

## Updating Submodules

```bash
# Update all submodules to latest upstream
git submodule update --remote

# Update a specific submodule
git submodule update --remote reference/strudel
```

## Acknowledgments

SVLive builds on the work of these amazing projects:

| Project | Author | Description |
|---------|--------|-------------|
| [Strudel](https://codeberg.org/uzu/strudel) | Felix Roos & contributors | Live coding pattern language for the browser |
| [strudel-dj](https://github.com/mr-spaghetti-code/strudel-dj) | mr-spaghetti-code | Strudel fork with Vital integration, MIDI import, and AI features |
| [Vital](https://github.com/mtytel/vital) | Matt Tytel | Spectral warping wavetable synthesizer |
| [Vita](https://github.com/DBraun/Vita) | David Braun | Python bindings for the Vital synthesizer |
| [MIDI-To-Strudel](https://github.com/Emanuel-de-Jong/MIDI-To-Strudel) | Emanuel de Jong | MIDI file to Strudel code converter |
| [midi-to-strudel-web](https://github.com/rayanfer32/midi-to-strudel-web) | Rayanfer32 | Web interface for MIDI-to-Strudel conversion |
| [live-coding-music-mcp](https://github.com/williamzujkowski/live-coding-music-mcp) | William Zujkowski | MCP server for AI-assisted live coding |
| [strudel-claude-music-generator](https://github.com/etbars/strudel-claude-music-generator) | Etbars | AI-powered Strudel music composition |
| [strudel-llm-docs](https://github.com/calvinw/strudel-llm-docs) | Calvin W | LLM documentation and compositions for Strudel |
| [@tonejs/midi](https://github.com/Tonejs/Midi) | Yotam Mann & contributors | MIDI file parser for JavaScript |

## License

This project is available under the [AGPL-3.0-or-later](LICENSE) license, respecting the licenses of its upstream dependencies.
