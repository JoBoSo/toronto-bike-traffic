"use client";

import React from "react";
import styles from "@/components/Sidebar/PlaybackControl/PlaybackControl.module.scss";
import { Loader2, Play, Pause, RotateCcw } from 'lucide-react';

interface PlaybackControlProps {
  dataIsLoaded: boolean;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onRefresh?: () => void;       // new optional prop
  infoLines?: string[];
}

const PlaybackControl: React.FC<PlaybackControlProps> = ({
  dataIsLoaded,
  isPlaying,
  onTogglePlay,
  onRefresh,
  infoLines = [],
}) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        <div className={styles.rowItem}>
          <button 
            onClick={onTogglePlay} 
            disabled={dataIsLoaded}
            className={`${dataIsLoaded ? styles.loadPlayPauseButton : styles.playPauseButton}`}
          >
            {dataIsLoaded ? 
              <Loader2 className="size-full align-middle animate-spin" /> 
              : (isPlaying ? <Pause className={styles.lucidIcon} /> : <Play className={styles.lucidIcon} />)
            }
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
            <button 
              onClick={onRefresh} 
              disabled={dataIsLoaded}
              className={dataIsLoaded ? styles.loadRefreshButton : styles.refreshButton}
            >
              {dataIsLoaded ? 
                <Loader2 className="size-full align-middle animate-spin" /> 
                : <RotateCcw className={styles.lucidIcon} />
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaybackControl;
