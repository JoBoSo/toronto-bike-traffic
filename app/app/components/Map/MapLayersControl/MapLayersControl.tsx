import { useEffect, useRef, useState } from "react";
import { Layers } from "lucide-react";
import styles from './MapLayersControl.module.scss'; 

export default function MapLayersControl({
  isSatellite,
  setIsSatellite
}: {
  isSatellite: boolean;
  setIsSatellite: (v: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        className={`${styles['map-layers-button']} ${open ? styles.active : ''}`}
        onClick={() => setOpen(!open)} // toggle panel
      >
        <Layers size={22} />
      </button>

      <div
        ref={panelRef}
        className={`${styles['map-layers-panel']} ${open ? styles.open : ''}`}
      >
        <div className={styles['map-layers-header']}>Base Map</div>
        <div className={styles['layer-toggle-row']}>
          <span>Satellite</span>
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
    </>
  );
}
