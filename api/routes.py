from flask import Blueprint, jsonify, request
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
COUNTS_15M_FILE = DATA_DIR / "counts_15m.parquet"
COUNTS_DAILY_FILE = DATA_DIR / "counts_daily.parquet"
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
    
    # mask = (df["dt"] >= start_dt) & (df["dt"] <= end_dt)
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

@api_bp.route('/fifteen-min-counts-for-date-range')
def get_fifteen_min_counts_for_date_range():
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

    df["datetime_bin"] = pd.to_datetime(df["datetime_bin"])
    df["record_id"] = df["record_id"].astype(int)
    df["location_dir_id"] = df["location_dir_id"].astype(str)
    df["bin_volume"] = df["bin_volume"].astype(int)
    
    mask = (df["datetime_bin"] >= start_dt) & (df["datetime_bin"] <= end_dt)
    filtered_df = df.loc[mask]

    if filtered_df.empty:
        return jsonify([]), 200
    
    filtered_df["time_bin"] = filtered_df["datetime_bin"].dt.strftime("%H:%M:%S")
    
    agg_df = (
        filtered_df
        .groupby(["location_dir_id", "time_bin"], as_index=False)
        .agg(avg_bin_volume=("bin_volume", "mean"))
    )

    return jsonify(agg_df.to_dict(orient="records")), 200

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