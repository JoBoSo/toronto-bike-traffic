import os
import pandas as pd

class ParquetLoader():

    def __init__(self):
        pass

    def df_to_parquet(self, df: pd.DataFrame, parquet_path: str, overwrite: bool=False):
        if os.path.exists(parquet_path) and not overwrite:
            print(f"Parquet file already exists at {parquet_path}. Skipping save.")
            return
        print(f"Saving DataFrame to {parquet_path}...")
        df.to_parquet(parquet_path, index=False)
        print(f"Saved to {parquet_path}")