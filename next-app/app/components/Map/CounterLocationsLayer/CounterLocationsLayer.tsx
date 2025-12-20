"use client";

import { GeoJSON, Pane } from "react-leaflet";
import L from "leaflet";
import styles from "./CounterLocationsLayer.module.scss";

interface CounterLocationsLayerProps {
  data: any;
}

export default function CounterLocationsLayer({ data }: CounterLocationsLayerProps) {
  if (!data || data.length === 0) return null;

  // 1. Logic to create the CircleMarker for each point
  const pointToLayer = (feature: any, latlng: L.LatLng) => {
    return L.circleMarker(latlng, {
      pane: "counterLocationsPane",
      radius: 5,
      color: "#1e2674ff",
      weight: 0,
      fillColor: "#1e2674ff",
      fillOpacity: 1,
      className: styles.radarPulseCircleColor,
    });
  };

  // 2. Popup logic
  const onEachFeature = (feature: any, layer: L.Layer) => {
    const { 
      location_dir_ids, 
      name, 
      directions, 
      first_active, 
      last_active 
    } = feature.properties;

    const startDate = new Date(first_active).toISOString().split('T')[0];
    const endDate = new Date(last_active).toISOString().split('T')[0];

    layer.bindPopup(`
      <div style="font-family: sans-serif;">
        <b>Bike Counter</b><br/>
        <p style="margin: 2px 0;">${name}</p>
        <p style="margin: 2px 0;">Directions: ${directions}</p>
        <p style="margin: 2px 0;">Active from ${startDate} to ${endDate}</p>
        <p style="margin: 2px 0;">Device IDs: ${location_dir_ids}</p>
      </div>
    `);
  };

  return (
    <Pane name="counterLocationsPane" style={{ zIndex: 630 }}>
      <GeoJSON 
        data={data} 
        pointToLayer={pointToLayer}
        onEachFeature={onEachFeature}
      />
    </Pane>
  );
}