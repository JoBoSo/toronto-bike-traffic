import { FlaskApi } from "@/src/apis/flaskApi";
import mergeCoordinates from "@/components/Map/utils/mergeCoordinates";
import React, { useState } from "react";

export async function fetch24HourCycleData(
  dateRange: [Date | null, Date | null], 
  counterLocationData: any,
  setHr24TrafficData: React.Dispatch<React.SetStateAction<any>>
) {
  try {
    {if (!dateRange[0]  || !dateRange[1]) return}
    const start = dateRange[0].toISOString().split('T')[0];
    const end = dateRange[1].toISOString().split('T')[0];
    const flaskApi = new FlaskApi();
    console.log("fetching 24 hour data")
    const data = await flaskApi.get15MinCountsInDateRange(start, end);
    const dataWithCoords = mergeCoordinates(counterLocationData, data);
    // console.log(dataWithCoords);
    setHr24TrafficData(dataWithCoords);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};