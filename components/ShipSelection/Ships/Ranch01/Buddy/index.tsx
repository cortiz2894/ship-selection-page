//@ts-nocheck
import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useControls } from "leva";

export function BuddyRanch01() {
  const { nodes, materials } = useGLTF("/glb/buddy-baked.glb");

  const transformControls = useControls("Buddy Transform", {
    positionX: {
      value: -2.1,
      min: -10,
      max: 10,
      step: 0.1,
      label: "Position X",
    },
    positionY: {
      value: 0.4,
      min: -10,
      max: 10,
      step: 0.1,
      label: "Position Y",
    },
    positionZ: {
      value: 1.7,
      min: -10,
      max: 10,
      step: 0.1,
      label: "Position Z",
    },
    rotationX: {
      value: -0.07,
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
      label: "Rotation X",
    },
    rotationY: {
      value: -0.48,
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
      label: "Rotation Y",
    },
    rotationZ: {
      value: 0.03,
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
      label: "Rotation Z",
    },
    scale: {
      value: 0.8,
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
      <mesh
        castShadow={false}
        receiveShadow={false}
        geometry={nodes.BézierCurve.geometry}
        material={materials.wire}
        position={[0, 0.085, -1.102]}
        rotation={[-0.153, 0, 0]}
      />
      <mesh
        castShadow={false}
        receiveShadow={false}
        geometry={nodes.BézierCurve002.geometry}
        material={materials.wire}
        position={[0.162, 0.386, -1.571]}
        rotation={[-0.153, 0, 0]}
        scale={0.701}
      />
      <mesh
        castShadow={false}
        receiveShadow={false}
        geometry={nodes.Cube028.geometry}
        material={materials.Material}
        position={[0.001, 0.573, -1.599]}
        rotation={[-0.061, 0, 0]}
        scale={[0.907, 0.768, 0.548]}
      />
      <group
        position={[-0.201, 0.824, -1.533]}
        rotation={[0.044, 0, 0]}
        scale={[0.195, 0.012, 0.107]}
      >
        <mesh
          castShadow={false}
          receiveShadow={false}
          geometry={nodes.Cube037.geometry}
          material={materials["Metal-Procedural"]}
        />
        <mesh
          castShadow={false}
          receiveShadow={false}
          geometry={nodes.Cube037_1.geometry}
          material={materials["metal-black"]}
        />
        <mesh
          castShadow={false}
          receiveShadow={false}
          geometry={nodes.Cube037_2.geometry}
          material={materials.Glow}
        />
      </group>
      <mesh
        castShadow={false}
        receiveShadow={false}
        geometry={nodes.Cube040.geometry}
        material={materials["metal-black"]}
        position={[0, 0.837, -2.065]}
        rotation={[0.146, 0, 0]}
        scale={[0.028, 0.044, 0.034]}
      />
      <mesh
        castShadow={false}
        receiveShadow={false}
        geometry={nodes.Cube041.geometry}
        material={materials["metal-black"]}
        position={[0, 0.862, -2.245]}
        rotation={[0.146, 0, 0]}
        scale={[0.028, 0.044, 0.034]}
      />
      <mesh
        castShadow={false}
        receiveShadow={false}
        geometry={nodes.Cube042.geometry}
        material={materials["metal-black"]}
        position={[0, 0.85, -2.153]}
        rotation={[0.146, 0, 0]}
        scale={[0.028, 0.044, 0.034]}
      />
      <mesh
        castShadow={false}
        receiveShadow={false}
        geometry={nodes.Cube043.geometry}
        material={materials["metal-black"]}
        position={[0, 0.823, -1.971]}
        rotation={[0.146, 0, 0]}
        scale={[0.028, 0.044, 0.034]}
      />
      <mesh
        castShadow={false}
        receiveShadow={false}
        geometry={nodes.Cube044.geometry}
        material={materials["metal-black"]}
        position={[0, 0.794, -2.345]}
        rotation={[0.177, 0, 0]}
        scale={[0.123, 0.128, 0.128]}
      />
      <mesh
        castShadow={false}
        receiveShadow={false}
        geometry={nodes.Cube045.geometry}
        material={materials["metal-black"]}
        position={[0, 0.49, -2.194]}
        rotation={[-0.153, 0, 0]}
        scale={0.108}
      />
      <group
        position={[0.257, 0.42, -1.851]}
        rotation={[1.515, -0.145, -0.089]}
        scale={0.082}
      >
        <mesh
          castShadow={false}
          receiveShadow={false}
          geometry={nodes.Cylinder006_1.geometry}
          material={materials["metal-black"]}
        />
        <mesh
          castShadow={false}
          receiveShadow={false}
          geometry={nodes.Cylinder006_2.geometry}
          material={materials.Glow}
        />
      </group>
      <mesh
        castShadow={false}
        receiveShadow={false}
        geometry={nodes.Cylinder006.geometry}
        material={materials["metal-black"]}
        position={[0, 0.683, -2.361]}
        rotation={[-0.153, 0, 0]}
        scale={0.741}
      />
      <mesh
        castShadow={false}
        receiveShadow={false}
        geometry={nodes.Cylinder007.geometry}
        material={materials["metal-black"]}
        position={[0, 0.594, -1.935]}
        rotation={[-0.153, 0, 0]}
        scale={[0.821, 1.064, 1.064]}
      />
      <mesh
        castShadow={false}
        receiveShadow={false}
        geometry={nodes.Cylinder008.geometry}
        material={materials["metal-black"]}
        position={[0, 0.591, -1.934]}
        rotation={[-0.153, 0, 0]}
        scale={[0.865, 0.419, 0.419]}
      />
      <mesh
        castShadow={false}
        receiveShadow={false}
        geometry={nodes.Cylinder009.geometry}
        material={materials["metal-black"]}
        position={[0, 0.608, -2.152]}
        rotation={[-0.153, 0, 0]}
        scale={[0.838, 1.064, 1.064]}
      />
      <mesh
        castShadow={false}
        receiveShadow={false}
        geometry={nodes.Cylinder010.geometry}
        material={materials["metal-black"]}
        position={[0, 0.605, -2.152]}
        rotation={[-0.153, 0, 0]}
        scale={[0.891, 0.419, 0.419]}
      />
      <group
        position={[0.074, 0.786, -2.024]}
        rotation={[0.133, -0.001, -0.058]}
        scale={0.033}
      >
        <mesh
          castShadow={false}
          receiveShadow={false}
          geometry={nodes.Cylinder013_1.geometry}
          material={materials["metal-black"]}
        />
        <mesh
          castShadow={false}
          receiveShadow={false}
          geometry={nodes.Cylinder013_2.geometry}
          material={materials.Glow}
        />
      </group>
      <mesh
        castShadow={false}
        receiveShadow={false}
        geometry={nodes.Plane009.geometry}
        material={materials["metal-black"]}
        position={[0.144, 0.249, -1.626]}
        rotation={[1.174, -0.122, -1.56]}
        scale={0.203}
      />
      <group position={[0, 0.6, -1.452]} rotation={[0.079, 0, 0]}>
        <mesh
          castShadow={false}
          receiveShadow={false}
          geometry={nodes.Cylinder012_1.geometry}
          material={materials["metal-black"]}
        />
        <mesh
          castShadow={false}
          receiveShadow={false}
          geometry={nodes.Cylinder012_2.geometry}
          material={materials.Glow}
        />
        <mesh
          castShadow={false}
          receiveShadow={false}
          geometry={nodes.Cylinder012_3.geometry}
          material={materials["glow-eye"]}
        />
      </group>
      <mesh
        castShadow={false}
        receiveShadow={false}
        geometry={nodes.Cube048.geometry}
        material={materials["metal-black"]}
        position={[0.167, 0.638, -1.687]}
        rotation={[0.079, 0, 0.131]}
      />
      <mesh
        castShadow={false}
        receiveShadow={false}
        geometry={nodes.Cube047.geometry}
        material={materials["metal-black"]}
        position={[0.08, 0.475, -1.56]}
        rotation={[0.666, 0.242, 0.246]}
        scale={[0.059, 0.046, 0.053]}
      />
      <mesh
        castShadow={false}
        receiveShadow={false}
        geometry={nodes.Cylinder013.geometry}
        material={materials["metal-black"]}
        position={[0.122, 0.68, -1.486]}
        rotation={[1.65, 0, 0]}
        scale={0.035}
      />
    </group>
  );
}

useGLTF.preload("/glb/buddy-baked.glb");
