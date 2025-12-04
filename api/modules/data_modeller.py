import pandas as pd
from dataclasses import dataclass
from typing import Optional, Any
from datetime import date, datetime

class DataModeller():

    def __init__(self):
        pass

    def model_df(self, df: pd.DataFrame, model: dataclass) -> pd.DataFrame:
        """
        Converts DataFrame columns to match the target types defined in the dataclass.
        This is essential for correct data processing (e.g., saving dates correctly).
        """
        
        # Mapping Python/Dataclass types to optimal Pandas dtypes
        dtype_map = {
            str: 'object',
            int: 'int64',
            float: 'float64',
            pd.Timestamp: 'datetime64[ns]',
            date: 'datetime64[ns]',
            datetime: 'datetime64[ns]',
            Optional[str]: 'object'
        }
        
        print("--- Enforcing Data Model Types ---")

        for field in model.__dataclass_fields__.values():
            field_name = field.name
            expected_type = field.type
            
            # Skip if the column is not in the DataFrame
            if field_name not in df.columns:
                print(f"Warning: Column '{field_name}' missing from DataFrame.")
                continue

            target_dtype = dtype_map.get(expected_type)
            
            if target_dtype:
                try:
                    # Special handling for Datetime
                    if target_dtype == 'datetime64[ns]':
                        # Use pd.to_datetime for robust conversion from strings/objects
                        df[field_name] = pd.to_datetime(df[field_name], errors='coerce')
                    else:
                        # Use .astype() for standard type conversion
                        # We convert to nullable integers/floats if NaN is present
                        df[field_name] = df[field_name].astype(target_dtype)
                    
                    print(f"✔️ Converted '{field_name}' to {df[field_name].dtype}")
                    
                except Exception as e:
                    # If conversion fails, log the error and coerce to object/keep original
                    print(f"❌ Failed to convert '{field_name}' to {target_dtype}. Error: {e}")
                    
        print("----------------------------------")
        return df