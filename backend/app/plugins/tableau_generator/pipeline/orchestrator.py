import os
from pathlib import Path
from lxml import etree as ET
from loguru import logger
from typing import Dict, Any

from ..engines.metadata_engine import MetadataEngine
from ..engines.recommendation_engine import RecommendationEngine
from ..planning.dashboard_planner import DashboardPlanner
from ..templates.registry import TemplateRegistry
from ..utils.xml_modifier import XMLModifier
from ..binders.datasource_binder import DatasourceBinder
from ..binders.metadata_binder import MetadataBinder
from ..binders.calculation_binder import CalculationBinder
from ..binders.worksheet_binder import WorksheetBinder
from ..binders.dashboard_binder import DashboardBinder
from ..validation.pipeline import ValidationPipeline
from ..packaging.twbx_packager import TwbxPackager
from ..versioning.manager import VersionManager
from ..versioning.adapters.adapter_2026_2 import Adapter2026_2

class GeneratorPipeline:
    """
    Main Orchestrator for the TableauGen AI workbook generator.
    Replaces the old legacy generator.py.
    """
    def __init__(self, templates_dir: Path):
        self.metadata_engine = MetadataEngine()
        self.recommendation_engine = RecommendationEngine()
        self.dashboard_planner = DashboardPlanner()
        
        self.template_registry = TemplateRegistry(templates_dir)
        self.version_manager = VersionManager()
        self.version_manager.register("2026.2", Adapter2026_2())
        
        self.validation_pipeline = ValidationPipeline()
        self.packager = TwbxPackager()

    def generate(self, project_id: str, raw_columns: Dict[str, Any], csv_path: str, output_dir: Path) -> Path:
        logger.info(f"Starting Generation Pipeline for project {project_id}")
        
        # 1. Semantic Engines
        semantic_metadata = self.metadata_engine.process(raw_columns)
        recommendations = self.recommendation_engine.generate_recommendations(semantic_metadata)
        
        # 2. Planning
        # Defaulting to the top recommended template theme
        theme = recommendations["templates"][0]["theme"]
        capabilities = self.template_registry.get_capabilities(theme)
        
        blueprint = self.dashboard_planner.construct_blueprint(
            project_id, recommendations, capabilities, theme
        )
        
        # 3. Load Template
        template_info = self.template_registry.get_template(blueprint.template_target)
        try:
            tree = ET.parse(template_info.file_path)
        except Exception as e:
            logger.error(f"Failed to load template {template_info.file_path}: {e}")
            raise
            
        modifier = XMLModifier(tree)
        
        # 4. Binding
        DatasourceBinder().bind_datasource(modifier, csv_path)
        MetadataBinder().bind_metadata(modifier, semantic_metadata)
        CalculationBinder().inject_calculations(modifier, blueprint.kpis)
        
        worksheet_binder = WorksheetBinder(self.version_manager, template_info.version)
        worksheet_binder.bind_charts(modifier, blueprint.charts)
        
        DashboardBinder().bind_dashboard(modifier, blueprint)
        
        # 5. Validation
        if not self.validation_pipeline.run_all_layers(blueprint, tree):
            raise ValueError("Validation Pipeline Failed. Output workbook may be corrupt.")
            
        # 6. Output & Packaging
        output_dir.mkdir(parents=True, exist_ok=True)
        temp_twb = output_dir / f"{project_id}_temp.twb"
        tree.write(str(temp_twb), encoding="utf-8", xml_declaration=True)
        
        twbx_path = self.packager.package(temp_twb, Path(csv_path), output_dir)
        
        # Cleanup temporary twb
        if temp_twb.exists():
            os.remove(temp_twb)
            
        logger.info(f"Pipeline completed successfully. Artifact: {twbx_path}")
        return twbx_path
