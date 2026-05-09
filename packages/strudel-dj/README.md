# Strudel AI - Live Coding with LLMs

This is a **fork of [Strudel](https://strudel.cc/)** that integrates Large Language Models (LLMs) directly into the live coding environment. It uses Anthropic's Claude to generate, modify, and perform music code in real-time.

## 🤖 New AI Features

This fork adds a dedicated **AI Tab** to the REPL with three powerful modes:

### 1. Generate Mode
Create complete, runnable Strudel tracks from scratch using natural language.
- **How it works**: Describe the genre, mood, or instruments you want.
- **Example**: *"Create a minimal techno track at 128bpm with a heavy kick, off-beat hi-hats, and a random synth sequence."*

### 2. Modify Mode
Refine and evolve your existing code without rewriting it manually.
- **How it works**: Select a specific part of your code (or let the AI decide) and ask for changes.
- **Example**: *"Add a reverb effect to the snare"* or *"Make the bassline twice as fast"* or *"Change the scale to D Dorian"*.

### 3. AI DJ Mode (Auto-DJ)
An autonomous agent that "performs" your track live.
- **How it works**: The AI continuously listens to the current state of the code and queues up changes over time to keep the arrangement interesting.
- **Features**:
    - **Queue System**: See upcoming changes before they happen.
    - **Evolution Control**: Adjust how frequently the AI makes changes.
    - **Vibe Control**: Give the DJ a direction like *"Build up tension for a drop"* or *"Break it down to just the pads"*.

---

## 🚀 Getting Started

### Prerequisites
To use the AI features, you need an **Anthropic API Key** (or a compatible third-party proxy token).

**Official Anthropic**

1. Go to [console.anthropic.com](https://console.anthropic.com/).
2. Create an API Key.
3. Paste it under **API Key 或第三方令牌** in the AI Tab (stored in `localStorage` in your browser).

**Third-party proxy (no shell `export` required)**

1. Copy `website/public/anthropic.provider.example.json` to `website/public/anthropic.provider.json` (the latter is gitignored).
2. Fill in `baseURL` (e.g. `https://api.yxai88.com`) and `authToken` (your proxy token, equivalent to `ANTHROPIC_AUTH_TOKEN`). Use `"authStyle": "authToken"` if in doubt.
3. Optional: set `"model"` to a model ID your channel actually routes (if you see `model_not_found`, change this or use the **模型 ID** field in the AI Tab).
4. Restart `pnpm dev` and open the AI Tab — values from the JSON load first; you can still override Base URL / token / **认证方式** / model in the UI (saved per browser).

The AI Tab also supports **API Base URL** and **认证方式** (自动 / Bearer / 官方 x-api-key) without touching global environment variables on your machine.

### Installation & Running Locally

1. **Install Node.js**: Version 18 or newer.
2. **Install pnpm**: `npm install -g pnpm`
3. **Install Dependencies**:
   ```bash
   pnpm i
   ```
4. **Run Development Server**:
   ```bash
   pnpm dev
   ```
   Open `http://localhost:3000` (or the port shown in the terminal) to see the REPL.

---

## 💡 Example Prompts

### For Generation
- *"Liquid Drum and Bass at 174bpm with amen breaks and deep reese bass."*
- *"Ambient soundscape with granular textures and slow evolving pads using the 'grab' function for generative scales."*
- *"80s Synthwave with a driving bass arpeggio and gated reverb drums."*

### For Modification / DJing
- *"Add a low-pass filter sweep to the lead synth over 4 cycles."*
- *"Randomize the panning of the percussion layer."*
- *"Mute the kick drum and increase the delay feedback on the melody."*
- *"Create a breakdown by removing drums and adding a high-pass filter."*

---

## 🎹 About Strudel

Strudel is a port of the TidalCycles pattern language to JavaScript, making live coding accessible in the browser.

- **Official Site**: <https://strudel.cc>
- **Docs**: <https://strudel.cc/learn>
- **Original Repo**: <https://github.com/tidalcycles/strudel>

### Community
- **Discord**: #strudel channel on [TidalCycles Discord](https://discord.com/invite/HGEdXmRkzT)
- **Forum**: [Tidal Club](https://club.tidalcycles.org/)

### License
This project is licensed under the **GNU Affero Public Licence v3** (AGPL-3.0). See [LICENSE](LICENSE) for details.
