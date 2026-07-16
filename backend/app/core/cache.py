"""
Simple TTL in-memory cache for expensive intelligence computations.

Usage:
    cache = TTLCache(ttl_seconds=300)

    value = cache.get("key")
    if value is None:
        value = expensive_computation()
        cache.set("key", value)
"""

from __future__ import annotations

import time
from typing import Any


class TTLCache:
    """
    Thread-safe (GIL-protected for CPython) in-memory TTL cache.

    Parameters
    ----------
    ttl_seconds : int
        How long to keep cached values (default: 5 minutes)
    max_size : int
        Maximum number of entries before LRU eviction (default: 500)
    """

    def __init__(self, ttl_seconds: int = 300, max_size: int = 500):
        self._store: dict[str, tuple[Any, float]] = {}  # key → (value, expires_at)
        self.ttl = ttl_seconds
        self.max_size = max_size

    def get(self, key: str) -> Any | None:
        """Return cached value if present and not expired."""
        entry = self._store.get(key)
        if entry is None:
            return None
        value, expires_at = entry
        if time.monotonic() > expires_at:
            del self._store[key]
            return None
        return value

    def set(self, key: str, value: Any) -> None:
        """Store value with TTL expiry. Evicts oldest entries if at capacity."""
        if len(self._store) >= self.max_size:
            # Evict the entry with the nearest expiry
            oldest_key = min(self._store, key=lambda k: self._store[k][1])
            del self._store[oldest_key]
        self._store[key] = (value, time.monotonic() + self.ttl)

    def invalidate(self, key: str) -> None:
        """Remove a specific cache entry."""
        self._store.pop(key, None)

    def invalidate_prefix(self, prefix: str) -> int:
        """Remove all entries whose key starts with prefix. Returns count removed."""
        keys_to_remove = [k for k in self._store if k.startswith(prefix)]
        for k in keys_to_remove:
            del self._store[k]
        return len(keys_to_remove)

    def clear(self) -> None:
        """Clear all cache entries."""
        self._store.clear()

    def __len__(self) -> int:
        return len(self._store)

    def stats(self) -> dict[str, Any]:
        """Return cache statistics."""
        now = time.monotonic()
        expired = sum(1 for _, (_, exp) in self._store.items() if now > exp)
        return {
            "total_entries": len(self._store),
            "expired_entries": expired,
            "live_entries": len(self._store) - expired,
            "ttl_seconds": self.ttl,
            "max_size": self.max_size,
        }


# ── Module-level shared cache instances ──────────────────────────────────────

# Cache for intelligence full reports (expensive: profile + 3 engines)
intelligence_cache = TTLCache(ttl_seconds=300, max_size=200)  # 5-min TTL

# Cache for dashboard blueprints (cheaper, reused often)
blueprint_cache = TTLCache(ttl_seconds=600, max_size=500)     # 10-min TTL
