"use client";

import dynamic from "next/dynamic";
import styles from "@/components/Map/MapWrapper/MapWrapper.module.scss";

const MapClient = dynamic(() => import("../MapClient/MapClient"), {
  ssr: false,
  loading: () => (
    <div className={styles.loadingMapClient}>
      <p>Loading map...</p>
    </div>
  )
});

export default function MapWrapper() {
  return (
    <div className={styles.mapWrapper}>
      <MapClient />
    </div>
  );
}
