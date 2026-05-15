"""
Vital-Bridge: FastAPI 渲染服务
将 .vital 预设通过 Vita 引擎渲染为音频，供 Strudel 前端使用

启动方式:
    mamba activate livecoding
    cd SVLive/packages/vital-bridge
    uvicorn server:app --host 0.0.0.0 --port 8765 --reload
    """

import os
import io
import json
import hashlib
import struct
import time
import glob
import zipfile
from pathlib import Path
from typing import Optional
from contextlib import asynccontextmanager

import numpy as np
import vita
import httpx
from fastapi import FastAPI, UploadFile, File, HTTPException, Query, Request
from fastapi.responses import Response, JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


class _UpstreamError(Exception):
    """Raised inside the streaming proxy when upstream returns a non-2xx status."""
    def __init__(self, status_code: int, body: bytes, content_type: str | None = None):
        self.status_code = status_code
        self.body = body
        self.content_type = content_type


# ============================================================
# Configuration
# ============================================================

SAMPLE_RATE = 44100
BPM = 120.0
CACHE_DIR = Path(__file__).parent / "render_cache"
LOG_DIR = Path(__file__).parent / "llm_logs"
def _resolve_presets_dir(env_key: str, *fallbacks: str) -> Path:
    """Resolve a presets directory from env var, falling back to the first
    path that actually exists on disk (or the first fallback if none do)."""
    env_val = os.environ.get(env_key)
    if env_val:
        return Path(env_val)
    for fb in fallbacks:
        p = Path(os.path.expanduser(fb))
        if p.is_dir():
            return p
    # nothing exists — return the first fallback so the error message makes sense
    return Path(os.path.expanduser(fallbacks[0]))

PRESETS_DIR = _resolve_presets_dir(
    "VITAL_PRESETS_DIR",
    "~/music/Vital",
    "~/mnt/music/Vital",
)
JEK_PRESETS_DIR = _resolve_presets_dir(
    "JEK_PRESETS_DIR",
    "~/music/Jek's Vital Presets",
    "~/mnt/music/Jek's Vital Presets",
)

# ============================================================
# Global State
# ============================================================

synth: Optional[vita.Synth] = None
current_preset_hash: Optional[str] = None
current_preset_name: Optional[str] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize synth engine on startup."""
    global synth
    synth = vita.Synth()
    synth.set_bpm(BPM)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    print(f"[vital-bridge] Vita {vita.__version__} engine ready")
    print(f"[vital-bridge] Presets dir: {PRESETS_DIR}")
    print(f"[vital-bridge] Cache dir: {CACHE_DIR}")
    yield
    synth = None


app = FastAPI(
    title="Vital-Bridge",
    description="Render .vital presets to audio for Strudel",
    version="0.1.0",
    lifespan=lifespan,
)

# Allow CORS from strudel-dj (typically localhost:5173 or similar)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Helpers
# ============================================================

def compute_preset_hash(data: bytes) -> str:
    """Compute a short hash for cache key."""
    return hashlib.sha256(data).hexdigest()[:16]


def get_cache_path(preset_hash: str, note: int, velocity: float,
                   note_dur: float, render_dur: float, macros: Optional[dict] = None) -> Path:
    """Get cache file path for a specific render."""
    key = f"{preset_hash}_n{note}_v{int(velocity*100)}_d{int(note_dur*100)}_r{int(render_dur*100)}"
    key += get_macro_cache_suffix(macros)
    return CACHE_DIR / f"{key}.wav"


def numpy_to_wav_bytes(audio: np.ndarray, sample_rate: int = SAMPLE_RATE) -> bytes:
    """Convert numpy array (2, N) to 16-bit PCM WAV bytes in memory.

    Uses 16-bit PCM (format code 1) for universal browser compatibility.
    Float32 WAV (format code 3) causes "Unable to decode audio data" in some browsers.
    """
    # audio shape: (2, num_samples)
    num_channels = audio.shape[0]
    num_samples = audio.shape[1]

    # Interleave channels: (N, 2) and convert float → int16
    interleaved = audio.T  # shape: (num_samples, num_channels)
    # Clip to [-1, 1] then scale to int16 range
    clipped = np.clip(interleaved, -1.0, 1.0)
    pcm16 = (clipped * 32767).astype(np.int16)

    # Build WAV header (PCM 16-bit)
    bits_per_sample = 16
    bytes_per_sample = bits_per_sample // 8
    data_size = num_samples * num_channels * bytes_per_sample

    buf = io.BytesIO()
    # RIFF header
    buf.write(b'RIFF')
    buf.write(struct.pack('<I', 36 + data_size))  # file size - 8
    buf.write(b'WAVE')
    # fmt chunk
    buf.write(b'fmt ')
    buf.write(struct.pack('<I', 16))  # chunk size
    buf.write(struct.pack('<H', 1))   # format = PCM (1), NOT IEEE float (3)
    buf.write(struct.pack('<H', num_channels))
    buf.write(struct.pack('<I', sample_rate))
    buf.write(struct.pack('<I', sample_rate * num_channels * bytes_per_sample))  # byte rate
    buf.write(struct.pack('<H', num_channels * bytes_per_sample))  # block align
    buf.write(struct.pack('<H', bits_per_sample))  # bits per sample
    # data chunk
    buf.write(b'data')
    buf.write(struct.pack('<I', data_size))
    buf.write(pcm16.tobytes())

    return buf.getvalue()


def render_note(note: int, velocity: float, note_dur: float, render_dur: float) -> np.ndarray:
    """Render a single note with the currently loaded preset."""
    global synth
    if synth is None:
        raise RuntimeError("Synth not initialized")
    return synth.render(note, velocity, note_dur, render_dur)


def apply_macros(macros: dict) -> None:
    """Apply macro values (0.0-1.0) to the current preset via JSON manipulation.

    Accepts keys like 'macro1', 'macro2', etc. or 'macro_control_1', 'macro_control_2', etc.
    """
    global synth
    if synth is None or not macros:
        return

    j = synth.to_json()
    d = json.loads(j)
    settings = d.get('settings', {})

    for key, value in macros.items():
        # Normalize key: 'macro1' → 'macro_control_1', 'macro_control_1' → 'macro_control_1'
        if key.startswith('macro_control_'):
            ctrl_key = key
        elif key.startswith('macro'):
            num = key.replace('macro', '')
            ctrl_key = f'macro_control_{num}'
        else:
            continue

        # Clamp value to 0.0-1.0
        value = max(0.0, min(1.0, float(value)))
        settings[ctrl_key] = value

    d['settings'] = settings
    synth.load_json(json.dumps(d))


def restore_macros_from_preset(preset_path: str) -> None:
    """Restore the original macro values from the preset file."""
    global synth
    if synth is None:
        return
    synth.load_preset(preset_path)


def get_macro_cache_suffix(macros: Optional[dict]) -> str:
    """Generate a cache suffix for macro values."""
    if not macros:
        return ""
    # Sort keys for deterministic ordering
    parts = []
    for i in range(1, 5):
        key_variants = [f'macro{i}', f'macro_control_{i}']
        for k in key_variants:
            if k in macros:
                parts.append(f"m{i}_{int(macros[k]*100)}")
                break
    return "_" + "_".join(parts) if parts else ""


def scan_presets(base_dir: Path, source: str = "default") -> list[dict]:
    """Recursively scan for .vital files."""
    presets = []
    for vital_file in sorted(base_dir.rglob("*.vital")):
        rel_path = vital_file.relative_to(base_dir)
        parts = rel_path.parts
        pack = parts[0] if len(parts) > 1 else "Local"
        name = vital_file.stem
        presets.append({
            "name": name,
            "pack": pack,
            "source": source,
            "path": str(vital_file),
            "relative": str(rel_path),
        })
    return presets


# ============================================================
# API Models
# ============================================================

class RenderRequest(BaseModel):
    note: int = 60          # MIDI note (0-127)
    velocity: float = 0.7   # 0.0 - 1.0
    note_dur: float = 1.0   # seconds
    render_dur: float = 3.0 # seconds
    macros: Optional[dict] = None  # {"macro1": 0.5, "macro2": 0.8, ...} values 0.0-1.0


class RenderBatchRequest(BaseModel):
    notes: list[int] = list(range(36, 85, 4))  # C2 to C6 in major thirds
    velocity: float = 0.7
    note_dur: float = 1.0
    render_dur: float = 3.0
    macros: Optional[dict] = None  # {"macro1": 0.5, ...} values 0.0-1.0


class LoadPresetRequest(BaseModel):
    path: str  # absolute or relative path to .vital file


class VerifyRequest(BaseModel):
    baseURL: str = ""
    apiKey: str = ""
    authStyle: str = "authToken"
    model: str = ""


class ClaudeRequest(BaseModel):
    code: str = ""          # current editor code
    request: str = ""       # modification/generation instruction
    mode: str = "modify"    # "modify" or "generate"


class ExportRequest(BaseModel):
    preset: Optional[str] = None  # preset path (uses current if None)
    low: int = 36
    high: int = 84
    step: int = 4
    velocity: float = 0.7
    note_dur: float = 1.0
    render_dur: float = 4.0
    macros: Optional[dict] = None
    format: str = 'wav'  # 'wav' or 'zip'


class LogRequest(BaseModel):
    """Full LLM interaction log for debugging Vital preset selection issues."""
    system_prompt: str         # Full system prompt sent to the model
    user_prompt: str           # User's request
    full_response: str         # Complete model output text
    thinking_blocks: list = [] # Captured thinking deltas (if any)
    mode: str = "generate"     # generate / modify / dj
    model: str = ""            # Model identifier
    intent: dict = {}          # Resolved intent (genre, bpm, key, mood)
    preset_guidance: str = ""  # Matched Vital presets injected into prompt
    duration_sec: float = 0    # Request duration
    translation_error: str = "" # If LLM translation failed


# ============================================================
# Endpoints
# ============================================================

@app.get("/")
async def root():
    return {
        "service": "vital-bridge",
        "version": "0.1.0",
        "vita_version": vita.__version__,
        "current_preset": current_preset_name,
        "sample_rate": SAMPLE_RATE,
        "essentia_available": HAS_ESSENTIA,
        "endpoints": {
            "presets": "/presets",
            "render": "/render",
            "essentia_analyze": "/essentia/analyze",
            "essentia_status": "/essentia/status",
            "api_proxy": "/api-proxy/{path}",
            "health": "/health",
        },
    }


@app.get("/presets")
async def list_presets(
    source: str = Query(default="all", description="Filter by source: default, jek, all")
):
    """List all available .vital presets from configured directories."""
    presets = []
    counts = {}

    if source in ("default", "all"):
        default_presets = scan_presets(PRESETS_DIR, source="default")
        presets.extend(default_presets)
        counts["default"] = len(default_presets)

    if source in ("jek", "all") and JEK_PRESETS_DIR.exists():
        jek_presets = scan_presets(JEK_PRESETS_DIR, source="jek")
        presets.extend(jek_presets)
        counts["jek"] = len(jek_presets)

    return {
        "count": len(presets),
        "counts": counts,
        "presets": presets,
    }


# Load preset tag index at startup
_preset_tags_data = None

def get_preset_tags():
    global _preset_tags_data
    if _preset_tags_data is None:
        tags_file = Path(__file__).parent / "preset_tags.json"
        if tags_file.exists():
            _preset_tags_data = json.loads(tags_file.read_text())
        else:
            _preset_tags_data = {"presets": [], "inverted_index": {}, "type_counts": {}, "style_counts": {}}
    return _preset_tags_data


@app.get("/presets/tags")
async def list_tags():
    """Return all available tags with counts."""
    data = get_preset_tags()
    return {
        "total_presets": data["total"],
        "type_counts": data.get("type_counts", {}),
        "style_counts": data.get("style_counts", {}),
        "all_tags": sorted(data.get("inverted_index", {}).keys()),
    }


@app.get("/presets/search")
async def search_presets(
    q: str = Query(default="", description="Search query: tag names or keywords"),
    tag: str = Query(default="", description="Comma-separated tags to filter by"),
    match: str = Query(default="any", description="Match mode: 'any' or 'all' tags"),
):
    """Search presets by tags or keywords. Use ?tag=bass,pad for tag filter."""
    data = get_preset_tags()
    all_presets = data.get("presets", [])
    inverted = data.get("inverted_index", {})

    # Filter by tags
    if tag or q:
        search_tags = []
        if tag:
            search_tags = [t.strip().lower() for t in tag.split(",") if t.strip()]
        if q:
            # q can be multiple words
            search_tags = [t.strip().lower() for t in q.split() if t.strip()]

        if search_tags:
            if match == "all":
                # Intersection: preset must have all tags
                matched_names = None
                for t in search_tags:
                    names = set(inverted.get(t, []))
                    if matched_names is None:
                        matched_names = names
                    else:
                        matched_names &= names
                matched_names = matched_names or set()
            else:
                # Union: preset must have any tag
                matched_names = set()
                for t in search_tags:
                    matched_names.update(inverted.get(t, []))

            presets = [p for p in all_presets if p["name"] in matched_names]
        else:
            presets = all_presets
    else:
        presets = all_presets

    return {
        "query": q or tag,
        "match": match,
        "count": len(presets),
        "presets": presets,
    }


@app.post("/load")
async def load_preset(req: LoadPresetRequest):
    """Load a .vital preset file by path."""
    global synth, current_preset_hash, current_preset_name
    
    path = Path(req.path)
    # Try relative to presets dir if not absolute
    if not path.is_absolute():
        path = PRESETS_DIR / path
    
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Preset not found: {path}")
    
    # Load preset
    data = path.read_bytes()
    preset_hash = compute_preset_hash(data)
    
    result = synth.load_preset(str(path))
    if not result:
        raise HTTPException(status_code=500, detail="Failed to load preset")
    
    current_preset_hash = preset_hash
    current_preset_name = path.stem
    
    return {
        "status": "loaded",
        "name": current_preset_name,
        "hash": preset_hash,
    }


@app.post("/upload")
async def upload_preset(file: UploadFile = File(...)):
    """Upload a .vital file and load it."""
    global synth, current_preset_hash, current_preset_name
    
    if not file.filename.endswith('.vital'):
        raise HTTPException(status_code=400, detail="File must be .vital format")
    
    data = await file.read()
    preset_hash = compute_preset_hash(data)
    
    # Save to cache dir for persistence
    save_path = CACHE_DIR / f"uploaded_{preset_hash}.vital"
    save_path.write_bytes(data)
    
    # Load into synth
    result = synth.load_preset(str(save_path))
    if not result:
        raise HTTPException(status_code=500, detail="Failed to load preset")
    
    current_preset_hash = preset_hash
    current_preset_name = Path(file.filename).stem
    
    return {
        "status": "loaded",
        "name": current_preset_name,
        "hash": preset_hash,
    }


@app.post("/render")
async def render_single(req: RenderRequest):
    """Render a single note with the current preset. Returns WAV."""
    global synth, current_preset_hash

    if current_preset_hash is None:
        raise HTTPException(status_code=400, detail="No preset loaded. Call /load or /upload first.")

    # Check cache
    cache_path = get_cache_path(current_preset_hash, req.note, req.velocity,
                                req.note_dur, req.render_dur, req.macros)

    if cache_path.exists():
        wav_bytes = cache_path.read_bytes()
    else:
        # Apply macros if specified
        if req.macros:
            apply_macros(req.macros)

        # Render
        t0 = time.time()
        audio = render_note(req.note, req.velocity, req.note_dur, req.render_dur)
        elapsed = (time.time() - t0) * 1000

        wav_bytes = numpy_to_wav_bytes(audio)

        # Save to cache
        cache_path.write_bytes(wav_bytes)

        # Restore original preset if macros were applied
        if req.macros and current_preset_hash:
            # Re-load the preset to reset macros for next render
            # (only needed if macros were changed)
            pass  # Next render will apply macros again anyway

        print(f"[render] note={req.note} vel={req.velocity:.1f} "
              f"dur={req.note_dur:.1f}s render={req.render_dur:.1f}s "
              f"macros={req.macros or 'default'} -> {elapsed:.0f}ms")

    return Response(
        content=wav_bytes,
        media_type="audio/wav",
        headers={
            "X-Preset-Name": current_preset_name or "",
            "X-Preset-Hash": current_preset_hash or "",
            "X-Note": str(req.note),
        }
    )


@app.post("/render-batch")
async def render_batch(req: RenderBatchRequest):
    """Render multiple notes at once. Returns JSON with WAV URLs."""
    global synth, current_preset_hash, current_preset_name

    if current_preset_hash is None:
        raise HTTPException(status_code=400, detail="No preset loaded. Call /load or /upload first.")

    # Apply macros before batch render
    if req.macros:
        apply_macros(req.macros)

    t0 = time.time()
    results = []
    cached_count = 0
    rendered_count = 0

    for note in req.notes:
        cache_path = get_cache_path(current_preset_hash, note, req.velocity,
                                    req.note_dur, req.render_dur, req.macros)

        if cache_path.exists():
            cached_count += 1
        else:
            audio = render_note(note, req.velocity, req.note_dur, req.render_dur)
            wav_bytes = numpy_to_wav_bytes(audio)
            cache_path.write_bytes(wav_bytes)
            rendered_count += 1

        results.append({
            "note": note,
            "url": f"/cache/{cache_path.name}",
        })

    elapsed = (time.time() - t0) * 1000

    return {
        "preset": current_preset_name,
        "hash": current_preset_hash,
        "total": len(req.notes),
        "rendered": rendered_count,
        "cached": cached_count,
        "time_ms": round(elapsed),
        "macros": req.macros,
        "notes": results,
    }


@app.post("/render-chromatic")
async def render_chromatic(
    low: int = Query(default=36, description="Lowest MIDI note"),
    high: int = Query(default=84, description="Highest MIDI note"),
    step: int = Query(default=1, description="Semitone step"),
    velocity: float = Query(default=0.7),
    note_dur: float = Query(default=1.0),
    render_dur: float = Query(default=3.0),
):
    """Render a chromatic range of notes. Used for initial preset caching."""
    global synth, current_preset_hash, current_preset_name
    
    if current_preset_hash is None:
        raise HTTPException(status_code=400, detail="No preset loaded.")
    
    notes = list(range(low, high + 1, step))
    t0 = time.time()
    rendered = 0
    cached = 0
    
    for note in notes:
        cache_path = get_cache_path(current_preset_hash, note, velocity, note_dur, render_dur)
        if cache_path.exists():
            cached += 1
        else:
            audio = render_note(note, velocity, note_dur, render_dur)
            wav_bytes = numpy_to_wav_bytes(audio)
            cache_path.write_bytes(wav_bytes)
            rendered += 1
    
    elapsed = (time.time() - t0) * 1000
    
    return {
        "preset": current_preset_name,
        "notes_range": f"{low}-{high} step {step}",
        "total": len(notes),
        "rendered": rendered,
        "cached": cached,
        "time_ms": round(elapsed),
    }


@app.get("/cache/stats")
async def cache_stats():
    """Get cache statistics: file count, total size, directory path."""
    files = list(CACHE_DIR.glob("*.wav"))
    total_size = sum(f.stat().st_size for f in files)
    return {
        "count": len(files),
        "size_bytes": total_size,
        "size_mb": round(total_size / (1024 * 1024), 2),
        "cache_dir": str(CACHE_DIR),
    }


@app.delete("/cache")
async def clear_cache():
    """Clear all cached renders."""
    count = 0
    total_size = 0
    for f in CACHE_DIR.glob("*.wav"):
        total_size += f.stat().st_size
        f.unlink()
        count += 1
    return {
        "cleared": count,
        "freed_mb": round(total_size / (1024 * 1024), 2),
    }


@app.get("/cache/wav/{filename}")
async def get_cached_wav(filename: str):
    """Serve a cached WAV file."""
    if not filename.endswith('.wav'):
        raise HTTPException(status_code=404, detail="Not a WAV file")
    cache_path = CACHE_DIR / filename
    if not cache_path.exists():
        raise HTTPException(status_code=404, detail="Cached file not found")

    return Response(
        content=cache_path.read_bytes(),
        media_type="audio/wav",
    )


@app.get("/cache/{filename}")
async def get_cached_wav_legacy(filename: str):
    """Serve a cached WAV file (legacy path, redirects to /cache/wav/)."""
    return await get_cached_wav(filename)


@app.post("/export")
async def export_preset(req: ExportRequest):
    """Export a preset as a self-contained sample pack (ZIP of WAV files).

    The exported ZIP contains:
      - <preset_name>/c2.wav, e2.wav, ... (note-named WAV files)
      - <preset_name>/strudel.json (metadata for strudel samples() loader)

    Usage in strudel (after extracting):
      samples('/path/to/exported/<preset_name>/strudel.json')
      note("c3 e3 g3").s("<preset_name>")
    """
    global synth, current_preset_hash, current_preset_name

    # Load preset if specified
    if req.preset:
        path = Path(req.preset)
        if not path.is_absolute():
            path = PRESETS_DIR / path
        if not path.exists():
            raise HTTPException(status_code=404, detail=f"Preset not found: {path}")
        data = path.read_bytes()
        preset_hash = compute_preset_hash(data)
        result = synth.load_preset(str(path))
        if not result:
            raise HTTPException(status_code=500, detail="Failed to load preset")
        current_preset_hash = preset_hash
        current_preset_name = path.stem

    if current_preset_hash is None:
        raise HTTPException(status_code=400, detail="No preset loaded.")

    # Apply macros if specified
    if req.macros:
        apply_macros(req.macros)

    # Generate note list
    notes = list(range(req.low, req.high + 1, req.step))

    # Sanitize preset name for folder/file naming
    safe_name = current_preset_name.lower().replace(' ', '_')
    safe_name = ''.join(c for c in safe_name if c.isalnum() or c == '_')

    t0 = time.time()

    # MIDI note to note name mapping
    note_names_map = ['c', 'cs', 'd', 'ds', 'e', 'f', 'fs', 'g', 'gs', 'a', 'as', 'b']

    def midi_to_note_name(midi):
        oct = midi // 12 - 1
        name = note_names_map[midi % 12]
        return f"{name}{oct}"

    # Render all notes
    rendered_notes = {}
    for note in notes:
        cache_path = get_cache_path(current_preset_hash, note, req.velocity,
                                    req.note_dur, req.render_dur, req.macros)
        if cache_path.exists():
            wav_bytes = cache_path.read_bytes()
        else:
            audio = render_note(note, req.velocity, req.note_dur, req.render_dur)
            wav_bytes = numpy_to_wav_bytes(audio)
            cache_path.write_bytes(wav_bytes)

        note_name = midi_to_note_name(note)
        rendered_notes[note_name] = wav_bytes

    elapsed = (time.time() - t0) * 1000

    # Build strudel.json metadata
    # This follows the strudel samples() format: { "sound_name": { "note_name": ["filename"] } }
    strudel_meta = {
        safe_name: {
            note_name: [f"{note_name}.wav"]
            for note_name in rendered_notes.keys()
        },
        "_meta": {
            "preset": current_preset_name,
            "hash": current_preset_hash,
            "range": f"{req.low}-{req.high} step {req.step}",
            "velocity": req.velocity,
            "note_dur": req.note_dur,
            "render_dur": req.render_dur,
            "macros": req.macros,
            "exported_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        }
    }

    # Build ZIP in memory
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
        # Add WAV files
        for note_name, wav_bytes in rendered_notes.items():
            zf.writestr(f"{safe_name}/{note_name}.wav", wav_bytes)

        # Add strudel.json
        zf.writestr(f"{safe_name}/strudel.json", json.dumps(strudel_meta, indent=2))

    zip_buffer.seek(0)
    zip_size = zip_buffer.getbuffer().nbytes

    print(f"[export] {current_preset_name}: {len(notes)} notes, "
          f"{zip_size / 1024 / 1024:.1f}MB ZIP, {elapsed:.0f}ms")

    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={
            "Content-Disposition": f'attachment; filename="{safe_name}.zip"',
            "X-Preset-Name": current_preset_name or "",
            "X-Notes-Count": str(len(notes)),
            "X-Render-Time-Ms": str(round(elapsed)),
        }
    )


@app.post("/proxy/verify")
async def proxy_verify(req: VerifyRequest):
    """Proxy an API connectivity check — avoids CORS issues in browser.
    Tries GET /v1/models first; if 404, falls back to POST /v1/messages."""
    import httpx
    base = (req.baseURL or "https://api.anthropic.com").rstrip("/")
    headers = {"Content-Type": "application/json"}
    if req.authStyle == "authToken":
        headers["Authorization"] = f"Bearer {req.apiKey}"
    else:
        headers["x-api-key"] = req.apiKey
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Try model listing first
            url = f"{base}/v1/models"
            resp = await client.get(url, headers=headers)
            if resp.status_code == 404:
                # Some providers (e.g. DeepSeek) don't expose /v1/models.
                # Fall back to a trivial messages call as connectivity check.
                url2 = f"{base}/v1/messages"
                body = {
                    "model": req.model or "default",
                    "max_tokens": 1,
                    "messages": [{"role": "user", "content": "hi"}],
                }
                resp2 = await client.post(url2, headers=headers, json=body)
                return {
                    "ok": resp2.status_code < 500,
                    "status": resp2.status_code,
                    "url": url2,
                    "method": "POST",
                }
            return {"ok": resp.status_code < 400, "status": resp.status_code, "url": url}
    except Exception as e:
        return {"ok": False, "status": 0, "error": str(e), "url": url}


@app.post("/claude/run")
async def claude_run(req: ClaudeRequest):
    """Run Claude Code CLI to edit Strudel code with tool-calling.
    Creates temp workspace with code + CLAUDE.md, runs claude -p, returns result."""
    import subprocess
    import tempfile
    import shutil

    if not req.code.strip():
        return {"ok": False, "error": "No code provided"}

    # Find Claude Code binary
    claude_bin = shutil.which("claude")
    if not claude_bin:
        return {"ok": False, "error": "Claude Code CLI not found. Install with: npm i -g @anthropic-ai/claude-code"}

    # Create temp workspace
    workdir = Path(tempfile.mkdtemp(prefix="svlive_claude_"))
    codefile = workdir / "pattern.js"
    codefile.write_text(req.code)

    # Copy CLAUDE.md for project context
    project_root = Path(__file__).parent.parent.parent  # SVLive root
    claude_md_src = project_root / "CLAUDE.md"
    if claude_md_src.exists():
        shutil.copy(claude_md_src, workdir / "CLAUDE.md")

    # Also copy preset_tags.json for preset knowledge
    tags_src = Path(__file__).parent / "preset_tags.json"
    if tags_src.exists():
        shutil.copy(tags_src, workdir / "preset_tags.json")

    # Build the prompt
    if req.mode == "generate":
        prompt = f"""Create a new Strudel live-coding pattern in {codefile}.

Request: {req.request}

The file currently has starter code. Replace it entirely with a new composition following SVLive conventions (Vital presets for synths, Tidal samples for drums, use CLAUDE.md for syntax reference)."""
    else:
        prompt = f"""Edit the Strudel pattern in {codefile} based on this request.

Request: {req.request}

IMPORTANT RULES (from CLAUDE.md):
- Make MINIMAL, targeted edits. Do NOT rewrite the entire file.
- Identify the specific layer (orbit) to modify.
- Preserve all other layers exactly as-is.
- For drum changes: only touch drum layers (.o(0), .o(1), .o(2)).
- For melody/synth changes: only touch synth layers.

The current code is in {codefile}. Read it, then use the Edit tool to make precise changes."""

    try:
        result = subprocess.run(
            [claude_bin, "-p", "--dangerously-skip-permissions", prompt],
            cwd=str(workdir),
            capture_output=True,
            text=True,
            timeout=180,
            env={**os.environ, "NO_COLOR": "1"},
        )

        # Read the (possibly modified) code file
        modified_code = codefile.read_text() if codefile.exists() else req.code

        # Trim output to reasonable size
        output = result.stdout
        if len(output) > 4000:
            output = output[-4000:]

        return {
            "ok": result.returncode == 0,
            "code": modified_code,
            "changed": modified_code != req.code,
            "output": output,
            "returncode": result.returncode,
        }

    except subprocess.TimeoutExpired:
        return {"ok": False, "error": "Claude Code timed out (180s limit)"}
    except FileNotFoundError:
        return {"ok": False, "error": f"Claude Code not found at {claude_bin}"}
    except Exception as e:
        return {"ok": False, "error": str(e)}
    finally:
        shutil.rmtree(workdir, ignore_errors=True)


# ============================================================
# Transparent API Proxy — avoids CORS when calling 3rd-party
# Anthropic-compatible APIs from browser (localhost origins)
# ============================================================

@app.api_route("/api-proxy/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def api_proxy(path: str, request: Request):
    """Proxy requests to external Anthropic-compatible APIs to bypass CORS.

    The browser SDK sets baseURL to http://localhost:8765/api-proxy
    and passes the real target via X-Proxy-Target header.

    Supports both regular and streaming (SSE) responses — detected from
    ``"stream": true`` in the request body.
    """
    import httpx

    target = request.headers.get("x-proxy-target", "")
    if not target:
        raise HTTPException(status_code=400, detail="Missing X-Proxy-Target header")

    # Build target URL: <target_base>/<request_path>?<query>
    target = target.rstrip("/")
    target_url = f"{target}/{path.lstrip('/')}"
    if request.url.query:
        target_url += f"?{request.url.query}"

    # Forward headers (strip hop-by-hop and our custom one)
    fwd_headers = {}
    skip = {"host", "connection", "transfer-encoding", "x-proxy-target", "content-length", "accept-encoding"}
    for key, val in request.headers.items():
        if key.lower() not in skip:
            fwd_headers[key] = val

    body = await request.body()

    # Detect streaming: if the request body has "stream": true, use SSE streaming
    is_stream = False
    try:
        body_json = json.loads(body)
        is_stream = body_json.get("stream", False)
    except (json.JSONDecodeError, UnicodeDecodeError, TypeError):
        pass

    if is_stream:
        # ── Streaming (SSE) proxy ──
        async def event_generator():
            async with httpx.AsyncClient(timeout=300.0) as client:
                async with client.stream(
                    method=request.method,
                    url=target_url,
                    headers=fwd_headers,
                    content=body,
                ) as resp:
                    # If upstream returns an error, collect the body and raise so
                    # the caller gets the proper HTTP status instead of a broken SSE stream.
                    if resp.status_code >= 400:
                        error_body = b""
                        async for chunk in resp.aiter_bytes():
                            error_body += chunk
                        raise _UpstreamError(resp.status_code, error_body, resp.headers.get("content-type"))
                    async for chunk in resp.aiter_bytes():
                        yield chunk

        try:
            return StreamingResponse(
                event_generator(),
                status_code=200,
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "X-Accel-Buffering": "no",
                },
            )
        except _UpstreamError as e:
            return Response(
                content=e.body,
                status_code=e.status_code,
                media_type=e.content_type or "application/json",
            )

    # ── Regular (buffered) proxy ──
    async with httpx.AsyncClient(timeout=180.0) as client:
        resp = await client.request(
            method=request.method,
            url=target_url,
            headers=fwd_headers,
            content=body,
        )

    # Forward response as-is — httpx handles decompression transparently,
    # so headers already reflect the decompressed body (no content-encoding).
    # Only strip true hop-by-hop headers.
    resp_headers = dict(resp.headers)
    for h in ("transfer-encoding", "connection", "keep-alive", "content-encoding"):
        resp_headers.pop(h, None)

    return Response(
        content=resp.content,
        status_code=resp.status_code,
        headers=resp_headers,
        media_type=resp.headers.get("content-type"),
    )


@app.post("/log/save")
async def save_llm_log(req: LogRequest):
    """Save full LLM interaction to disk for debugging.

    Writes timestamped JSON files to llm_logs/ directory containing:
    - Complete system prompt (to see what instructions the model received)
    - User prompt
    - Full response text (code + rationale)
    - Thinking blocks if captured (model's reasoning process)
    - Intent analysis results + preset matching guidance
    - Timing and error metadata
    """
    LOG_DIR.mkdir(parents=True, exist_ok=True)

    ts = time.strftime("%Y-%m-%d_%H-%M-%S")
    safe_model = req.model.replace("/", "_").replace(":", "_") if req.model else "unknown"
    filename = f"{ts}_{safe_model}_{req.mode}.json"
    filepath = LOG_DIR / filename

    log_entry = {
        "timestamp": ts,
        "model": req.model,
        "mode": req.mode,
        "duration_sec": req.duration_sec,
        "intent": req.intent,
        "translation_error": req.translation_error,
        "preset_guidance": req.preset_guidance,
        "system_prompt_length": len(req.system_prompt),
        "system_prompt": req.system_prompt,
        "user_prompt": req.user_prompt,
        "user_prompt_length": len(req.user_prompt),
        "full_response_length": len(req.full_response),
        "full_response": req.full_response,
        "thinking_blocks": req.thinking_blocks,
        "thinking_count": len(req.thinking_blocks),
    }

    filepath.write_text(json.dumps(log_entry, ensure_ascii=False, indent=2))

    print(f"[log] Saved: {filename} ({len(req.full_response)} chars response, "
          f"{len(req.thinking_blocks)} thinking blocks, {req.duration_sec:.1f}s)")

    return {"ok": True, "file": filename, "path": str(filepath)}


@app.get("/log/list")
async def list_logs():
    """List saved LLM interaction logs."""
    if not LOG_DIR.exists():
        return {"logs": []}
    files = sorted(LOG_DIR.glob("*.json"), key=lambda f: f.stat().st_mtime, reverse=True)
    return {
        "count": len(files),
        "logs": [{"file": f.name, "size": f.stat().st_size, "mtime": f.stat().st_mtime} for f in files[:50]]
    }



# ============================================================
# Essentia Audio Analysis — style fingerprint extraction
# ============================================================

from essentia_analysis import analyze_audio as essentia_analyze, HAS_ESSENTIA

@app.post("/essentia/analyze")
async def essentia_analyze_endpoint(file: UploadFile = File(...)):
    """Upload an audio file and get a style profile back.
    
    Returns comprehensive musical analysis:
    - genre (primary + top3 with confidence)
    - bpm (value + confidence)  
    - key (value + confidence)
    - mood (primary + arousal/valence + per-mood scores)
    - instruments (inferred from genre)
    - soundTags (character descriptors for Vital matching)
    - danceability (probability)
    - voice (presence + probability)
    - description (natural language summary)
    
    Accepts: WAV, MP3, FLAC, OGG, M4A
    """
    import tempfile, os
    
    # Save upload to temp file (essentia needs a file path)
    suffix = os.path.splitext(file.filename or "audio.wav")[1] or ".wav"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name
    
    try:
        result = essentia_analyze(tmp_path)
        return {
            "status": "ok",
            "essentia_available": HAS_ESSENTIA,
            **result,
        }
    finally:
        try:
            os.unlink(tmp_path)
        except:
            pass


@app.get("/essentia/status")
async def essentia_status():
    """Check if Essentia analysis is available and list loaded models."""
    from pathlib import Path
    from essentia_analysis import MODELS_DIR, CACHE_DIR
    models_available = []
    models_missing = []
    
    expected_models = [
        "msd-musicnn-1.pb",
        "mood_relaxed-msd-musicnn-1.pb",
        "mood_sad-msd-musicnn-1.pb",
        "mood_party-msd-musicnn-1.pb",
        "arousal_valence-msd-musicnn-1.pb",
        "danceability-msd-musicnn-1.pb",
        "key_edma-msd-musicnn-1.pb",
        "voice_instrumental-msd-musicnn-1.pb",
    ]
    
    for model in expected_models:
        (models_available if (MODELS_DIR / model).exists() else models_missing).append(model)
    
    return {
        "essentia_installed": HAS_ESSENTIA,
        "models_dir": str(MODELS_DIR),
        "models_dir_exists": MODELS_DIR.exists(),
        "models_available": models_available,
        "models_missing": models_missing,
        "models_count": len(models_available),
        "cache_dir": str(CACHE_DIR),
        "cache_exists": CACHE_DIR.exists(),
    }

@app.get("/health")
async def health():
    return {"status": "ok", "synth_ready": synth is not None}
