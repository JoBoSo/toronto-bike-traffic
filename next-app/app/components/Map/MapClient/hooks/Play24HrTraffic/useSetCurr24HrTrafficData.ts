import { useEffect, useState } from "react";

export function useSetCurr24HrTrafficData(
  timeArray: string[],
  currentTimeIndex: number,
  twentyFourHrCycleData: any,
  setCurrentTime: React.Dispatch<React.SetStateAction<string>>,
) { 
  const [currtwentyFourHrCycleData, setCurr24HrCycleData] = useState<any>(null);

  // Playback logic
  useEffect(() => {
    if (timeArray.length > 0 && twentyFourHrCycleData) {
      const time = timeArray[currentTimeIndex];
      setCurrentTime(time);

      const currData = twentyFourHrCycleData[time] || [];
      setCurr24HrCycleData(currData);

      // console.log(time, currData[0]);
    }
  }, [currentTimeIndex, twentyFourHrCycleData, timeArray]);

  return currtwentyFourHrCycleData;
}
