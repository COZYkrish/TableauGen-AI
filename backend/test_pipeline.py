"""
Quick validation script for the Dataset Profiler + Metadata Engine pipeline.
Run: python -m test_pipeline
"""

import sys
import json
from pathlib import Path

# Add parent to path so we can import app modules
sys.path.insert(0, str(Path(__file__).parent))

import pandas as pd
from app.services.dataset_profiler.profiler import DatasetProfiler
from app.services.metadata_engine.engine import MetadataEngine


def main():
    csv_path = Path("sample_data/sample_sales.csv")
    if not csv_path.exists():
        print(f"❌ Sample CSV not found at {csv_path}")
        return

    print("=" * 60)
    print("TableauGen AI — Pipeline Validation")
    print("=" * 60)

    # 1. Read CSV
    df = pd.read_csv(csv_path)
    print(f"\n[FILE] Loaded: {csv_path.name}")
    print(f"   Rows: {len(df)}  |  Columns: {len(df.columns)}")

    # 2. Dataset Profiler
    print("\n─── Stage 1: Dataset Profiler ───")
    profiler = DatasetProfiler(df)
    profile = profiler.profile()
    overview = profile["overview"]
    print(f"   Rows:       {overview['row_count']}")
    print(f"   Columns:    {overview['column_count']}")
    print(f"   Missing %:  {overview['missing_percent']}%")
    print(f"   Duplicates: {overview['duplicate_rows']}")
    print(f"   Memory:     {overview['memory_mb']} MB")

    # 3. Metadata Engine
    print("\n─── Stage 2: Metadata Engine ───")
    engine = MetadataEngine(profile)
    metadata = engine.analyze()
    summary = metadata["summary"]

    print(f"   Dimensions ({summary['dimension_count']}): {summary['dimensions']}")
    print(f"   Measures   ({summary['measure_count']}):   {summary['measures']}")
    print(f"   Dates      ({summary['date_count']}):      {summary['dates']}")
    print(f"   Identifiers: {summary['identifiers']}")
    print(f"   Has Geographic: {summary['has_geographic']}")
    print(f"   Has Currency:   {summary['has_currency']}")

    # 4. Column detail
    print("\n─── Column Metadata Detail ───")
    print(f"{'Column':<20} {'Role':<12} {'Semantic':<14} {'Agg':<8} {'Format':<12} {'Entity'}")
    print("─" * 85)
    for col_name, col in metadata["columns"].items():
        entity = col.get("business_entity") or "—"
        print(
            f"{col_name:<20} {col['field_role']:<12} {col['semantic_type']:<14} "
            f"{col['default_aggregation']:<8} {col['display_format']:<12} {entity}"
        )

    print("\n[SUCCESS] Pipeline validation passed!")
    print("=" * 60)


if __name__ == "__main__":
    main()
