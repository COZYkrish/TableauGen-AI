"""
Export Manager — packages a .twb file and its data source CSV
into a Tableau Packaged Workbook (.twbx) ZIP archive.

The .twbx format is a ZIP file containing:
  /workbook.twb        — the workbook XML
  /Data/Datasources/   — the CSV data source file(s)

This module:
  1. Validates the .twb file
  2. Creates the .twbx ZIP archive
  3. Returns the path to the .twbx file
"""

from __future__ import annotations

import zipfile
from pathlib import Path
from typing import Any
from loguru import logger

from app.plugins.tableau_generator.validator import validate_twb, ValidationResult


class ExportManager:
    """Packages a .twb + CSV into a .twbx file."""

    def __init__(self, export_dir: Path):
        self.export_dir = export_dir
        self.export_dir.mkdir(parents=True, exist_ok=True)

    def package(
        self,
        twb_path: Path,
        csv_path: Path,
        project_name: str = "TableauGen",
    ) -> tuple[Path, ValidationResult]:
        """
        Validate the .twb and package it with the CSV into a .twbx.

        Parameters
        ----------
        twb_path : Path
            Path to the generated .twb XML file.
        csv_path : Path
            Path to the original CSV data source.
        project_name : str
            Used to name the output .twbx file.

        Returns
        -------
        tuple[Path, ValidationResult]
            (path to .twbx file, validation result)

        Raises
        ------
        ValueError
            If the .twb fails validation (hard errors).
        """
        # ── Step 1: Validate ─────────────────────────────────────────
        logger.info(f"Export Manager: validating {twb_path.name}...")
        validation = validate_twb(twb_path)

        if not validation.valid:
            error_summary = "; ".join(validation.errors)
            logger.error(f"Export Manager: validation failed — {error_summary}")
            raise ValueError(f"Workbook validation failed: {error_summary}")

        if validation.warnings:
            for w in validation.warnings:
                logger.warning(f"Export Manager: {w}")

        # ── Step 2: Create .twbx ─────────────────────────────────────
        safe_name = project_name.replace(" ", "_").replace("/", "_")
        twbx_path = self.export_dir / f"{safe_name}.twbx"

        logger.info(f"Export Manager: packaging → {twbx_path}")

        with zipfile.ZipFile(twbx_path, "w", zipfile.ZIP_DEFLATED) as zf:
            # Add the workbook XML as the root .twb
            twb_arcname = f"{safe_name}.twb"
            zf.write(twb_path, arcname=twb_arcname)

            # Add the CSV under the Tableau data source convention
            csv_arcname = f"Data/Datasources/{csv_path.name}"
            if csv_path.exists():
                zf.write(csv_path, arcname=csv_arcname)
                logger.info(f"Export Manager: added {csv_path.name} → {csv_arcname}")
            else:
                logger.warning(f"Export Manager: CSV not found at {csv_path} — packaging without data")

        size_kb = twbx_path.stat().st_size / 1024
        logger.info(f"Export Manager: created {twbx_path.name} ({size_kb:.1f} KB)")

        return twbx_path, validation
