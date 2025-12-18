import { FlaskApi } from "@/src/apis/flaskApi";
import React from "react";

// Fetch data by date range
export async function fetchDailyCountsByLocNameInDateRange(
  startDate: Date, 
  endDate: Date, 
  setDateRangeData: React.Dispatch<React.SetStateAction<any>>,
  setLoadingDailyTrafficData: React.Dispatch<React.SetStateAction<boolean>>,
) {
  console.log("fetching daily traffic data by loc name")
  try {
    setLoadingDailyTrafficData(true);
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];
    
    const flaskApi = new FlaskApi();
    const data = await flaskApi.getDailyCountsByLocNameInDateRange(start, end);
    setDateRangeData(data);
    setLoadingDailyTrafficData(false);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};