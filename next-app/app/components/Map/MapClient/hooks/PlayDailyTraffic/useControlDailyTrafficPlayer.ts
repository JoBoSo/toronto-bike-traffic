import { useEffect } from "react";
import { useMapContext } from "@/src/contexts/MapContext";

export function useControlDailyTrafficPlayer(
  playIntervalRef: React.MutableRefObject<NodeJS.Timeout | null>
) { 
  const {
    isPlaying,
    currentDateIndex,
    dateArray,
    setCurrentDateIndex,
    setIsPlaying,
  } = useMapContext();

  useEffect(() => {
    if (isPlaying && dateArray.length > 0) {
      console.log("Starting date playback");

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