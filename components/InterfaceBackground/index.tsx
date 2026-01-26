"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Leva, useControls } from "leva";
import { useEffect, useRef, useMemo } from "react";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import gsap from "gsap";
import * as THREE from "three";
import { ParticlesWebGPU } from "./ParticlesWebGPU";

// Color variants type
export type ColorVariant = "default" | "secondary";

// Color palettes
const COLOR_PALETTES: Record<
  ColorVariant,
  {
    particleColor: string;
    fogColor: string;
    centerLineColor: string;
    gridColor: string;
    backgroundColor: string;
  }
> = {
  default: {
    particleColor: "#d692eb",
    fogColor: "#332239",
    centerLineColor: "#db97d2",
    gridColor: "#db97d2",
    backgroundColor: "#332239",
  },
  secondary: {
    particleColor: "#a0b4be",
    fogColor: "#28373e",
    centerLineColor: "#a0b4be",
    gridColor: "#a0b4be",
    backgroundColor: "#28373e",
  },
};

function ColorVignetteOverlay({
  color,
  intensity,
}: {
  color: string;
  intensity: number;
}) {
  const { viewport } = useThree();

  const vignetteShader = useMemo(
    () => ({
      uniforms: {
        uColor: { value: new THREE.Color(color) },
        uIntensity: { value: intensity },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uIntensity;
        varying vec2 vUv;

        void main() {
          vec2 center = vec2(0.5, 0.5);
          float dist = distance(vUv, center);
          float vignette = smoothstep(0.3, 1.2, dist);

          gl_FragColor = vec4(uColor, vignette * uIntensity);
        }
      `,
    }),
    [color, intensity]
  );

  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uColor.value = new THREE.Color(color);
      materialRef.current.uniforms.uIntensity.value = intensity;
    }
  }, [color, intensity]);

  return (
    <mesh position={[0, 0, 15]}>
      <planeGeometry args={[viewport.width, viewport.height]} />
      <shaderMaterial
        ref={materialRef}
        attach="material"
        {...vignetteShader}
        transparent
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

function SceneContent({
  backgroundColor,
  carouselRotation,
  colorVariant = "default",
}: {
  backgroundColor: string;
  carouselRotation: { direction: number; timestamp: number };
  colorVariant?: ColorVariant;
}) {
  const palette = COLOR_PALETTES[colorVariant];
  const {
    gridSize,
    gridDivisions,
    gridColor,
    centerLineColor,
    gridOpacity,
    gridHeight,
    rotationX,
    rotationY,
    rotationZ,
    carouselRotationIntensity,
    carouselRotationMomentum,
    enableCarouselRotation,
  } = useControls(
    `Interface BG - Grid 3D (${colorVariant})`,
    {
      gridSize: {
        value: 80,
        min: 10,
        max: 200,
        step: 10,
        label: "Grid Size",
      },
      gridDivisions: {
        value: 40,
        min: 10,
        max: 100,
        step: 10,
        label: "Grid Divisions",
      },
      gridColor: {
        value: palette.gridColor,
        label: "Grid Color",
      },
      centerLineColor: {
        value: palette.centerLineColor,
        label: "Center Line Color",
      },
      gridOpacity: {
        value: colorVariant === "secondary" ? 0.5 : 0.7,
        min: 0,
        max: 1,
        step: 0.1,
        label: "Grid Opacity",
      },
      gridHeight: {
        value: colorVariant === "secondary" ? 2.5 : -4.5,
        min: -10,
        max: 10,
        step: 0.5,
        label: "Grid Height",
      },
      rotationX: {
        value: colorVariant === "secondary" ? 0.15 : 0,
        min: -Math.PI,
        max: Math.PI,
        step: 0.01,
        label: "Rotation X",
      },
      rotationY: {
        value: colorVariant === "secondary" ? 0.4 : 0,
        min: -Math.PI,
        max: Math.PI,
        step: 0.1,
        label: "Rotation Y",
      },
      rotationZ: {
        value: 0,
        min: -Math.PI,
        max: Math.PI,
        step: 0.1,
        label: "Rotation Z",
      },
      enableCarouselRotation: {
        value: true,
        label: "Enable Carousel Rotation",
      },
      carouselRotationIntensity: {
        value: 0.28,
        min: 0,
        max: 1,
        step: 0.01,
        label: "Carousel Rotation Intensity",
      },
      carouselRotationMomentum: {
        value: 0.9,
        min: 0.3,
        max: 3,
        step: 0.1,
        label: "Rotation Momentum",
      },
    },
    { collapsed: true }
  );

  // Controles del Fog
  const { fogColor, fogNear, fogFar, fogEnabled } = useControls(
    `Interface BG - Fog (${colorVariant})`,
    {
      fogEnabled: {
        value: true,
        label: "Enable Fog",
      },
      fogColor: {
        value: palette.fogColor,
        label: "Fog Color",
      },
      fogNear: {
        // value: 5,
        value: 18,
        min: 0,
        max: 50,
        step: 1,
        label: "Fog Near",
      },
      fogFar: {
        // value: 35,
        value: 45,
        min: 10,
        max: 200,
        step: 5,
        label: "Fog Far",
      },
    },
    { collapsed: true }
  );

  // Controles del Bloom
  const { bloomIntensity, bloomLuminanceThreshold, bloomRadius } = useControls(
    `Interface BG - Bloom (${colorVariant})`,
    {
      bloomIntensity: {
        value: 2,
        min: 0,
        max: 5,
        step: 0.1,
        label: "Bloom Intensity",
      },
      bloomLuminanceThreshold: {
        value: 0.3,
        min: 0,
        max: 1,
        step: 0.05,
        label: "Luminance Threshold",
      },
      bloomRadius: {
        value: 0.7,
        min: 0,
        max: 2,
        step: 0.1,
        label: "Bloom Radius",
      },
    },
    { collapsed: true }
  );

  // Controles de la cámara
  const { cameraY, cameraZ, lookAtY } = useControls(
    `Interface BG - Camera (${colorVariant})`,
    {
      cameraY: {
        value: 7,
        min: 0,
        max: 30,
        step: 1,
        label: "Camera Y",
      },
      cameraZ: {
        value: 12,
        min: 0,
        max: 50,
        step: 1,
        label: "Camera Z",
      },
      lookAtY: {
        value: 6.0,
        min: -10,
        max: 10,
        step: 0.5,
        label: "Look At Y",
      },
    },
    { collapsed: true }
  );

  // Controles del Vignette
  const {
    VignetteOffset,
    VignetteDarkness,
    VignetteOpacity,
    vignetteColor,
    vignetteColorIntensity,
    vignetteBlendMode,
    enableColorVignette,
  } = useControls(
    `Interface BG - Vignette (${colorVariant})`,
    {
      VignetteOffset: {
        value: -0.2,
        min: -10,
        max: 10,
        step: 0.1,
        label: "Offset",
      },
      VignetteDarkness: {
        // value: 0.9,
        value: 1.3,
        min: -10,
        max: 10,
        step: 0.1,
        label: "Darkness",
      },
      VignetteOpacity: {
        value: 0.9,
        min: 0,
        max: 1,
        step: 0.01,
        label: "Opacity",
      },
      enableColorVignette: {
        value: true,
        label: "Enable Color Vignette",
      },
      vignetteColor: {
        value: "#0b0d0f",
        label: "Vignette Color",
      },
      vignetteColorIntensity: {
        value: 0.8,
        min: 0,
        max: 1,
        step: 0.01,
        label: "Color Intensity",
      },
      vignetteBlendMode: {
        value: "DARKEN",
        options: [
          "SKIP",
          "ADD",
          "ALPHA",
          "AVERAGE",
          "COLOR_BURN",
          "COLOR_DODGE",
          "DARKEN",
          "DIFFERENCE",
          "EXCLUSION",
          "LIGHTEN",
          "MULTIPLY",
          "DIVIDE",
          "NEGATION",
          "NORMAL",
          "OVERLAY",
          "REFLECT",
          "SCREEN",
          "SOFT_LIGHT",
          "SUBTRACT",
        ],
        label: "Blend Mode",
      },
    },
    { collapsed: true }
  );

  const { camera, scene } = useThree();
  const gridRef = useRef<THREE.GridHelper>(null);
  const sceneGroupRef = useRef<THREE.Group>(null);
  const carouselRotationRef = useRef({ targetY: 0, currentY: 0 });
  const accumulatedRotationRef = useRef(0);
  const baseCameraPosition = useRef({ x: 0, y: cameraY, z: cameraZ });

  // Actualizar posición base de cámara (sin rotación)
  useEffect(() => {
    baseCameraPosition.current = { x: 0, y: cameraY, z: cameraZ };

    // Si no hay rotación del carousel, setear posición normal
    if (!enableCarouselRotation) {
      camera.position.set(0, cameraY, cameraZ);
      camera.lookAt(0, lookAtY, 0);
    }
  }, [camera, cameraY, cameraZ, lookAtY, enableCarouselRotation]);

  // Aplicar background color a la escena 3D (no CSS)
  useEffect(() => {
    scene.background = new THREE.Color(backgroundColor);
  }, [scene, backgroundColor]);

  // Actualizar colores y opacidad del grid
  useEffect(() => {
    if (gridRef.current) {
      const grid = gridRef.current;
      // El gridHelper tiene material.color (líneas del grid) y material en array
      if (grid.material) {
        if (Array.isArray(grid.material)) {
          // Primer material = líneas centrales, segundo = líneas del grid
          grid.material[0].color.set(centerLineColor);
          grid.material[0].opacity = gridOpacity;
          grid.material[1].color.set(gridColor);
          grid.material[1].opacity = gridOpacity;
        } else {
          // @ts-ignore
          grid.material.color.set(gridColor);
          // @ts-ignore
          grid.material.opacity = gridOpacity;
        }
      }
    }
  }, [gridColor, centerLineColor, gridOpacity]);

  // Setear rotación base del grid
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.rotation.set(rotationX, rotationY, rotationZ);
    }
  }, [rotationX, rotationY, rotationZ]);

  // Acumular rotación basada en la dirección del carousel
  useEffect(() => {
    if (
      !enableCarouselRotation ||
      carouselRotation.direction === 0 ||
      carouselRotation.timestamp === 0
    )
      return;

    // Acumular rotación basada en dirección (1 = derecha, -1 = izquierda)
    accumulatedRotationRef.current +=
      carouselRotation.direction * carouselRotationIntensity;

    // Actualizar target para que GSAP anime hacia la nueva rotación acumulada
    carouselRotationRef.current.targetY = accumulatedRotationRef.current;
  }, [
    carouselRotation.timestamp,
    enableCarouselRotation,
    carouselRotationIntensity,
  ]);

  // Aplicar rotación con momentum a la cámara
  useEffect(() => {
    if (!enableCarouselRotation) return;

    // Interpolar la rotación actual hacia la target con momentum
    gsap.to(carouselRotationRef.current, {
      currentY: carouselRotationRef.current.targetY,
      duration: carouselRotationMomentum,
      ease: "power2.out",
      onUpdate: () => {
        // Calcular nueva posición de cámara rotando alrededor del origen
        const angle = carouselRotationRef.current.currentY;
        const basePos = baseCameraPosition.current;

        // Rotar la posición de la cámara alrededor del eje Y
        const newX = basePos.x * Math.cos(angle) + basePos.z * Math.sin(angle);
        const newZ = -basePos.x * Math.sin(angle) + basePos.z * Math.cos(angle);

        camera.position.set(newX, basePos.y, newZ);
        camera.lookAt(0, lookAtY, 0);
      },
    });
  }, [
    enableCarouselRotation,
    carouselRotationMomentum,
    lookAtY,
    carouselRotation.timestamp,
    camera,
  ]);

  return (
    <>
      {/* Luz ambiental suave */}
      {/* @ts-ignore */}
      <ambientLight intensity={0.2} />

      {/* Fog */}
      {fogEnabled && <fog attach="fog" args={[fogColor, fogNear, fogFar]} />}

      {/* Grid 3D centrado en el origen */}
      <gridHelper
        ref={gridRef}
        args={[gridSize, gridDivisions, centerLineColor, gridColor]}
        position={[0, gridHeight, 0]}
      />

      {/* Partículas flotantes centradas */}
      <ParticlesWebGPU colorVariant={colorVariant} />

      {/* Overlay de vignette de color (fuera del grupo, siempre frontal) */}
      {enableColorVignette && (
        <ColorVignetteOverlay
          color={vignetteColor}
          intensity={vignetteColorIntensity}
        />
      )}

      {/* Effects */}
      <EffectComposer>
        {/* Vignette Effect */}
        <Vignette
          offset={VignetteOffset}
          darkness={VignetteDarkness}
          eskil={false}
          opacity={VignetteOpacity}
          // @ts-ignore
          blendFunction={BlendFunction[vignetteBlendMode]}
        />
        {/* Bloom Effect */}
        <Bloom
          mipmapBlur={true}
          intensity={bloomIntensity}
          luminanceThreshold={bloomLuminanceThreshold}
          radius={bloomRadius}
        />
      </EffectComposer>
    </>
  );
}

// Componente principal
export default function InterfaceBackground({
  carouselRotation = { direction: 0, timestamp: 0 },
  colorVariant = "default",
}: {
  carouselRotation?: { direction: number; timestamp: number };
  colorVariant?: ColorVariant;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const palette = COLOR_PALETTES[colorVariant];

  // Add colorVariant to folder name to force Leva to treat them as different controls
  const { backgroundColor } = useControls(
    `Interface BG - Background (${colorVariant})`,
    {
      backgroundColor: {
        value: palette.backgroundColor,
        label: "Background Color",
      },
    },
    { collapsed: true }
  );

  return (
    <>
      <Leva collapsed hidden />
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          // background: backgroundColor,
        }}
      >
        <Canvas
          camera={{
            position: [0, 8, 15],
            fov: 50,
          }}
          dpr={1}
        >
          <SceneContent
            backgroundColor={backgroundColor}
            carouselRotation={carouselRotation}
            colorVariant={colorVariant}
          />
        </Canvas>
      </div>
    </>
  );
}
