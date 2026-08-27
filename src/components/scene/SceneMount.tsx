"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/**
 * Client-only wrapper for the 3D scene.
 *
 * `ssr: false` in next/dynamic is only legal inside a Client Component, which
 * is why this thin wrapper exists at all — WebGL has no server equivalent.
 *
 * The canvas is also deferred until the browser is idle. Compiling shaders and
 * building the scene is a long synchronous block on the main thread, and doing
 * it during load competes directly with hydration — it showed up as ~1s of
 * Total Blocking Time. Waiting for idle moves that work after the page is
 * interactive, so text and links respond immediately and the scene fades in a
 * moment later. The 2s timeout guarantees it still mounts on a busy main
 * thread where idle never arrives.
 */
const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => null,
});

export function SceneMount() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const start = () => setReady(true);

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(start, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }
    // Safari historically lacks requestIdleCallback.
    const timer = window.setTimeout(start, 400);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="scene-layer" aria-hidden>
      {ready && <Scene />}
    </div>
  );
}
