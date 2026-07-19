from typing import Dict, Any, List

class RecommendationEngine:
    """
    Stateless engine that evaluates semantic metadata to score visualizations and KPIs.
    Provides confidence scores and recommends templates.
    """
    
    def generate_recommendations(self, semantic_metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Consumes semantic metadata and outputs scored recommendations.
        """
        measures = [k for k, v in semantic_metadata.items() if v["role"] == "measure"]
        dimensions = [k for k, v in semantic_metadata.items() if v["role"] == "dimension"]
        temporal = [k for k, v in semantic_metadata.items() if v["semantic_meaning"] == "temporal"]
        geographic = [k for k, v in semantic_metadata.items() if v["semantic_meaning"] == "geographic"]
        
        charts = self._score_charts(measures, dimensions, temporal, geographic)
        kpis = self._score_kpis(measures)
        templates = self._score_templates(temporal, geographic)
        
        return {
            "charts": charts,
            "kpis": kpis,
            "templates": templates
        }

    def _score_charts(self, measures, dimensions, temporal, geographic) -> List[Dict[str, Any]]:
        charts = []
        if temporal and measures:
            charts.append({"type": "line", "x": temporal[0], "y": measures[0], "score": 0.98})
        if geographic and measures:
            charts.append({"type": "map", "x": geographic[0], "y": measures[0], "score": 0.95})
        if dimensions and measures:
            charts.append({"type": "bar", "x": dimensions[0], "y": measures[0], "score": 0.90})
            charts.append({"type": "treemap", "x": dimensions[0], "y": measures[0], "score": 0.80})
            
        # Sort by score descending
        charts.sort(key=lambda x: x["score"], reverse=True)
        return charts

    def _score_kpis(self, measures) -> List[Dict[str, Any]]:
        kpis = []
        for i, m in enumerate(measures):
            # Base score decreases slightly for subsequent measures
            score = max(0.95 - (i * 0.05), 0.50)
            kpis.append({
                "title": f"Total {m}",
                "formula": f"SUM([{m}])",
                "score": score
            })
        return kpis

    def _score_templates(self, temporal, geographic) -> List[Dict[str, Any]]:
        # Recommend Executive by default if we have time-series, otherwise Minimal
        templates = []
        if temporal:
            templates.append({"theme": "Executive", "score": 0.95})
        if geographic:
            templates.append({"theme": "Operations", "score": 0.85})
        
        templates.append({"theme": "Minimal", "score": 0.60})
        templates.sort(key=lambda x: x["score"], reverse=True)
        return templates
