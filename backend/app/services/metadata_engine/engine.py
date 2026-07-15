"""
Metadata Engine — Infers semantic meaning from profiled columns.

This is the CRITICAL intermediate layer in the pipeline:
    Dataset Profiler → Metadata Engine → Recommendation Engine / KPI / Dashboard

Instead of downstream modules inspecting raw CSV columns, they consume
rich metadata: field roles, semantic types, default aggregations, display formats,
and business entity guesses.
"""

from __future__ import annotations

import re
from typing import Any, Literal
from loguru import logger


# ── Semantic Type Constants ──────────────────────────────────────────────────

FieldRole = Literal["dimension", "measure", "date", "identifier", "boolean"]
SemanticType = Literal[
    "currency", "percentage", "geographic", "temporal",
    "quantity", "ratio", "count", "text", "categorical",
    "identifier", "boolean", "numeric",
]
AggregationType = Literal["SUM", "AVG", "COUNT", "COUNTD", "MIN", "MAX", "MEDIAN", "NONE"]
DisplayFormat = Literal["currency", "percentage", "integer", "decimal_2", "decimal_4", "date", "text"]

# ── Pattern libraries for semantic inference ─────────────────────────────────

CURRENCY_PATTERNS = re.compile(
    r"(revenue|sales|price|cost|amount|income|expense|profit|salary|wage|fee|"
    r"budget|payment|total|balance|billing|invoice_amount|mrp|msrp|tax)",
    re.IGNORECASE,
)

PERCENTAGE_PATTERNS = re.compile(
    r"(percent|pct|ratio|rate|margin|share|growth|change|discount|yield|"
    r"conversion|churn|retention|utilization|efficiency|coverage)",
    re.IGNORECASE,
)

GEO_PATTERNS = re.compile(
    r"(country|state|city|region|zip|postal|province|district|county|"
    r"address|latitude|longitude|lat|lng|lon|geo|location|territory|area_code)",
    re.IGNORECASE,
)

DATE_PATTERNS = re.compile(
    r"(date|time|year|month|day|week|quarter|timestamp|created|updated|"
    r"modified|born|started|ended|expired|due|deadline|period|fiscal)",
    re.IGNORECASE,
)

IDENTIFIER_PATTERNS = re.compile(
    r"(id|key|code|number|no|num|index|ref|uuid|sku|isbn|ssn|"
    r"serial|account|ticket|order_id|customer_id|product_id|employee_id)",
    re.IGNORECASE,
)

QUANTITY_PATTERNS = re.compile(
    r"(quantity|qty|count|number|units|volume|weight|size|length|"
    r"height|width|depth|capacity|stock|inventory|headcount)",
    re.IGNORECASE,
)

DIMENSION_NAME_PATTERNS = re.compile(
    r"(name|category|type|status|segment|group|class|tier|level|"
    r"brand|department|division|channel|source|medium|campaign|"
    r"product|customer|vendor|supplier|employee|manager|team|gender|"
    r"color|material|model|version|plan|subscription|priority|label|tag)",
    re.IGNORECASE,
)

# ── Business Entity Mapping ─────────────────────────────────────────────────

BUSINESS_ENTITY_MAP: dict[str, str] = {
    "customer": "Customer",
    "product": "Product",
    "employee": "Employee",
    "order": "Order",
    "invoice": "Invoice",
    "region": "Region",
    "department": "Department",
    "vendor": "Vendor",
    "supplier": "Supplier",
    "campaign": "Campaign",
    "channel": "Channel",
    "segment": "Segment",
    "category": "Category",
    "brand": "Brand",
    "store": "Store",
    "branch": "Branch",
}


class MetadataEngine:
    """
    Takes the output of DatasetProfiler and enriches each column
    with semantic metadata.

    Output: A list of ColumnMetadata dicts — the single source of truth
    for every downstream module.
    """

    def __init__(self, profile: dict[str, Any]):
        self.overview = profile["overview"]
        self.columns = profile["columns"]

    def analyze(self) -> dict[str, Any]:
        """Return enriched metadata for all columns."""
        logger.info(f"Metadata Engine: analyzing {len(self.columns)} columns")
        column_metadata = {}
        for col_name, col_profile in self.columns.items():
            column_metadata[col_name] = self._infer_metadata(col_profile)

        return {
            "overview": self.overview,
            "columns": column_metadata,
            "summary": self._build_summary(column_metadata),
        }

    # ── Per-column inference ─────────────────────────────────────────────

    def _infer_metadata(self, col: dict[str, Any]) -> dict[str, Any]:
        """Produce a full ColumnMetadata dict from the profiler output."""
        name = col["name"]
        dtype = col.get("inferred_dtype", "categorical")

        field_role = self._infer_field_role(name, dtype, col)
        semantic_type = self._infer_semantic_type(name, dtype, col)
        aggregation = self._infer_default_aggregation(field_role, semantic_type, dtype)
        display_format = self._infer_display_format(semantic_type, dtype)
        business_entity = self._infer_business_entity(name)
        date_hierarchy = self._infer_date_hierarchy(col) if dtype == "datetime" else None

        return {
            # Original profiler data carried forward
            **col,
            # Enriched metadata
            "field_role": field_role,
            "semantic_type": semantic_type,
            "default_aggregation": aggregation,
            "display_format": display_format,
            "business_entity": business_entity,
            "date_hierarchy": date_hierarchy,
            "is_filterable": field_role in ("dimension", "date", "boolean"),
            "is_sortable": field_role in ("measure", "date"),
            "tableau_data_role": "dimension" if field_role in ("dimension", "date", "identifier", "boolean") else "measure",
        }

    # ── Field Role ───────────────────────────────────────────────────────

    def _infer_field_role(self, name: str, dtype: str, col: dict) -> FieldRole:
        """Determine if a column is a dimension, measure, date, identifier, or boolean."""
        # Booleans
        if dtype == "boolean":
            return "boolean"

        # Dates
        if dtype == "datetime" or DATE_PATTERNS.search(name):
            return "date"

        # Identifiers: high-cardinality columns with id-like names
        if IDENTIFIER_PATTERNS.search(name):
            return "identifier"

        # Numeric columns: check if they are measures or encoded dimensions
        if dtype == "numeric":
            unique_ratio = col.get("uniqueness_ratio", 0)
            unique_count = col.get("unique_count", 0)

            # If numeric but very low cardinality (e.g. rating 1-5), treat as dimension
            if unique_count <= 10 and unique_ratio < 0.01:
                return "dimension"

            # Otherwise it's a measure
            return "measure"

        # Categorical with dimension-like name
        if DIMENSION_NAME_PATTERNS.search(name):
            return "dimension"

        # Default: categorical → dimension
        return "dimension"

    # ── Semantic Type ────────────────────────────────────────────────────

    def _infer_semantic_type(self, name: str, dtype: str, col: dict) -> SemanticType:
        """Infer the business meaning of a column."""
        if dtype == "boolean":
            return "boolean"
        if dtype == "datetime":
            return "temporal"

        if CURRENCY_PATTERNS.search(name):
            return "currency"
        if PERCENTAGE_PATTERNS.search(name):
            return "percentage"
        if GEO_PATTERNS.search(name):
            return "geographic"
        if QUANTITY_PATTERNS.search(name):
            return "quantity"
        if IDENTIFIER_PATTERNS.search(name):
            return "identifier"

        if dtype == "numeric":
            # Check if values look like percentages (0-1 or 0-100)
            max_val = col.get("max", None)
            min_val = col.get("min", None)
            if max_val is not None and min_val is not None:
                if 0 <= min_val <= max_val <= 1:
                    return "ratio"
            return "numeric"

        return "categorical"

    # ── Default Aggregation ──────────────────────────────────────────────

    def _infer_default_aggregation(
        self, role: FieldRole, semantic: SemanticType, dtype: str
    ) -> AggregationType:
        """What Tableau aggregation should be applied by default?"""
        if role in ("dimension", "identifier", "boolean"):
            return "NONE"
        if role == "date":
            return "NONE"

        # Measures
        if semantic == "currency":
            return "SUM"
        if semantic == "quantity":
            return "SUM"
        if semantic in ("percentage", "ratio"):
            return "AVG"
        if semantic == "count":
            return "SUM"

        return "SUM"  # default for unclassified measures

    # ── Display Format ───────────────────────────────────────────────────

    def _infer_display_format(self, semantic: SemanticType, dtype: str) -> DisplayFormat:
        if semantic == "currency":
            return "currency"
        if semantic in ("percentage", "ratio"):
            return "percentage"
        if semantic == "temporal":
            return "date"
        if dtype == "numeric":
            return "decimal_2"
        return "text"

    # ── Business Entity ──────────────────────────────────────────────────

    def _infer_business_entity(self, name: str) -> str | None:
        """Try to guess what business object this column relates to."""
        lower = name.lower().replace("_", " ").replace("-", " ")
        for keyword, entity in BUSINESS_ENTITY_MAP.items():
            if keyword in lower:
                return entity
        return None

    # ── Date Hierarchy ───────────────────────────────────────────────────

    def _infer_date_hierarchy(self, col: dict) -> list[str] | None:
        """Determine which date parts are meaningful."""
        range_days = col.get("date_range_days", 0)
        hierarchy = ["Year"]
        if range_days > 90:
            hierarchy.append("Quarter")
        if range_days > 30:
            hierarchy.append("Month")
        if range_days > 7:
            hierarchy.append("Week")
        hierarchy.append("Day")
        if col.get("has_time_component", False):
            hierarchy.extend(["Hour", "Minute"])
        return hierarchy

    # ── Summary ──────────────────────────────────────────────────────────

    def _build_summary(self, columns: dict[str, dict]) -> dict[str, Any]:
        """Build a high-level summary of field roles across all columns."""
        roles: dict[str, list[str]] = {
            "dimensions": [],
            "measures": [],
            "dates": [],
            "identifiers": [],
            "booleans": [],
        }
        for name, meta in columns.items():
            role = meta.get("field_role", "dimension")
            if role == "dimension":
                roles["dimensions"].append(name)
            elif role == "measure":
                roles["measures"].append(name)
            elif role == "date":
                roles["dates"].append(name)
            elif role == "identifier":
                roles["identifiers"].append(name)
            elif role == "boolean":
                roles["booleans"].append(name)

        return {
            **{k: v for k, v in roles.items()},
            "dimension_count": len(roles["dimensions"]),
            "measure_count": len(roles["measures"]),
            "date_count": len(roles["dates"]),
            "has_geographic": any(
                c.get("semantic_type") == "geographic" for c in columns.values()
            ),
            "has_temporal": len(roles["dates"]) > 0,
            "has_currency": any(
                c.get("semantic_type") == "currency" for c in columns.values()
            ),
        }
