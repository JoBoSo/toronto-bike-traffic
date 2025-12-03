"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type MapContextType = {
  dateRange: [Date | null, Date | null];
  setDateRange: (range: [Date | null, Date | null]) => void;
  dateRangeData: any;
  setDateRangeData: React.Dispatch<React.SetStateAction<any>>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
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
    new Date("2025-06-01"),
    new Date("2025-08-31"),
  ]);
  const [dateRangeData, setDateRangeData] = useState<any>(null);

  // Playback state for traffic across date range
  const [isPlaying, setIsPlaying] = useState(false);
  const [dateArray, setDateArray] = useState<Date[]>([]);
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  
  // Playback state for traffic across 24 hours
  const [timeIsPlaying, setTimeIsPlaying] = useState(false);
  const [timeArray, setTimeArray] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState<string>("17:00:00");
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);

  return (
    <MapContext.Provider value={{
      dateRange,
      setDateRange,
      dateRangeData,
      setDateRangeData,
      isPlaying,
      setIsPlaying,
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
