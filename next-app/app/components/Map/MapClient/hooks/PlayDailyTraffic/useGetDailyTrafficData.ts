import { useEffect } from "react";
import L from "leaflet";
import { fetchDailyCountsInDateRange } from "@/components/Map/utils/fetchDailyCountsInDateRange";

export function useGetDailyTrafficData(
  mapInstance: L.Map | null,
  dateRange: [Date | null, Date | null],
  setDateRangeData: React.Dispatch<React.SetStateAction<any>>
) {
  useEffect(() => {
      if (mapInstance && dateRange[0] && dateRange[1]) {
        console.log("Fetching initial date data");
        const firstDay = dateRange[0];
        const lastDay = dateRange[1];
        fetchDailyCountsInDateRange(firstDay, lastDay, setDateRangeData);
      }
    }, [mapInstance, dateRange]);
}