"use client";

import { useEffect, useState } from "react";
import { CounterLocationFeature } from "@/src/interfaces/counterLocationTypes";
import { getCounterRoutes, CounterRoute } from "./helpers/getCounterRoutes";

export function useCacheCounterRoutes(
  counterLocations: CounterLocationFeature[],
): CounterRoute[] | undefined {
  const [routes, setRoutes] = useState<CounterRoute[]>();

  useEffect(() => {
    if (!counterLocations?.length) return;

    let cancelled = false;

    const render = async () => {
      try {
        const resolvedRoutes = await getCounterRoutes(counterLocations);
        if (cancelled) return;
        setRoutes(resolvedRoutes);
      } catch (err) {
        console.error("Error rendering animated counter polylines:", err);
      }
    };

    render();

    return () => {
      cancelled = true;
    };
  }, [counterLocations]);

  return routes;
}
