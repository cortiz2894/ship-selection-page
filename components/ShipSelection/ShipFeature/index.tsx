"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Image from "next/image";
import styles from "./ShipFeature.module.scss";
import { Ship } from "@/constants/ships";
import { MenuAudioManager } from "@/utils/audioMenu";

interface ShipFeatureProps {
  ship: Ship;
  isTransitioning: boolean;
  title: string;
  icon: string;
  featureName: string;
  videoUrl?: string; // Optional video URL for hover effect
}

export default function ShipFeature({
  ship,
  isTransitioning,
  title,
  icon,
  featureName,
  videoUrl,
}: ShipFeatureProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoBorderRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const soundManagerRef = useRef<MenuAudioManager | null>(null);

  // Initialize MenuAudioManager
  useEffect(() => {
    if (typeof window !== "undefined") {
      soundManagerRef.current = MenuAudioManager.getInstance();
    }
  }, []);

  // Animate exit when transitioning starts
  useEffect(() => {
    if (!containerRef.current || !isTransitioning) return;

    gsap.to(containerRef.current, {
      delay: 0.5,
      opacity: 0,
      x: 20,
      duration: 0.3,
      ease: "power2.in",
    });
  }, [isTransitioning]);

  // Animate entrance when ship changes
  useEffect(() => {
    if (!containerRef.current) return;

    // Animate entrance
    gsap.fromTo(
      containerRef.current,
      {
        x: 40,
        opacity: 0,
      },
      {
        x: 0,
        opacity: 1,
        duration: 1,
        delay: 0.7,
        ease: "power3.out",
      }
    );
  }, [ship.id]);

  // Handle hover animation for video
  useEffect(() => {
    if (!videoUrl) return;

    if (isHovered) {
      // Use a small delay to ensure refs are ready
      const timer = setTimeout(() => {
        if (
          !videoContainerRef.current ||
          !videoBorderRef.current ||
          !videoRef.current
        ) {
          console.log("[ShipFeature] Refs not ready yet");
          return;
        }

        // Play video
        videoRef.current.play().catch((err) => {
          console.error("[ShipFeature] Video play error:", err);
        });

        // Kill any existing timeline
        if (hoverTimelineRef.current) {
          hoverTimelineRef.current.kill();
        }

        console.log("[ShipFeature] Starting hover animation");

        // Create timeline for hover animation
        const tl = gsap.timeline();

        // 1. Border expands from right to left
        tl.fromTo(
          videoBorderRef.current,
          {
            width: 0,
            opacity: 0,
          },
          {
            width: "100%",
            duration: 0.2,
            opacity: 0.3,
            ease: "power2.out",
          }
        );

        // 2. Video container appears with blinking effect
        tl.fromTo(
          videoContainerRef.current,
          {
            opacity: 0,
          },
          {
            opacity: 0.5,
            duration: 0.05,
            repeat: 3,
            yoyo: true,
            ease: "none",
          }
        )
          .to(videoContainerRef.current, {
            opacity: 1,
            duration: 0.05,
            ease: "none",
          })
          .to(videoBorderRef.current, {
            opacity: 1,
            duration: 0.1,
          });

        hoverTimelineRef.current = tl;
      }, 50);

      return () => clearTimeout(timer);
    } else {
      // Kill any existing timeline
      if (hoverTimelineRef.current) {
        hoverTimelineRef.current.kill();
      }

      // Animate hide with blinking effect
      if (
        videoContainerRef.current &&
        videoBorderRef.current &&
        videoRef.current
      ) {
        const tl = gsap.timeline({
          onComplete: () => {
            // Pause video after animation completes
            if (videoRef.current) {
              videoRef.current.pause();
              videoRef.current.currentTime = 0;
            }
          },
        });

        // 1. Video container disappears with blinking effect

        tl.to(videoContainerRef.current, {
          width: 0,
          opacity: 0,
          duration: 0.1,
          ease: "power2.in",
        })
          .to(
            videoBorderRef.current,
            {
              opacity: 0.3,
              duration: 0.1,
              ease: "power2.in",
            },
            "<"
          )
          .to(videoBorderRef.current, {
            width: 0,
            opacity: 0,
            duration: 0.07,
            ease: "power4.in",
          });

        // 2. Border fades out and contracts

        // 3. Ensure everything is hidden
        tl.set([videoContainerRef.current, videoBorderRef.current], {
          opacity: 0,
          width: 0,
        });

        hoverTimelineRef.current = tl;
      }
    }
  }, [isHovered, videoUrl]);

  const handleMouseEnter = () => {
    if (videoUrl) {
      // Play hologram sound with faster playback rate (1.3x speed)
      soundManagerRef.current?.play("openHologram", {
        volume: 0.4,
        playbackRate: 1.3,
      });
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    // Play hologram sound with faster playback rate (1.3x speed)
    soundManagerRef.current?.play("closeHologram", {
      volume: 0.3,
      // playbackRate: 1.3,
    });
    setIsHovered(false);
  };

  return (
    <div
      ref={containerRef}
      className={styles.specialPower}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Title */}
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.powerContainer}>
        {/* Icon and Content */}
        <div className={styles.content}>
          <div className={styles.iconWrapper}>
            <Image
              src={icon} //ship.specialPower.iconPath
              alt={featureName} //ship.specialPower.name
              width={80}
              height={80}
              className={styles.icon}
            />
          </div>

          <div className={styles.info}>
            <h4 className={styles.powerName}>{featureName}</h4>
            <p className={styles.description}>
              {ship.specialPower.description}
            </p>
          </div>
        </div>

        {/* Video Hologram Effect */}
        {videoUrl && (
          <div className={styles.videoHologram}>
            {/* Border that expands from right to left */}
            <div ref={videoBorderRef} className={styles.videoBorder} />

            {/* Video Container */}
            <div ref={videoContainerRef} className={styles.videoContainer}>
              <video
                ref={videoRef}
                src={videoUrl}
                loop
                muted
                playsInline
                className={styles.video}
              />
              {/* Holographic overlay effects */}
              <div className={styles.hologramScanline} />
              <div className={styles.hologramGlitch} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
