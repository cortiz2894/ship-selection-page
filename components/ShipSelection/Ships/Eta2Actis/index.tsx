//@ts-nocheck

import React, { useRef, useEffect, useLayoutEffect, useState } from "react";
import { useGLTF, useAnimations, Float } from "@react-three/drei";
import { useControls } from "leva";

interface Eta2ActisProps {
  shouldPlayAnimation?: boolean;
}

export function Eta2Actis({
  shouldPlayAnimation = false,
}: Eta2ActisProps = {}) {
  const { scene, animations } = useGLTF("/glb/ship-eta-2.glb");
  const group = useRef();
  const wingsAnimationPlayed = useRef(false);

  const { actions } = useAnimations(animations, group);

  const animationControls = useControls("Eta2Actis Animation", {
    duration: {
      value: 1,
      min: 0.1,
      max: 5,
      step: 0.1,
      label: "Wings Animation Duration (s)",
    },
    playAnimation: {
      value: false,
      label: "Play Wings Animation (Manual)",
    },
  });
  useLayoutEffect(() => {
    if (scene) {
      scene.traverse((child: any) => {
        if (child.isMesh) {
          child.castShadow = true;
          // child.receiveShadow = true;
          console.log("[Eta2Actis] Shadow enabled for:", child.name);
        }
      });
    }
  }, [scene]);
  // Play wings animation when shouldPlayAnimation becomes true
  useEffect(() => {
    setTimeout(() => {
      if (!wingsAnimationPlayed.current && actions) {
        // Play both wings animations
        const wingsRotation = actions["wings-rotation"];
        const wingsRotation001 = actions["wings-rotation.001"];

        if (wingsRotation) {
          wingsRotation.reset();
          wingsRotation.setLoop(2201, 1); // LoopOnce
          wingsRotation.clampWhenFinished = true;
          wingsRotation.timeScale =
            wingsRotation.getClip().duration / animationControls.duration;
          wingsRotation.play();
          console.log("[Eta2Actis] Playing wings-rotation animation");
        }

        if (wingsRotation001) {
          wingsRotation001.reset();
          wingsRotation001.setLoop(2201, 1); // LoopOnce
          wingsRotation001.clampWhenFinished = true;
          wingsRotation001.timeScale =
            wingsRotation001.getClip().duration / animationControls.duration;
          wingsRotation001.play();
          console.log("[Eta2Actis] Playing wings-rotation.001 animation");
        }

        wingsAnimationPlayed.current = true;
      }
    }, 1100);
  }, [actions, animationControls.duration]);

  // Manual play control (for testing with Leva)
  useEffect(() => {
    if (animationControls.playAnimation && actions) {
      const wingsRotation = actions["wings-rotation"];
      const wingsRotation001 = actions["wings-rotation.001"];

      if (wingsRotation) {
        wingsRotation.reset();
        wingsRotation.play();
      }
      if (wingsRotation001) {
        wingsRotation001.reset();
        wingsRotation001.play();
      }
    }
  }, [animationControls.playAnimation, actions]);

  return (
    <Float
      speed={2}
      autoInvalidate
      rotationIntensity={0.2}
      floatingRange={[-0.05, 0.05]}
    >
      <group
        ref={group}
        rotation={[0, -0.5, 0]}
        position={[0, 0.6, 0.2]}
        scale={0.8}
      >
        <primitive object={scene} />
      </group>
    </Float>
  );
}

useGLTF.preload("/glb/ship-eta-2.glb");
