from etl_pipelines.bicycle_counters.client import *
from etl_pipelines.bicycle_counters.loader import *
import asyncio

async def main():
    print("Starting ETL process")

    bcl = BicycleCountersLoader()

    async def data_files_use_in_app():
        print("Perparing data files used in app")
        await bcl.counter_groups_to_json()
        await bcl.counter_locations_to_geojson()
        await bcl.counts_daily_to_parquet()
        await bcl.counts_15m_to_parquet()
        print("Finished perparing data files used in app")

    async def data_files_not_use_in_app():
        print("Perparing data files not used in app")
        await bcl.load_counter_locations_into_sqlite()
        bcl.load_location_groups_into_sqlite()
        await bcl.load_daily_counts_into_sqlite()
        await bcl.load_15m_counts_into_sqlite()
        bcl.load_annual_counts_into_sqlite()
        bcl.load_monthly_counts_into_sqlite()
        bcl.load_hourly_counts_into_sqlite()
        bcl.load_location_group_stats_overall_into_sqlite()
        bcl.load_location_group_stats_yearly_into_sqlite()
        bcl.load_location_group_stats_monthly_into_sqlite()
        bcl.load_location_group_stats_weekly_into_sqlite()
        bcl.load_fifteen_min_counts_by_year_and_month_into_sqlite()
        print("Finished perparing data files not used in app")

    await data_files_use_in_app()
    # await data_files_not_use_in_app()

    print('Finished ETL process')

if __name__ == "__main__":
    asyncio.run(main())