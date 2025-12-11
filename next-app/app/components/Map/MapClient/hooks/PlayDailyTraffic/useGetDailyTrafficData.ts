import { useEffect } from "react";
import L from "leaflet";
import { fetchDailyCountsInDateRange } from "@/components/Map/utils/fetchDailyCountsInDateRange";
import { useMapContext } from "@/src/contexts/MapContext";

export function useGetDailyTrafficData(
  mapInstance: L.Map | null,
) {
  const {
    dateRange,
    setDateRangeData,
    setLoadingDailyTrafficData,
  } = useMapContext();

  useEffect(() => {
      if (mapInstance && dateRange[0] && dateRange[1]) {
        console.log("Fetching initial date data");
        const firstDay = dateRange[0];
        const lastDay = dateRange[1];
        fetchDailyCountsInDateRange(firstDay, lastDay, setDateRangeData, setLoadingDailyTrafficData);
      }
    }, [mapInstance, dateRange]);
}