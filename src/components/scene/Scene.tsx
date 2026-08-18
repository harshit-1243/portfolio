"use client";

import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { COLORS, FOG } from "./world";
import { CameraRig } from "./CameraRig";
import { AvatarAnchor } from "./objects/AvatarAnchor";
import { HandCloud } from "./objects/HandCloud";
import { FeatureSurface } from "./objects/FeatureSurface";
import { RetrievalGraph } from "./objects/RetrievalGraph";
import { useDeviceTier, useReducedMotion } from "@/lib/useReducedMotion";

export default function Scene() {
  const tier = useDeviceTier();
  const reduced = useReducedMotion();

  // Postprocessing is the first thing to go on a weak device, and it's also
  // motion the reduced-motion setting is asking us not to add.
  const post = tier === "high" && !reduced;

  return (
    <Canvas
      // aria-hidden because everything the scene illustrates also exists as
      // real text in the DOM. A screen reader gains nothing from the canvas.
      aria-hidden
      dpr={[1, tier === "high" ? 1.75 : 1.25]}
      gl={{
        antialias: tier === "high",
        powerPreference: "high-performance",
        alpha: false,
      }}
      camera={{ position: [0, 0.6, 7], fov: 42, near: 0.1, far: 200 }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(new THREE.Color(COLORS.bg), 1);
        scene.fog = new THREE.Fog(FOG.color, FOG.near, FOG.far);
      }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 8, 6]} intensity={0.8} color={COLORS.primary} />
      <directionalLight position={[-6, 2, -4]} intensity={0.4} color={COLORS.secondary} />

      <CameraRig parallaxEnabled={!reduced} />

      <AvatarAnchor trackPointer={!reduced} />
      <HandCloud tier={tier} />
      <FeatureSurface tier={tier} />
      <RetrievalGraph tier={tier} />

      <AdaptiveDpr pixelated />

      {post && (
        <EffectComposer>
          <Bloom intensity={0.55} luminanceThreshold={0.35} luminanceSmoothing={0.9} mipmapBlur />
          <Vignette eskil={false} offset={0.22} darkness={0.72} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
