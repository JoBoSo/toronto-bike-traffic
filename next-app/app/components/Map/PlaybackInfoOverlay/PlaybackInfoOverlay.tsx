import React from 'react';
import styles from "@/components/Map/PlaybackInfoOverlay/PlaybackInfoOverlay.module.scss"

interface PlaybackInfoOverlayProps {
  info: string;
}

const PlaybackInfoOverlay: React.FC<PlaybackInfoOverlayProps> = ({ info }) => {
  return (
    <>
      <div className={styles.infoOverlay}>
        <p className={styles.infoTime}>
          {info}
        </p>
      </div>
    </>
  );
};

export default PlaybackInfoOverlay;