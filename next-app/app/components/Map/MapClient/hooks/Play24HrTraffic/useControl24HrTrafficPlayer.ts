import { useEffect, useState } from "react";
import generate15MinIntervals from "@/components/Map/utils/generate15MinIntervals"

export function useControl24HrTrafficPlayer(
  timeIsPlaying: boolean,
  setTimeIsPlaying: React.Dispatch<React.SetStateAction<boolean>>,
  timeArray: string[],
  setTimeArray: React.Dispatch<React.SetStateAction<string[]>>,
  currentTimeIndex: number,
  setCurrentTimeIndex: React.Dispatch<React.SetStateAction<number>>,
  hr24TrafficData: any,
  playIntervalRef: React.MutableRefObject<NodeJS.Timeout | null>,
) { 
  // Playback logic
  useEffect(() => {
    if (!timeArray.length) {
      const intervals = generate15MinIntervals();
      setTimeArray(intervals);
    }

    if (timeIsPlaying && timeArray.length > 0 && hr24TrafficData) {

      playIntervalRef.current = setInterval(() => {
        setCurrentTimeIndex((prev) => {
          const next = prev + 1;
          if (next >= timeArray.length) {
            setTimeIsPlaying(false); // stop playback at the end
            return prev;
          }
          return next;
        });
      }, 200); // milliseconds
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }

    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [timeIsPlaying, currentTimeIndex, hr24TrafficData, timeArray]);
}