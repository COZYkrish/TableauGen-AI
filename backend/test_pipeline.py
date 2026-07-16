import pandas as pd
from app.services.dataset_profiler.profiler import DatasetProfiler
from app.services.metadata_engine.engine import MetadataEngine
from app.services.dashboard_planner.planner import DashboardPlanner

# Create sample data
df = pd.DataFrame({
    'Region': ['East','West','North','South','East','West'],
    'Category': ['Tech','Tech','Finance','Finance','Healthcare','Healthcare'],
    'Revenue': [120000,85000,95000,110000,75000,130000],
    'Units': [340,210,280,315,195,420],
    'Profit_Margin': [0.22,0.18,0.25,0.21,0.30,0.28],
    'Order_Date': pd.date_range('2023-01-01', periods=6, freq='ME').strftime('%Y-%m-%d').tolist(),
})

profiler = DatasetProfiler(df)
profile = profiler.profile()

engine = MetadataEngine(profile)
metadata = engine.analyze()

planner = DashboardPlanner(metadata)
blueprint = planner.plan()

print("Template:", blueprint["template"])
print("Theme:", blueprint["theme_name"])
print("KPIs:", len(blueprint["kpis"]), "cards")
print("Recommendations:", len(blueprint["recommendations"]), "charts")
for r in blueprint["recommendations"]:
    print(f"  [{r['score']:>3}] {r['chart_type']:10} {r['title']}")
print("Filters:", len(blueprint["filters"]))
print("Layout cells:", len(blueprint["layout"]))
print("Pipeline test PASSED")
