from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class Geometry(BaseModel):
    type: str
    coordinates: List[float]  # [longitude, latitude]

class Properties(BaseModel):
    bin_size: str
    centreline_id: int
    date_decommissioned: Optional[str] = None
    direction: str
    first_active: str
    last_active: str
    latest_calibration_study: Optional[str] = None
    linear_name_full: str
    location_dir_id: int
    location_name: str
    side_street: str
    technology: str

class CounterLocation(BaseModel):
    type: str
    id: int
    geometry: Geometry
    properties: Properties

    # This allows the model to work with data even if it has extra fields 
    # not defined here, preventing crashes if the API adds new data.
    model_config = ConfigDict(extra='ignore')

class DailyCount(BaseModel):
    record_id: int = Field(alias='_id')
    location_dir_id: str
    location_name: str
    direction: str
    linear_name_full: str
    side_street: str
    dt: datetime
    daily_volume: int

    # This allows you to use either 'record_id' or '_id' when creating the object
    # and ensures compatibility when loading from raw API dictionaries.
    model_config = {
        "populate_by_name": True
    }

class FifteenMinCount(BaseModel):
    record_id: int = Field(alias='_id')
    location_dir_id: str
    datetime_bin: datetime
    bin_volume: int

    # Allows initializing using either 'record_id' or '_id'
    model_config = ConfigDict(populate_by_name=True)