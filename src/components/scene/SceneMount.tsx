"use client";

import dynamic from "next/dynamic";

/**
 * Client-only wrapper for the 3D scene.
 *
 * This file exists solely because `ssr: false` in next/dynamic is only legal
 * inside a Client Component. WebGL has no server equivalent, so the scene must
 * never be part of the server render.
 */
const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => null,
});

export function SceneMount() {
  return (
    <div className="scene-layer" aria-hidden>
      <Scene />
    </div>
  );
}
