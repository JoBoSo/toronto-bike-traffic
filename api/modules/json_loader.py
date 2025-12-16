import os
import json
import pandas as pd # <-- Must import pandas
from typing import Any, Dict, List, Union

class JsonLoader():
    """
    Utility class for saving Python objects (like lists, dictionaries, or GeoJSON)
    and pandas DataFrames to a JSON or GeoJSON file, with overwriting protection.
    """

    def __init__(self):
        pass

    def _check_overwrite(self, json_path: str, overwrite: bool) -> bool:
        """Helper to check for file existence and overwrite preference."""
        if os.path.exists(json_path) and not overwrite:
            print(f"JSON file already exists at {json_path}. Skipping save.")
            return False
        
        # Ensure the directory exists before attempting to write the file
        directory = os.path.dirname(json_path)
        if directory and not os.path.exists(directory):
            os.makedirs(directory)
            
        print(f"Saving data to {json_path}...")
        return True

    def save_to_json(self, 
                     data: Union[Dict[str, Any], List[Any]], 
                     json_path: str, 
                     overwrite: bool = False,
                     indent: int = 4):
        """Saves a standard Python object to a JSON file."""
        
        if not self._check_overwrite(json_path, overwrite):
            return

        try:
            with open(json_path, 'w', encoding='utf-8') as f:
                # Use json.dump for standard Python objects
                json.dump(data, f, indent=indent, ensure_ascii=False)
                
            print(f"Saved successfully to {json_path}")
            
        except Exception as e:
            # Note: This is where your original error was being caught
            print(f"ERROR: Failed to save JSON file {json_path}. Reason: {e}")

    def df_to_json(self, 
                   df: pd.DataFrame, 
                   json_path: str, 
                   overwrite: bool = False, 
                   orient: str = 'records', 
                   indent: int = 4):
        """
        Saves a pandas DataFrame to a JSON file, handling Timestamps automatically.

        :param df: The pandas DataFrame to save.
        :param json_path: The full file path.
        :param overwrite: If True, overwrite the file if it exists.
        :param orient: The format of the JSON output ('records', 'split', 'index', etc.).
                       'records' is best for GeoJSON-like output (list of objects).
        :param indent: The indentation level for pretty-printing the JSON output. 
        """
        
        if not self._check_overwrite(json_path, overwrite):
            return

        try:
            # Use the DataFrame's built-in .to_json() method
            json_string = df.to_json(
                orient=orient, 
                date_format='iso', # Converts Timestamps to ISO 8601 strings (e.g., "YYYY-MM-DDTHH:MM:SS")
                indent=indent
            )

            # Write the generated JSON string to the file
            with open(json_path, 'w', encoding='utf-8') as f:
                f.write(json_string)
                
            print(f"Saved successfully to {json_path}")

        except Exception as e:
            print(f"ERROR: Failed to save DataFrame to JSON file {json_path}. Reason: {e}")