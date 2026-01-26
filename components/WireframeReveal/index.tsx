"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import gsap from "gsap";

const wireframeVertex = /* glsl */ `
varying vec3 vPosition;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;
  vPosition = position;
}
`;

const wireframeFragment = /* glsl */ `
uniform float uAlpha;
uniform float uProgress;
uniform float uAlphaNear;
uniform float uAlphaFar;
uniform vec3 uColor;
uniform vec3 uBoundingMin;
uniform vec3 uBoundingMax;

varying vec3 vPosition;

void main() {
  float centerPos = uBoundingMin.x +
   ((abs(uBoundingMax.x - uBoundingMin.x) + (uAlphaFar * 2.0)) * uProgress) -
    uAlphaFar;

  float depth = distance(centerPos, vPosition.x);
  float alpha = max(0., uAlpha - smoothstep(uAlphaNear, uAlphaFar, depth));

  gl_FragColor = vec4(uColor, alpha);
}
`;

interface WireframeRevealProps {
  /**
   * Color del wireframe en formato hex
   */
  wireframeColor?: string;
  /**
   * Duración de la animación en segundos
   */
  duration?: number;
  /**
   * Delay antes de iniciar la animación en segundos
   */
  delay?: number;
  /**
   * Progreso manual del efecto (0-1). Si se proporciona, desactiva la animación automática
   */
  progress?: number;
  /**
   * Distancia near para el efecto de fade
   */
  alphaNear?: number;
  /**
   * Distancia far para el efecto de fade
   */
  alphaFar?: number;
  /**
   * Callback cuando termina la animación
   */
  onComplete?: () => void;
  /**
   * Si es true, reproduce la animación automáticamente
   */
  autoPlay?: boolean;
  /**
   * Children prop to accept React Three Fiber components
   */
  children?: React.ReactNode;
  /**
   * Mode of the animation: 'reveal' shows the model, 'disappear' hides it
   */
  mode?: "reveal" | "disappear";
}

export function WireframeReveal({
  children,
  wireframeColor = "#FFBE18",
  duration = 2,
  delay = 0.2,
  progress: manualProgress,
  alphaNear = 0,
  alphaFar = 1.5,
  onComplete,
  autoPlay = true,
  mode = "reveal",
}: WireframeRevealProps) {
  const groupRef = useRef<THREE.Group>(null);
  const wireframeRef = useRef<THREE.LineSegments>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const [childrenCounter, setChildrenCounter] = useState(0);

  const uniforms = useRef({
    uAlpha: { value: 0 },
    uColor: { value: new THREE.Color(wireframeColor) },
    uProgress: { value: 0 },
    uAlphaNear: { value: alphaNear },
    uAlphaFar: { value: alphaFar },
    uBoundingMin: { value: new THREE.Vector3(0, 0, 0) },
    uBoundingMax: { value: new THREE.Vector3(0, 0, 0) },
  });

  // Update color
  useEffect(() => {
    uniforms.current.uColor.value.set(wireframeColor);
  }, [wireframeColor]);

  // Update parameters
  useEffect(() => {
    uniforms.current.uAlphaNear.value = alphaNear;
    uniforms.current.uAlphaFar.value = alphaFar;
  }, [alphaNear, alphaFar]);

  useEffect(() => {
    console.log(
      "[v0] WireframeReveal: Children changed, cleaning up and resetting animation"
    );

    // Kill existing animation
    if (animationRef.current) {
      animationRef.current.kill();
      animationRef.current = null;
    }

    // Reset uniforms
    uniforms.current.uProgress.value = 0;
    uniforms.current.uAlpha.value = 0;

    // Increment counter
    setChildrenCounter((prev) => prev + 1);
  }, [children]);

  // Apply shader to materials and setup animation
  useEffect(() => {
    if (!groupRef.current) return;

    const targetGroup = groupRef.current;

    const cleanupFunctions: (() => void)[] = [];

    // Function to apply shader to material
    const applyShaderToMaterial = (material: THREE.Material, meshName?: string) => {
      // Store original values
      const originalOnBeforeCompile = (material as any).onBeforeCompile;
      const originalTransparent = material.transparent;
      const originalDepthWrite = material.depthWrite;
      const originalOpacity = material.opacity;

      console.log(`[WireframeReveal] Applying shader to material:`, {
        materialName: material.name,
        meshName,
        originalTransparent,
        originalDepthWrite,
        originalOpacity,
        hasMap: !!(material as any).map,
        hasNormalMap: !!(material as any).normalMap,
      });

      material.transparent = true;
      material.needsUpdate = true;
      (material as any).onBeforeCompile = (shader: any) => {
        shader.vertexShader = shader.vertexShader.replace(
          `#include <clipping_planes_pars_vertex>`,
          `
            #include <clipping_planes_pars_vertex>
            varying vec3 vPosition;
          `
        );

        shader.vertexShader = shader.vertexShader.replace(
          `#include <fog_vertex>`,
          `
            #include <fog_vertex>
            vPosition = position;
          `
        );

        shader.fragmentShader = shader.fragmentShader.replace(
          `#include <clipping_planes_pars_fragment>`,
          `
            #include <clipping_planes_pars_fragment>

            uniform float uAlpha;
            uniform float uProgress;
            uniform float uAlphaNear;
            uniform float uAlphaFar;
            uniform vec3 uWireframeColor;
            uniform vec3 uBoundingMin;
            uniform vec3 uBoundingMax;

            varying vec3 vPosition;
          `
        );

        shader.fragmentShader = shader.fragmentShader.replace(
          `#include <dithering_fragment>`,
          `
            #include <dithering_fragment>

            float diff = uAlphaFar - uAlphaNear;
            float centerPos = uBoundingMin.x - diff;
            float depth = distance(centerPos, vPosition.x);
            float revealProgress = abs(uBoundingMax.x - centerPos) * uProgress;
            float alphaFactor = smoothstep(revealProgress, revealProgress + diff, depth);

            float materialAlpha = gl_FragColor.a;
            float revealAlpha = materialAlpha * (1.0 - alphaFactor);

            gl_FragColor = vec4(
              mix(gl_FragColor.rgb, uWireframeColor, alphaFactor * 0.3),
              revealAlpha
            );
          `
        );

        shader.uniforms.uAlpha = uniforms.current.uAlpha;
        shader.uniforms.uProgress = uniforms.current.uProgress;
        shader.uniforms.uAlphaNear = uniforms.current.uAlphaNear;
        shader.uniforms.uAlphaFar = uniforms.current.uAlphaFar;
        shader.uniforms.uWireframeColor = uniforms.current.uColor;
        shader.uniforms.uBoundingMin = uniforms.current.uBoundingMin;
        shader.uniforms.uBoundingMax = uniforms.current.uBoundingMax;
      };

      cleanupFunctions.push(() => {
        console.log(`[WireframeReveal] Cleaning up material:`, {
          materialName: material.name,
          meshName,
          restoringTransparent: originalTransparent,
          restoringDepthWrite: originalDepthWrite,
          restoringOpacity: originalOpacity,
        });

        (material as any).onBeforeCompile = originalOnBeforeCompile;
        material.transparent = originalTransparent;
        material.depthWrite = originalDepthWrite;
        material.opacity = originalOpacity;
        material.needsUpdate = true;
      });
    };

    // Apply shader to all meshes in the group
    let meshCount = 0;
    targetGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        meshCount++;
        const material = child.material;
        const meshName = child.name || `Mesh_${meshCount}`;

        if (Array.isArray(material)) {
          material.forEach((mat, index) =>
            applyShaderToMaterial(mat, `${meshName}_material_${index}`)
          );
        } else if (material) {
          applyShaderToMaterial(material, meshName);
        }
      }
    });

    console.log(`[v0] WireframeReveal: Applied shader to ${meshCount} meshes`);

    // Calculate bounding box
    const boundingBox = new THREE.Box3();
    let first = true;

    targetGroup.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        child.geometry.computeBoundingBox();
        if (child.geometry.boundingBox) {
          const childBox = child.geometry.boundingBox.clone();
          const worldMatrix = child.matrixWorld.clone();
          childBox.applyMatrix4(worldMatrix);

          if (first) {
            boundingBox.copy(childBox);
            first = false;
          } else {
            boundingBox.union(childBox);
          }
        }
      }
    });

    // Convert to local space
    const groupMatrixInverse = new THREE.Matrix4()
      .copy(targetGroup.matrixWorld)
      .invert();
    boundingBox.applyMatrix4(groupMatrixInverse);

    uniforms.current.uBoundingMin.value.copy(boundingBox.min);
    uniforms.current.uBoundingMax.value.copy(boundingBox.max);

    console.log(
      `[v0] WireframeReveal: Bounding box:`,
      `min: (${boundingBox.min.x.toFixed(2)}, ${boundingBox.min.y.toFixed(
        2
      )}, ${boundingBox.min.z.toFixed(2)})`,
      `max: (${boundingBox.max.x.toFixed(2)}, ${boundingBox.max.y.toFixed(
        2
      )}, ${boundingBox.max.z.toFixed(2)})`
    );

    // Manual progress
    if (manualProgress !== undefined) {
      uniforms.current.uProgress.value = manualProgress;
      uniforms.current.uAlpha.value = 1;
      return;
    }

    if (autoPlay && manualProgress === undefined) {
      // Reset progress before starting
      const startValue = mode === "reveal" ? 0 : 1;
      const endValue = mode === "reveal" ? 1 : 0;

      uniforms.current.uProgress.value = startValue;

      const tween = gsap.fromTo(
        uniforms.current.uProgress,
        { value: startValue },
        {
          value: endValue,
          delay,
          duration,
          ease: "power2.inOut",
          onStart: () => {
            uniforms.current.uAlpha.value = 1;
            console.log(
              `[v0] WireframeReveal: Animation started (${mode} mode)`
            );
          },
          onComplete: () => {
            console.log(
              `[v0] WireframeReveal: Animation completed (${mode} mode)`
            );

            // After reveal completes, disable the shader effect completely
            if (mode === "reveal") {
              uniforms.current.uAlpha.value = 0;

              // Force material updates to ensure they render correctly
              if (groupRef.current) {
                console.log(
                  "[WireframeReveal] onComplete - Checking material states:"
                );

                groupRef.current.traverse((child) => {
                  if (child instanceof THREE.Mesh) {
                    const material = child.material;
                    const meshName = child.name || "unnamed_mesh";

                    if (Array.isArray(material)) {
                      material.forEach((mat, index) => {
                        console.log(
                          `[WireframeReveal] Material state after animation:`,
                          {
                            meshName: `${meshName}_${index}`,
                            materialName: mat.name,
                            transparent: mat.transparent,
                            opacity: mat.opacity,
                            visible: mat.visible,
                            depthWrite: mat.depthWrite,
                            depthTest: mat.depthTest,
                            hasMap: !!(mat as any).map,
                          }
                        );
                        mat.needsUpdate = true;
                      });
                    } else if (material) {
                      console.log(
                        `[WireframeReveal] Material state after animation:`,
                        {
                          meshName,
                          materialName: material.name,
                          transparent: material.transparent,
                          opacity: material.opacity,
                          visible: material.visible,
                          depthWrite: material.depthWrite,
                          depthTest: material.depthTest,
                          hasMap: !!(material as any).map,
                        }
                      );
                      material.needsUpdate = true;
                    }
                  }
                });

                // Additional check after a frame to see final render state
                setTimeout(() => {
                  console.log(
                    "[WireframeReveal] Final state check (after 1 frame):"
                  );
                  groupRef.current?.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                      const meshName = child.name || "unnamed_mesh";
                      const material = child.material;

                      // Check if mesh is potentially invisible
                      let isLikelyInvisible = false;
                      if (Array.isArray(material)) {
                        isLikelyInvisible = material.some(
                          (mat) => mat.opacity === 0 || !mat.visible
                        );
                      } else if (material) {
                        isLikelyInvisible =
                          material.opacity === 0 || !material.visible;
                      }

                      if (isLikelyInvisible) {
                        console.warn(
                          `[WireframeReveal] ⚠️ Potentially invisible mesh:`,
                          {
                            meshName,
                            material: Array.isArray(material)
                              ? material.map((m) => ({
                                  name: m.name,
                                  opacity: m.opacity,
                                  visible: m.visible,
                                  transparent: m.transparent,
                                }))
                              : {
                                  name: material.name,
                                  opacity: material.opacity,
                                  visible: material.visible,
                                  transparent: material.transparent,
                                },
                          }
                        );
                      }
                    }
                  });
                }, 16); // One frame at 60fps
              }
            }

            onComplete?.();
          },
        }
      );

      animationRef.current = tween;

      return () => {
        console.log(
          "[WireframeReveal] Cleaning up animation and materials - running cleanup functions"
        );
        tween.kill();
        animationRef.current = null;
        console.log(
          `[WireframeReveal] Executing ${cleanupFunctions.length} cleanup functions`
        );
        cleanupFunctions.forEach((cleanup, index) => {
          console.log(`[WireframeReveal] Running cleanup function ${index + 1}`);
          cleanup();
        });
        console.log("[WireframeReveal] All cleanup functions completed");
      };
    }

    return () => {
      console.log(
        `[WireframeReveal] Manual cleanup - executing ${cleanupFunctions.length} cleanup functions`
      );
      cleanupFunctions.forEach((cleanup, index) => {
        console.log(`[WireframeReveal] Running manual cleanup ${index + 1}`);
        cleanup();
      });
      console.log("[WireframeReveal] Manual cleanup completed");
    };
  }, [
    children,
    manualProgress,
    autoPlay,
    duration,
    delay,
    onComplete,
    alphaNear,
    alphaFar,
    wireframeColor,
    mode,
  ]);

  const wireframeGeometry = useMemo(() => {
    if (!groupRef.current) return null;

    console.log("[v0] WireframeReveal: Creating new wireframe geometry");

    const geometries: THREE.BufferGeometry[] = [];

    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        const clonedGeometry = child.geometry.clone();
        // Apply the mesh's local matrix relative to the group
        const localMatrix = new THREE.Matrix4();
        let node: THREE.Object3D = child;

        // Build the transformation matrix from the child up to (but not including) the group
        while (node && node !== groupRef.current) {
          localMatrix.premultiply(
            new THREE.Matrix4().compose(
              node.position,
              node.quaternion,
              node.scale
            )
          );
          node = node.parent!;
        }

        clonedGeometry.applyMatrix4(localMatrix);
        geometries.push(clonedGeometry);
      }
    });

    if (geometries.length > 0) {
      try {
        const mergedGeometry = mergeGeometries(geometries, false);
        if (mergedGeometry) {
          const wireframe = new THREE.WireframeGeometry(mergedGeometry);
          console.log(
            `[v0] WireframeReveal: Created wireframe from ${geometries.length} meshes`
          );

          geometries.forEach((geo) => geo.dispose());

          return wireframe;
        }
      } catch (error) {
        console.error("[v0] WireframeReveal: Error merging geometries:", error);
        geometries.forEach((geo) => geo.dispose());
      }
    }
    return null;
  }, [childrenCounter]);

  useEffect(() => {
    return () => {
      if (wireframeGeometry) {
        wireframeGeometry.dispose();
        console.log("[v0] WireframeReveal: Disposed wireframe geometry");
      }
    };
  }, [wireframeGeometry]);

  return (
    <group ref={groupRef}>
      {children}

      {wireframeGeometry && (
        <lineSegments
          ref={wireframeRef}
          geometry={wireframeGeometry}
          key={childrenCounter}
          renderOrder={-1}
        >
          <shaderMaterial
            transparent
            depthWrite={false}
            uniforms={uniforms.current}
            vertexShader={wireframeVertex}
            fragmentShader={wireframeFragment}
          />
        </lineSegments>
      )}
    </group>
  );
}

export function useWireframeReveal() {
  const progressRef = useRef(0);

  const play = (duration = 2, onComplete?: () => void) => {
    gsap.to(progressRef, {
      current: 1,
      duration,
      ease: "power2.inOut",
      onComplete,
    });
  };

  const reset = () => {
    progressRef.current = 0;
  };

  return {
    progress: progressRef.current,
    play,
    reset,
  };
}
