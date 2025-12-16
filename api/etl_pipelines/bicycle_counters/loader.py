from etl_pipelines.bicycle_counters.client import BicycleCountersClient
from modules.parquet_loader import ParquetLoader
from modules.json_loader import JsonLoader
from modules.data_modeller import DataModeller
from etl_pipelines.bicycle_counters.models import (DailyCount, CounterLocation)
import os
import sqlite3
import json
import pandas as pd
from dataclasses import asdict

class BicycleCountersLoader(BicycleCountersClient, ParquetLoader, JsonLoader, DataModeller):

    async def counter_locations_to_geojson(self) -> None:        
        results = await self.get_counter_locations_raw()
        file_path = "./data/counter_locations.geojson"
        self.save_to_json(results, file_path, overwrite=True)

    async def counter_groups_to_json(self) -> None:
        # --- Part 1: Data Preparation and Cleaning ---
        results = await self.get_counter_locations()
        data_dicts = [asdict(r) for r in results]
        df = pd.json_normalize(data_dicts)
        
        # 1. Rename and Select Columns
        # Note: 'properties.last_active' is added to the rename dictionary
        df = df.rename(
            columns={
                'properties.location_name': 'location_name',
                'properties.location_dir_id': 'location_dir_id',
                'properties.last_active': 'last_active',
                'geometry.coordinates': 'coordinates',
            }
        )
        df = df[['location_name', 'location_dir_id', 'last_active', 'coordinates']]
        
        # 2. Data Cleaning for Grouping
        df['location_name'] = df['location_name'].str.replace(' (retired)', '', regex=False)
        # Convert 'last_active' to datetime objects for accurate comparison (crucial for max())
        df['last_active'] = pd.to_datetime(df['last_active'], errors='coerce') 
        # Convert lists of coordinates to tuples for hashability (required for any grouping/merging)
        df['coordinates'] = df['coordinates'].apply(tuple)
        
        # --- Part 2: Grouping and Aggregation ---
        
        GROUP_KEY = 'location_name'
        
        # 1. Get the list of IDs (using sum to flatten if IDs are already lists)
        #    AND find the maximum 'last_active' date for each group.
        #    We use 'list' for the IDs first, then flatten the result later.
        id_date_agg = df.groupby(GROUP_KEY).agg(
            location_dir_ids=('location_dir_id', list), # Collect all IDs into a list
            max_active_date=('last_active', 'max')      # Find the latest date
        ).reset_index()

        # 2. Find the coordinates associated with the maximum date.
        #    a. Find the index (row number in the original df) corresponding to the max date for each group.
        latest_index = df.groupby(GROUP_KEY)['last_active'].idxmax()
        
        #    b. Use .loc to pull the full rows (which contain the coordinates) corresponding to those indices.
        latest_rows = df.loc[latest_index]
        
        # 3. Prepare the Coordinate and Max Date columns for merging
        coords_for_merge = latest_rows[[GROUP_KEY, 'coordinates', 'last_active']].rename(
            columns={'coordinates': 'max_date_coordinates'}
        )
        
        # 4. Merge the ID/MaxDate aggregation with the Coordinates extracted from the latest row.
        final_df = pd.merge(
            id_date_agg,
            coords_for_merge[[GROUP_KEY, 'max_date_coordinates']],
            on=GROUP_KEY,
            how='left'
        )
        
        # 5. Final output format cleanup (reorder columns and rename max_active_date)
        final_df = final_df.rename(columns={'max_active_date': 'last_active'})
        
        final_df = final_df[[
            GROUP_KEY, 
            'max_date_coordinates', 
            'last_active', 
            'location_dir_ids'
        ]]
        
        # 6. Save or Print Result
        # print(final_df)
        # If you needed to save to JSON/GeoJSON, you'd add:
        self.df_to_json(final_df, './data/counter_groups.json', overwrite=True, orient='records')

    async def load_counter_locations_into_sqlite(self):
        # Ensure database directory exists
        os.makedirs(os.path.dirname(self.DB_PATH), exist_ok=True)

        with sqlite3.connect(self.DB_PATH) as conn:
            cursor = conn.cursor()

            cursor.execute('''
                CREATE TABLE IF NOT EXISTS bicycle_counters (
                    id INTEGER PRIMARY KEY,
                    bin_size TEXT,
                    centreline_id INTEGER,
                    date_decommissioned TEXT,
                    direction TEXT,
                    first_active TEXT,
                    last_active TEXT,
                    latest_calibration_study TEXT,
                    linear_name_full TEXT,
                    location_dir_id INTEGER,
                    location_name TEXT,
                    side_street TEXT,
                    technology TEXT,
                    geom_type TEXT,
                    coordinates TEXT
                )
            ''')

            cursor.execute("CREATE INDEX IF NOT EXISTS idx_location_dir_id ON bicycle_counters(location_dir_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_direction ON bicycle_counters(direction)")

            insert_sql = '''
                INSERT OR REPLACE INTO bicycle_counters (
                    id, bin_size, centreline_id, date_decommissioned, direction,
                    first_active, last_active, latest_calibration_study,
                    linear_name_full, location_dir_id, location_name,
                    side_street, technology, geom_type, coordinates
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            '''

            rows = [
                (
                    loc.id,
                    loc.properties.bin_size,
                    loc.properties.centreline_id,
                    loc.properties.date_decommissioned,
                    loc.properties.direction,
                    loc.properties.first_active,
                    loc.properties.last_active,
                    loc.properties.latest_calibration_study,
                    loc.properties.linear_name_full,
                    loc.properties.location_dir_id,
                    loc.properties.location_name,
                    loc.properties.side_street,
                    loc.properties.technology,
                    loc.geometry.type,
                    json.dumps(loc.geometry.coordinates),
                )
                for loc in await self.get_counter_locations()
            ]

            cursor.executemany(insert_sql, rows)
            print(f"Inserted/Updated {len(rows)} counter location records.")

        return len(rows)
    
    def load_location_groups_into_sqlite(self) -> int:
        os.makedirs(os.path.dirname(self.DB_PATH), exist_ok=True)

        with sqlite3.connect(self.DB_PATH) as conn:
            cursor = conn.cursor()

            cursor.execute('''
                create table IF NOT EXISTS location_groups (
                    location_dir_ids text,
                    location_name text primary key
                )
            ''')

            insert_sql = """
                INSERT OR REPLACE INTO location_groups (
                    location_dir_ids, location_name
                ) 
                select JSON_GROUP_ARRAY(location_dir_id) location_dir_ids, 
                    REPLACE(location_name, ' (retired)', '') location_name
                from bicycle_counters
                group by REPLACE(location_name, ' (retired)', '')
                order by REPLACE(location_name, ' (retired)', '')
            """

            cursor.execute(insert_sql)
            print(f"Inserted/updated location_groups records.")
    
    async def load_daily_counts_into_sqlite(self) -> int:
        # 1. Ensure database directory exists
        os.makedirs(os.path.dirname(self.DB_PATH), exist_ok=True)

        # 2. Connect to the database
        with sqlite3.connect(self.DB_PATH) as conn:
            cursor = conn.cursor()

            # 3. Create the table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS daily_bicycle_counts (
                    record_id INTEGER PRIMARY KEY,
                    location_dir_id TEXT NOT NULL,
                    location_name TEXT,
                    direction TEXT,
                    linear_name_full TEXT,
                    side_street TEXT,
                    dt TEXT,             -- Stored as TEXT ('YYYY-MM-DD')
                    daily_volume INTEGER
                )
            ''')

            # 4. Create indexes for common lookups
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_daily_location_dir_id ON daily_bicycle_counts(location_dir_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_daily_dt ON daily_bicycle_counts(dt)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_daily_direction ON daily_bicycle_counts(direction)")

            # 5. Define the INSERT statement
            insert_sql = '''
                INSERT OR REPLACE INTO daily_bicycle_counts (
                    record_id, location_dir_id, location_name, direction,
                    linear_name_full, side_street, dt, daily_volume
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            '''

            # 6. Prepare the data rows
            # The date object (dt) must be converted back to an ISO string for SQLite storage.
            daily_counts = await self.get_daily_counts()
            
            rows = [
                (
                    count.record_id,
                    count.location_dir_id,
                    count.location_name,
                    count.direction,
                    count.linear_name_full,
                    count.side_street,
                    count.dt.isoformat(),  # Convert datetime.date back to string for storage
                    count.daily_volume,
                )
                for count in daily_counts
            ]

            # 7. Execute the bulk insert
            cursor.executemany(insert_sql, rows)
            print(f"Inserted/Updated {len(rows)} daily bicycle count records.")

        return len(rows)
    
    async def counts_daily_to_parquet(self) -> None:        
        results = await self.get_daily_counts()
        raw_df = pd.DataFrame([r.__dict__ for r in results])
        df = self.model_df(raw_df, DailyCount)
        self.df_to_parquet(df, "./data/counts_daily.parquet", overwrite=True)
    
    async def load_15m_counts_into_sqlite(self) -> int:
        # 1. Ensure database directory exists
        os.makedirs(os.path.dirname(self.DB_PATH), exist_ok=True)

        # 2. Connect to the database
        with sqlite3.connect(self.DB_PATH) as conn:
            cursor = conn.cursor()

            # 3. Create the table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS fifteen_min_bicycle_counts (
                    record_id INTEGER,
                    location_dir_id TEXT NOT NULL,
                    datetime_bin TEXT,     -- Stored as TEXT ('YYYY-MM-DD HH:MM:SS')
                    bin_volume INTEGER,
                    PRIMARY KEY (location_dir_id, datetime_bin)
                )
            ''')

            # 4. Create indexes for common lookups
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_15m_location_dir_id ON fifteen_min_bicycle_counts(location_dir_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_15m_datetime_bin ON fifteen_min_bicycle_counts(datetime_bin)")

            # 5. Define the INSERT statement
            insert_sql = '''
                INSERT OR REPLACE INTO fifteen_min_bicycle_counts (
                    record_id, location_dir_id, datetime_bin, bin_volume
                ) VALUES (?, ?, ?, ?)
            '''

            # 6. Prepare the data rows
            # The datetime object (datetime_bin) must be converted back to an ISO string for SQLite storage.
            counts_15m = await self.get_15m_counts()
            
            rows = [
                (
                    count.record_id,
                    count.location_dir_id,
                    count.datetime_bin.isoformat(sep=' '),  # Convert datetime.datetime back to string for storage
                    count.bin_volume,
                )
                for count in counts_15m
            ]

            # 7. Execute the bulk insert
            cursor.executemany(insert_sql, rows)
            print(f"Inserted/Updated {len(rows)} fifteen-minute bicycle count records.")

        return len(rows)
    
    async def counts_15m_to_parquet(self) -> None:        
        results = await self.get_15m_counts()
        df = pd.DataFrame([r.__dict__ for r in results])
        self.df_to_parquet(df, "./data/counts_15m.parquet", overwrite=True)
    
    def load_fifteen_min_counts_by_year_and_month_into_sqlite(self) -> int:
        os.makedirs(os.path.dirname(self.DB_PATH), exist_ok=True)

        with sqlite3.connect(self.DB_PATH) as conn:
            cursor = conn.cursor()

            cursor.execute('''
                create table if not exists fifteen_min_counts_by_year_and_month (
                    location_dir_id text not null,
                    year text not null,
                    month text not null,
                    time text not null,
                    avg_vol real,
                    primary key (location_dir_id, year, month, time)
                )
            ''')

            cursor.execute("CREATE INDEX IF NOT EXISTS idx_15m_ym_location_dir_id ON fifteen_min_counts_by_year_and_month(location_dir_id)")

            insert_sql = '''
                INSERT OR REPLACE INTO fifteen_min_counts_by_year_and_month (
                    location_dir_id, year, month, time, avg_vol
                ) 
                select 
                    location_dir_id,
                    strftime('%Y', datetime_bin) as year,
                    strftime('%m', datetime_bin) as month,
                    time(datetime_bin) as time,
                    avg(bin_volume) avg_vol
                from fifteen_min_bicycle_counts fmbc 
                where date(datetime_bin) >= ('2023-01-01')
                group by location_dir_id, year, month, time
                order by location_dir_id, year, month, time
            '''

            cursor.execute(insert_sql)
            print(f"Inserted/Updated fifteen_min_counts_by_year_and_month records.")
    
    def load_annual_counts_into_sqlite(self) -> int:
        os.makedirs(os.path.dirname(self.DB_PATH), exist_ok=True)

        with sqlite3.connect(self.DB_PATH) as conn:
            cursor = conn.cursor()

            cursor.execute('''
                create table if not exists annual_bicycle_counts (
                    year text not null,
                    location_dir_id text not null,
                    location_name text,
                    volume integer,
                    primary key (year, location_dir_id)
                )
            ''')

            cursor.execute("CREATE INDEX IF NOT EXISTS idx_annual_location_dir_id ON annual_bicycle_counts(location_dir_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_annual_year ON annual_bicycle_counts(year)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_annual_volume ON annual_bicycle_counts(volume)")

            insert_sql = '''
                INSERT OR REPLACE INTO annual_bicycle_counts (
                    year, location_dir_id, location_name, volume
                ) 
                select strftime('%Y', dt) year, cast(location_dir_id as integer), location_name, sum(daily_volume) volume
                from daily_bicycle_counts
                group by strftime('%Y', dt), location_dir_id, location_name
                order by location_name, cast(location_dir_id as integer), "year" 
            '''

            cursor.execute(insert_sql)
            print(f"Inserted/Updated annual bicycle count records.")

    def load_monthly_counts_into_sqlite(self) -> int:
        os.makedirs(os.path.dirname(self.DB_PATH), exist_ok=True)

        with sqlite3.connect(self.DB_PATH) as conn:
            cursor = conn.cursor()

            cursor.execute('''
                create table if not exists monthly_bicycle_counts (
                    year text not null,
                    month text not null,
                    location_dir_id text not null,
                    volume integer,
                    primary key (year, month, location_dir_id)
                )
            ''')

            cursor.execute("CREATE INDEX IF NOT EXISTS idx_monthly_location_dir_id ON monthly_bicycle_counts(location_dir_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_monthly_year ON monthly_bicycle_counts(year)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_monthly_month ON monthly_bicycle_counts(month)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_monthly_volume ON monthly_bicycle_counts(volume)")

            insert_sql = """
                INSERT OR REPLACE INTO monthly_bicycle_counts (
                    year, month, location_dir_id, volume
                ) 
                select strftime('%Y', dt) year, 
                    strftime('%m', dt) month, cast(location_dir_id as integer), sum(daily_volume) volume
                from daily_bicycle_counts
                group by year, location_dir_id, month
                order by cast(location_dir_id as integer), year, month
            """

            cursor.execute(insert_sql)
            print(f"Inserted/Updated monthly bicycle count records.")

    def load_hourly_counts_into_sqlite(self) -> int:
        os.makedirs(os.path.dirname(self.DB_PATH), exist_ok=True)

        with sqlite3.connect(self.DB_PATH) as conn:
            cursor = conn.cursor()

            cursor.execute('''
                create table if not exists hourly_bicycle_counts (
                    date text not null,
                    hour text not null,
                    location_dir_id text not null,
                    volume integer,
                    primary key (date, hour, location_dir_id)
                )
            ''')

            cursor.execute("CREATE INDEX IF NOT EXISTS idx_hourly_location_dir_id ON hourly_bicycle_counts(location_dir_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_hourly_date ON hourly_bicycle_counts(date)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_hourly_hour ON hourly_bicycle_counts(hour)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_hourly_volume ON hourly_bicycle_counts(volume)")

            insert_sql = """
                INSERT OR REPLACE INTO hourly_bicycle_counts (
                    date, hour, location_dir_id, volume
                ) 
                select date(datetime_bin) date,  
                    strftime('%H', datetime_bin) hour,
                    cast(location_dir_id as integer) location_dir_id, 
                    sum(bin_volume) volume
                from fifteen_min_bicycle_counts
                group by date, hour, location_dir_id
                order by cast(location_dir_id as integer), date, hour
            """

            cursor.execute(insert_sql)
            print(f"Inserted/Updated hourly bicycle count records.")

    def load_location_group_stats_overall_into_sqlite(self) -> int:
        os.makedirs(os.path.dirname(self.DB_PATH), exist_ok=True)

        with sqlite3.connect(self.DB_PATH) as conn:
            cursor = conn.cursor()

            cursor.execute('''
                create table IF NOT EXISTS location_group_stats_overall (
                    location_name text primary key,
                    location_dir_ids text,
                    first_active text,
                    last_active text,
                    days_bw_first_last integer,
                    days_active integer,
                    prct_active_days real,
                    total_vol integer,
                    avg_daily_vol real
                )
            ''')

            insert_sql = """
                INSERT OR REPLACE INTO location_group_stats_overall (
                    location_name, location_dir_ids, first_active, last_active, days_bw_first_last,
                    days_active, prct_active_days, total_vol, avg_daily_vol
                ) 
                select 
                    REPLACE(TRIM(dbc.location_name), ' (retired)', '') location_name,
                    JSON_GROUP_ARRAY(distinct cast(dbc.location_dir_id as integer)) location_dir_ids,
                    MIN(dbc.dt) as first_active,
                    MAX(dbc.dt) as last_active,
                    JULIANDAY(max(dbc.dt)) - JULIANDAY(min(dbc.dt)) + 1 as days_bw_first_last,
                    count(distinct dt) as days_active,	
                    count(distinct dt)/(JULIANDAY(max(dbc.dt)) - JULIANDAY(min(dbc.dt)) + 1) as prct_active_days,
                    sum(daily_volume) total_vol,
                    sum(daily_volume)/count(distinct dt) avg_daily_vol
                from daily_bicycle_counts dbc 
                GROUP BY REPLACE(TRIM(dbc.location_name), ' (retired)', '')
                order by avg_daily_vol desc
            """

            cursor.execute(insert_sql)
            print(f"Inserted/updated location_group_stats_overall records.")

    def load_location_group_stats_yearly_into_sqlite(self) -> int:
        os.makedirs(os.path.dirname(self.DB_PATH), exist_ok=True)

        with sqlite3.connect(self.DB_PATH) as conn:
            cursor = conn.cursor()

            cursor.execute('''
                create table IF NOT EXISTS location_group_stats_yearly (
                    location_name text,
                    year text,
                    location_dir_ids text,
                    first_active text,
                    last_active text,
                    days_bw_first_last integer,
                    days_active integer,
                    prct_active_days real,
                    total_vol integer,
                    avg_daily_vol real,
                    primary key (location_name, year)
                )
            ''')

            insert_sql = """
                INSERT OR REPLACE INTO location_group_stats_yearly (
                    location_name, year, location_dir_ids, first_active, last_active, days_bw_first_last,
                    days_active, prct_active_days, total_vol, avg_daily_vol
                ) 
                select 
                    REPLACE(TRIM(dbc.location_name), ' (retired)', '') location_name,
                    STRFTIME('%Y', dt) year,
                    JSON_GROUP_ARRAY(distinct cast(dbc.location_dir_id as integer)) location_dir_ids,
                    MIN(dbc.dt) as first_active,
                    MAX(dbc.dt) as last_active,
                    JULIANDAY(max(dbc.dt)) - JULIANDAY(min(dbc.dt)) + 1 as days_bw_first_last,
                    count(distinct dt) as days_active,	
                    count(distinct dt)/(JULIANDAY(max(dbc.dt)) - JULIANDAY(min(dbc.dt)) + 1) as prct_active_days,
                    sum(daily_volume) total_vol,
                    sum(daily_volume)/count(distinct dt) avg_daily_vol
                from daily_bicycle_counts dbc 
                GROUP BY REPLACE(TRIM(dbc.location_name), ' (retired)', ''), year
                order by location_name, year
            """

            cursor.execute(insert_sql)
            print(f"Inserted/updated location_group_stats_yearly records.")
    
    def load_location_group_stats_monthly_into_sqlite(self) -> int:
        os.makedirs(os.path.dirname(self.DB_PATH), exist_ok=True)

        with sqlite3.connect(self.DB_PATH) as conn:
            cursor = conn.cursor()

            cursor.execute('''
                create table IF NOT EXISTS location_group_stats_monthly (
                    location_name text,
                    year text,
                    month text,
                    location_dir_ids text,
                    first_active text,
                    last_active text,
                    days_bw_first_last integer,
                    days_active integer,
                    prct_active_days real,
                    total_vol integer,
                    avg_daily_vol real,
                    primary key (location_name, year, month)
                )
            ''')

            insert_sql = """
                INSERT OR REPLACE INTO location_group_stats_monthly (
                    location_name, year, month, location_dir_ids, first_active, last_active, days_bw_first_last,
                    days_active, prct_active_days, total_vol, avg_daily_vol
                ) 
                select 
                    REPLACE(TRIM(dbc.location_name), ' (retired)', '') location_name,
                    STRFTIME('%Y', dt) year,
                    STRFTIME('%m', dt) month,
                    JSON_GROUP_ARRAY(distinct cast(dbc.location_dir_id as integer)) location_dir_ids,
                    MIN(dbc.dt) as first_active,
                    MAX(dbc.dt) as last_active,
                    JULIANDAY(max(dbc.dt)) - JULIANDAY(min(dbc.dt)) + 1 as days_bw_first_last,
                    count(distinct dt) as days_active,	
                    count(distinct dt)/(JULIANDAY(max(dbc.dt)) - JULIANDAY(min(dbc.dt)) + 1) as prct_active_days,
                    sum(daily_volume) total_vol,
                    sum(daily_volume)/count(distinct dt) avg_daily_vol
                from daily_bicycle_counts dbc 
                GROUP BY REPLACE(TRIM(dbc.location_name), ' (retired)', ''), year, month
                order by location_name, year, month
            """

            cursor.execute(insert_sql)
            print(f"Inserted/updated location_group_stats_monthly records.")

    def load_location_group_stats_weekly_into_sqlite(self) -> int:
        os.makedirs(os.path.dirname(self.DB_PATH), exist_ok=True)

        with sqlite3.connect(self.DB_PATH) as conn:
            cursor = conn.cursor()

            cursor.execute('''
                create table IF NOT EXISTS location_group_stats_weekly (
                    location_name text,
                    year text,
                    month text,
                    week text, 
                    location_dir_ids text,
                    first_active text,
                    last_active text,
                    days_bw_first_last integer,
                    days_active integer,
                    prct_active_days real,
                    total_vol integer,
                    avg_daily_vol real,
                    primary key (location_name, year, month, week)
                )
            ''')

            insert_sql = """
                INSERT OR REPLACE INTO location_group_stats_weekly (
                    location_name, year, month, week, location_dir_ids, first_active, last_active, days_bw_first_last,
                    days_active, prct_active_days, total_vol, avg_daily_vol
                ) 
                select 
                    REPLACE(TRIM(dbc.location_name), ' (retired)', '') location_name,
                    STRFTIME('%Y', dt) year,
                    STRFTIME('%m', dt) month,
                    STRFTIME('%W', dt) week,
                    JSON_GROUP_ARRAY(distinct cast(dbc.location_dir_id as integer)) location_dir_ids,
                    MIN(dbc.dt) as first_active,
                    MAX(dbc.dt) as last_active,
                    JULIANDAY(max(dbc.dt)) - JULIANDAY(min(dbc.dt)) + 1 as days_bw_first_last,
                    count(distinct dt) as days_active,	
                    count(distinct dt)/(JULIANDAY(max(dbc.dt)) - JULIANDAY(min(dbc.dt)) + 1) as prct_active_days,
                    sum(daily_volume) total_vol,
                    sum(daily_volume)/count(distinct dt) avg_daily_vol
                from daily_bicycle_counts dbc 
                GROUP BY REPLACE(TRIM(dbc.location_name), ' (retired)', ''), year, month, week
                order by location_name, year, month, week
            """

            cursor.execute(insert_sql)
            print(f"Inserted/updated location_group_stats_weekly records.")
    # do seasonal, weekly, counts 
    # group retired and current counters in the same spot--create grouping table with location ids
