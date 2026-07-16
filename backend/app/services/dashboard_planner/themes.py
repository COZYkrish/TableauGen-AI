"""
Theme Engine — Color palette and typography definitions for dashboards.

Themes are used by both the Dashboard Planner (for the Blueprint JSON)
and the Tableau Generator (for worksheet formatting).

Available themes:
    - executive    Dark, professional — navy/gold
    - sales        Energetic — teal/orange
    - finance      Conservative — deep blue/green
    - minimal      Clean white-space, monochrome accents
"""

from __future__ import annotations
from typing import Any

THEMES: dict[str, dict[str, Any]] = {
    "executive": {
        "name": "Executive",
        "description": "Professional dark theme with navy and gold accents",
        "colors": {
            "primary": "#1A3A5C",      # Navy blue
            "secondary": "#C9973A",    # Gold
            "accent_1": "#2E6DA4",     # Medium blue
            "accent_2": "#E8B84B",     # Light gold
            "accent_3": "#4A90D9",     # Sky blue
            "background": "#0F2337",   # Dark navy
            "text": "#F0F4F8",         # Near white
            "text_secondary": "#A8BCD0",
            "border": "#2A4B6A",
        },
        "palette": [
            "#1A3A5C", "#C9973A", "#2E6DA4", "#E8B84B",
            "#4A90D9", "#F5C842", "#7FB3D3", "#8B6914",
        ],
        "font_family": "Tableau Regular",
        "header_font": "Tableau Bold",
        "background_color": "#0F2337",
        "worksheet_background": "#0F2337",
        "shading": "Dark",
    },

    "sales": {
        "name": "Sales",
        "description": "Energetic theme with teal and orange — great for sales dashboards",
        "colors": {
            "primary": "#00897B",      # Teal
            "secondary": "#FF6D00",    # Orange
            "accent_1": "#26A69A",     # Light teal
            "accent_2": "#FFA726",     # Amber
            "accent_3": "#43A047",     # Green (positive)
            "background": "#FAFAFA",   # Near white
            "text": "#212121",         # Dark gray
            "text_secondary": "#757575",
            "border": "#E0E0E0",
        },
        "palette": [
            "#00897B", "#FF6D00", "#26A69A", "#FFA726",
            "#43A047", "#EF5350", "#7E57C2", "#29B6F6",
        ],
        "font_family": "Tableau Regular",
        "header_font": "Tableau Bold",
        "background_color": "#FFFFFF",
        "worksheet_background": "#FAFAFA",
        "shading": "Light",
    },

    "finance": {
        "name": "Finance",
        "description": "Conservative blue-green palette for financial reporting",
        "colors": {
            "primary": "#1565C0",      # Deep blue
            "secondary": "#2E7D32",    # Dark green
            "accent_1": "#1976D2",     # Blue
            "accent_2": "#388E3C",     # Green
            "accent_3": "#C62828",     # Red (negative)
            "background": "#F5F7FA",   # Light gray
            "text": "#1A1A2E",         # Dark navy
            "text_secondary": "#546E7A",
            "border": "#CFD8DC",
        },
        "palette": [
            "#1565C0", "#2E7D32", "#1976D2", "#388E3C",
            "#C62828", "#F57F17", "#6A1B9A", "#00838F",
        ],
        "font_family": "Tableau Regular",
        "header_font": "Tableau Bold",
        "background_color": "#FFFFFF",
        "worksheet_background": "#F5F7FA",
        "shading": "Light",
    },

    "minimal": {
        "name": "Minimal",
        "description": "Clean, whitespace-focused design with subtle accents",
        "colors": {
            "primary": "#5C6BC0",      # Indigo
            "secondary": "#78909C",    # Blue gray
            "accent_1": "#7E57C2",     # Purple
            "accent_2": "#42A5F5",     # Blue
            "accent_3": "#26C6DA",     # Cyan
            "background": "#FFFFFF",   # White
            "text": "#263238",         # Dark
            "text_secondary": "#90A4AE",
            "border": "#ECEFF1",
        },
        "palette": [
            "#5C6BC0", "#78909C", "#7E57C2", "#42A5F5",
            "#26C6DA", "#66BB6A", "#FFCA28", "#FF7043",
        ],
        "font_family": "Tableau Regular",
        "header_font": "Tableau Light",
        "background_color": "#FFFFFF",
        "worksheet_background": "#FFFFFF",
        "shading": "None",
    },
}

DEFAULT_THEME = "executive"


def get_theme(name: str) -> dict[str, Any]:
    """Return a theme dict by name, falling back to default."""
    return THEMES.get(name, THEMES[DEFAULT_THEME])


def list_themes() -> list[dict[str, str]]:
    """Return a minimal list of theme metadata for the UI."""
    return [
        {"id": tid, "name": t["name"], "description": t["description"]}
        for tid, t in THEMES.items()
    ]
