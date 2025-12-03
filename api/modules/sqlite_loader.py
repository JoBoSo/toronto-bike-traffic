import sqlite3
import pandas as pd
from dotenv import load_dotenv
import os

load_dotenv()

class SqliteLoader():

    DB_PATH=os.getenv('DB_PATH')

    def __init__(self):
        pass

    def table_to_df(self, table_name: str) -> pd.DataFrame:
        """
        Load an entire SQLite table into a pandas DataFrame.
        """
        conn = sqlite3.connect(self.DB_PATH)
        query = f"SELECT * FROM {table_name}"
        df = pd.read_sql_query(query, conn)
        conn.close()
        return df

