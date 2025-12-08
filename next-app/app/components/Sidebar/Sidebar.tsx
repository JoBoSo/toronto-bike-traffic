"use client";

import { useState } from "react";
import { useMapContext } from "@/src/contexts/MapContext";
import { usePageContentContext } from "@/src/contexts/PageContentContext";
import { fetchDailyCountsInDateRange } from "@/components/Map/utils/fetchDailyCountsInDateRange";
import styles from "@/components/Sidebar/Sidebar.module.scss";
import DateRangePicker from "@/components/Sidebar/DateRangePicker/DateRangePicker";
import PlaybackControl from "@/components/Sidebar/PlaybackControl/PlaybackControl";
import { fetch24HourCycleData } from "../Map/utils/fetch24HourCycleData";
import { convertTo12HourTime } from "@/src/utils/convertTo12HourTime"

interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  // Context
  const { counterLocations } = usePageContentContext();
  const { 
    dateRange, 
    dateArray,
    setDateRange, 
    setDateRangeData, 
    isPlaying,
    setIsPlaying,
    setHr24TrafficData,
    timeIsPlaying,
    timeArray,
    setTimeIsPlaying,
    currentDateIndex,
    setCurrentDateIndex,
    currentTimeIndex,
    setCurrentTimeIndex,
    currentTime,
  } = useMapContext();

  const collapsed = isCollapsed;

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
        onClick={() => setIsCollapsed(!collapsed)}
        title={collapsed ? "Open sidebar" : "Close sidebar"}
      >
        {collapsed ? "➤" : "⬅"}
      </div>

      {/* Sidebar content */}
      <div className={styles.content}>

        {/* Date range selector */}
        <div className={styles.section}>
          <p className={styles.sectionHeader}>Period</p>
          <DateRangePicker
            dateRange={dateRange}
            onChange={(update) => {
              setDateRange(update);
              setIsPlaying(false);
              setTimeIsPlaying(false);
              if (update[0] && update[1]) fetchDailyCountsInDateRange(update[0], update[1], setDateRangeData);
            }}
          />
        </div>

        {/* Play avg traffic in 15 min increments across 24 hours */}
        <div className={styles.section}>
          <p className={styles.sectionHeader}>Play 24hr traffic</p>
          <PlaybackControl
            isPlaying={timeIsPlaying}
            onTogglePlay={toggleHourlyPlayer}
            onRefresh={() => {
              setTimeIsPlaying(false);
              setCurrentTimeIndex(0);
              if (dateRange[0] && dateRange[1]) fetch24HourCycleData(dateRange, counterLocations, setHr24TrafficData);
            }}
            infoLines={[
              `Time of day ${convertTo12HourTime(timeArray[currentTimeIndex]??currentTime)}`,
            ]}
          />
        </div>

        {/* Date Range Play/Pause */}
        <div className={styles.section}>
          <p className={styles.sectionHeader}>Play daily traffic</p>
          <PlaybackControl
            isPlaying={isPlaying}
            onTogglePlay={toggleDailyPlayer}
            onRefresh={() => {
              setCurrentDateIndex(0);
              setIsPlaying(false);
              if (dateRange[0] && dateRange[1]) fetchDailyCountsInDateRange(dateRange[0], dateRange[1], setDateRangeData);
            }}
            infoLines={[
              `Day ${currentDateIndex + 1} of ${dateArray.length}`,
              dateArray[currentDateIndex]?.toISOString().split("T")[0] ?? "",
            ]}
          />
        </div>
        
      </div>
    </div>
  );
}
