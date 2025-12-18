import { useEffect, useState } from "react";
import { useMapContext } from "@/src/contexts/MapContext";

export function useSetCurr24HrTrafficData() { 
  const {
    timeArray,
    currentTimeIndex,
    hr24TrafficByLocNameData,
    setCurrentTime,
  } = useMapContext();

  const [currtwentyFourHrCycleData, setCurr24HrCycleData] = useState<any>(null);

  // Playback logic
  useEffect(() => {
    if (timeArray.length > 0 && hr24TrafficByLocNameData) {
      const time = timeArray[currentTimeIndex];
      setCurrentTime(time);

      const currData = hr24TrafficByLocNameData[time] || [];
      setCurr24HrCycleData(currData);

      // console.log(time, currData[0]);
    }
  }, [currentTimeIndex, hr24TrafficByLocNameData, timeArray]);

  return currtwentyFourHrCycleData;
}
