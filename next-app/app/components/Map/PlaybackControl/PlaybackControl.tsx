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
      <div className={styles.buttonRow}>
        <div className={styles.button}>
          <button onClick={onTogglePlay} className={`${styles.playPauseButton}`}>
            {isPlaying ? "⏸" : "▶"}
          </button>
        </div>

        {onRefresh && (
          <div className={styles.button}>
            <button onClick={onRefresh} className={styles.refreshButton}>
              ⟲
            </button>
          </div>
        )}
      </div>

      {infoLines.length > 0 && (
        <div className={styles.infoBox}>
          {infoLines.map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaybackControl;
