import { useEffect } from "react";
import L from "leaflet";
import { fetchDailyCountsByLocNameInDateRange } from "@/components/Map/utils/fetchDailyCountsByLocNameInDateRange";
import { useMapContext } from "@/src/contexts/MapContext";

export function useGetDailyTrafficByLocNameData(
  mapInstance: L.Map | null,
) {
  const {
    dateRange,
    setDateRangeByLocNameData,
    setLoadingDailyTrafficData,
  } = useMapContext();

  useEffect(() => {
      if (mapInstance && dateRange[0] && dateRange[1]) {
        // console.log("Fetching initial date data");
        const firstDay = dateRange[0];
        const lastDay = dateRange[1];
        fetchDailyCountsByLocNameInDateRange(
          firstDay, lastDay, setDateRangeByLocNameData, setLoadingDailyTrafficData
        );
      }
    }, [mapInstance, dateRange]);
}