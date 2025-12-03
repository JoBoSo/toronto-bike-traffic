import { useEffect, useState } from "react";

export function use24HrTrafficPlayer(
  timeIsPlaying: boolean,
  timeArray: string[],
  setTimeArray: React.Dispatch<React.SetStateAction<string[]>>,
  currentTimeIndex: number,
  twentyFourHrCycleData: any,
  setCurrentTimeIndex: React.Dispatch<React.SetStateAction<number>>,
  setTimeIsPlaying: React.Dispatch<React.SetStateAction<boolean>>,
  playIntervalRef: React.MutableRefObject<NodeJS.Timeout | null>,
  currentTime: string,
  setCurrentTime: React.Dispatch<React.SetStateAction<string>>,
  // setCurr24HrCycleData: React.Dispatch<React.SetStateAction<null>>,
) { 
  const [currtwentyFourHrCycleData, setCurr24HrCycleData] = useState<any>(null);

  // Playback logic
  useEffect(() => {
    if (!timeArray.length) {
      const intervals = generate15MinIntervals();
      setTimeArray(intervals);
    }

    if (timeIsPlaying && timeArray.length > 0 && twentyFourHrCycleData) {
      const time = timeArray[currentTimeIndex];
      const currData = twentyFourHrCycleData.filter(
        (item: any) => item.time_bin === time
      );

      setCurr24HrCycleData(currData);
      setCurrentTime(time);
      console.log(time, currData[0]);

      playIntervalRef.current = setInterval(() => {
        setCurrentTimeIndex((prev) => {
          const next = prev + 1;
          if (next >= timeArray.length) {
            setTimeIsPlaying(false); // stop playback at the end
            return prev;
          }
          return next;
        });
      }, 300);
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }

    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [timeIsPlaying, currentTimeIndex, twentyFourHrCycleData, timeArray]);


  return currtwentyFourHrCycleData;
}


function generate15MinIntervals(): string[] {
  const intervals: string[] = [];

  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hour = h.toString().padStart(2, "0");
      const minute = m.toString().padStart(2, "0");
      intervals.push(`${hour}:${minute}:00`);
    }
  }

  return intervals;
}