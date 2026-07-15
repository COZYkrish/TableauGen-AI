"""
Dataset Profiler — Analyzes every column in a CSV to produce
statistical summaries, type detection, null analysis, and outlier detection.

This is the first stage of the pipeline:
    CSV → Dataset Profiler → Metadata Engine → downstream modules
"""

from __future__ import annotations

import pandas as pd
import numpy as np
from typing import Any
from loguru import logger


class DatasetProfiler:
    """Generates a comprehensive statistical profile for a pandas DataFrame."""

    def __init__(self, df: pd.DataFrame):
        self.df = df

    def profile(self) -> dict[str, Any]:
        """Return a full dataset profile including per-column analysis."""
        logger.info(f"Profiling dataset: {self.df.shape[0]} rows × {self.df.shape[1]} columns")
        return {
            "overview": self._overview(),
            "columns": {col: self._profile_column(col) for col in self.df.columns},
        }

    # ── Dataset-level overview ───────────────────────────────────────────

    def _overview(self) -> dict[str, Any]:
        return {
            "row_count": int(self.df.shape[0]),
            "column_count": int(self.df.shape[1]),
            "duplicate_rows": int(self.df.duplicated().sum()),
            "total_missing": int(self.df.isnull().sum().sum()),
            "total_cells": int(self.df.shape[0] * self.df.shape[1]),
            "missing_percent": round(
                self.df.isnull().sum().sum() / (self.df.shape[0] * self.df.shape[1]) * 100, 2
            ),
            "memory_mb": round(self.df.memory_usage(deep=True).sum() / 1024 / 1024, 2),
            "column_names": list(self.df.columns),
        }

    # ── Column-level profiling ───────────────────────────────────────────

    def _profile_column(self, col: str) -> dict[str, Any]:
        series = self.df[col]
        base = self._base_stats(series, col)

        # Attempt numeric profiling
        numeric = pd.to_numeric(series, errors="coerce")
        if numeric.notna().sum() > 0 and numeric.notna().sum() / len(series) > 0.5:
            base["inferred_dtype"] = "numeric"
            base.update(self._numeric_stats(numeric))
            base["outliers"] = self._detect_outliers(numeric)
        # Attempt date profiling
        elif self._is_date_column(series):
            base["inferred_dtype"] = "datetime"
            base.update(self._date_stats(series))
        # Boolean detection
        elif self._is_boolean_column(series):
            base["inferred_dtype"] = "boolean"
            base.update(self._boolean_stats(series))
        # Default to categorical/text
        else:
            base["inferred_dtype"] = "categorical"
            base.update(self._categorical_stats(series))

        return base

    def _base_stats(self, series: pd.Series, col: str) -> dict[str, Any]:
        """Statistics common to every column."""
        return {
            "name": col,
            "pandas_dtype": str(series.dtype),
            "total_count": int(len(series)),
            "null_count": int(series.isnull().sum()),
            "null_percent": round(series.isnull().sum() / len(series) * 100, 2),
            "unique_count": int(series.nunique()),
            "uniqueness_ratio": round(series.nunique() / max(len(series), 1), 4),
            "sample_values": [
                _safe_value(v) for v in series.dropna().head(5).tolist()
            ],
        }

    # ── Numeric ──────────────────────────────────────────────────────────

    def _numeric_stats(self, series: pd.Series) -> dict[str, Any]:
        clean = series.dropna()
        if clean.empty:
            return {}
        return {
            "mean": _safe_float(clean.mean()),
            "median": _safe_float(clean.median()),
            "std": _safe_float(clean.std()),
            "min": _safe_float(clean.min()),
            "max": _safe_float(clean.max()),
            "q1": _safe_float(clean.quantile(0.25)),
            "q3": _safe_float(clean.quantile(0.75)),
            "skewness": _safe_float(clean.skew()),
            "kurtosis": _safe_float(clean.kurtosis()),
            "sum": _safe_float(clean.sum()),
            "zeros_count": int((clean == 0).sum()),
            "negative_count": int((clean < 0).sum()),
        }

    def _detect_outliers(self, series: pd.Series) -> dict[str, Any]:
        """IQR-based outlier detection."""
        clean = series.dropna()
        if clean.empty:
            return {"count": 0, "percent": 0.0}
        q1 = clean.quantile(0.25)
        q3 = clean.quantile(0.75)
        iqr = q3 - q1
        lower = q1 - 1.5 * iqr
        upper = q3 + 1.5 * iqr
        outlier_mask = (clean < lower) | (clean > upper)
        return {
            "count": int(outlier_mask.sum()),
            "percent": round(outlier_mask.sum() / len(clean) * 100, 2),
            "lower_bound": _safe_float(lower),
            "upper_bound": _safe_float(upper),
        }

    # ── Date ─────────────────────────────────────────────────────────────

    def _is_date_column(self, series: pd.Series) -> bool:
        """Heuristic: try to parse the column as dates."""
        if series.dtype == "datetime64[ns]":
            return True
        if series.dtype == "object":
            sample = series.dropna().head(50)
            if sample.empty:
                return False
            try:
                parsed = pd.to_datetime(sample, infer_datetime_format=True, errors="coerce")
                return parsed.notna().sum() / len(sample) > 0.7
            except Exception:
                return False
        return False

    def _date_stats(self, series: pd.Series) -> dict[str, Any]:
        parsed = pd.to_datetime(series, errors="coerce")
        clean = parsed.dropna()
        if clean.empty:
            return {}
        return {
            "min_date": str(clean.min()),
            "max_date": str(clean.max()),
            "date_range_days": int((clean.max() - clean.min()).days),
            "has_time_component": bool(clean.dt.hour.sum() > 0),
        }

    # ── Boolean ──────────────────────────────────────────────────────────

    def _is_boolean_column(self, series: pd.Series) -> bool:
        if series.dtype == "bool":
            return True
        unique = set(series.dropna().astype(str).str.lower().unique())
        bool_sets = [
            {"true", "false"}, {"yes", "no"}, {"1", "0"},
            {"y", "n"}, {"t", "f"},
        ]
        return unique in bool_sets or unique.issubset({"true", "false", "1", "0", "yes", "no"})

    def _boolean_stats(self, series: pd.Series) -> dict[str, Any]:
        clean = series.dropna().astype(str).str.lower()
        truthy = clean.isin(["true", "yes", "1", "y", "t"])
        return {
            "true_count": int(truthy.sum()),
            "false_count": int((~truthy).sum()),
            "true_percent": round(truthy.sum() / max(len(clean), 1) * 100, 2),
        }

    # ── Categorical ──────────────────────────────────────────────────────

    def _categorical_stats(self, series: pd.Series) -> dict[str, Any]:
        clean = series.dropna()
        if clean.empty:
            return {}
        value_counts = clean.value_counts()
        return {
            "top_values": [
                {"value": str(v), "count": int(c)}
                for v, c in value_counts.head(10).items()
            ],
            "avg_length": round(clean.astype(str).str.len().mean(), 1),
            "max_length": int(clean.astype(str).str.len().max()),
            "min_length": int(clean.astype(str).str.len().min()),
        }


# ── Helpers ──────────────────────────────────────────────────────────────────

def _safe_float(val: Any) -> float | None:
    """Convert numpy/pandas numerics to Python float, handling NaN/Inf."""
    if val is None or (isinstance(val, float) and (np.isnan(val) or np.isinf(val))):
        return None
    try:
        return round(float(val), 4)
    except (TypeError, ValueError):
        return None


def _safe_value(val: Any) -> Any:
    """Make a value JSON-safe."""
    if isinstance(val, (np.integer,)):
        return int(val)
    if isinstance(val, (np.floating,)):
        return float(val)
    if isinstance(val, (pd.Timestamp, np.datetime64)):
        return str(val)
    return val
