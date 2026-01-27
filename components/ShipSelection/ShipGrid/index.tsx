"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Image from "next/image";
import styles from "./ShipGrid.module.scss";
import { SHIPS, Ship } from "@/constants/ships";
import { Lock } from "lucide-react";
import { MenuAudioManager } from "@/utils/audioMenu";

interface ShipGridProps {
  selectedShipId: string;
  onShipSelect: (shipId: string) => void;
  isTransitioning?: boolean;
}

export default function ShipGrid({
  selectedShipId,
  onShipSelect,
  isTransitioning,
}: ShipGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement[]>([]);
  const shineRefs = useRef<HTMLDivElement[]>([]);
  const soundManagerRef = useRef<MenuAudioManager | null>(null);

  // Initialize MenuAudioManager
  useEffect(() => {
    if (typeof window !== "undefined") {
      soundManagerRef.current = MenuAudioManager.getInstance();
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    // Animate container entrance
    gsap.to(containerRef.current, {
      x: 0,
      delay: 1,
      opacity: 1,
      duration: 1,
      ease: "power3.out",
    });

    // Animate items with stagger - filter out null/undefined elements
    const validItems = itemsRef.current.filter(
      (item) => item !== null && item !== undefined
    );

    gsap.fromTo(
      validItems,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration: 0.5,
        stagger: 0.15,
        ease: "power2.out",
        delay: 1.5,
      }
    );
  }, []);

  const handleMouseEnter = (ship: Ship, index: number) => {
    // Only play hover sound for unlocked ships
    if (ship.isUnlocked) {
      soundManagerRef.current?.play("buttonHover", { volume: 1.5 });

      // Animate shine effect
      const shineEl = shineRefs.current[index];
      if (shineEl) {
        gsap.fromTo(
          shineEl,
          {
            x: "-150%",
          },
          {
            x: "150%",
            duration: 1.2,
            ease: "power2.out",
          }
        );
      }
    }
  };

  const handleShipClick = (ship: Ship) => {
    if (ship.isUnlocked) {
      soundManagerRef.current?.play("buttonConfirm", { volume: 1.5 });
      onShipSelect(ship.id);
    }
  };

  return (
    <div ref={containerRef} className={styles.shipGrid}>
      <div className={styles.gridContainer}>
        <h5 className="text-base md:text-lg font-[500] font-akatab uppercase text-[#67e4e4] mb-2">
          SHIPS
        </h5>
        <div className="flex flex-col gap-2">
          {SHIPS.map((ship, index) => {
            const isSelected = ship.id === selectedShipId;

            return (
              <div
                key={ship.id}
                ref={(el) => {
                  if (el) itemsRef.current[index] = el;
                }}
                className={`${styles.shipItem} ${
                  ship.isUnlocked ? styles.unlocked : styles.locked
                } ${isSelected ? styles.selected : ""}`}
                onClick={() => handleShipClick(ship)}
                onMouseEnter={() => handleMouseEnter(ship, index)}
              >
                {/* Shine effect */}
                {ship.isUnlocked && (
                  <div
                    ref={(el) => {
                      if (el) shineRefs.current[index] = el;
                    }}
                    className={styles.shipItemShine}
                  />
                )}
                <div className={styles.shipContent}>
                  {ship.isUnlocked ? (
                    <>
                      <div className={styles.shipIcon}>
                        <Image
                          src={ship.iconPath}
                          alt={ship.displayName}
                          width={40}
                          height={40}
                          className={styles.shipImage}
                        />
                      </div>
                      <div className={styles.shipInfo}>
                        <p className={styles.shipName}>{ship.displayName}</p>
                        <p className={styles.specialPower}>
                          {ship.specialPower.name}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={styles.lockIcon}>
                        <Lock fontSize={10} />
                      </div>
                      <div className={styles.shipInfo}>
                        <p className={styles.shipName}>NOT ALLOWED</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
