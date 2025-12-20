"use client";

import { useEffect, useState } from "react";
import { PolylineAnimationConfig } from "@/components/Map/MapClient/hooks/CounterPolylines/useAnimatedPolylineFlow";
import { CounterPolyline } from "@/components/Map/AnimatedCounterPolylines/helpers/renderPolylines";

export interface CounterVolData {
  locationDirId: number,
  volume: number
};

export function useCreatePolylineConfig(
  polylines: CounterPolyline[] | undefined,
  counterVolData: any//CounterVolData[] | undefined,
) {
  const [configs, setConfigs] = useState<PolylineAnimationConfig[]>([]);

  useEffect(() => {
    if (!polylines || !counterVolData) return;

    const configs = polylines.map((pl: CounterPolyline) => {
      const counterData = counterVolData.find((item: any) => Number(item.location_dir_id) === pl.locationDirId);
      const counterVol = counterData ? counterData.avg_bin_volume : 0;
      const dashSpace = 500/Math.max(0.00001, counterVol);
      const speed = (counterVol === 0) ? 2 + (counterVol * 0.05) : 0;
      console.log(pl.locationDirId, counterVol, dashSpace);
      return {
        polyline: pl.polyline,
        speed: speed,//1.2,
        direction: -1,
        dashLength: 3,
        dashSpacing: 15,//dashSpace,
        color: "#000000ff",
        weight: 4,
        opacity: 1,
      } as PolylineAnimationConfig
    });
    console.log(configs);

    setConfigs(configs)

    return () => {
      setConfigs([]);
    };
  }, [polylines, counterVolData]);

  return configs;
}
