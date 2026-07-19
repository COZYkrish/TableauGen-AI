import pytest
from pathlib import Path
from ..pipeline.orchestrator import GeneratorPipeline

def test_pipeline_initialization():
    """
    Tests that the main orchestrator can initialize all its engines and binders 
    without failing, indicating the dependencies are correctly wired.
    """
    templates_dir = Path(__file__).parent.parent / "templates" / "files"
    pipeline = GeneratorPipeline(templates_dir)
    
    assert pipeline.metadata_engine is not None
    assert pipeline.recommendation_engine is not None
    assert pipeline.dashboard_planner is not None
    assert pipeline.template_registry is not None
    assert pipeline.version_manager is not None
    assert pipeline.validation_pipeline is not None
    assert pipeline.packager is not None
