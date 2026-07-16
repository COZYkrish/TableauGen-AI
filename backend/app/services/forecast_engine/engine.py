"""
Forecast Engine — Generates forward-looking projections for temporal measure columns.

Approach:
  1. Linear Trend Forecast   — OLS regression extrapolation (always available)
  2. Moving Average Forecast — smoothed baseline using trailing window
  3. Seasonal Naive Forecast — repeat last period's seasonal pattern (if ≥12 data points)

Outputs a forecast series (next N periods) for each temporal measure pair,
plus confidence bounds (±1σ of residuals).

No external ML libraries required — pure Python/math.
"""

from __future__ import annotations

import math
from typing import Any
from loguru import logger


# Number of periods to forecast forward
DEFAULT_HORIZON = 6


class ForecastEngine:
    """
    Generates time-series forecasts from a dataset profile.

    Parameters
    ----------
    profile : dict
        Output of DatasetProfiler.profile()
    metadata : dict
        Output of MetadataEngine.analyze()
    horizon : int
        Number of future periods to forecast (default 6)
    """

    def __init__(self, profile: dict[str, Any], metadata: dict[str, Any], horizon: int = DEFAULT_HORIZON):
        self.profile = profile
        self.metadata = metadata
        self.summary = metadata.get("summary", {})
        self.horizon = horizon

    def forecast(self) -> list[dict[str, Any]]:
        """
        Generate forecasts for each (date, measure) pair in the dataset.

        Returns
        -------
        list[dict]
            Each item:
            - measure: str
            - date_field: str
            - method: str        (linear | moving_avg | seasonal_naive)
            - historical: list   [{period, value}]
            - forecast: list     [{period, value, lower_bound, upper_bound}]
            - trend_direction: str  (up | down | flat)
            - growth_rate_pct: float
            - confidence: str    (high | medium | low)
        """
        dates = self.summary.get("dates", [])
        measures = self.summary.get("measures", [])

        if not dates or not measures:
            logger.info("Forecast Engine: no temporal measures found — skipping")
            return []

        forecasts = []
        date_field = dates[0]

        for measure in measures[:3]:  # Limit to top 3 measures
            ts_key = f"{date_field}__{measure}"
            time_series = self.profile.get("time_series", {}).get(ts_key)

            if not time_series or len(time_series) < 3:
                logger.debug(f"Forecast Engine: skipping {measure} (insufficient data)")
                continue

            # Extract clean (period_label, value) pairs
            series = [(str(t), float(v)) for t, v in time_series if v is not None]
            if len(series) < 3:
                continue

            result = self._forecast_series(date_field, measure, series)
            forecasts.append(result)
            logger.info(f"Forecast Engine: {measure} → {result['method']} | trend: {result['trend_direction']} | growth: {result['growth_rate_pct']:+.1f}%")

        return forecasts

    # ── Internal helpers ─────────────────────────────────────────────────────

    def _forecast_series(
        self, date_field: str, measure: str, series: list[tuple[str, float]]
    ) -> dict[str, Any]:
        """Choose the best forecast method and run it."""
        values = [v for _, v in series]
        n = len(values)

        # Choose method based on data length
        if n >= 12:
            method = "seasonal_naive"
            forecast_values, sigma = self._seasonal_naive(values)
        elif n >= 5:
            method = "moving_avg"
            forecast_values, sigma = self._moving_average_forecast(values)
        else:
            method = "linear"
            forecast_values, sigma = self._linear_forecast(values)

        # Build period labels for forecast (extend sequence)
        last_label = series[-1][0]
        forecast_labels = [f"F+{i + 1}" for i in range(self.horizon)]

        forecast_points = [
            {
                "period": lbl,
                "value": round(v, 4),
                "lower_bound": round(max(0, v - 1.96 * sigma), 4),
                "upper_bound": round(v + 1.96 * sigma, 4),
            }
            for lbl, v in zip(forecast_labels, forecast_values)
        ]

        # Trend stats
        slope = (values[-1] - values[0]) / max(1, n - 1)
        trend_direction = "up" if slope > values[0] * 0.01 else "down" if slope < -values[0] * 0.01 else "flat"
        growth_rate_pct = ((values[-1] - values[0]) / values[0] * 100) if values[0] != 0 else 0

        confidence = "high" if n >= 12 else "medium" if n >= 6 else "low"

        return {
            "measure": measure,
            "date_field": date_field,
            "method": method,
            "historical": [{"period": t, "value": round(v, 4)} for t, v in series],
            "forecast": forecast_points,
            "trend_direction": trend_direction,
            "growth_rate_pct": round(growth_rate_pct, 2),
            "confidence": confidence,
        }

    def _linear_forecast(self, values: list[float]) -> tuple[list[float], float]:
        """OLS linear regression extrapolation."""
        n = len(values)
        xs = list(range(n))
        mean_x = sum(xs) / n
        mean_y = sum(values) / n

        num = sum((x - mean_x) * (y - mean_y) for x, y in zip(xs, values))
        den = sum((x - mean_x) ** 2 for x in xs)
        slope = num / den if den != 0 else 0
        intercept = mean_y - slope * mean_x

        predicted = [intercept + slope * x for x in xs]
        residuals = [v - p for v, p in zip(values, predicted)]
        sigma = math.sqrt(sum(r ** 2 for r in residuals) / max(1, n - 2)) if n > 2 else abs(mean_y * 0.1)

        forecast = [intercept + slope * (n + i) for i in range(self.horizon)]
        return forecast, sigma

    def _moving_average_forecast(self, values: list[float], window: int = 3) -> tuple[list[float], float]:
        """Forecast using a trailing moving average."""
        window = min(window, len(values))
        trailing = values[-window:]
        ma_value = sum(trailing) / window

        # Residuals: deviation from moving average
        residuals = [v - sum(values[max(0, i - window + 1): i + 1]) / min(i + 1, window) for i, v in enumerate(values)]
        sigma = math.sqrt(sum(r ** 2 for r in residuals) / max(1, len(residuals) - 1))

        # Trend-adjusted MA
        recent_slope = (values[-1] - values[-window]) / max(1, window - 1) if len(values) >= window else 0
        forecast = [ma_value + recent_slope * (i + 1) for i in range(self.horizon)]
        return forecast, sigma

    def _seasonal_naive(self, values: list[float], period: int = 4) -> tuple[list[float], float]:
        """Seasonal naive: repeat last seasonal cycle."""
        period = min(period, len(values) // 3)
        if period < 2:
            return self._moving_average_forecast(values)

        last_season = values[-period:]

        # Residuals for sigma estimate
        seasonal_residuals = []
        for i in range(period, len(values)):
            expected = values[i - period]
            seasonal_residuals.append(values[i] - expected)
        sigma = math.sqrt(sum(r ** 2 for r in seasonal_residuals) / max(1, len(seasonal_residuals) - 1)) if seasonal_residuals else abs(values[-1] * 0.1)

        forecast = [last_season[i % period] for i in range(self.horizon)]
        return forecast, sigma
