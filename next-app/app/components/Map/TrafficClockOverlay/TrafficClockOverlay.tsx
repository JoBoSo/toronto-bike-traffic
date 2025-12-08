import React from 'react';
import styles from "@/components/Map/TrafficClockOverlay/TrafficClockOverlay.module.scss"
import { convertTo12HourTime } from "@/src/utils/convertTo12HourTime"

interface TrafficClockOverlayProps {
  currentTime: string; // Accepts the formatted time string (e.g., "1:30pm")
}

const TrafficClockOverlay: React.FC<TrafficClockOverlayProps> = ({ currentTime }) => {
  return (
    <>
      <div className={styles.clockOverlay}>
        <p className={styles.clockTime}>
          {convertTo12HourTime(currentTime)}
        </p>
      </div>
    </>
  );
};

export default TrafficClockOverlay;