"use client";

import React, { useEffect, useRef, useState } from "react";
import { Layers } from "lucide-react";
import styles from './MapLayersControl.module.scss'; 

interface MapLayersControlProps {
  isSatellite: boolean;
  setIsSatellite: (v: boolean) => void;
}

/**
 * UI Component for toggling map layers.
 * Positioned absolutely over the MapContainer.
 */
export default function MapLayersControl({
  isSatellite,
  setIsSatellite
}: MapLayersControlProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // Close when clicking outside logic
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        panelRef.current && !panelRef.current.contains(target) &&
        buttonRef.current && !buttonRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, [open]);

  return (
    <div className={styles.container}>
      <button
        ref={buttonRef}
        className={`${styles['map-layers-button']} ${open ? styles.active : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Toggle Layer Panel"
      >
        <Layers size={22} />
      </button>

      <div
        ref={panelRef}
        className={`${styles['map-layers-panel']} ${open ? styles.open : ''}`}
      >
        <div className={styles['map-layers-header']}>Map Settings</div>
        
        <div className={styles['layer-toggle-row']}>
          <span className={styles.label}>Satellite View</span>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={isSatellite}
              onChange={() => setIsSatellite(!isSatellite)}
            />
            <span className={styles.slider} />
          </label>
        </div>
      </div>
    </div>
  );
}