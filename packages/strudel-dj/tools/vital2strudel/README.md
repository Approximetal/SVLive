# vital2strudel

Convert [Vital](https://vital.audio/) synthesizer presets to parameterized [Strudel](https://strudel.cc/) live coding format.

## What it does

1. **Parses** `.vital` preset files (gzip JSON format)
2. **Exports** wavetable data as standard `.wav` files
3. **Generates** Strudel code with full parameter mapping

## Supported Parameters

| Vital Feature | Strudel Mapping |
|---|---|
| Wavetable oscillator | `s("preset_osc1")` via `tables()` |
| Wavetable position | `.wt(0.5)` |
| Warp type & amount | `.warpmode("sync").warp(0.5)` |
| Unison voices/detune | `.unison(4).detune(0.3).spread(0.5)` |
| Amplitude ADSR | `.attack().decay().sustain().release()` |
| Filter (LP/HP/BP) | `.cutoff().resonance()` |
| Filter envelope | `.lpenv().lpattack().lpdecay()...` |
| Filter LFO | `.lprate().lpdepth().lpshape()` |
| WT position LFO | `.wtrate().wtdepth().wtshape()` |
| Warp LFO | `.warprate().warpdepth()` |
| Reverb | `.room().roomsize()` |
| Delay | `.delay().delaytime().delayfeedback()` |
| Distortion | `.shape()` |

## Usage

```bash
# Basic usage
python vital2strudel.py my_preset.vital

# With custom output directory and hosting URL
python vital2strudel.py my_preset.vital \
  --output-dir ./output \
  --base-url https://raw.githubusercontent.com/user/repo/main/wavetables/

# Also export parsed parameters as JSON
python vital2strudel.py my_preset.vital --json
```

## Output

```
output/
├── wavetables/
│   ├── my_preset_osc1.wav
│   ├── my_preset_osc2.wav
│   └── my_preset_osc3.wav
├── my_preset.js          # Strudel code
└── my_preset_parsed.json # (optional) raw parameters
```

## Workflow

1. Design your sound in Vital
2. Save as `.vital` preset
3. Run `python vital2strudel.py your_preset.vital --base-url <url>`
4. Host the `.wav` wavetable files (GitHub, your server, etc.)
5. Paste the generated Strudel code → play!

## Limitations

- **Modulation matrix**: Only LFO→position, LFO→filter, LFO→warp, and Env→filter are mapped. Complex routings are listed as comments.
- **Spectral morphing**: Vital's spectral warp modes are approximated using Strudel's closest warp modes.
- **Multiple filters in series**: Only the first active filter is used.
- **Chorus/Flanger**: Not available in Strudel (phaser is).
- **Custom LFO shapes**: Approximated to nearest standard shape (sine/tri/saw/square).

## Requirements

Python 3.8+ (no external dependencies — uses only stdlib).

## Wavetable Hosting

The exported `.wav` files need to be hosted somewhere accessible. Options:

- **GitHub repo**: Push to a public repo, use raw.githubusercontent.com URL
- **GitHub Pages**: Free static hosting
- **Your own server**: Any HTTP server with CORS headers

Example with GitHub:
```bash
# In your wavetable repo
cp output/wavetables/*.wav ./wavetables/
echo '{"my_preset_osc1": ["my_preset_osc1.wav"]}' > wavetables/strudel.json
git add . && git commit -m "Add vital preset" && git push
```

Then in Strudel:
```js
await tables("github:user/wavetable-repo")
```
