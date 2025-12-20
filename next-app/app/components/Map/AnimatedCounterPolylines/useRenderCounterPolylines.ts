"use client";

import { useEffect, useState } from "react";
import { Map as LeafletMap } from "leaflet";
import { renderPolylines, CounterPolyline } from "./helpers/renderPolylines";
import { ensureMapPane } from "./helpers/ensureMapPane";
import { CounterRoute } from "./helpers/getCounterRoutes";

const POLYLINE_PANE_NAME = "counterPolylinePane";
const PANE_Z_INDEX = "629";

export function useRenderCounterPolylines(
  mapInstance: LeafletMap | null,
  counterRoutes: CounterRoute[] | undefined,
  paneName: string = POLYLINE_PANE_NAME,
  paneZIndex: string = PANE_Z_INDEX,
): CounterPolyline[] | undefined {
  const [polylines, setPolylines] = useState<CounterPolyline[]>();

  useEffect(() => {
    if (!mapInstance || !counterRoutes) return;

    ensureMapPane(mapInstance, paneName, paneZIndex)

    const polylines: CounterPolyline[] = renderPolylines(
      mapInstance, counterRoutes, paneName
    );

    setPolylines(polylines);
  }, [mapInstance, counterRoutes]);

  return polylines;
}
