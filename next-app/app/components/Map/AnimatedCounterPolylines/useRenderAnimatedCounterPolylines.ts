"use client";

import { useEffect, useState } from "react";
import { Map as LeafletMap } from "leaflet";
import { useAnimatedPolylineFlow, PolylineAnimationConfig } from "@/components/Map/AnimatedCounterPolylines/useAnimatedPolylineFlow";
import { CounterPolyline } from "@/components/Map/AnimatedCounterPolylines/helpers/renderPolylines";

export function useRenderAnimatedCounterPolylines(
  mapInstance: LeafletMap | null,
  polylines: CounterPolyline[] | undefined,
  polylineConfigs: PolylineAnimationConfig[] | undefined,
) {
  const [configs, setConfigs] = useState<PolylineAnimationConfig[]>([]);

  useAnimatedPolylineFlow(configs);

  useEffect(() => {
    if (!mapInstance || !polylines) return;

    if (polylineConfigs) {
      setConfigs(polylineConfigs)
    }

    return () => {
      // configs.forEach(({ polyline }) =>
      //   mapInstance.removeLayer(polyline)
      // );
      setConfigs([]);
    };
  }, [mapInstance, polylines, polylineConfigs]);

  return { configs, setConfigs };
}
