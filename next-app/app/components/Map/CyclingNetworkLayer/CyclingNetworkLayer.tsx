"use client";

import { GeoJSON, Pane } from "react-leaflet";
import L from "leaflet";

interface CyclingNetworkLayerProps {
  geoJsonData: any;
}

/**
 * Component to render the Toronto Cycling Network.
 * Must be a child of <MapContainer />
 */
export default function CyclingNetworkLayer({ geoJsonData }: CyclingNetworkLayerProps) {
  if (!geoJsonData) return null;

  // 1. Helper to extract infra type for styling and popups
  const getInfraType = (feature: any) => {
    return feature?.properties?.INFRA_LOWORDER?.trim()
      ? feature.properties.INFRA_LOWORDER
      : feature?.properties?.INFRA_HIGHORDER;
  };

  // 2. Styling logic
  const styleFeature = (feature: any) => {
    const infra = getInfraType(feature);
    return {
      color: getColor(infra),
      weight: 3,
      opacity: 0.8,
    };
  };

  // 3. Popup logic
  const onEachFeature = (feature: any, layer: L.Layer) => {
    const infra = getInfraType(feature);
    const { STREET_NAME, FROM_STREET, TO_STREET, INSTALLED } = feature.properties;

    layer.bindPopup(`
      <div style="font-family: sans-serif;">
        <strong>${infra}</strong><br/>
        <p style="margin: 2px 0;">${STREET_NAME}</p>
        <p style="margin: 2px 0;"><i>From</i> ${FROM_STREET}</p>
        <p style="margin: 2px 0;"><i>To</i> ${TO_STREET}</p>
        <p style="margin: 2px 0;">Installed in ${INSTALLED}</p>
      </div>
    `);
  };

  return (
    /* Pane handles the z-index automatically. 
       React-Leaflet creates the pane if it doesn't exist.
    */
    <Pane name="cyclingNetworkPane" style={{ zIndex: 610 }}>
      <GeoJSON 
        data={geoJsonData} 
        style={styleFeature} 
        onEachFeature={onEachFeature} 
      />
    </Pane>
  );
}

// Keep your helper outside the component to prevent re-declaration
function getColor(infra: string) {
  if (!infra) return "black";
  
  switch (true) {
    case infra.includes("Cycle Track"): return "#FF6B6B";
    case infra.includes("Bi-Directional Cycle Track"): return "#FFD93D";
    case infra.includes("Multi-Use Trail"): return "#6BCB77";
    case infra.includes("Bike Lane – Buffered"): return "#4D96FF";
    case infra.includes("Bike Lane"): return "#845EC2";
    case infra.includes("Contra-flow Bike Lane"): return "#FF9671";
    case infra.includes("Sharrows - Wayfinding"): return "#F9F871";
    case infra.includes("Sharrows"): return "#C34A8E";
    case infra.includes("Park Road"): return "#00C9A7";
    case infra.includes("Signed Route"): return "#FF5D8F";
    default: return "black";
  }
}