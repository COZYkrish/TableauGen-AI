"""Test the full export pipeline: Blueprint -> .twb -> .twbx"""
import pandas as pd
import tempfile
import os
from pathlib import Path
from app.services.dataset_profiler.profiler import DatasetProfiler
from app.services.metadata_engine.engine import MetadataEngine
from app.services.dashboard_planner.planner import DashboardPlanner
from app.plugins.tableau_generator.generator import TableauGenerator
from app.plugins.export_manager import ExportManager

# Sample data
df = pd.DataFrame({
    'Region': ['East','West','North','South','East','West'],
    'Category': ['Tech','Tech','Finance','Finance','Healthcare','Healthcare'],
    'Revenue': [120000,85000,95000,110000,75000,130000],
    'Units': [340,210,280,315,195,420],
    'Order_Date': ['2023-01-01','2023-02-01','2023-03-01','2023-04-01','2023-05-01','2023-06-01'],
})

# Save temp CSV
with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False, newline='') as f:
    df.to_csv(f, index=False)
    csv_path = f.name

# Pipeline
profiler = DatasetProfiler(df)
profile = profiler.profile()
metadata = MetadataEngine(profile).analyze()
blueprint = DashboardPlanner(metadata).plan()

# Generate .twb
output_dir = Path("exports/test")
gen = TableauGenerator(
    blueprint=blueprint,
    metadata=metadata,
    csv_path=csv_path,
    output_dir=output_dir,
    project_name="Test Dashboard"
)
twb_path = gen.generate()
print("TWB generated:", twb_path)
print("TWB size:", twb_path.stat().st_size, "bytes")

# Package .twbx
manager = ExportManager(output_dir)
twbx_path, validation = manager.package(twb_path, Path(csv_path), "Test Dashboard")
print("TWBX generated:", twbx_path)
print("TWBX size:", twbx_path.stat().st_size, "bytes")
print("Validation valid:", validation.valid)
print("Validation warnings:", validation.warnings)

os.unlink(csv_path)
print("Export pipeline test PASSED")
