"use client";

import React from "react";
import styles from "@/components/Map/PlaybackControl/PlaybackControl.module.scss";

interface PlaybackControlProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onRefresh?: () => void;       // new optional prop
  infoLines?: string[];
}

const PlaybackControl: React.FC<PlaybackControlProps> = ({
  isPlaying,
  onTogglePlay,
  onRefresh,
  infoLines = [],
}) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        <div className={styles.rowItem}>
          <button onClick={onTogglePlay} className={`${styles.playPauseButton}`}>
            {isPlaying ? "⏸" : "▶"}
          </button>
        </div>

        {infoLines.length > 0 && (
          <div className={styles.rowItem}>
            {/* The infoText variable holds the single, combined string */}
            <div className={styles.infoBox}>
              {infoLines.join(' ')}
            </div>
          </div>
        )}

        {onRefresh && (
          <div className={styles.rowItem}>
            <button onClick={onRefresh} className={styles.refreshButton}>
              ⟲
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaybackControl;
