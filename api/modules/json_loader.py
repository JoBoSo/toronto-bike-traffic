import os
import json
from typing import Any, Dict, List, Union

class JsonLoader():
    """
    Utility class for saving Python objects (like lists, dictionaries, or GeoJSON)
    to a JSON or GeoJSON file, with overwriting protection.
    """

    def __init__(self):
        pass

    def save_to_json(self, 
                     data: Union[Dict[str, Any], List[Any]], 
                     json_path: str, 
                     overwrite: bool = False,
                     indent: int = 4):
        """
        Saves a Python object to a JSON file.

        :param data: The Python object (dict, list, etc.) to serialize and save.
        :param json_path: The full file path where the JSON file will be saved 
        :param overwrite: If True, overwrite the file if it exists. If False, skip saving.
        :param indent: The indentation level for pretty-printing the JSON output. 
                       Set to None for compact output.
        """
        
        if os.path.exists(json_path) and not overwrite:
            print(f"JSON file already exists at {json_path}. Skipping save.")
            return

        # Ensure the directory exists before attempting to write the file
        directory = os.path.dirname(json_path)
        if directory and not os.path.exists(directory):
            os.makedirs(directory)

        print(f"Saving data to {json_path}...")
        
        try:
            with open(json_path, 'w', encoding='utf-8') as f:
                # Use json.dump to serialize the Python object to the file
                json.dump(data, f, indent=indent, ensure_ascii=False)
                
            print(f"Saved successfully to {json_path}")
            
        except Exception as e:
            print(f"ERROR: Failed to save JSON file {json_path}. Reason: {e}")
