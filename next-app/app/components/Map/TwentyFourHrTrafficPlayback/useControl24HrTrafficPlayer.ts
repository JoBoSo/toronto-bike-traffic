"use client";

import { useEffect } from "react";
import { useMapContext } from "@/src/contexts/MapContext";

/**
 * The "Engine" hook that increments the time index on an interval.
 * This drives the currHr24CycleData stream by scrubbing through the timeArray.
 */
export function useControl24HrTrafficPlayer(
  playIntervalRef: React.MutableRefObject<NodeJS.Timeout | null>,
) { 
  const {
    timeIsPlaying,
    setTimeIsPlaying,
    timeArray,
    setCurrentTimeIndex,
    hr24TrafficByLocNameData,
  } = useMapContext();

  useEffect(() => {
    // 1. Clear any existing interval to prevent overlapping loops
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }

    // 2. Playback Requirements: Playing must be true, 
    // timeline must exist, and data must be loaded.
    const canPlay = timeIsPlaying && timeArray.length > 0 && hr24TrafficByLocNameData;

    if (canPlay) {
      playIntervalRef.current = setInterval(() => {
        setCurrentTimeIndex((prev) => {
          const next = prev + 1;
          
          // 3. Loop or Stop logic
          if (next >= timeArray.length) {
            setTimeIsPlaying(false); // Stop at the end of 24 hours
            return prev;
          }
          
          return next;
        });
      }, 200); // 200ms = 5 frames per second (1.25 hours of data per second)
    }

    // 4. Cleanup on unmount or when dependencies change
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    };
  }, [timeIsPlaying, hr24TrafficByLocNameData, timeArray, setTimeIsPlaying, setCurrentTimeIndex, playIntervalRef]);
}