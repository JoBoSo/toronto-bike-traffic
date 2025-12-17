from etl_pipelines.toronto_open_data.client import CityOfTorontoClient
from etl_pipelines.bicycle_counters.models import *
from typing import List, Dict, Any
from datetime import date, datetime
from dotenv import load_dotenv
import os

load_dotenv()

class BicycleCountersClient(CityOfTorontoClient):
    PACKAGE_ID = "ff7e7369-cbba-4545-9e26-e5a5ef6a123c"
    DB_PATH=os.getenv('DB_PATH')

    def parse_model(self, model_cls, data: Dict[str, Any]):
        """General helper to instantiate classes with nested dicts."""
        return model_cls(**data)

    async def get_counter_locations_raw(self) -> List[CounterLocation]:
        resource_name = "cycling_permanent_counts_locations_geojson"
        data = await self.get_resource_data(self.PACKAGE_ID, resource_name)
        return data
    
    async def get_counter_locations(self) -> List[CounterLocation]:
        resource_name = "cycling_permanent_counts_locations_geojson"
        data = await self.get_resource_data(self.PACKAGE_ID, resource_name)

        if not data or "features" not in data:
            return []
        modelled_data = [
            self.parse_model(CounterLocation, feature)
            for feature in data["features"]
        ]
        return modelled_data
    
    async def get_daily_counts(self) -> List[DailyCount]:
        resource_name = "cycling_permanent_counts_daily.json"
        data = await self.get_resource_data(self.PACKAGE_ID, resource_name,json_content_type="application/octet-stream")

        def parse_daily_count(data: Dict[str, Any]) -> DailyCount:
            return DailyCount(
                record_id=data["_id"],
                location_dir_id=data["location_dir_id"],
                location_name=data["location_name"],
                direction=data["direction"],
                linear_name_full=data["linear_name_full"],
                side_street=data["side_street"],
                dt=date.fromisoformat(data["dt"]),
                daily_volume=data["daily_volume"],
            )
        
        if not data:
            return []
        modelled_data = [
            parse_daily_count(feature)
            for feature in data
        ]
        return modelled_data
    
    async def get_15m_counts(self) -> List[FifteenMinCount]:
        all_data = []
        for resource_name in [
            "cycling_permanent_counts_15min_1994_2024.json",
            "cycling_permanent_counts_15min_2024_2025.json",
            "cycling_permanent_counts_15min_2025_2026.json"
        ]:
            data = await self.get_resource_data(self.PACKAGE_ID, resource_name)
            print(f"Fetched {len(data)} records from {resource_name}")
            all_data.extend(data)
        
        def parse_15m_count(data: Dict[str, Any]) -> FifteenMinCount:
            return FifteenMinCount(
                record_id=data["_id"],
                location_dir_id=data["location_dir_id"],
                datetime_bin=datetime.fromisoformat(data["datetime_bin"]),
                bin_volume=data["bin_volume"],
            )
        
        if not data:
            return []
        modelled_data = [
            parse_15m_count(feature)
            for feature in all_data
        ]
        return modelled_data