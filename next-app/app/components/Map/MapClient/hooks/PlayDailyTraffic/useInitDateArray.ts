import { useEffect } from 'react';
import { generateDateRange } from "@/components/Map/utils/generateDateRange";
import { useMapContext } from "@/src/contexts/MapContext";

export function useInitDateArray() {
  const {
    dateRange,
    setDateArray,
    setCurrentDateIndex,
  } = useMapContext();

  // Update date array when date range changes
  useEffect(() => {
    if (dateRange[0] && dateRange[1]) {
      console.log("Updateing date array");
      const dates = generateDateRange(dateRange[0], dateRange[1]);
      setDateArray(dates);
      setCurrentDateIndex(0);
    }
  }, [dateRange]);
}