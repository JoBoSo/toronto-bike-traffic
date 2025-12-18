import { useEffect } from "react";
import { useMapContext } from "@/src/contexts/MapContext";

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

    if (timeIsPlaying && timeArray.length > 0 && hr24TrafficByLocNameData) {

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
  }, [timeIsPlaying, hr24TrafficByLocNameData, timeArray, setTimeIsPlaying, setCurrentTimeIndex]);
}