"use client";

import { SetStateAction, useState, Dispatch } from "react";
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
    loadingDailyTrafficData,
    setLoadingDailyTrafficData,
    isPlaying,
    setIsPlaying,
    setHr24TrafficData,
    loadingHr24TrafficData,
    setLoadingHr24TrafficData,
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

  /**
   * Creates a generic toggle function for any playback mechanism.
   * * This factory is designed to be called once per player instance (e.g., daily or hourly)
   * to "bake in" the specific state variables and setters needed.
   *
   * @param {boolean} isPlaying The current playback state (e.g., isPlaying, timeIsPlaying).
   * @param {any[]} playArray The data array (e.g., dateArray, timeArray).
   * @param {number} currentIndex The current index in the array (e.g., currentDateIndex, currentTimeIndex).
   * @param {React.Dispatch<React.SetStateAction<number>>} setCurrentIndex The setter for the index.
   * @param {React.Dispatch<React.SetStateAction<boolean>>} setIsPlaying The setter for the playback state.
   * @returns {function(): void} A function that, when called, executes the toggle logic.
   */
  const createTogglePlayer = <T extends any>(
    isPlaying: boolean,
    playArray: T[],
    currentIndex: number,
    setCurrentIndex: Dispatch<SetStateAction<number>>,
    setIsPlaying: Dispatch<SetStateAction<boolean>>
  ): (() => void) => {
    // The returned function will be used as the actual event handler
    return () => {
      // Reset index only if currently stopped AND at the very last element
      if (!isPlaying && currentIndex >= playArray.length - 1) {
        setCurrentIndex(0);
      }
      // Toggle the playing state
      setIsPlaying(!isPlaying);
    };
  };

  const toggleDailyPlayer = createTogglePlayer(
    isPlaying,
    dateArray,
    currentDateIndex,
    setCurrentDateIndex,
    setIsPlaying
  );

  const toggleHourlyPlayer = createTogglePlayer(
    timeIsPlaying,
    timeArray,
    currentTimeIndex,
    setCurrentTimeIndex,
    setTimeIsPlaying
  );

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
              if (update[0] && update[1]) fetchDailyCountsInDateRange(update[0], update[1], setDateRangeData, setLoadingDailyTrafficData);
            }}
          />
        </div>

        {/* Play avg traffic in 15 min increments across 24 hours */}
        <div className={styles.section}>
          <p className={styles.sectionHeader}>Play 24hr traffic</p>
          <PlaybackControl
            dataIsLoaded={loadingHr24TrafficData}
            isPlaying={timeIsPlaying}
            onTogglePlay={toggleHourlyPlayer}
            onRefresh={() => {
              setTimeIsPlaying(false);
              setCurrentTimeIndex(0);
              if (dateRange[0] && dateRange[1]) fetch24HourCycleData(dateRange, counterLocations, setHr24TrafficData, setLoadingHr24TrafficData);
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
            dataIsLoaded={loadingDailyTrafficData}
            isPlaying={isPlaying}
            onTogglePlay={toggleDailyPlayer}
            onRefresh={() => {
              setCurrentDateIndex(0);
              setIsPlaying(false);
              if (dateRange[0] && dateRange[1]) fetchDailyCountsInDateRange(dateRange[0], dateRange[1], setDateRangeData, setLoadingDailyTrafficData);
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
