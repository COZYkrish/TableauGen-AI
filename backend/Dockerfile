# ═══════════════════════════════════════════════════════════════════════════
# TableauGen AI — Backend Dockerfile
# Multi-stage build for production use
# ═══════════════════════════════════════════════════════════════════════════

# ── Stage 1: Builder ────────────────────────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /build

# Install build deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install wheels
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt


# ── Stage 2: Runtime ────────────────────────────────────────────────────────
FROM python:3.11-slim AS runtime

WORKDIR /app

# Create non-root user
RUN groupadd -r tableaugen && useradd -r -g tableaugen tableaugen

# Install runtime deps (libpq for psycopg2)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 curl \
    && rm -rf /var/lib/apt/lists/*

# Copy wheels and install
COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir --find-links=/wheels /wheels/*.whl && \
    rm -rf /wheels

# Copy application code
COPY --chown=tableaugen:tableaugen . .

# Create required directories
RUN mkdir -p uploads exports logs && \
    chown -R tableaugen:tableaugen uploads exports logs

# Switch to non-root
USER tableaugen

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
