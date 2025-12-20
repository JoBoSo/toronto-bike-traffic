from etl_pipelines.toronto_open_data.client import CityOfTorontoClient
from etl_pipelines.bicycle_counters.models import *
from typing import List
from dotenv import load_dotenv
import os

load_dotenv()

class BicycleCountersClient(CityOfTorontoClient):
    PACKAGE_ID = "ff7e7369-cbba-4545-9e26-e5a5ef6a123c"
    DB_PATH=os.getenv('DB_PATH')

    async def get_counter_locations_raw(self) -> List[CounterLocation]:
        resource_name = "cycling_permanent_counts_locations_geojson"
        data = await self.get_resource_data(self.PACKAGE_ID, resource_name)
        return data
    
    async def get_counter_locations(self) -> List[CounterLocation]:
        resource_name = "cycling_permanent_counts_locations_geojson"
        data = await self.get_resource_data(self.PACKAGE_ID, resource_name)

        if not data or "features" not in data:
            return []
        
        return [
            CounterLocation.model_validate(feature) 
            for feature in data["features"]
        ]
    
    async def get_daily_counts(self) -> List[DailyCount]:
        resource_name = "cycling_permanent_counts_daily.json"
        data = await self.get_resource_data(
            self.PACKAGE_ID, 
            resource_name,
            json_content_type="application/octet-stream"
        )
        
        if not data:
            return []

        return [DailyCount.model_validate(record) for record in data]
    
    async def get_15m_counts(self) -> List[FifteenMinCount]:
        all_data = []
        for resource_name in [
            "cycling_permanent_counts_15min_1994_2024.json",
            "cycling_permanent_counts_15min_2024_2025.json",
            "cycling_permanent_counts_15min_2025_2026.json"
        ]:
            data = await self.get_resource_data(self.PACKAGE_ID, resource_name)
            all_data.extend(data)
        
        if not data:
            return []
        
        return [FifteenMinCount.model_validate(record) for record in data]