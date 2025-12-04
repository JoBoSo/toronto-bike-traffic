import { useEffect } from "react";
import { fetchDataByDateRange } from "@/components/Map/utils/fetchDataByDateRange";

export function useDatePlayer(
  isPlaying: boolean,
  currentDateIndex: number,
  dateArray: Date[],
  setDateRangeData: React.Dispatch<React.SetStateAction<any>>,
  setCurrentDateIndex: React.Dispatch<React.SetStateAction<number>>,
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>,
  playIntervalRef: React.MutableRefObject<NodeJS.Timeout | null>
) { 
  // Playback logic
  useEffect(() => {
    if (isPlaying && dateArray.length > 0) {
      console.log("Starting date playback");

      // Fetch data for current date index
      const currentDate = dateArray[currentDateIndex];
      if (currentDate) {
        fetchDataByDateRange(currentDate, currentDate, setDateRangeData);
      }

      playIntervalRef.current = setInterval(() => {
        setCurrentDateIndex((prev) => {
          const next = prev + 1;
          if (next >= dateArray.length) {
            setIsPlaying(false); // Stop at end
            return prev; // Stay at last index
          }
          return next;
        });
      }, 200); // milliseconds
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    }
    
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, currentDateIndex, dateArray]);
}