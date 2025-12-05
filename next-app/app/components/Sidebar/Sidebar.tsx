"use client";

import { useState } from "react";
import { useMapContext } from "@/components/Map/contexts/MapContext";
import { usePageContentContext } from "@/src/contexts/PageContentContext";
import { fetchDataByDateRange } from "@/components/Map/utils/fetchDataByDateRange";
import styles from "@/components/Sidebar/Sidebar.module.scss";
import DateRangePicker from "@/components/Map/DateRangePicker/DateRangePicker";
import PlaybackControl from "@/components/Map/PlaybackControl/PlaybackControl";
import { fetch24HourCycleData } from "../Map/utils/fetch24HourCycleData";

export default function Sidebar() {
  // Context
  const { counterLocations } = usePageContentContext();
  const { 
    dateRange, 
    dateArray,
    setDateRange, 
    setDateRangeData, 
    isPlaying,
    setIsPlaying,
    timeIsPlaying,
    timeArray,
    setTimeIsPlaying,
    currentDateIndex,
    setCurrentDateIndex,
    currentTimeIndex,
    setCurrentTimeIndex,
    currentTime,
  } = useMapContext();

  const [collapsed, setCollapsed] = useState(false);

  const toggleDailyPlayer = () => {
    // Reset only if player reached the end
    if (!isPlaying && currentDateIndex >= dateArray.length - 1) {
      setCurrentDateIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const toggleHourlyPlayer = () => {
    // Reset only if player reached the end
    if (!timeIsPlaying && currentTimeIndex >= timeArray.length - 1) {
      setCurrentTimeIndex(0);
    }
    setTimeIsPlaying(!timeIsPlaying);
  };

  return (
    <div className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      {/* Toggle handle */}
      <div
        className={styles.toggle}
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? "Open sidebar" : "Close sidebar"}
      >
        {collapsed ? "➤" : "⬅"}
      </div>

      {/* Sidebar content */}
      <div className={styles.content}>

        {/* Date range selector */}
        <div><p>Period</p></div>
        <DateRangePicker
          dateRange={dateRange}
          onChange={(update) => {
            setDateRange(update);
            setIsPlaying(false);
            setTimeIsPlaying(false);
            if (update[0] && update[1]) fetchDataByDateRange(update[0], update[1], setDateRangeData);
          }}
        />

        {/* Play avg traffic in 15 min increments across 24 hours */}
        <div><p>Play 24hr traffic</p></div>
        <PlaybackControl
          isPlaying={timeIsPlaying}
          onTogglePlay={toggleHourlyPlayer}
          onRefresh={() => {
            setCurrentTimeIndex(0);
            setTimeIsPlaying(false);
            if (dateRange[0] && dateRange[1]) fetch24HourCycleData(dateRange, counterLocations);
          }}
          infoLines={[
            `Time of day ${currentTime}`,
          ]}
        />

        {/* Date Range Play/Pause */}
        <div><p>Play daily traffic</p></div>
        <PlaybackControl
          isPlaying={isPlaying}
          onTogglePlay={toggleDailyPlayer}
          onRefresh={() => {
            setCurrentDateIndex(0);
            setIsPlaying(false);
            if (dateRange[0] && dateRange[1]) fetchDataByDateRange(dateRange[0], dateRange[1], setDateRangeData);
          }}
          infoLines={[
            `Day ${currentDateIndex + 1} of ${dateArray.length}`,
            dateArray[currentDateIndex]?.toISOString().split("T")[0] ?? "",
          ]}
        />
        
      </div>
    </div>
  );
}
