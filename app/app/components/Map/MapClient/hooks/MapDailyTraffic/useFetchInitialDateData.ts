import { useEffect } from "react";
import L from "leaflet";
import { fetchDataByDateRange } from "../../../utils/fetchDataByDateRange";

export function useFetchInitialDateData(
  mapInstance: L.Map | null,
  dateRange: [Date | null, Date | null],
  setDateRangeData: React.Dispatch<React.SetStateAction<any>>
) {
  useEffect(() => {
      if (mapInstance && dateRange[0]) {
        console.log("Fetching initial date data");
        const firstDay = dateRange[0];
        fetchDataByDateRange(firstDay, firstDay, setDateRangeData);
      }
    }, [mapInstance, dateRange]);
}