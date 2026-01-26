"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import styles from "./ShipDescription.module.scss";
import "./cursor.css";
import { Ship } from "@/constants/ships";
import { ChevronRight } from "lucide-react";
import { MenuAudioManager } from "@/utils/audioMenu";

gsap.registerPlugin(TextPlugin);

interface ShipDescriptionProps {
  ship: Ship;
  isTransitioning: boolean;
  onNextShip: () => void;
}

export default function ShipDescription({
  ship,
  isTransitioning,
  onNextShip,
}: ShipDescriptionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const nextButtonShineRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
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
      y: -20,
      duration: 0.3,
      ease: "power2.in",
    });
  }, [isTransitioning]);

  // Animate entrance when ship changes
  useEffect(() => {
    if (
      !containerRef.current ||
      !descriptionRef.current ||
      !nameRef.current ||
      !nextButtonRef.current
    )
      return;

    // Clear description text
    if (descriptionRef.current) {
      descriptionRef.current.innerHTML = "";
    }

    // Animate container entrance
    gsap.fromTo(
      containerRef.current,
      {
        y: -40,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        delay: 0.5,
        ease: "power3.out",
      }
    );

    // Animate name entrance
    gsap.fromTo(
      nameRef.current,
      {
        scale: 0.9,
        opacity: 0,
      },
      {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        delay: 0.8,
        ease: "back.out(1.7)",
      }
    );

    // Animate next button entrance
    gsap.fromTo(
      nextButtonRef.current,
      {
        scale: 0.9,
        opacity: 0,
      },
      {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        delay: 0.8,
        ease: "back.out(1.7)",
      }
    );

    // Typing animation for description
    const timeline = gsap.timeline({ delay: 1.3 });

    timeline.to(descriptionRef.current, {
      duration: 0.6,
      text: {
        value: ship.description,
        delimiter: "",
      },
      ease: "none",
    });
  }, [ship.id, ship.description]);

  const handleMouseEnter = () => {
    if (!isTransitioning) {
      soundManagerRef.current?.play("buttonHover", { volume: 1.5 });

      // Animate shine effect
      if (nextButtonShineRef.current) {
        gsap.fromTo(
          nextButtonShineRef.current,
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

  const handleClick = () => {
    if (!isTransitioning) {
      soundManagerRef.current?.play("buttonConfirm", { volume: 1.5 });
      onNextShip();
    }
  };

  return (
    <div ref={containerRef} className={styles.shipDescription}>
      <div className={styles.headerContainer}>
        {/* Ship Name */}
        <div ref={nameRef} className={styles.nameContainer}>
          <h2 className={styles.shipName}>{ship.displayName}</h2>
        </div>

        {/* Next Ship Button */}
        <button
          ref={nextButtonRef}
          className={styles.nextButton}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          disabled={isTransitioning}
        >
          {/* Shine effect */}
          <div ref={nextButtonShineRef} className={styles.nextButtonShine} />
          <ChevronRight />
        </button>
      </div>

      {/* Description with typing effect */}
      <div className={styles.descriptionContainer}>
        <p ref={descriptionRef} className={styles.description}>
          {/* Text will be animated by GSAP */}
        </p>
      </div>
    </div>
  );
}
