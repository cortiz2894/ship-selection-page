//@ts-nocheck

import React, { useRef, useMemo, useEffect } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { getSoundManager } from "@/components/SoundEffects";

// Fixed constants (previously from Leva controls)
const BASE_CONFIG = {
  // Metal Material
  metalColor: "#7c7c7c",
  metalness: 0.92,
  roughness: 0.32,
  emissive: "#000000",
  emissiveIntensity: 0,

  // Textures
  useColorMap: true,
  useMetalnessMap: false,
  useNormalMap: true,
  useRoughnessMap: false,
  normalScale: 1,
  textureRepeat: 1.5,

  // Central Base Rotation
  rotationSpeed: 0.2,
  enableRotation: true,

  // Mouse Rotation
  mouseRotationIntensity: 0.3,
  mouseRotationMomentum: 0.11,
  enableMouseRotation: true,

  // Transform
  position: [0, -0.8, 0] as [number, number, number],
  rotation: [-0.11, 2.39, 0] as [number, number, number],
  scale: [0.8, 0.27, 0.8] as [number, number, number],
};

export function BaseModel({
  transitionTimestamp,
}: {
  transitionTimestamp?: number;
}) {
  const { nodes, materials } = useGLTF(
    "/glb/ship-base.glb"
  );

  // Ref for the central base mesh to animate
  const centralBaseRef = useRef<THREE.Mesh>(null);
  // Ref for the base group to apply mouse rotation
  const baseGroupRef = useRef<THREE.Group>(null);
  // Mouse tracking refs
  const mouseX = useRef(0);
  const targetRotationY = useRef(0);
  const currentMouseRotationY = useRef(0);
  // Flag to disable mouse rotation during ship change animation
  const isAnimating = useRef(false);
  // Store the base rotation after animation completes
  const baseRotationOffset = useRef(0);
  // Throttle tracking for mouse events
  const lastMouseUpdate = useRef(0);

  // Load textures
  const [colorMap, metalnessMap, normalMap, roughnessMap] = useTexture([
    "/textures/base/color.jpg",
    "/textures/base/metalness.jpg",
    "/textures/base/normal.jpg",
    "/textures/base/roughness.jpg",
  ]);

  // Configure texture wrapping, repeat, and optimization settings (only once)
  useMemo(() => {
    [colorMap, metalnessMap, normalMap, roughnessMap].forEach((texture) => {
      // Wrapping and repeat
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(BASE_CONFIG.textureRepeat, BASE_CONFIG.textureRepeat);

      // Performance optimizations
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.anisotropy = 4; // Better quality at angles

      // Set proper encoding for color map
      if (texture === colorMap) {
        texture.colorSpace = THREE.SRGBColorSpace;
      }

      texture.needsUpdate = true;
    });
  }, [colorMap, metalnessMap, normalMap, roughnessMap]);

  // Initialize base rotation offset
  useEffect(() => {
    if (baseRotationOffset.current === 0) {
      baseRotationOffset.current = BASE_CONFIG.rotation[1];
    }
  }, []);

  // Track mouse movement for base rotation with throttling
  useEffect(() => {
    if (!BASE_CONFIG.enableMouseRotation) return;

    const THROTTLE_MS = 16; // ~60fps, only update once per frame

    const handleMouseMove = (event: MouseEvent) => {
      const now = performance.now();

      // Throttle: skip if called too soon
      if (now - lastMouseUpdate.current < THROTTLE_MS) return;

      lastMouseUpdate.current = now;

      // Normalize mouse X position to -1 to 1 range
      mouseX.current = (event.clientX / window.innerWidth) * 2 - 1;

      // Calculate target rotation (same direction as mouse)
      targetRotationY.current =
        mouseX.current * BASE_CONFIG.mouseRotationIntensity;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Animate 360° rotation when ship transition starts
  useEffect(() => {
    if (!baseGroupRef.current || !transitionTimestamp) return;

    // Set animating flag to disable mouse rotation
    isAnimating.current = true;

    // Play random rotation sound
    const soundManager = getSoundManager();
    const rotationSounds = ["baseRotation02", "baseRotation03"];
    const randomSound =
      rotationSounds[Math.floor(Math.random() * rotationSounds.length)];

    // Store current rotation (which includes any mouse rotation offset)
    const currentRotationY = baseGroupRef.current.rotation.y;
    const targetRotation = currentRotationY + Math.PI * 2; // 360 degrees
    // Animate rotation with GSAP
    gsap.to(baseGroupRef.current.rotation, {
      y: targetRotation,
      duration: 2,
      delay: 0.1,
      ease: "power2.inOut",
      onStart: () => {
        soundManager.play(randomSound, { volume: 0.3 });
      },

      onComplete: () => {
        // Store the final rotation as the new base offset
        if (baseGroupRef.current) {
          baseRotationOffset.current = baseGroupRef.current.rotation.y;
          // Reset mouse rotation offset since we've incorporated it into base
          currentMouseRotationY.current = 0;
          targetRotationY.current = 0;
        }
        // Re-enable mouse rotation
        isAnimating.current = false;
      },
    });
  }, [transitionTimestamp]);

  // Animate central base rotation and mouse rotation
  useFrame((state, delta) => {
    // Early return if nothing to animate
    if (!BASE_CONFIG.enableRotation && !BASE_CONFIG.enableMouseRotation) return;

    // Skip frame if delta is too small (paused or very slow frame)
    if (delta < 0.001) return;

    // Central base auto-rotation
    if (
      centralBaseRef.current &&
      BASE_CONFIG.enableRotation &&
      BASE_CONFIG.rotationSpeed > 0
    ) {
      centralBaseRef.current.rotation.y += delta * BASE_CONFIG.rotationSpeed;
    }

    // Base mouse rotation (only if not animating ship change)
    if (
      baseGroupRef.current &&
      BASE_CONFIG.enableMouseRotation &&
      !isAnimating.current
    ) {
      // Calculate difference to target
      const diff = Math.abs(
        currentMouseRotationY.current - targetRotationY.current
      );

      // Skip lerp if already very close to target (no visible change)
      if (diff < 0.0001) return;

      // Lerp towards target rotation
      currentMouseRotationY.current = THREE.MathUtils.lerp(
        currentMouseRotationY.current,
        targetRotationY.current,
        BASE_CONFIG.mouseRotationMomentum
      );

      // Apply combined rotation (base offset from animation + mouse rotation)
      baseGroupRef.current.rotation.y =
        baseRotationOffset.current + currentMouseRotationY.current;
    }
  });

  // Create custom metal material ONCE - no dependencies to avoid recreation
  const customMetalMaterial = useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(BASE_CONFIG.metalColor),
      metalness: BASE_CONFIG.metalness,
      roughness: BASE_CONFIG.roughness,
      emissive: new THREE.Color(BASE_CONFIG.emissive),
      emissiveIntensity: BASE_CONFIG.emissiveIntensity,
      // Apply textures based on config
      map: BASE_CONFIG.useColorMap ? colorMap : null,
      metalnessMap: BASE_CONFIG.useMetalnessMap ? metalnessMap : null,
      normalMap: BASE_CONFIG.useNormalMap ? normalMap : null,
      normalScale: new THREE.Vector2(
        BASE_CONFIG.normalScale,
        BASE_CONFIG.normalScale
      ),
      roughnessMap: BASE_CONFIG.useRoughnessMap ? roughnessMap : null,
    });

    return material;
    // Only recreate if textures change (rare)
  }, [colorMap, metalnessMap, normalMap, roughnessMap]);

  return (
    <group dispose={null}>
      <group
        ref={baseGroupRef}
        rotation={BASE_CONFIG.rotation}
        scale={BASE_CONFIG.scale}
        position={BASE_CONFIG.position}
      >
        <mesh
          castShadow={false}
          receiveShadow
          geometry={nodes.Cylinder001.geometry}
          material={customMetalMaterial}
        />
        <mesh
          castShadow={false}
          receiveShadow={false}
          geometry={nodes.Cylinder001_1.geometry}
          material={materials["Material.002"]}
        />
        <mesh
          castShadow={false}
          receiveShadow={false}
          geometry={nodes.Cylinder001_2.geometry}
          material={materials["Material.001"]}
        />
        <mesh
          ref={centralBaseRef}
          castShadow={false}
          receiveShadow
          geometry={nodes.CentralBase.geometry}
          material={customMetalMaterial}
          position={[0, 0.16, 0]}
          scale={[1, 2, 1]}
        />
      </group>
    </group>
  );
}

useGLTF.preload("/glb/ship-base.glb");
