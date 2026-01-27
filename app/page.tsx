
"use client";

import { useRef, Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import InterfaceBackground from "@/components/InterfaceBackground";
import Footer from "@/components/Footer";
import { BaseModel } from "@/components/ShipSelection/BaseModel";
import { Ranch01 } from "@/components/ShipSelection/Ships/Ranch01";
import { Eta2Actis } from "@/components/ShipSelection/Ships/Eta2Actis";

import ShipGrid from "@/components/ShipSelection/ShipGrid";
import ShipStats from "@/components/ShipSelection/ShipStats";
import ShipDescription from "@/components/ShipSelection/ShipDescription";
import ShipFeature from "@/components/ShipSelection/ShipFeature";
import { SHIPS } from "@/constants/ships";
import { Leva } from "leva";
import { Float } from "@react-three/drei";
import { BuddyRanch01 } from "@/components/ShipSelection/Ships/Ranch01/Buddy";
import { WireframeReveal } from "@/components/WireframeReveal";
import Lights from "@/components/ShipSelection/components/Lights";
import CameraController from "@/components/ShipSelection/components/CameraController";
import { Effects } from "@/components/ShipSelection/components/Effects";
import SoundEffects from "@/components/SoundEffects";
import { GameProvider } from "@/context/game-context";
import Loading from "@/components/Loading";

function ShipModel({
  componentName,
  mode,
}: {
  componentName: string;
  mode: "reveal" | "disappear";
}) {
  const shipComponents: Record<
    string,
    React.ComponentType<{ shouldPlayAnimation?: boolean }>
  > = {
    Ranch01: Ranch01,
    Eta2Actis: Eta2Actis,
  };

  const Component = shipComponents[componentName];

  if (!Component) {
    console.warn(`Ship component "${componentName}" not found`);
    return null;
  }

  return (
    <WireframeReveal
      wireframeColor="#67e4e4"
      duration={1.5}
      delay={0}
      autoPlay={true}
      mode={mode}
    >
      <Component />
    </WireframeReveal>
  );
}

function BuddyModel({
  componentName,
  mode,
}: {
  componentName: string;
  mode: "reveal" | "disappear";
}) {
  const groupRef = useRef<THREE.Group>(null);
  const opacityRef = useRef({ value: 1 });

  const buddyComponents: Record<string, React.ComponentType> = {
    BuddyRanch01: BuddyRanch01,
  };

  const Component = buddyComponents[componentName];

  const updateMaterialsOpacity = (opacity: number) => {
    if (!groupRef.current) return;
    groupRef.current.traverse((child) => {
      if ((child as THREE.Mesh).material) {
        const material = (child as THREE.Mesh).material as THREE.Material;
        material.opacity = opacity;
        material.transparent = true;
      }
    });
  };

  useEffect(() => {
    if (!groupRef.current) return;

    if (mode === "disappear") {
      gsap.to(opacityRef.current, {
        value: 0,
        duration: 0.7,
        ease: "power2.in",
        onUpdate: () => updateMaterialsOpacity(opacityRef.current.value),
      });
      gsap.to(groupRef.current.position, {
        z: -2.2,
        y: -1.2,
        duration: 1.5,
        ease: "power2.inOut",
      });
    } else {
      gsap.fromTo(
        groupRef.current.position,
        { z: -2 },
        {
          z: 0,
          duration: 1,
          delay: 0.5,
          ease: "power2.out",
        }
      );
      gsap.fromTo(
        opacityRef.current,
        { value: 0 },
        {
          value: 1,
          duration: 1.5,
          delay: 0.5,
          ease: "power2.out",
          onUpdate: () => updateMaterialsOpacity(opacityRef.current.value),
        }
      );
    }
  }, [mode]);

  if (!Component) {
    console.warn(`Buddy component "${componentName}" not found`);
    return null;
  }

  return (
    <group ref={groupRef}>
      <Float speed={5} rotationIntensity={0.2} floatingRange={[-0.08, 0.08]}>
        <Component />
      </Float>
    </group>
  );
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [selectedShipId, setSelectedShipId] = useState<string>("ranch01");
  const [displayedShipId, setDisplayedShipId] = useState<string>("ranch01");
  const [animationMode, setAnimationMode] = useState<"reveal" | "disappear">(
    "reveal"
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionTimestamp, setTransitionTimestamp] = useState(0);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    setTimeout(() => {
      setIsSceneReady(true);
    }, 100);
  };

  const selectedShip =
    SHIPS.find((ship) => ship.id === selectedShipId) || SHIPS[0];

  const handleShipSelect = (shipId: string) => {
    if (shipId === selectedShipId || isTransitioning) return;

    setIsTransitioning(true);
    setAnimationMode("disappear");
    setTransitionTimestamp(Date.now());

    setTimeout(() => {
      setDisplayedShipId(shipId);
      setSelectedShipId(shipId);
      setAnimationMode("reveal");
      setIsTransitioning(false);
    }, 1500);
  };

  const handleNextShip = () => {
    if (isTransitioning) return;

    const currentIndex = SHIPS.findIndex((ship) => ship.id === selectedShipId);
    let nextIndex = (currentIndex + 1) % SHIPS.length;
    let attempts = 0;

    while (attempts < SHIPS.length) {
      if (SHIPS[nextIndex].isUnlocked) {
        handleShipSelect(SHIPS[nextIndex].id);
        return;
      }
      nextIndex = (nextIndex + 1) % SHIPS.length;
      attempts++;
    }

    console.warn("No unlocked ships found");
  };

  return (
    <GameProvider gameMode="classic" gameState="menu" setGameState={() => {}}>
      <SoundEffects>
        {isLoading && (
          <Loading
            minDuration={3000}
            onLoadingComplete={handleLoadingComplete}
          />
        )}
        <div
          ref={containerRef}
          className="relative w-full h-screen overflow-hidden flex justify-center pt-10 py-20"
        >
          <InterfaceBackground colorVariant="secondary" />

          <div className="w-full m-auto px-5 h-full flex flex-col relative">
            <ShipGrid
              selectedShipId={selectedShipId}
              onShipSelect={handleShipSelect}
            />

            <ShipStats ship={selectedShip} isTransitioning={isTransitioning} />

            <ShipDescription
              ship={selectedShip}
              isTransitioning={isTransitioning}
              onNextShip={handleNextShip}
            />
            <div className="absolute top-[40px] right-[40px] z-10 hidden md:flex flex-col gap-4">
              <ShipFeature
                ship={selectedShip}
                isTransitioning={isTransitioning}
                title={"SPECIAL POWER"}
                featureName={selectedShip.specialPower.name}
                icon={selectedShip.specialPower.iconPath}
                videoUrl="/assets/videos/Tutorial-Hand-Control.mp4"
              />

              <ShipFeature
                ship={selectedShip}
                isTransitioning={isTransitioning}
                title={"BUDDY"}
                featureName={selectedShip.buddy.name}
                icon={"/assets/images/buddy-page-selection-icon.png"}
                videoUrl="/assets/videos/Wave-Progress-Tutorial.mp4"
              />
            </div>

          </div>
          <Leva collapsed/>

          <div className="fixed inset-0 w-screen h-screen pointer-events-none">
            <Canvas
              camera={{ position: [0, 2, 5], fov: 50 }}
              dpr={1.5}
              gl={{ antialias: true }}
              shadows
            >
              <Suspense fallback={null}>
                <CameraController />
                <Lights />

                {isSceneReady && (
                  <ShipModel
                    componentName={
                      SHIPS.find((ship) => ship.id === displayedShipId)
                        ?.component || SHIPS[0].component
                    }
                    mode={animationMode}
                  />
                )}
                <BaseModel transitionTimestamp={transitionTimestamp} />
                <Effects />
              </Suspense>
            </Canvas>
          </div>

          <Footer />
        </div>
      </SoundEffects>
    </GameProvider>
  );
}
