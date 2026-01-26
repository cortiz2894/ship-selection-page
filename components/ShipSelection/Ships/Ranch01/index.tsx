import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useControls } from "leva";

export function Ranch01() {
  const { nodes, materials } = useGLTF("/glb/rnch01.glb") as any;

  // Controls for Ranch01 transform
  const transformControls = useControls("Ranch01 Transform", {
    positionX: {
      value: -0.3,
      min: -10,
      max: 10,
      step: 0.1,
      label: "Position X",
    },
    positionY: {
      value: -0.4,
      min: -10,
      max: 10,
      step: 0.1,
      label: "Position Y",
    },
    positionZ: {
      value: 0.6,
      min: -10,
      max: 10,
      step: 0.1,
      label: "Position Z",
    },
    rotationX: {
      value: -0.27,
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
      label: "Rotation X",
    },
    rotationY: {
      value: -0.4,
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
      label: "Rotation Y",
    },
    rotationZ: {
      value: -0.11,
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
      label: "Rotation Z",
    },
    scale: {
      value: 1,
      min: 0.1,
      max: 5,
      step: 0.1,
      label: "Scale",
    },
  });

  return (
    <group
      dispose={null}
      position={[
        transformControls.positionX,
        transformControls.positionY,
        transformControls.positionZ,
      ]}
      rotation={[
        transformControls.rotationX,
        transformControls.rotationY,
        transformControls.rotationZ,
      ]}
      scale={transformControls.scale}
    >
      <group
        position={[0.899, 0.456, -0.413]}
        rotation={[0, 0.797, 0]}
        scale={1.206}
      >
        <mesh
          castShadow
          receiveShadow={false}
          geometry={nodes.Cube057.geometry}
          material={materials["base-metal"]}
        />
        <mesh
          castShadow
          receiveShadow={false}
          geometry={nodes.Cube057_1.geometry}
          material={materials.Glow}
        />
      </group>
      <group
        position={[0.354, 0.353, 0.715]}
        rotation={[0.062, -0.068, 0.541]}
        scale={1.248}
      >
        <mesh
          castShadow
          receiveShadow={false}
          geometry={nodes.Cube058.geometry}
          material={materials["base-metal"]}
        />
        <mesh
          castShadow
          receiveShadow={false}
          geometry={nodes.Cube058_1.geometry}
          material={materials.Glow}
        />
      </group>
      <mesh
        castShadow={false}
        receiveShadow={false}
        geometry={nodes["BackLights-LT"].geometry}
        material={materials.Glow}
        position={[1.223, 0.591, -1.534]}
        rotation={[Math.PI, 0, Math.PI]}
        scale={[0.102, 0.115, 0.115]}
      />
      <mesh
        castShadow={false}
        receiveShadow={false}
        geometry={nodes["BackLights-RT"].geometry}
        material={materials.Glow}
        position={[-1.239, 0.591, -1.541]}
        rotation={[Math.PI, 0, Math.PI]}
        scale={[0.102, 0.115, 0.115]}
      />
      <mesh
        castShadow={false}
        receiveShadow={false}
        geometry={nodes["BackLights-RB"].geometry}
        material={materials.Glow}
        position={[-1.233, 0.352, -1.527]}
        rotation={[-Math.PI, 0, 0]}
        scale={[0.102, 0.115, 0.115]}
      />
      <mesh
        castShadow={false}
        receiveShadow={false}
        geometry={nodes.Plane006.geometry}
        material={materials.Glass}
        position={[0.005, 0.693, -0.939]}
        rotation={[-0.05, 0, 0]}
        scale={[0.235, 0.353, 0.539]}
      />
      <mesh
        castShadow
        receiveShadow={false}
        geometry={nodes["BackLights-LB"].geometry}
        material={materials.Glow}
        position={[1.228, 0.343, -1.526]}
        rotation={[Math.PI, 0, Math.PI]}
        scale={[0.102, 0.115, 0.115]}
      />
      <mesh
        castShadow
        receiveShadow={false}
        geometry={nodes.Cube.geometry}
        material={nodes.Cube.material}
        position={[0.481, 0.34, -1.684]}
        scale={0.013}
      />
      <mesh
        castShadow
        receiveShadow={false}
        geometry={nodes.Cube022.geometry}
        material={nodes.Cube022.material}
        position={[0.481, 0.34, -1.108]}
        scale={0.013}
      />
      <mesh
        castShadow
        receiveShadow={false}
        geometry={nodes.Cube023.geometry}
        material={nodes.Cube023.material}
        position={[-0.489, 0.34, -1.684]}
        scale={0.013}
      />
      <mesh
        castShadow
        receiveShadow={false}
        geometry={nodes.Cube027.geometry}
        material={nodes.Cube027.material}
        position={[-0.489, 0.34, -1.108]}
        scale={0.013}
      />
      <mesh
        castShadow={false}
        receiveShadow={false}
        geometry={nodes.Cylinder003.geometry}
        material={materials["Glow.003"]}
        position={[-0.498, 0.27, -1.272]}
        rotation={[0, 0, Math.PI]}
        scale={1.223}
      />
      <mesh
        castShadow={false}
        receiveShadow={false}
        geometry={nodes.Cylinder004.geometry}
        material={materials["Glow.003"]}
        position={[0.48, 0.27, -1.272]}
        scale={1.223}
      />
      <mesh
        castShadow
        receiveShadow={false}
        geometry={nodes.Cylinder003_1.geometry}
        material={materials["Metal-Procedural"]}
      />
      <mesh
        castShadow
        receiveShadow={false}
        geometry={nodes.Cylinder003_2.geometry}
        material={materials["metal-black"]}
      />
      <mesh
        castShadow
        receiveShadow={false}
        geometry={nodes.Cylinder003_3.geometry}
        material={materials.Glow}
      />
    </group>
  );
}

useGLTF.preload("/glb/rnch01.glb");
