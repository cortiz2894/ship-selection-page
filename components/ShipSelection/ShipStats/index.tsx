"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Image from "next/image";
import styles from "./ShipStats.module.scss";
import { Ship, MAX_STAT_VALUE } from "@/constants/ships";

interface Stat {
  name: string;
  value: number;
  maxValue: number;
}

interface ShipStatsProps {
  ship: Ship;
  isTransitioning: boolean;
}

export default function ShipStats({ ship, isTransitioning }: ShipStatsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<HTMLDivElement[]>([]);

  const stats: Stat[] = [
    { name: "Energy", value: ship.stats.energy, maxValue: MAX_STAT_VALUE },
    { name: "Shield", value: ship.stats.shield, maxValue: MAX_STAT_VALUE },
    { name: "Velocity", value: ship.stats.velocity, maxValue: MAX_STAT_VALUE },
    { name: "Attack", value: ship.stats.attack, maxValue: MAX_STAT_VALUE },
  ];

  // Animate exit when transitioning starts
  useEffect(() => {
    if (!containerRef.current || !isTransitioning) return;

    gsap.to(containerRef.current, {
      delay: 0.5,
      opacity: 0,
      x: -20,
      duration: 0.3,
      ease: "power2.in",
    });
  }, [isTransitioning]);

  // Animate entrance when ship changes
  useEffect(() => {
    if (!containerRef.current) return;

    // Animate container entrance
    gsap.fromTo(
      containerRef.current,
      {
        x: -40,
        opacity: 0,
      },
      {
        x: 0,
        opacity: 1,
        duration: 1,
        delay: 0.5,
        ease: "power3.out",
      }
    );

    // Animate stat bars with stagger
    const validBars = barsRef.current.filter((bar) => bar !== null);

    gsap.fromTo(
      validBars,
      {
        scaleX: 0,
      },
      {
        scaleX: 1,
        duration: 0.8,
        stagger: 0.1,
        delay: 1.5,
        ease: "power2.out",
      }
    );
  }, [ship.id]);

  return (
    <div ref={containerRef} className={styles.shipStats}>
      <div className={styles.statsContainer}>
        {/* Ship Icon */}
        <div className={styles.iconWrapper}>
          <div className={styles.iconContainer}>
            <Image
              src={ship.iconPath}
              alt={ship.displayName}
              width={80}
              height={80}
              className={styles.shipIcon}
            />
          </div>
          {/* <h3 className={styles.shipName}>{ship.displayName}</h3> */}
        </div>

        {/* Stats Bars */}
        <div className={styles.statsGrid}>
          {stats.map((stat, index) => {
            const percentage = (stat.value / stat.maxValue) * 100;

            return (
              <div key={stat.name} className={styles.statRow}>
                <span className={styles.statLabel}>{stat.name}</span>
                <div className={styles.statBarContainer}>
                  <div
                    ref={(el) => {
                      if (el) barsRef.current[index] = el;
                    }}
                    className={styles.statBarFill}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className={styles.statValue}>
                  {stat.value}/{stat.maxValue}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
