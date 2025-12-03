"use client";

import dynamic from "next/dynamic";
import styles from "./MapWrapper.module.scss";

const MapClient = dynamic(() => import("../MapClient/MapClient"), {
  ssr: false,
  loading: () => (
    <div className={styles.loadingMapClient}>
      <p>Loading map...</p>
    </div>
  )
});

export default function MapWrapper({ data }: { data: any }) {
  return (
    <div className={styles.mapWrapper}>
      <MapClient data={data} />
    </div>
  );
}
