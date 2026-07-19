from typing import Dict, Any, List

class MetadataEngine:
    """
    Performs semantic understanding of the dataset.
    Moves beyond naive string/number mapping.
    Infers data type, semantic meaning, measure/dimension roles, geographic roles, 
    date hierarchies, and display formatting.
    """
    def __init__(self):
        # In a real enterprise app, this might load a dictionary of synonyms
        # or use an LLM/NLP library to classify semantic meanings.
        pass

    def process(self, raw_columns: Dict[str, Any]) -> Dict[str, Any]:
        """
        Takes raw column profiles (e.g. from pandas) and returns semantic metadata.
        """
        semantic_metadata = {}
        for col_name, raw_profile in raw_columns.items():
            semantic_metadata[col_name] = self._infer_semantics(col_name, raw_profile)
        return semantic_metadata

    def _infer_semantics(self, col_name: str, raw_profile: Any) -> Dict[str, Any]:
        """
        Example: Revenue -> Measure -> Currency -> Aggregation = SUM -> Format = $ -> Role = Financial Metric
        """
        col_lower = col_name.lower()
        
        # Defaults
        role = "dimension"
        tableau_datatype = "string"
        aggregation = "NONE"
        format_type = "standard"
        semantic_meaning = "categorical"

        # Simple heuristics for demonstration
        if raw_profile.get("dtype") in ["int64", "float64"]:
            role = "measure"
            tableau_datatype = "real"
            aggregation = "SUM"
            semantic_meaning = "numeric"
            
            if any(term in col_lower for term in ["revenue", "sales", "profit", "cost", "price", "margin"]):
                format_type = "currency"
                semantic_meaning = "financial_metric"
            elif any(term in col_lower for term in ["rate", "percent", "ratio", "margin"]):
                format_type = "percentage"
                aggregation = "AVG"
                semantic_meaning = "ratio_metric"
                
        elif raw_profile.get("dtype") == "datetime64":
            role = "dimension"
            tableau_datatype = "datetime"
            semantic_meaning = "temporal"
            
        elif any(term in col_lower for term in ["country", "state", "city", "region", "zip"]):
            role = "dimension"
            tableau_datatype = "string"
            semantic_meaning = "geographic"

        return {
            "original_name": col_name,
            "role": role,
            "tableau_datatype": tableau_datatype,
            "aggregation": aggregation,
            "format_type": format_type,
            "semantic_meaning": semantic_meaning,
            "nullable": raw_profile.get("has_nulls", True)
        }
