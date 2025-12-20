"use client";

import { useEffect } from "react";
import { useMapContext } from "@/src/contexts/MapContext";

export function useControlDailyTrafficPlayer(
  playIntervalRef: React.MutableRefObject<NodeJS.Timeout | null>
) { 
  const {
    isPlaying,
    dateArray,
    setCurrentDateIndex,
    setIsPlaying,
  } = useMapContext();

  useEffect(() => {
    // 1. Always clear existing interval before starting a new one
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }

    if (isPlaying && dateArray.length > 0) {
      console.log("Starting daily playback engine...");

      playIntervalRef.current = setInterval(() => {
        // 2. Functional update prevents the need for currentDateIndex in dependencies
        setCurrentDateIndex((prev) => {
          const next = prev + 1;
          
          if (next >= dateArray.length) {
            setIsPlaying(false); // Stop playback state
            // Interval is cleared by the 'else' logic or cleanup on next effect run
            return prev; 
          }
          return next;
        });
      }, 200);
    }

    // 3. Cleanup logic
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    };
    // Removed currentDateIndex from here to prevent interval thrashing
  }, [isPlaying, dateArray, setCurrentDateIndex, setIsPlaying, playIntervalRef]);
}