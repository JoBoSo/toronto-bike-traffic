import { FlaskApi } from "@/src/apis/flaskApi";
import React from "react";

// Fetch data by date range
export async function fetchDailyCountsInDateRange(
  startDate: Date, 
  endDate: Date, 
  setDateRangeData: React.Dispatch<React.SetStateAction<any>>
) {
  try {
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];
    
    const flaskApi = new FlaskApi();
    const data = await flaskApi.getDailyCountsInDateRange(start, end);
    setDateRangeData(data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};