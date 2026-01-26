"use client";

import { useEffect, useState } from "react";
import styles from "./Loading.module.scss";

interface LoadingProps {
  onLoadingComplete?: () => void;
  minDuration?: number;
}

export default function Loading({
  onLoadingComplete,
  minDuration = 2500,
}: LoadingProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => {
        setIsVisible(false);
        onLoadingComplete?.();
      }, 500);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration, onLoadingComplete]);

  if (!isVisible) return null;

  return (
    <div className={`${styles.loadingContainer} ${isFading ? styles.fadeOut : ""}`}>
      <div className={styles.content}>
        <div className={styles.logoContainer}>
          <span className={styles.logoText}>LASER DRIFT</span>
          <span className={styles.logoSubtext}>NEON BLAST</span>
        </div>

        <div className={styles.loadingBarContainer}>
          <div className={styles.loadingBar}>
            <div className={styles.loadingLight} />
          </div>
        </div>

        <span className={styles.loadingText}>LOADING EXPERIENCE</span>
      </div>
    </div>
  );
}
