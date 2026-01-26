import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useControls } from "leva";
import { BlendFunction } from "postprocessing";

export function Effects() {
  const { bloomIntensity, bloomLuminanceThreshold, bloomRadius } = useControls(
    "Bloom Effect",
    {
      bloomIntensity: {
        value: 0.1,
        min: 0,
        max: 5,
        step: 0.01,
        label: "Intensity",
      },
      bloomLuminanceThreshold: {
        value: 0.9,
        min: 0,
        max: 1,
        step: 0.01,
        label: "Threshold",
      },
      bloomRadius: {
        value: 0.45,
        min: 0,
        max: 1,
        step: 0.001,
        label: "Radius",
      },
    }
  );

  return (
    <EffectComposer>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={bloomLuminanceThreshold}
        radius={bloomRadius}
        blendFunction={BlendFunction.ADD}
        mipmapBlur={true}
      />
    </EffectComposer>
  );
}
