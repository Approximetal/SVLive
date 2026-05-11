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
from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.responses import Response, JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ============================================================
# Configuration
# ============================================================

SAMPLE_RATE = 44100
BPM = 120.0
CACHE_DIR = Path(__file__).parent / "render_cache"
PRESETS_DIR = Path(os.environ.get("VITAL_PRESETS_DIR", os.path.expanduser("~/music/Vital")))
JEK_PRESETS_DIR = Path(os.environ.get("JEK_PRESETS_DIR", os.path.expanduser("~/music/Jek's Vital Presets")))

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
    Sends GET /v1/models to the target Anthropic-compatible endpoint."""
    import httpx
    url = (req.baseURL or "https://api.anthropic.com").rstrip("/") + "/v1/models"
    headers = {"Content-Type": "application/json"}
    if req.authStyle == "authToken":
        headers["Authorization"] = f"Bearer {req.apiKey}"
    else:
        headers["x-api-key"] = req.apiKey
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(url, headers=headers)
        return {"ok": resp.status_code < 400, "status": resp.status_code, "url": url}
    except Exception as e:
        return {"ok": False, "status": 0, "error": str(e), "url": url}


@app.get("/health")
async def health():
    return {"status": "ok", "synth_ready": synth is not None}
