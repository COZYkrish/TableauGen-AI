"""
TableauGen AI — FastAPI Application Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.core.config import settings
from app.core.database import engine, Base
from app.api import auth, projects, uploads, health, dashboard, intelligence

# Import models so Base.metadata knows about them
from app.models import user, project, pipeline_job  # noqa: F401

logger.add(
    "logs/tableaugen_{time}.log",
    rotation="10 MB",
    retention="30 days",
    level="INFO",
)


def create_app() -> FastAPI:
    """Application factory."""
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description=(
            "## TableauGen AI\n\n"
            "Upload any CSV and generate a production-ready **Tableau Packaged Workbook (.twbx)** "
            "with AI-powered chart recommendations, KPI cards, statistical insights, and forecasts.\n\n"
            "### Pipeline\n"
            "1. **Upload** — CSV ingestion with type detection\n"
            "2. **Profile** — Statistical profiling of all columns\n"
            "3. **Metadata** — Semantic type inference (currency, geography, dates)\n"
            "4. **Recommend** — AI-scored chart recommendations\n"
            "5. **Plan** — Dashboard Blueprint with grid layout and themes\n"
            "6. **Generate** — Valid `.twb` XML (Tableau 2021.1+)\n"
            "7. **Export** — Packaged `.twbx` with embedded data\n\n"
            "### Intelligence\n"
            "- **Insights** — Distribution, correlation, trend, quality alerts\n"
            "- **Forecast** — Linear / moving-average / seasonal projections\n"
            "- **Narrative** — Auto-generated executive summaries and action items"
        ),
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_tags=[
            {"name": "Health", "description": "Service health check"},
            {"name": "Authentication", "description": "Signup, login, JWT management"},
            {"name": "Projects", "description": "Project CRUD, stats, export history"},
            {"name": "Uploads", "description": "CSV upload and dataset profiling"},
            {"name": "Dashboard", "description": "Blueprint generation, Tableau export (.twbx)"},
            {"name": "Intelligence", "description": "Insights, forecasting, and narrative AI engines"},
        ],
        license_info={"name": "MIT"},
    )


    # CORS ----------------------------------------------------------------
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routers --------------------------------------------------------------
    app.include_router(health.router, prefix="/api", tags=["Health"])
    app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
    app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
    app.include_router(uploads.router, prefix="/api/uploads", tags=["Uploads"])
    app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
    app.include_router(intelligence.router, prefix="/api/intelligence", tags=["Intelligence"])

    # Startup: create tables -----------------------------------------------
    @app.on_event("startup")
    def on_startup():
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created / verified.")

    logger.info(f"{settings.APP_NAME} v{settings.APP_VERSION} started.")
    return app


app = create_app()

