"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type MapContextType = {
  dateRange: [Date | null, Date | null];
  setDateRange: (range: [Date | null, Date | null]) => void;
  dateRangeData: any;
  setDateRangeData: React.Dispatch<React.SetStateAction<any>>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  hr24TrafficData: any;
  setHr24TrafficData: React.Dispatch<React.SetStateAction<any>>;
  timeIsPlaying: boolean;
  setTimeIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  timeArray: string[];
  setTimeArray: React.Dispatch<React.SetStateAction<string[]>>;
  dateArray: Date[];
  setDateArray: React.Dispatch<React.SetStateAction<Date[]>>;
  currentDateIndex: number;
  setCurrentDateIndex: React.Dispatch<React.SetStateAction<number>>;
  currentTimeIndex: number;
  setCurrentTimeIndex: React.Dispatch<React.SetStateAction<number>>;
  currentTime: string;
  setCurrentTime: React.Dispatch<React.SetStateAction<string>>;
};

const MapContext = createContext<MapContextType | undefined>(undefined);

export function MapProvider({ children }: { children: ReactNode }) {
  // Date range state
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    new Date("2025-06-02"),
    new Date("2025-09-01"),
  ]);

  // Playback state for traffic across date range
  const [dateRangeData, setDateRangeData] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dateArray, setDateArray] = useState<Date[]>([]);
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  
  // Playback state for traffic across 24 hours
  const [hr24TrafficData, setHr24TrafficData] = useState<any>(null);
  const [timeIsPlaying, setTimeIsPlaying] = useState(false);
  const [timeArray, setTimeArray] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState<string>("00:00:00");
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);

  return (
    <MapContext.Provider value={{
      dateRange,
      setDateRange,
      dateRangeData,
      setDateRangeData,
      isPlaying,
      setIsPlaying,
      hr24TrafficData,
      setHr24TrafficData,
      timeIsPlaying,
      setTimeIsPlaying,
      timeArray,
      setTimeArray,
      dateArray,
      setDateArray,
      currentDateIndex,
      setCurrentDateIndex,
      currentTimeIndex,
      setCurrentTimeIndex,
      currentTime,
      setCurrentTime,
    }}>
      {children}
    </MapContext.Provider>
  );
}

export function useMapContext() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMapContext must be used within a MapProvider");
  }
  return context;
}
