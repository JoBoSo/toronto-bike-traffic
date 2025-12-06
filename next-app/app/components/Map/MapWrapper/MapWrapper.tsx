"use client";

import dynamic from "next/dynamic";
import styles from "@/components/Map/MapWrapper/MapWrapper.module.scss";

interface MapWrapperProps {
    isSidebarCollapsed: boolean;
}

const MapClient = dynamic(() => import("../MapClient/MapClient"), {
  ssr: false,
  loading: () => (
    <div className={styles.loadingMapClient}>
      <p>Loading map...</p>
    </div>
  )
});

export default function MapWrapper({ isSidebarCollapsed }: MapWrapperProps) {
  return (
    <div className={styles.mapWrapper}>
      <MapClient 
        isSidebarCollapsed={isSidebarCollapsed} 
      />
    </div>
  );
}
