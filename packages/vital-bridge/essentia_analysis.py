"""
Essentia Audio Analysis Service — extracts musical style fingerprints from audio files.

Uses Essentia's built-in (non-TensorFlow) algorithms — NO model downloads required.
Works fully offline:
  - BPM: RhythmExtractor2013 (multifeel)
  - Key: KeyExtractor (HPCP chroma + profile matching)
  - Genre: heuristic-based from tempo, spectral features, dynamic complexity
  - Mood/Energy: RMS energy + spectral centroid + dynamic complexity
  - Danceability: rhythmic regularity score

Optionally enhanced with pre-trained TensorFlow models if available in ~/essentia_models/.
"""

import os, json, time, hashlib
from pathlib import Path
from typing import Optional

MODELS_DIR = Path(os.environ.get("ESSENTIA_MODELS_DIR", os.path.expanduser("~/essentia_models")))
MODEL_SR = 16000        # Sample rate required by TensorFlow models
ANALYSIS_SR = 44100     # Sample rate for BPM, key, spectral analysis (needs HF transients)
CACHE_DIR = Path(__file__).parent / "essentia_cache"

try:
    import numpy as np
    import essentia.standard as es
    import essentia.pytools as ep
    HAS_ESSENTIA = True
except ImportError:
    HAS_ESSENTIA = False
    print("[essentia] essentia not installed. pip install essentia-tensorflow")

# ============================================================
# Genre → metadata maps
# ============================================================

GENRE_CHARACTER = {
    "house": ["warm", "punchy", "groovy", "clean"],
    "techno": ["dark", "driving", "industrial", "hypnotic"],
    "trance": ["bright", "euphoric", "wide", "evolving"],
    "dnb": ["energetic", "aggressive", "tight", "complex"],
    "dubstep": ["heavy", "aggressive", "digital", "cinematic"],
    "garage": ["swing", "crisp", "clean", "groovy"],
    "ambient": ["space", "dreamy", "evolving", "soft"],
    "trap": ["dark", "heavy", "minimal", "digital"],
    "synthwave": ["retro", "analog", "bright", "wide"],
    "lofi": ["warm", "lofi", "chill", "soft"],
    "hyperpop": ["digital", "aggressive", "bright", "glitch"],
    "hiphop": ["punchy", "lofi", "minimal", "swing"],
    "jazz": ["warm", "acoustic", "complex", "clean"],
    "classical": ["acoustic", "cinematic", "wide", "clean"],
    "funk": ["groovy", "warm", "punchy", "analog"],
    "reggae": ["warm", "chill", "groovy", "analog"],
    "latin": ["warm", "groovy", "acoustic", "complex"],
}

GENRE_INSTRUMENTS = {
    "house": ["drum", "bass", "lead", "pad", "pluck"],
    "techno": ["drum", "bass", "lead", "fx"],
    "trance": ["drum", "bass", "lead", "pad", "arp"],
    "dnb": ["drum", "bass", "lead", "pad", "fx"],
    "dubstep": ["drum", "bass", "lead", "fx"],
    "garage": ["drum", "bass", "lead", "chord", "pluck"],
    "ambient": ["drum", "pad", "fx", "bell"],
    "trap": ["drum", "bass", "lead", "bell"],
    "synthwave": ["drum", "bass", "lead", "pad", "bell"],
    "lofi": ["drum", "bass", "pad", "keys", "pluck"],
    "hyperpop": ["drum", "bass", "lead", "pluck", "fx"],
    "hiphop": ["drum", "bass", "lead", "keys"],
    "jazz": ["drum", "bass", "keys", "string"],
    "classical": ["drum", "string", "keys", "pad"],
    "funk": ["drum", "bass", "lead", "keys"],
    "reggae": ["drum", "bass", "keys", "pluck"],
    "latin": ["drum", "bass", "keys", "string"],
}

MOOD_CHARACTER = {
    "bright": ["bright", "wide", "clean"],
    "dark": ["dark", "aggressive", "industrial"],
    "chill": ["soft", "dreamy", "warm"],
    "energetic": ["punchy", "driving", "bright"],
    "melancholic": ["warm", "soft", "lofi"],
}

# ============================================================
# Built-in (non-ML) Analysis
# ============================================================

def _load_audio(filepath, sr=ANALYSIS_SR):
    """Smart audio loader — detects format, channels, sample rate and auto-converts.

    1. Loads audio with AudioLoader to get original metadata
    2. Downmixes stereo/multi-channel → mono via MonoMixer
    3. Resamples to target rate if needed
    4. Returns (audio_array, metadata_dict)
    """
    if not HAS_ESSENTIA:
        raise RuntimeError("Essentia not installed")

    # Step 1: Load with original metadata
    try:
        loader = es.AudioLoader(filename=filepath)
        audio_orig, orig_sr, num_channels, md5, bit_rate, codec = loader()
    except Exception as e:
        raise RuntimeError(f"Failed to load audio: {filepath} — {e}")

    duration = len(audio_orig) / orig_sr if orig_sr > 0 else 0
    meta = {
        "original_sr": orig_sr,
        "channels": num_channels,
        "duration_sec": round(duration, 1),
        "codec": codec or "unknown",
        "bit_rate": bit_rate,
    }

    audio = audio_orig

    # Step 2: Downmix to mono if needed.
    # NOTE: AudioLoader may return 2D array shape even for mono files
    # (e.g., PCM WAV → shape=[samples, 2] with ch=1).
    # Always trust num_channels metadata, NOT array shape.
    if num_channels > 1:
        mono_mixer = es.MonoMixer()
        audio = mono_mixer(audio, num_channels)

    # Step 3: Flatten to 1D if still 2D (mono files with quirky AudioLoader output)
    if audio.ndim == 2:
        audio = audio.mean(axis=1).astype(np.float32)  # safe average across columns

    # Step 4: Resample to target rate if needed
    if orig_sr != sr:
        resampler = es.Resample(inputSampleRate=orig_sr, outputSampleRate=sr, quality=4)
        audio = resampler(audio)

    return audio, meta


def _resample_audio(audio, from_sr, to_sr):
    """Resample audio to target sample rate using Essentia's Resample."""
    if from_sr == to_sr:
        return audio
    resampler = es.Resample(inputSampleRate=from_sr, outputSampleRate=to_sr, quality=4)
    return resampler(audio)


def _detect_bpm_builtin(audio):
    """Detect BPM using RhythmExtractor2013 (multifeel)."""
    try:
        rhythm = es.RhythmExtractor2013(method="multifeature")
        bpm, beats, conf, _, intervals = rhythm(audio)
        return {"value": round(float(bpm)), "confidence": round(float(conf), 3)}
    except Exception as e:
        print(f"[essentia] BPM multifeel failed: {e}")
        try:
            percival = es.PercivalBpmEstimator()
            return {"value": round(float(percival(audio))), "confidence": 0.4}
        except:
            return None


def _detect_key_builtin(audio):
    """Detect key using KeyExtractor (HPCP chroma + tempered profile)."""
    try:
        ke = es.KeyExtractor()
        key, scale, strength = ke(audio)
        mode = "major" if scale == "major" else "minor"
        return {"value": f"{key}:{mode}", "confidence": round(float(strength), 3)}
    except Exception as e:
        print(f"[essentia] Key detection failed: {e}")
        return None


def _extract_spectral_features(audio):
    """Extract spectral features for heuristic genre/mood classification."""
    try:
        # Frame-based spectral analysis
        frame_size = 2048
        hop_size = 1024

        w = es.Windowing(type='hann')
        spec = es.Spectrum(size=frame_size)
        centroid = es.Centroid(range=MODEL_SR / 2)
        rolloff = es.RollOff(sampleRate=MODEL_SR)
        mfcc = es.MFCC(sampleRate=MODEL_SR, highFrequencyBound=MODEL_SR/2)
        energy = es.RMS()

        centroids = []
        rolloffs = []
        mfccs = []
        energies = []

        for frame in es.FrameGenerator(audio, frameSize=frame_size, hopSize=hop_size):
            windowed = w(frame)
            spectrum = spec(windowed)
            centroids.append(centroid(spectrum))
            rolloffs.append(rolloff(spectrum))
            mfccs.append(mfcc(spectrum)[1])
            energies.append(energy(frame))

        centroids = np.array(centroids)
        rolloffs = np.array(rolloffs)
        mfccs = np.array(mfccs)
        energies = np.array(energies)

        return {
            "centroid_mean": float(np.mean(centroids)),
            "centroid_std": float(np.std(centroids)),
            "rolloff_mean": float(np.mean(rolloffs)),
            "rolloff_std": float(np.std(rolloffs)),
            "mfcc_mean": float(np.mean(mfccs)),
            "mfcc_std": float(np.std(mfccs)),
            "energy_mean": float(np.mean(energies)),
            "energy_std": float(np.std(energies)),
        }
    except Exception as e:
        print(f"[essentia] Spectral features failed: {e}")
        return None


def _detect_dynamic_complexity(audio):
    """Measure dynamic complexity (loudness variation + timbre variation)."""
    try:
        dc = es.DynamicComplexity(sampleRate=MODEL_SR)
        complexity, loudness = dc(audio)
        return {
            "complexity": float(complexity),
            "loudness": float(loudness),
        }
    except:
        return None


# ============================================================
# Heuristic Genre/Mood Classification
# ============================================================

def _classify_genre_heuristic(bpm_dict, spectral, dynamic):
    """Classify genre based on tempo + spectral features + dynamic complexity."""
    bpm = bpm_dict["value"] if bpm_dict else 120
    centroid = spectral["centroid_mean"] if spectral else 800
    rolloff = spectral["rolloff_mean"] if spectral else 2000
    energy = spectral["energy_mean"] if spectral else 0.01
    energy_std = spectral["energy_std"] if spectral else 0.005

    # Calculate scores for each genre based on heuristic rules
    scores = {}

    # Tempo-based scoring
    def tempo_score(target_ranges, bpm):
        """Score how well bpm fits into target ranges [(low, high), ...]."""
        if not target_ranges:
            return 1.0
        best = 0.0
        for lo, hi in target_ranges:
            if lo <= bpm <= hi:
                # Perfect fit: 1.0 at center, tapering at edges
                center = (lo + hi) / 2
                dist = abs(bpm - center) / ((hi - lo) / 2)
                best = max(best, 1.0 - dist * 0.5)
            elif bpm < lo:
                best = max(best, 0.1)
            else:
                best = max(best, 0.1)
        return max(best, 0.1)

    # Genre tempo ranges (BPM)
    genre_tempo = {
        "ambient": [(40, 85)],
        "lofi": [(60, 95)],
        "reggae": [(65, 90)],
        "hiphop": [(70, 105)],
        "classical": [(60, 110)],
        "jazz": [(80, 140)],
        "funk": [(90, 125)],
        "latin": [(90, 130)],
        "synthwave": [(85, 115)],
        "house": [(118, 132)],
        "garage": [(128, 138)],
        "techno": [(125, 145)],
        "trance": [(128, 145)],
        "hyperpop": [(140, 180)],
        "dubstep": [(135, 150)],
        "trap": [(130, 160)],
        "dnb": [(160, 185)],
    }

    for genre, ranges in genre_tempo.items():
        t_score = tempo_score(ranges, bpm)
        # Spectral: brighter centroid → electronic/pop; darker → ambient/classical
        s_score = 0.5
        if centroid > 2500:
            s_score = 1.0 if genre in ("hyperpop", "dnb", "trance", "garage") else 0.7 if genre in ("house", "techno", "dubstep", "trap") else 0.5
        elif centroid > 1500:
            s_score = 1.0 if genre in ("house", "techno", "synthwave", "funk") else 0.7
        else:
            s_score = 1.0 if genre in ("ambient", "lofi", "classical", "jazz") else 0.6

        # Energy: higher → dance/electronic; lower → ambient/chill
        e_score = 0.5
        if energy > 0.05:
            e_score = 1.0 if genre in ("techno", "dubstep", "dnb", "hyperpop", "trance") else 0.7
        elif energy > 0.01:
            e_score = 1.0 if genre in ("house", "trap", "funk", "hiphop", "synthwave") else 0.7
        else:
            e_score = 1.0 if genre in ("ambient", "classical", "lofi") else 0.6

        # Energy variation: high std → more dynamic genres like jazz/classical
        if genre in ("jazz", "classical", "funk"):
            e_score *= (0.5 + energy_std * 30)
        elif genre in ("ambient", "techno", "trance"):
            e_score *= (1.0 - energy_std * 10)

        scores[genre] = t_score * 0.4 + s_score * 0.3 + e_score * 0.3

    # Normalize
    max_score = max(scores.values()) if scores else 0.01
    for g in scores:
        scores[g] /= max_score

    sorted_genres = sorted(scores.items(), key=lambda x: -x[1])
    primary, conf = sorted_genres[0]
    top3 = [{"genre": g, "confidence": round(min(c, 1.0), 3)} for g, c in sorted_genres[:3]]

    return {
        "primary": primary,
        "confidence": round(min(conf, 0.95), 3),
        "top3": top3,
        "_method": "heuristic",
    }


def _classify_mood_heuristic(bpm_dict, spectral, dynamic):
    """Classify mood from tempo + energy + spectral centroid."""
    bpm = bpm_dict["value"] if bpm_dict else 120
    energy = spectral["energy_mean"] if spectral else 0.01
    energy_std = spectral["energy_std"] if spectral else 0.005
    centroid = spectral["centroid_mean"] if spectral else 800

    # Arousal: normalized from energy + tempo
    energy_norm = min(energy / 0.1, 1.0)  # 0.1 as "max typical energy"
    tempo_norm = min(bpm / 180, 1.0)
    arousal = energy_norm * 0.6 + tempo_norm * 0.4

    # Valence: inferred from spectral centroid (brighter = more positive)
    # and energy variation (more variation = more expressive/emotional)
    centroid_norm = min(centroid / 3000, 1.0)
    var_norm = min(energy_std / 0.02, 1.0)
    valence = centroid_norm * 0.5 + var_norm * 0.3 + 0.2  # slight positivity bias

    arousal = round(float(np.clip(arousal, 0, 1)), 3)
    valence = round(float(np.clip(valence, 0, 1)), 3)

    # Classify mood from arousal/valence
    if arousal > 0.7:
        primary = "bright" if valence > 0.5 else "dark"
    elif arousal > 0.5:
        primary = "energetic" if valence > 0.4 else "dark"
    elif arousal > 0.25:
        primary = "chill" if valence > 0.4 else "melancholic"
    else:
        primary = "melancholic" if valence < 0.5 else "chill"

    return {
        "primary": primary,
        "arousal": arousal,
        "valence": valence,
        "scores": {},
        "_method": "heuristic",
    }


def _detect_danceability_builtin(audio, bpm_dict):
    """Estimate danceability from BPM + rhythmic regularity."""
    bpm = bpm_dict["value"] if bpm_dict else 120
    # Danceable BPM range: 100-140, peak at 120-130
    center = 125
    spread = 35
    bpm_score = max(0, 1.0 - abs(bpm - center) / spread)

    # Higher confidence in BPM → more regular rhythm → more danceable
    conf = bpm_dict["confidence"] if bpm_dict else 0.5
    rhythm_score = conf

    probability = bpm_score * 0.6 + rhythm_score * 0.4
    probability = round(float(np.clip(probability, 0, 1)), 3)

    return {
        "danceable": probability > 0.5,
        "probability": probability,
        "_method": "heuristic",
    }


# ============================================================
# Optional: TensorFlow model enhancement
# ============================================================
# Architecture: two-step pipeline
#   Step 1: msd-musicnn-1.pb (TensorflowPredictMusiCNN) → tags + embeddings
#   Step 2: classification heads (TensorflowPredict2D on embeddings)
# All models downloaded from https://essentia.upf.edu/models/

# Official MSD top-50 tag list (from msd-musicnn-1.json metadata)
MUSICNN_TAGS = [
    "rock", "pop", "alternative", "indie", "electronic",
    "female vocalists", "dance", "00s", "alternative rock", "jazz",
    "beautiful", "metal", "chillout", "male vocalists", "classic rock",
    "soul", "indie rock", "Mellow", "electronica", "80s",
    "folk", "90s", "chill", "instrumental", "punk",
    "oldies", "blues", "hard rock", "ambient", "acoustic",
    "experimental", "female vocalist", "guitar", "Hip-Hop", "70s",
    "party", "country", "easy listening", "sexy", "catchy",
    "funk", "electro", "heavy metal", "Progressive rock", "60s",
    "rnb", "indie pop", "sad", "House", "happy",
]

# Maps MusiCNN tags → our internal genre classes
MSD_TAG_TO_GENRE = {
    # Electronic genres (specific → general)
    "House": "house",
    "electronica": "house",
    "electronic": "house",
    "electro": "techno",
    "dance": "house",
    "ambient": "ambient",
    "chillout": "chill",
    "chill": "chill",
    # Rock/metal
    "rock": "rock",
    "classic rock": "rock",
    "alternative rock": "rock",
    "alternative": "rock",
    "indie rock": "rock",
    "indie": "rock",
    "hard rock": "rock",
    "metal": "metal",
    "heavy metal": "metal",
    "Progressive rock": "rock",
    "punk": "punk",
    # Pop
    "pop": "pop",
    "indie pop": "pop",
    "catchy": "pop",
    "80s": "synthwave",
    "90s": "rock",
    "00s": "rock",
    "60s": "rock",
    "70s": "rock",
    # Soul/funk/RnB
    "soul": "funk",
    "funk": "funk",
    "rnb": "hiphop",
    "Hip-Hop": "hiphop",
    # Jazz/classical
    "jazz": "jazz",
    "blues": "blues",
    "country": "country",
    "folk": "folk",
    "acoustic": "folk",
    # Other
    "experimental": "experimental",
    "party": "energetic",
    "happy": "bright",
    "sad": "melancholic",
    "beautiful": "chill",
    "Mellow": "chill",
    "easy listening": "chill",
    "sexy": "chill",
    "oldies": "funk",
    "instrumental": "ambient",
    "female vocalists": "pop",
    "female vocalist": "pop",
    "male vocalists": "pop",
    "guitar": "rock",
}

# Embedding cache: avoid re-running msd-musicnn-1.pb per classifier
_embeddings_cache = {}


def _has_model(model_name):
    return (MODELS_DIR / model_name).exists()


def _get_musicnn_outputs(audio):
    """Run msd-musicnn-1.pb to get (tag_predictions, embeddings).

    Returns:
        tags: np.array [frames, 50] — sigmoid activations for 50 MSD tags
        embeddings: np.array [frames, 200] — dense embedding vectors
        or (None, None) if model unavailable.
    """
    model_path = MODELS_DIR / "msd-musicnn-1.pb"
    if not model_path.exists():
        return None, None

    cache_key = id(audio)
    if cache_key in _embeddings_cache:
        return _embeddings_cache[cache_key]

    try:
        # Run model twice to get both outputs from the frozen graph
        # (TensorflowPredictMusiCNN only supports single output per call)
        model_tags = es.TensorflowPredictMusiCNN(
            graphFilename=str(model_path),
            output="model/Sigmoid",
        )
        tags = model_tags(audio)

        model_emb = es.TensorflowPredictMusiCNN(
            graphFilename=str(model_path),
            output="model/dense/BiasAdd",
        )
        embeddings = model_emb(audio)

        _embeddings_cache[cache_key] = (tags, embeddings)
        return tags, embeddings
    except Exception as e:
        print(f"[essentia] msd-musicnn-1.pb failed: {e}")
        return None, None


def _predict_classifier(embeddings, model_file, output="model/Softmax"):
    """Run a TensorflowPredict2D classifier on pre-computed embeddings.

    Args:
        embeddings: np.array [frames, 200] from msd-musicnn-1.pb
        model_file: filename of classification head .pb
        output: output layer name (model/Softmax for mood/voice, model/Identity for deam)
    """
    model_path = MODELS_DIR / model_file
    if not model_path.exists():
        return None
    try:
        model = es.TensorflowPredict2D(
            graphFilename=str(model_path),
            output=output,
        )
        return model(embeddings)
    except Exception as e:
        print(f"[essentia] classifier {model_file} failed: {e}")
        return None


def _detect_genre_ml(audio):
    """Enhance genre detection with MusiCNN 50-tag predictions."""
    tags, _ = _get_musicnn_outputs(audio)
    if tags is None:
        return None

    mean = np.mean(tags, axis=0)
    n_tags = min(len(mean), len(MUSICNN_TAGS))
    tag_probs = {}
    for i in range(n_tags):
        tag_probs[MUSICNN_TAGS[i]] = float(mean[i])

    # Aggregate by our genre classes
    genre_scores = {}
    for tag, prob in tag_probs.items():
        g = MSD_TAG_TO_GENRE.get(tag)
        if not g:
            g = MSD_TAG_TO_GENRE.get(tag.lower())
        if g:
            genre_scores[g] = max(genre_scores.get(g, 0), prob)

    if not genre_scores:
        return None

    sorted_genres = sorted(genre_scores.items(), key=lambda x: -x[1])
    primary, conf = sorted_genres[0]
    top3 = [{"genre": g, "confidence": round(c, 3)} for g, c in sorted_genres[:3]]
    # Return raw tags + genre classification
    raw_tags = sorted(tag_probs.items(), key=lambda x: -x[1])[:5]
    return {
        "primary": primary,
        "confidence": round(min(conf, 0.95), 3),
        "top3": top3,
        "raw_tags": [{"tag": t, "prob": round(p, 3)} for t, p in raw_tags],
        "_method": "musicnn",
    }


def _detect_mood_ml(audio):
    """Enhance mood with TF classification heads (requires embeddings)."""
    _, embeddings = _get_musicnn_outputs(audio)
    if embeddings is None:
        return None

    result = {"scores": {}}
    arousal = 0.5
    valence = 0.5

    # Arousal/valence regression (DEAM model, output: model/Identity)
    av = _predict_classifier(embeddings, "deam-msd-musicnn-2.pb", output="model/Identity")
    if av is not None:
        m = np.mean(av, axis=0)
        if len(m) >= 2:
            # DEAM outputs (valence, arousal) in 1-9 scale — normalize to 0-1
            valence = float(np.clip((m[0] - 1) / 8, 0, 1))
            arousal = float(np.clip((m[1] - 1) / 8, 0, 1))

    # Mood classifiers (all output: model/Softmax with [non_X, X])
    for mood_name, model_file in [
        ("relaxed", "mood_relaxed-msd-musicnn-1.pb"),
        ("sad", "mood_sad-msd-musicnn-1.pb"),
        ("party", "mood_party-msd-musicnn-1.pb"),
    ]:
        acts = _predict_classifier(embeddings, model_file)
        if acts is not None:
            m = np.mean(acts, axis=0)
            # Index 1 = positive class probability
            result["scores"][mood_name] = round(float(m[1]) if len(m) >= 2 else float(m[0]), 3)

    # Determine primary mood
    primary = "energetic"  # default
    if result["scores"].get("relaxed", 0) > 0.6:
        primary = "chill"
    elif result["scores"].get("sad", 0) > 0.5:
        primary = "melancholic"
    elif result["scores"].get("party", 0) > 0.6:
        primary = "energetic"
    elif arousal > 0.7 and valence > 0.5:
        primary = "bright"
    elif arousal > 0.7 and valence < 0.4:
        primary = "dark"
    elif arousal < 0.3:
        primary = "chill"

    return {
        "primary": primary,
        "arousal": round(arousal, 3),
        "valence": round(valence, 3),
        "scores": result["scores"],
        "_method": "tensorflow",
    }


def _detect_voice_ml(audio):
    """Detect voice/instrumental using TF classification head."""
    _, embeddings = _get_musicnn_outputs(audio)
    if embeddings is None:
        return None

    acts = _predict_classifier(embeddings, "voice_instrumental-msd-musicnn-1.pb")
    if acts is None:
        return None
    m = np.mean(acts, axis=0)
    if len(m) >= 2:
        vp = float(m[1])  # Index 1 = "voice" probability
        return {"voice_present": vp > 0.5, "probability": round(vp, 3), "_method": "tensorflow"}
    return None


# ============================================================
# Build description
# ============================================================

def _describe(genre, mood, bpm, key, voice):
    parts = [genre["primary"].title()]

    if bpm and bpm.get("value"):
        v = bpm["value"]
        speed = ("very slow" if v < 60 else "slow" if v < 80 else "medium" if v < 110
                 else "fast" if v < 140 else "very fast")
        parts.append(f"({speed}, {v}bpm)")

    mood_map = {
        "bright": "bright/uplifting", "dark": "dark/intense",
        "chill": "chill/relaxed", "energetic": "energetic/driving",
        "melancholic": "melancholic/emotional",
    }
    parts.append(f"with {mood_map.get(mood['primary'], 'balanced')} energy")

    if key and key.get("value"):
        parts.append(f"in {key['value']}")
    if voice and voice.get("voice_present"):
        parts.append("featuring vocals")

    return " — ".join(parts)


# ============================================================
# Caching
# ============================================================

def _cache_key(filepath):
    with open(filepath, 'rb') as f:
        return hashlib.md5(f.read(1024 * 1024)).hexdigest()

def _load_cache(filepath):
    try:
        ck = _cache_key(filepath)
        cp = CACHE_DIR / f"{ck}.json"
        if cp.exists() and time.time() - cp.stat().st_mtime < 86400:
            return json.loads(cp.read_text())
    except:
        pass
    return None

def _save_cache(filepath, result):
    try:
        CACHE_DIR.mkdir(parents=True, exist_ok=True)
        ck = _cache_key(filepath)
        (CACHE_DIR / f"{ck}.json").write_text(json.dumps(result, ensure_ascii=False, indent=2))
    except:
        pass


# ============================================================
# Main API
# ============================================================

def analyze_audio(filepath: str) -> dict:
    """Analyze audio file and return comprehensive style profile.

    Works fully offline with heuristic algorithms. TensorFlow models
    are used as optional enhancement if available in ~/essentia_models/.
    """
    if not HAS_ESSENTIA:
        return _fallback_profile(filepath)
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"File not found: {filepath}")

    cached = _load_cache(filepath)
    if cached:
        return cached

    t0 = time.time()

    # ── Smart load: auto-detect format, channels, sample rate; convert to mono/44.1k ──
    audio_full, meta = _load_audio(filepath, ANALYSIS_SR)
    conv_steps = []
    if meta.get('channels', 1) > 1:
        conv_steps.append(f"stereo→mono ({meta['channels']}ch)")
    if meta.get('original_sr', ANALYSIS_SR) != ANALYSIS_SR:
        conv_steps.append(f"{meta['original_sr']}Hz→{ANALYSIS_SR}Hz")
    if conv_steps:
        print(f"[essentia] auto-converted: {', '.join(conv_steps)}")

    # ── Built-in analysis (always works, at full resolution) ──
    bpm = _detect_bpm_builtin(audio_full)
    key = _detect_key_builtin(audio_full)
    spectral = _extract_spectral_features(audio_full)
    dynamic = _detect_dynamic_complexity(audio_full)

    # ── Prepare 16kHz audio for TensorFlow models ──
    audio_16k = _resample_audio(audio_full, ANALYSIS_SR, MODEL_SR)

    # ── Genre: try ML, fall back to heuristic ──
    genre = _detect_genre_ml(audio_16k) if _has_model("msd-musicnn-1.pb") else None
    if not genre:
        genre = _classify_genre_heuristic(bpm, spectral, dynamic)

    # ── Mood: try ML, fall back to heuristic ──
    mood = None
    if _has_model("deam-msd-musicnn-2.pb"):
        mood = _detect_mood_ml(audio_16k)
    if not mood or not mood.get("scores"):
        mood = _classify_mood_heuristic(bpm, spectral, dynamic)

    # ── Danceability ──
    danceability = _detect_danceability_builtin(audio_full, bpm)

    # ── Voice (ML only) ──
    voice = _detect_voice_ml(audio_16k) if _has_model("voice_instrumental-msd-musicnn-1.pb") else None

    # ── Infer instruments and sound character ──
    instruments = GENRE_INSTRUMENTS.get(genre["primary"], ["drum", "bass", "lead", "pad"])
    char_tags = list(GENRE_CHARACTER.get(genre["primary"], ["clean", "warm"]))
    mood_chars = MOOD_CHARACTER.get(mood["primary"], [])
    sound_tags = list(dict.fromkeys(char_tags + mood_chars))

    description = _describe(genre, mood, bpm, key, voice)

    elapsed = time.time() - t0

    model_status = "heuristic"
    if genre.get("_method") == "musicnn":
        model_status = "tensorflow+heuristic"

    result = {
        "analyzed_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "duration_sec": round(elapsed, 2),
        "filename": os.path.basename(filepath),
        "audio_meta": meta,          # original file: sample rate, channels, codec, duration
        "analysis_method": model_status,
        "genre": genre,
        "bpm": bpm,
        "key": key,
        "mood": mood,
        "instruments": instruments,
        "soundTags": sound_tags,
        "danceability": danceability,
        "voice": voice,
        "description": description,
    }

    _save_cache(filepath, result)

    info = f"genre={genre['primary']}/{genre.get('confidence',0):.2f}"
    info += f" bpm={bpm['value']}" if bpm else ""
    info += f" key={key['value']}" if key else ""
    info += f" mood={mood['primary']}"
    print(f"[essentia] {os.path.basename(filepath)} in {elapsed:.1f}s ({model_status}) → {info}")

    return result


def _fallback_profile(filepath):
    return {
        "analyzed_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "duration_sec": 0, "analysis_method": "unavailable",
        "filename": os.path.basename(filepath) if filepath else "unknown",
        "audio_meta": {},
        "genre": {"primary": "house", "confidence": 0.3, "top3": []},
        "bpm": None, "key": None,
        "mood": {"primary": "energetic", "arousal": 0.5, "valence": 0.5, "scores": {}},
        "instruments": ["drum", "bass", "lead", "pad"],
        "soundTags": ["warm", "clean"],
        "danceability": None, "voice": None,
        "description": "Style analysis unavailable — Essentia not installed.",
        "_fallback": True,
    }
