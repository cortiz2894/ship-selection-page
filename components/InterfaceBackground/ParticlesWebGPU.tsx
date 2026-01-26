"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useControls } from "leva";
import { ColorVariant } from "./index";

const COLOR_PALETTES = {
  default: {
    particleColor: "#d692eb",
  },
  secondary: {
    particleColor: "#a0b4be",
  },
};

export function ParticlesWebGPU({
  colorVariant,
}: {
  colorVariant: ColorVariant;
}) {
  const palette = COLOR_PALETTES[colorVariant];

  const {
    particleCount,
    particleSize,
    particleSpeed,
    particleSpread,
    particleDepthSpread,
    particlesEnabled,
    particleColor,
    particleEmissiveIntensity,
  } = useControls(
    `Interface BG - Particles (${colorVariant})`,
    {
      particlesEnabled: {
        value: true,
        label: "Enable Particles",
      },
      particleCount: {
        value: 150,
        min: 10,
        max: 500,
        step: 10,
        label: "Particle Count",
      },
      particleSize: {
        value: 0.002,
        min: 0.001,
        max: 0.3,
        step: 0.01,
        label: "Particle Size",
      },
      particleSpeed: {
        value: 0.4,
        min: 0.1,
        max: 2,
        step: 0.1,
        label: "Movement Speed",
      },
      particleSpread: {
        value: 21,
        min: 10,
        max: 100,
        step: 1,
        label: "Area Spread (X)",
      },
      particleDepthSpread: {
        value: 17.0,
        min: 0.5,
        max: 20,
        step: 0.5,
        label: "Depth Spread (Z)",
      },
      particleColor: {
        value: palette.particleColor,
        label: "Particle Color",
      },
      particleEmissiveIntensity: {
        value: 4,
        min: 0,
        max: 10,
        step: 0.5,
        label: "Emissive Intensity",
      },
    },
    { collapsed: true }
  );

  const pointsRef = useRef<THREE.Points>(null);
  const velocitiesRef = useRef<Float32Array | null>(null);
  const opacitiesRef = useRef<Float32Array | null>(null);

  // Initialize particle data
  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3);
    const opacities = new Float32Array(particleCount);

    const color = new THREE.Color(particleColor);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Random initial positions
      positions[i3] = (Math.random() - 0.5) * particleSpread;
      positions[i3 + 1] = Math.random() * 12 - 2;
      positions[i3 + 2] = (Math.random() - 0.5) * particleDepthSpread;

      // Velocities
      velocities[i3] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 1] = Math.random() * 0.01 + 0.005;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.01;

      // Colors
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      // Sizes
      sizes[i] = Math.random() * 0.5 + 0.5;

      // Opacities
      opacities[i] = Math.random() * 0.8 + 0.2;
    }

    velocitiesRef.current = velocities;
    opacitiesRef.current = opacities;

    return { positions, colors, sizes };
  }, [particleCount, particleSpread, particleDepthSpread, particleColor]);

  // Update particle color when it changes
  useEffect(() => {
    if (!pointsRef.current) return;

    const geometry = pointsRef.current.geometry;
    const colorAttribute = geometry.attributes.color as THREE.BufferAttribute;
    const color = new THREE.Color(particleColor);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      colorAttribute.array[i3] = color.r;
      colorAttribute.array[i3 + 1] = color.g;
      colorAttribute.array[i3 + 2] = color.b;
    }

    colorAttribute.needsUpdate = true;
  }, [particleColor, particleCount]);

  // Custom shader material for particles
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: particleSize * 100 },
        uEmissiveIntensity: { value: particleEmissiveIntensity },
      },
      vertexShader: `
        uniform float uSize;
        uniform float uTime;

        attribute float size;
        attribute float opacity;

        varying vec3 vColor;
        varying float vOpacity;

        void main() {
          vColor = color;
          vOpacity = opacity;

          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

          // Pulsating effect
          float pulse = sin(uTime * 2.0 + position.x * 10.0) * 0.1 + 0.9;

          gl_PointSize = uSize * size * pulse * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uEmissiveIntensity;

        varying vec3 vColor;
        varying float vOpacity;

        void main() {
          // Circular particle shape
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);

          if (dist > 0.5) {
            discard;
          }

          // Soft edges
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          alpha *= vOpacity;

          // Emissive glow
          vec3 finalColor = vColor * (1.0 + uEmissiveIntensity);

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
    });
  }, [particleSize, particleEmissiveIntensity]);

  // Update uniforms
  useEffect(() => {
    if (shaderMaterial) {
      shaderMaterial.uniforms.uSize.value = particleSize * 100;
      shaderMaterial.uniforms.uEmissiveIntensity.value =
        particleEmissiveIntensity;
    }
  }, [particleSize, particleEmissiveIntensity, shaderMaterial]);

  // Animation loop
  useFrame((state, delta) => {
    if (!pointsRef.current || !particlesEnabled || !velocitiesRef.current)
      return;

    const geometry = pointsRef.current.geometry;
    const positionAttribute = geometry.attributes
      .position as THREE.BufferAttribute;
    const positions = positionAttribute.array as Float32Array;
    const velocities = velocitiesRef.current;

    // Update shader time
    if (shaderMaterial) {
      shaderMaterial.uniforms.uTime.value = state.clock.elapsedTime;
    }

    // Update particle positions
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Update positions based on velocity
      positions[i3] += velocities[i3] * particleSpeed * delta * 60;
      positions[i3 + 1] += velocities[i3 + 1] * particleSpeed * delta * 60;
      positions[i3 + 2] += velocities[i3 + 2] * particleSpeed * delta * 60;

      // Respawn particles that go out of bounds
      // X axis
      if (positions[i3] > particleSpread / 2) {
        positions[i3] = -particleSpread / 2;
        positions[i3 + 1] = Math.random() * 12 - 2;
      } else if (positions[i3] < -particleSpread / 2) {
        positions[i3] = particleSpread / 2;
        positions[i3 + 1] = Math.random() * 12 - 2;
      }

      // Y axis (main movement direction)
      if (positions[i3 + 1] > 12) {
        positions[i3 + 1] = -2;
        positions[i3] = (Math.random() - 0.5) * particleSpread;
        positions[i3 + 2] = (Math.random() - 0.5) * particleDepthSpread;
      }

      // Z axis
      if (positions[i3 + 2] > particleDepthSpread / 2) {
        positions[i3 + 2] = -particleDepthSpread / 2;
        positions[i3 + 1] = Math.random() * 12 - 2;
      } else if (positions[i3 + 2] < -particleDepthSpread / 2) {
        positions[i3 + 2] = particleDepthSpread / 2;
        positions[i3 + 1] = Math.random() * 12 - 2;
      }
    }

    positionAttribute.needsUpdate = true;
  });

  if (!particlesEnabled) return null;

  return (
    <points ref={pointsRef} material={shaderMaterial}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particleCount}
          array={sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-opacity"
          count={particleCount}
          array={opacitiesRef.current!}
          itemSize={1}
        />
      </bufferGeometry>
    </points>
  );
}
