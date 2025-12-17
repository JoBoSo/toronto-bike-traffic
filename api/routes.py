from flask import Blueprint, jsonify, request, current_app
import json
import pandas as pd
from .db import get_db
import sqlite3
import os
from dotenv import load_dotenv
from pathlib import Path

dotenv_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=dotenv_path)

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = Path(os.getenv("DATA_DIR", str(BASE_DIR / "data"))).resolve()
COUNTER_LOCATIONS_FILE = DATA_DIR / "counter_locations.geojson"
COUNTER_GROUPS_FILE = DATA_DIR / "counter_groups.geojson"
COUNTS_15M_FILE = DATA_DIR / "counts_15m.parquet"
COUNTS_15M_BY_LOCATION_NAME_FILE = DATA_DIR / "counts_15m_by_location_name.parquet"
COUNTS_DAILY_FILE = DATA_DIR / "counts_daily.parquet"
COUNTS_DAILY_BY_LOCATION_NAME_FILE = DATA_DIR / "counts_daily_by_location_name.parquet"
DB_PATH = os.path.join(os.path.dirname(__file__), os.getenv('DB_PATH'))


# Create a Blueprint for API version 1
api_bp = Blueprint('api', __name__, url_prefix='/api/v1')

@api_bp.route('/hi', methods=['GET'])
def hi():
    return jsonify({"status": "ok", "message": "hello from toronto-bike-traffic API"}), 200

def get_table(table_name):
    """Helper function to fetch all records from a specified table."""
    # Validate table name to prevent SQL injection
    allowed_tables = [
        'bicycle_counters',
        'daily_bicycle_counts',
        'monthly_bicycle_counts',
        'annual_bicycle_counts',
    ]
    if table_name not in allowed_tables:
        return jsonify({"error": f"Invalid table name: {table_name}"}), 400
    
    db = get_db()
    try:
        cursor = db.execute(f'SELECT * FROM {table_name}')
        items = cursor.fetchall()
        return jsonify([dict(item) for item in items])
    except sqlite3.OperationalError as e:
        return jsonify({"error": f"Database error: {e}."}), 500

@api_bp.route('/bicycle_counters')
def get_bicycle_counters():
    """Endpoint to return data from the primary bicycle counters table."""
    return get_table('bicycle_counters')

@api_bp.route('/daily_counts')
def get_daily_counts():
    """Endpoint to return data from the daily count records."""
    return get_table('daily_bicycle_counts')

@api_bp.route('/monthly_counts')
def get_monthly_counts():
    """Endpoint to return data from the monthly count records."""
    return get_table('monthly_bicycle_counts')

@api_bp.route('/annual_counts')
def get_yearly_counts():
    """Endpoint to return data from the yearly count records."""
    return get_table('annual_bicycle_counts')

def load_data_from_cache(
    file_path_config_key: str, 
    cache_attribute_name: str, 
    is_required: bool = True
) -> dict:
    """
    Loads data from a file path specified in Flask config, caches it in 
    the current_app instance, and returns a copy of the cached data.

    :param file_path_config_key: The key in current_app.config that holds the file path.
    :param cache_attribute_name: The attribute name to use for caching on current_app 
                                 (e.g., 'location_geojson_cache').
    :param is_required: If True, raises FileNotFoundError if the file is missing.
    :return: A copy of the loaded data (dictionary or list).
    """
    
    # Check if the data is already cached
    if not hasattr(current_app, cache_attribute_name):
        
        file_path = current_app.config.get(file_path_config_key)
        
        if not file_path:
            raise RuntimeError(f"Configuration key '{file_path_config_key}' is not set in Flask config.")

        try:
            # 1. Attempt to open and load the file
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            # 2. Cache the data on the current_app instance
            setattr(current_app, cache_attribute_name, data)
            print(f"✅ Data loaded and cached successfully from: {file_path}")

        except FileNotFoundError:
            if is_required:
                raise FileNotFoundError(f"Data file not found at {file_path}")
            else:
                # If not required, set cache to empty and return
                empty_data = {"type": "FeatureCollection", "features": []}
                setattr(current_app, cache_attribute_name, empty_data)
                return empty_data.copy()
            
        except json.JSONDecodeError:
            raise ValueError(f"Error decoding JSON data from {file_path}. File might be corrupted.")
    
    # Return a copy of the cached data to prevent accidental modification
    return getattr(current_app, cache_attribute_name).copy()

@api_bp.route('/counter-locations', methods=['GET'])
def get_counter_locations():
    
    current_app.config['COUNTER_LOCATIONS_FILE'] = COUNTER_LOCATIONS_FILE

    try:
        full_geojson = load_data_from_cache(
            file_path_config_key='COUNTER_LOCATIONS_FILE',
            cache_attribute_name='location_geojson_cache'
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    location_dir_id = request.args.get('location_dir_id')

    if location_dir_id:
        try:
            target_id_str = str(int(location_dir_id))
        except ValueError:
            return jsonify({"error": "Invalid location_dir_id format. Must be an integer-like string."}), 400

        filtered_features = [
            feature
            for feature in full_geojson.get('features', [])
            if str(feature.get('id')) == target_id_str
        ]

        result_geojson = {
            "type": "FeatureCollection",
            "features": filtered_features
        }
    else:
        result_geojson = full_geojson
    
    if not result_geojson.get('features'):
        result_geojson['features'] = []
        
    return jsonify(result_geojson), 200

@api_bp.route('/counter-groups', methods=['GET'])
def get_counter_groups():
    """
    Reads the pre-aggregated counter group data from the JSON file, 
    using application-level caching to prevent file I/O on subsequent requests.
    Returns the data as a JSON response.
    """
    current_app.config['COUNTER_GROUPS_FILE'] = COUNTER_GROUPS_FILE
    
    try:
        counter_groups_data = load_data_from_cache(
            file_path_config_key='COUNTER_GROUPS_FILE',
            cache_attribute_name='counter_groups_cache' 
        )
    except FileNotFoundError:
        return jsonify({
            "error": f"Aggregated data file not found at {COUNTER_GROUPS_FILE}. Please run the counter aggregation job first."
        }), 404
    except Exception as e:
        return jsonify({"error": f"Failed to load counter groups data: {e}"}), 500

    return jsonify(counter_groups_data), 200

@api_bp.route('/daily-counts-in-date-range')
def get_daily_counts_in_date_range():
    start_date = request.args.get('start')  # Format: YYYY-MM-DD
    end_date = request.args.get('end')      # Format: YYYY-MM-DD

    if not start_date or not end_date:
        return jsonify({"error": "Missing start or end date"}), 400
    
    try:
        start_dt = pd.to_datetime(start_date)
        end_dt = pd.to_datetime(end_date)
    except Exception:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400
    
    df = pd.read_parquet(COUNTS_DAILY_FILE)
    df = df.set_index('dt')
    df = df.sort_index()
    
    filtered_df = df.loc[start_dt:end_dt]
    filtered_df = filtered_df.reset_index(names=['dt'])

    if filtered_df.empty:
        return jsonify([]), 200
    
    result_df = filtered_df[["dt", "location_dir_id", "daily_volume"]].copy()
    result_df['dt'] = result_df['dt'].dt.strftime('%a, %d %b %Y %H:%M:%S GMT')
    grouped_data = result_df.groupby('dt').apply(
        lambda x: x[['daily_volume', 'location_dir_id']].to_dict(orient='records')
    ).to_dict()

    return jsonify(grouped_data), 200

@api_bp.route('/daily-counts-by-location-name-in-date-range')
def get_daily_counts_by_location_name_in_date_range():
    start_date = request.args.get('start')  # Format: YYYY-MM-DD
    end_date = request.args.get('end')      # Format: YYYY-MM-DD

    if not start_date or not end_date:
        return jsonify({"error": "Missing start or end date"}), 400
    
    try:
        start_dt = pd.to_datetime(start_date)
        end_dt = pd.to_datetime(end_date)
    except Exception:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400
    
    df = pd.read_parquet(COUNTS_DAILY_BY_LOCATION_NAME_FILE)
    df = df.set_index('dt')
    df = df.sort_index()
    
    filtered_df = df.loc[start_dt:end_dt]
    filtered_df = filtered_df.reset_index(names=['dt'])

    if filtered_df.empty:
        return jsonify([]), 200
    
    result_df = filtered_df[['name', 'coordinates', "dt", "location_dir_ids", "daily_volume"]].copy()
    result_df['dt'] = result_df['dt'].dt.strftime('%a, %d %b %Y %H:%M:%S GMT')
    grouped_data = result_df.groupby('dt').apply(
        lambda x: x[['name', 'daily_volume', 'location_dir_ids', 'coordinates']].to_dict(orient='records')
    ).to_dict()

    return jsonify(grouped_data), 200

@api_bp.route('/fifteen-min-counts-in-date-range')
def get_fifteen_min_counts_in_date_range():
    start_date = request.args.get('start')  # Format: YYYY-MM-DD
    end_date = request.args.get('end')      # Format: YYYY-MM-DD

    if not start_date or not end_date:
        return jsonify({"error": "Missing start or end date"}), 400
    
    try:
        start_dt = pd.to_datetime(start_date)
        end_dt = pd.to_datetime(end_date)
    except Exception:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400
    
    df = pd.read_parquet(COUNTS_15M_FILE)
    df = df.set_index('datetime_bin')
    df = df.sort_index()
    
    filtered_df = df.loc[start_dt:end_dt]
    filtered_df = filtered_df.reset_index(names=['datetime_bin'])

    if filtered_df.empty:
        return jsonify([]), 200
    
    filtered_df["time_bin"] = filtered_df["datetime_bin"].dt.strftime("%H:%M:%S")
    
    agg_df = (
        filtered_df
        .groupby(["location_dir_id", "time_bin"], as_index=False)
        .agg(avg_bin_volume=("bin_volume", "mean"))
    )

    grouped_data = agg_df.groupby('time_bin').apply(
        lambda x: x[['location_dir_id', 'avg_bin_volume']].to_dict(orient='records')
    ).to_dict()

    return jsonify(grouped_data), 200

@api_bp.route('/fifteen-min-counts-by-location-name-in-date-range')
def get_fifteen_min_counts_by_location_name_in_date_range():
    start_date = request.args.get('start')  # Format: YYYY-MM-DD
    end_date = request.args.get('end')      # Format: YYYY-MM-DD

    if not start_date or not end_date:
        return jsonify({"error": "Missing start or end date"}), 400
    
    try:
        start_dt = pd.to_datetime(start_date)
        end_dt = pd.to_datetime(end_date)
    except Exception:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400
    
    df = pd.read_parquet(COUNTS_15M_BY_LOCATION_NAME_FILE)
    df = df.set_index('datetime_bin')
    df = df.sort_index()
    
    filtered_df = df.loc[start_dt:end_dt]
    filtered_df = filtered_df.reset_index(names=['datetime_bin'])

    if filtered_df.empty:
        return jsonify([]), 200
    
    filtered_df["time_bin"] = filtered_df["datetime_bin"].dt.strftime("%H:%M:%S")
    
    agg_df = (
        filtered_df
        .groupby(["name", "time_bin", "location_dir_ids", "coordinates"], as_index=False)
        .agg(avg_bin_volume=("total_bin_volume", "mean"))
    )

    grouped_data = agg_df.groupby('time_bin').apply(
        lambda x: x[['name', 'avg_bin_volume', "location_dir_ids", "coordinates"]].to_dict(orient='records')
    ).to_dict()

    return jsonify(grouped_data), 200

@api_bp.route('/avg-daily-vol-for-date-range', methods=['GET'])
def get_avg_daily_vol_for_date_range():
    start_date = request.args.get('start')  # Format: YYYY-MM-DD
    end_date = request.args.get('end')      # Format: YYYY-MM-DD
    
    if not start_date or not end_date:
        return jsonify({"error": "Missing start or end date"}), 400
    
    try:
        start_dt = pd.to_datetime(start_date)
        end_dt = pd.to_datetime(end_date)
    except Exception:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400
    
    df = pd.read_parquet(COUNTS_DAILY_FILE)
    
    mask = (df["dt"] >= start_dt) & (df["dt"] <= end_dt)
    filtered_df = df.loc[mask]

    if filtered_df.empty:
        return jsonify([]), 200
    
    if start_dt < end_dt:
        agg_df = (
            filtered_df
            .groupby(["location_dir_id"], as_index=False)
            .agg(avg_daily_volume=("daily_volume", "mean"))
        )
        result_df = agg_df[["location_dir_id", "avg_daily_volume"]]
    else:
        result_df = filtered_df[["location_dir_id", "daily_volume"]].copy()
        result_df.rename(columns={"daily_volume": "avg_daily_volume"}, inplace=True)

    return jsonify(result_df.to_dict(orient="records")), 200