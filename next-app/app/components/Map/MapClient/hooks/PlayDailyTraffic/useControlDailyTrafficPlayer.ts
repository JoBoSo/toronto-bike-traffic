import { useEffect } from "react";

export function useControlDailyTrafficPlayer(
  isPlaying: boolean,
  currentDateIndex: number,
  dateArray: Date[],
  setCurrentDateIndex: React.Dispatch<React.SetStateAction<number>>,
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>,
  playIntervalRef: React.MutableRefObject<NodeJS.Timeout | null>
) { 
  // Playback logic
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