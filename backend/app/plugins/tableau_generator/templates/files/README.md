# Tableau Base Templates

This directory serves as the root for all baseline Tableau `.twb` templates consumed by the TableauGen engine.

## Authoring Guidelines

1. **Version**: All templates must be saved in Tableau Desktop 2026.2 format.
2. **Placeholders**: Worksheets must be pre-built and named exactly following the placeholder convention:
   - `Placeholder_Chart_1`, `Placeholder_Chart_2`, etc.
   - `Placeholder_KPI_1`, `Placeholder_KPI_2`, etc.
   - `Placeholder_Filter_1`, etc.
3. **Immutability**: The generator will **never** alter the container hierarchy or generate new layout XML for dashboards. It will only replace data sources, fields, and text attributes within these templates.

## Structure
```
templates/files/
├── executive/
│   └── executive.twb
├── operations/
│   └── operations.twb
└── minimal/
    └── minimal.twb
```
