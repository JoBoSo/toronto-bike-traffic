import { useEffect, useState } from "react";
import DailyCountsByLocNameInDateRangeResponse, { DailyLocationCount } from "@/src/interfaces/flaskApiResponseTypes/DailyCountsByLocNameInDateRangeResponse";

/**
 * Custom hook to calculate and store the daily volume data 
 * corresponding to the currently selected date index.
 * @param dateRangeData The full map of daily volume data (DailyCountsResponse).
 * @param currentDateIndex The numerical index of the currently selected day (e.g., 0, 1, 2...).
 * @returns The data for the current day, or null if not yet loaded.
 */
export function useSetCurrDayData(
  dateRangeData: DailyCountsByLocNameInDateRangeResponse | null,
  currentDateIndex: number,
): DailyLocationCount[] | null {
  const [currDateData, setCurrDateData] = useState<DailyLocationCount[] | null>(null);

  useEffect(() => {
    if (!dateRangeData || currentDateIndex === undefined || currentDateIndex < 0) {
      // Clear data if inputs are invalid/missing
      setCurrDateData(null);
      return;
    }

    // --- Logic for finding and setting the current day's data ---
    
    // Sort keys chronologically
    const chronologicalDateKeys = Object.keys(dateRangeData).sort((a, b) => {
      // Convert to Date objects for reliable chronological comparison
      return new Date(a).getTime() - new Date(b).getTime();
    });

    // Check if the index is valid for the sorted keys
    if (currentDateIndex >= chronologicalDateKeys.length) {
        console.warn(`Index ${currentDateIndex} out of bounds for data range of length ${chronologicalDateKeys.length}`);
        setCurrDateData(null);
        return;
    }

    const currDateKey = chronologicalDateKeys[currentDateIndex];
    
    // Use the date key to look up the array of volumes
    const currentDayVolumes = dateRangeData[currDateKey];

    console.log(`Setting data for date key: ${currDateKey}`);
    
    // Update the state with the found data
    setCurrDateData(currentDayVolumes);

  }, [dateRangeData, currentDateIndex]);

  return currDateData;
}