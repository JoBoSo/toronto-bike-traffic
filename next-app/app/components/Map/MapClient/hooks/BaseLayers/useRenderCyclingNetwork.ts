import { useEffect } from "react";
import L, { Map as LeafletMap } from "leaflet";

export function useRenderCyclingNetwork(
  mapInstance: LeafletMap | null,
  geoJsonData: any
) {
  useEffect(() => {
    if (!mapInstance || !geoJsonData) return;
    console.log("Rendering cycling network");

    mapInstance.createPane("cyclingNetworkPane");
    mapInstance.getPane("cyclingNetworkPane")!.style.zIndex = "610";

    const geoJsonLayer = L.geoJSON(geoJsonData, {
      pane: "cyclingNetworkPane",
      style: (feature) => {
        const infra = feature?.properties?.INFRA_LOWORDER?.trim()
          ? feature.properties.INFRA_LOWORDER
          : feature?.properties?.INFRA_HIGHORDER;
        return {
          color: getColor(infra),
          weight: 3,
          opacity: 0.8,
        }
      },
      onEachFeature: (feature, layer) => {
        const infra = feature?.properties?.INFRA_LOWORDER?.trim()
          ? feature.properties.INFRA_LOWORDER
          : feature?.properties?.INFRA_HIGHORDER;
        const street_name = feature.properties?.STREET_NAME;
        const from_street = feature.properties?.FROM_STREET;
        const to_street = feature.properties?.TO_STREET;
        const installed = feature.properties?.INSTALLED;
        layer.bindPopup(`
          <strong>${infra}</strong><br/>
          <p style="margin: 2px 0;">${street_name}</p>
          <p style="margin: 2px 0;"><i>From</i> ${from_street}</p>
          <p style="margin: 2px 0;"><i>To</i> ${to_street}</p>
          <p style="margin: 2px 0;">Installed in ${installed}</p>
        `);
      },
    }).addTo(mapInstance);

    return () => {
      if (mapInstance && mapInstance.hasLayer(geoJsonLayer)) {
        mapInstance.removeLayer(geoJsonLayer);
      }
    };

  }, [mapInstance, geoJsonData]);
}

function getColor(infra: string) {
  switch (true) {
    case infra.includes("Cycle Track"): 
      return "#FF6B6B"; // vibrant red-orange
    case infra.includes("Bi-Directional Cycle Track"): 
      return "#FFD93D"; // bright yellow
    case infra.includes("Multi-Use Trail"): 
      return "#6BCB77"; // fresh green
    case infra.includes("Bike Lane – Buffered"): 
      return "#4D96FF"; // electric blue
    case infra.includes("Bike Lane"): 
      return "#845EC2"; // deep purple
    case infra.includes("Contra-flow Bike Lane"): 
      return "#FF9671"; // soft orange
    case infra.includes("Sharrows - Wayfinding"): 
      return "#F9F871"; // pale yellow
    case infra.includes("Sharrows"): 
      return "#C34A8E"; // magenta / pink
    case infra.includes("Park Road"): 
      return "#00C9A7"; // aqua / teal
    case infra.includes("Signed Route"): 
      return "#FF5D8F"; // coral pink
    default: 
      return "black";
  }
};