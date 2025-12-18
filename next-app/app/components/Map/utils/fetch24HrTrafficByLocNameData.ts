import { FlaskApi } from "@/src/apis/flaskApi";
import React, { useState } from "react";

export async function fetch24HrTrafficByLocNameData(
  dateRange: [Date | null, Date | null], 
  setHr24TrafficByLocNameData: React.Dispatch<React.SetStateAction<any>>,
  setLoadingHr24TrafficData: React.Dispatch<React.SetStateAction<boolean>>,
) {
  try {
    {if (!dateRange[0]  || !dateRange[1]) return}
    console.log("fetching 24 hour traffic data by loc name")
    setLoadingHr24TrafficData(true);
    
    const start = dateRange[0].toISOString().split('T')[0];
    const end = dateRange[1].toISOString().split('T')[0];

    const flaskApi = new FlaskApi();
    const data = await flaskApi.get15MinCountsByLocNameInDateRange(start, end);
    // console.log(data);
    setHr24TrafficByLocNameData(data);

    setLoadingHr24TrafficData(false);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};