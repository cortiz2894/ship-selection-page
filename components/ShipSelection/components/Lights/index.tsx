import { useControls } from "leva";

export default function Lights() {
  const directionalLight1Controls = useControls("Directional Light 1", {
    intensity: {
      value: 8.0,
      min: 0,
      max: 10,
      step: 0.1,
      label: "Intensity",
    },
    positionX: {
      value: -2.8,
      min: -10,
      max: 10,
      step: 0.1,
      label: "Position X",
    },
    positionY: {
      value: 0.5,
      min: -10,
      max: 10,
      step: 0.1,
      label: "Position Y",
    },
    positionZ: {
      value: -0.5,
      min: -10,
      max: 10,
      step: 0.1,
      label: "Position Z",
    },
    color: {
      value: "#ffffff",
      label: "Color",
    },
  });

  const directionalLight2Controls = useControls("Directional Light 2", {
    intensity: {
      value: 4.8,
      min: 0,
      max: 10,
      step: 0.1,
      label: "Intensity",
    },
    positionX: {
      value: 4.2,
      min: -10,
      max: 10,
      step: 0.1,
      label: "Position X",
    },
    positionY: {
      value: 3.9,
      min: -10,
      max: 10,
      step: 0.1,
      label: "Position Y",
    },
    positionZ: {
      value: -5,
      min: -10,
      max: 10,
      step: 0.1,
      label: "Position Z",
    },
    color: {
      value: "#ffffff",
      label: "Color",
    },
  });

  const directionalLight3Controls = useControls("Directional Light 3", {
    intensity: {
      value: 0.2,
      min: 0,
      max: 10,
      step: 0.1,
      label: "Intensity",
    },
    positionX: {
      value: 1.1,
      min: -10,
      max: 10,
      step: 0.1,
      label: "Position X",
    },
    positionY: {
      value: -4.5,
      min: -10,
      max: 10,
      step: 0.1,
      label: "Position Y",
    },
    positionZ: {
      value: -5,
      min: -10,
      max: 10,
      step: 0.1,
      label: "Position Z",
    },
    color: {
      value: "#52c4c4",
      label: "Color",
    },
  });

  return (
    <>
      {/* @ts-ignore */}
      <ambientLight intensity={0.5} />
      {/* @ts-ignore */}
      <directionalLight
        position={[
          directionalLight1Controls.positionX,
          directionalLight1Controls.positionY,
          directionalLight1Controls.positionZ,
        ]}
        intensity={directionalLight1Controls.intensity}
        color={directionalLight1Controls.color}
      />
      {/* @ts-ignore */}
      <directionalLight
        position={[
          directionalLight2Controls.positionX,
          directionalLight2Controls.positionY,
          directionalLight2Controls.positionZ,
        ]}
        intensity={directionalLight2Controls.intensity}
        color={directionalLight2Controls.color}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      {/* @ts-ignore */}
      <directionalLight
        position={[
          directionalLight3Controls.positionX,
          directionalLight3Controls.positionY,
          directionalLight3Controls.positionZ,
        ]}
        intensity={directionalLight3Controls.intensity}
        color={directionalLight3Controls.color}
      />
      {/* @ts-ignore */}
      <pointLight position={[-5, 5, 5]} intensity={0.5} />
    </>
  );
}
