"use client";

import { SetStateAction, useState, Dispatch } from "react";
import { useMapContext } from "@/src/contexts/MapContext";
import { usePageContentContext } from "@/src/contexts/PageContentContext";
import { fetchDailyCountsInDateRange } from "@/components/Map/utils/fetchDailyCountsInDateRange";
import styles from "@/components/Sidebar/Sidebar.module.scss";
import DateRangePicker from "@/components/Sidebar/DateRangePicker/DateRangePicker";
import PlaybackControl from "@/components/Sidebar/PlaybackControl/PlaybackControl";
import { fetch24HourCycleData } from "../Map/utils/fetch24HourCycleData";
import { fetchDailyCountsByLocNameInDateRange } from "../Map/utils/fetchDailyCountsByLocNameInDateRange";
import { fetch24HrTrafficByLocNameData } from "../Map/utils/fetch24HrTrafficByLocNameData";
import { convertTo12HourTime } from "@/src/utils/convertTo12HourTime"
import { PanelRightClose, PanelRightOpen } from 'lucide-react';

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
    setDateRangeByLocNameData,
    loadingDailyTrafficData,
    setLoadingDailyTrafficData,
    isPlaying,
    setIsPlaying,
    setHr24TrafficData,
    hr24TrafficByLocNameData,
    setHr24TrafficByLocNameData,
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
        {collapsed ? <PanelRightClose /> : <PanelRightOpen />}
      </div>

      {/* Sidebar content */}
      <div className={styles.content}>

        <div className={styles.section}>
          {/* <b className={styles.sectionHeader}>Toronto Bike Traffic Visualizer</b> */}
          <p className={styles.sectionDescription}>Explore data collected by the City of Toronto's bicycle counting devices.</p>
        </div>

        {/* Date range selector */}
        <div className={styles.section}>
          <b className={styles.sectionHeader}>Period</b>
          <p className={styles.sectionDescription}>The bike traffic data visualizations will cover this period.</p>
          <DateRangePicker
            dateRange={dateRange}
            onChange={(update) => {
              setDateRange(update);
              setIsPlaying(false);
              setTimeIsPlaying(false);
              if (update[0] && update[1]) {
                fetchDailyCountsByLocNameInDateRange(
                  update[0], update[1], setDateRangeByLocNameData, setLoadingDailyTrafficData
                );
              }
            }}
          />
        </div>

        {/* Play avg traffic in 15 min increments across 24 hours */}
        <div className={styles.section}>
          <b className={styles.sectionHeader}>24 Hour Traffic</b>
          <p className={styles.sectionDescription}>See bike traffic in 15 minute intervals over an entire day, averaged across the period.</p>
          <PlaybackControl
            dataIsLoaded={loadingHr24TrafficData}
            isPlaying={timeIsPlaying}
            onTogglePlay={toggleHourlyPlayer}
            onRefresh={() => {
              setTimeIsPlaying(false);
              setCurrentTimeIndex(0);
              if (dateRange[0] && dateRange[1]) {
                fetch24HrTrafficByLocNameData(
                  dateRange, setHr24TrafficByLocNameData, setLoadingHr24TrafficData
                );
              }
            }}
            infoLines={[
              `${convertTo12HourTime(timeArray[currentTimeIndex]??currentTime)}`,
            ]}
          />
        </div>

        {/* Date Range Play/Pause */}
        <div className={styles.section}>
          <b className={styles.sectionHeader}>Daily Traffic</b>
          <p className={styles.sectionDescription}>See total daily traffic for each day in the period.</p>
          <PlaybackControl
            dataIsLoaded={loadingDailyTrafficData}
            isPlaying={isPlaying}
            onTogglePlay={toggleDailyPlayer}
            onRefresh={() => {
              setCurrentDateIndex(0);
              setIsPlaying(false);
              if (dateRange[0] && dateRange[1]) {
                fetchDailyCountsByLocNameInDateRange(
                  dateRange[0], dateRange[1], setDateRangeByLocNameData, setLoadingDailyTrafficData
                );
              }
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
