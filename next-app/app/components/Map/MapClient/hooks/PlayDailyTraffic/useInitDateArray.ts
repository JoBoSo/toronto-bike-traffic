import { useEffect } from 'react';
import { generateDateRange } from "@/components/Map/utils/generateDateRange";

export function useInitDateArray(
  dateRange: [Date | null, Date | null], 
  setDateArray: React.Dispatch<React.SetStateAction<Date[]>>, 
  setCurrentDateIndex: React.Dispatch<React.SetStateAction<number>>,
) {
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