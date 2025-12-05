from dataclasses import dataclass, field
from typing import List, Optional
from datetime import date, datetime
import pandas as pd

@dataclass
class Geometry:
    type: str
    coordinates: List[float]   # [lon, lat]

@dataclass
class Properties:
    bin_size: str
    centreline_id: int
    date_decommissioned: Optional[str]
    direction: str
    first_active: str
    last_active: str
    latest_calibration_study: Optional[str]
    linear_name_full: str
    location_dir_id: int
    location_name: str
    side_street: str
    technology: str

@dataclass
class CounterLocation:
    type: str
    id: int
    geometry: Geometry
    properties: Properties

@dataclass
class DailyCount:
    record_id: int = field(metadata={'json_key': '_id'})
    location_dir_id: str
    location_name: str
    direction: str
    linear_name_full: str
    side_street: str
    dt: pd.Timestamp
    daily_volume: int

@dataclass
class FifteenMinCount:
    record_id: int = field(metadata={'json_key': '_id'})
    location_dir_id: str
    datetime_bin: datetime
    bin_volume: int