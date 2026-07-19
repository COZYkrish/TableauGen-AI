import zipfile
from pathlib import Path
from loguru import logger

class TwbxPackager:
    """
    Safely bundles the modified .twb XML and the datasource into a .twbx zip format.
    """
    def package(self, twb_path: Path, data_path: Path, output_dir: Path) -> Path:
        """
        Zips the twb file and the data file into a twbx package.
        Tableau expects the data file to be placed in the Data/ subdirectory.
        """
        twb_path_obj = Path(twb_path)
        data_path_obj = Path(data_path)
        
        output_dir.mkdir(parents=True, exist_ok=True)
        twbx_path = output_dir / f"{twb_path_obj.stem}.twbx"
        
        logger.info(f"Packaging {twbx_path.name}...")
        
        try:
            with zipfile.ZipFile(twbx_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                # Add the workbook XML at the root
                zipf.write(twb_path_obj, arcname=twb_path_obj.name)
                
                # Add the data source in the Data directory
                data_arcname = f"Data/{data_path_obj.name}"
                zipf.write(data_path_obj, arcname=data_arcname)
                
            logger.info(f"Successfully packaged {twbx_path}")
            return twbx_path
        except Exception as e:
            logger.error(f"Failed to package twbx: {e}")
            raise
