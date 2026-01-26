import { useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function CameraController() {
  const { camera } = useThree();
  const mousePosition = useRef({ x: 0, y: 0 });
  const targetPosition = useRef({ x: 0, y: 2, z: 5 });
  const currentPosition = useRef({ x: 0, y: 2, z: 5 });
  const lookAtTarget = useRef(new THREE.Vector3(0, 0, 0));

  const cameraControls = useControls("Camera Controls", {
    rotationIntensity: {
      value: 1,
      min: 0,
      max: 5,
      step: 0.1,
      label: "Rotation Intensity",
    },
    momentum: {
      value: 0.03,
      min: 0.01,
      max: 0.5,
      step: 0.01,
      label: "Momentum (Smoothing)",
    },
    enableMouseControl: {
      value: true,
      label: "Enable Mouse Control",
    },
    cameraDistance: {
      value: 5,
      min: 2,
      max: 10,
      step: 0.1,
      label: "Camera Distance",
    },
    cameraHeight: {
      value: 2.0,
      min: -5,
      max: 10,
      step: 0.1,
      label: "Camera Height",
    },
    lookAtY: {
      value: -0.4,
      min: -5,
      max: 5,
      step: 0.1,
      label: "Look At Height",
    },
  });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!cameraControls.enableMouseControl) return;

      // Normalize mouse position to -1 to 1 range (only X axis)
      mousePosition.current.x = (event.clientX / window.innerWidth) * 2 - 1;

      // Calculate target position (opposite direction of mouse, only X axis)
      targetPosition.current.x =
        -mousePosition.current.x * cameraControls.rotationIntensity;
      targetPosition.current.y = cameraControls.cameraHeight;
      targetPosition.current.z = cameraControls.cameraDistance;
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [
    cameraControls.enableMouseControl,
    cameraControls.rotationIntensity,
    cameraControls.cameraDistance,
    cameraControls.cameraHeight,
  ]);

  useFrame(() => {
    if (!cameraControls.enableMouseControl) return;

    // Lerp (smooth interpolation) towards target position
    currentPosition.current.x = THREE.MathUtils.lerp(
      currentPosition.current.x,
      targetPosition.current.x,
      cameraControls.momentum
    );
    currentPosition.current.y = THREE.MathUtils.lerp(
      currentPosition.current.y,
      targetPosition.current.y,
      cameraControls.momentum
    );
    currentPosition.current.z = THREE.MathUtils.lerp(
      currentPosition.current.z,
      targetPosition.current.z,
      cameraControls.momentum
    );

    // Apply position to camera
    camera.position.set(
      currentPosition.current.x,
      currentPosition.current.y,
      currentPosition.current.z
    );

    // Always look at the center (base and ship)
    lookAtTarget.current.set(0, cameraControls.lookAtY, 0);
    camera.lookAt(lookAtTarget.current);
  });

  return null;
}
