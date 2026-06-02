# Vital-Bridge Docker image for Hugging Face Spaces / production
# Build:  docker build -t vital-bridge .
# Run:    docker run -p 8765:7860 vital-bridge

FROM python:3.11-slim-bookworm

# System deps for audio (libsndfile for wav io, curl for healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libsndfile1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ---- Python dependencies (layered for caching) ----
# Layer 1: native wheel (vita), slow to install
RUN pip install --no-cache-dir vita>=0.0.5 numpy>=1.24 scipy>=1.10

# Layer 2: web stack, fast to install
RUN pip install --no-cache-dir \
    fastapi>=0.104 \
    "uvicorn[standard]>=0.24" \
    python-multipart>=0.0.6 \
    httpx>=0.27

# -------------------------------------------------------------------
# Presets — choose ONE strategy below:
#
#   A) HF Dataset (recommended):
#      docker build --build-arg PRESETS_DATASET=myuser/vital-presets -t vital-bridge .
#
#   B) Local copy:
#      cp -r ~/music/Vital ./presets/vital
#      cp -r ~/mnt/music/Jek\'s\ Vital\ Presets ./presets/jek
#      docker build -t vital-bridge .
# -------------------------------------------------------------------

ARG PRESETS_DATASET=""

RUN if [ -n "$PRESETS_DATASET" ]; then \
      echo ">>> Downloading presets from HF Dataset: $PRESETS_DATASET"; \
      pip install --no-cache-dir huggingface_hub && \
      mkdir -p /presets/vital /presets/jek && \
      python -c "\
from huggingface_hub import snapshot_download; \
snapshot_download('$PRESETS_DATASET', repo_type='dataset', local_dir='/presets', local_dir_use_symlinks=False); \
print('Presets downloaded successfully')\
"; \
    elif [ -d ./presets ]; then \
      echo ">>> Copying presets from build context"; \
      cp -r ./presets/* /presets/ 2>/dev/null || true; \
    else \
      mkdir -p /presets/vital /presets/jek && \
      echo "WARNING: No presets found. Mount at /presets/ at runtime."; \
    fi

# ---- Application code (changes frequently, copy last) ----
COPY server.py .
COPY essentia_analysis.py .
COPY tag_presets.py .
COPY preset_tags.json .

# ---- Runtime dirs ----
RUN mkdir -p render_cache essentia_cache llm_logs

# ---- Env ----
ENV VITAL_PRESETS_DIR=/presets/vital
ENV JEK_PRESETS_DIR=/presets/jek
ENV PYTHONUNBUFFERED=1

EXPOSE 7860

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -sf http://localhost:7860/health || exit 1

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "7860", "--log-level", "info"]
