"""
Chart-type rule modules.

Each module exposes a single function:
    evaluate(metadata: dict) -> list[ChartRecommendation]

Recommendations are merged and ranked by the RecommendationEngine.
"""
