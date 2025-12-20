import { Map as LeafletMap } from "leaflet";

/**
 * Checks if a specific Leaflet map pane exists. If not, it creates the pane
 * and sets its Z-index.
 * * @param mapInstance The active Leaflet map instance.
 * @param paneName The unique name of the pane to create or retrieve (e.g., "counterPolylinePane").
 * @param zIndex The CSS z-index value for the pane (e.g., "629").
 */
export function ensureMapPane(
    mapInstance: LeafletMap,
    paneName: string,
    zIndex: string
): void {
    let pane = mapInstance.getPane(paneName);
    
    if (!pane) {
      pane = mapInstance.createPane(paneName);
      pane.style.zIndex = zIndex;
    }
}