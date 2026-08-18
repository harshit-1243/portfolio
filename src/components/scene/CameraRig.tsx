"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { WAYPOINTS } from "./world";
import { clamp, damp, frameState, mapRange } from "@/lib/frameState";

/**
 * Drives the camera along a spline through WAYPOINTS as the page scrolls.
 *
 * Why a spline and not a lerp between waypoint pairs: a straight lerp changes
 * direction abruptly at every waypoint, and that direction change lands exactly
 * when the reader arrives at a section — the worst possible moment for a
 * visible stutter. A Catmull-Rom curve carries momentum through each stop while
 * still passing exactly through it at t = i/(n-1), so section boundaries stay
 * aligned with the even scroll division.
 *
 * FOV and parallax stay piecewise-linear on purpose. They're scalars, and a
 * spline through them would overshoot past the authored range between stops —
 * a wider FOV than any waypoint asked for, for no visual gain.
 */
export function CameraRig({ parallaxEnabled }: { parallaxEnabled: boolean }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;

  const { posCurve, targetCurve } = useMemo(() => {
    const tension = 0.35;
    return {
      posCurve: new THREE.CatmullRomCurve3(
        WAYPOINTS.map((w) => w.pos.clone()),
        false,
        "catmullrom",
        tension
      ),
      targetCurve: new THREE.CatmullRomCurve3(
        WAYPOINTS.map((w) => w.target.clone()),
        false,
        "catmullrom",
        tension
      ),
    };
  }, []);

  // Pre-allocated scratch. Allocating Vector3s inside useFrame means garbage
  // collection pauses at 60fps, which shows up as periodic hitching.
  const scratch = useRef({
    pos: new THREE.Vector3(),
    target: new THREE.Vector3(),
    lookAt: new THREE.Vector3(),
    smoothed: new THREE.Vector3(),
    smoothedLook: new THREE.Vector3(),
    pointer: new THREE.Vector2(),
    initialised: false,
  });

  useFrame((_, rawDelta) => {
    // Cap delta so a backgrounded tab returning doesn't teleport the camera.
    const dt = Math.min(rawDelta, 1 / 30);
    const s = scratch.current;
    const p = clamp(frameState.progress, 0, 1);

    posCurve.getPoint(p, s.pos);
    targetCurve.getPoint(p, s.target);

    // Piecewise-linear scalars across the same normalised parameter.
    const seg = p * (WAYPOINTS.length - 1);
    const i = clamp(Math.floor(seg), 0, WAYPOINTS.length - 2);
    const f = seg - i;
    const fov = THREE.MathUtils.lerp(WAYPOINTS[i].fov, WAYPOINTS[i + 1].fov, f);
    const parallax = THREE.MathUtils.lerp(
      WAYPOINTS[i].parallax,
      WAYPOINTS[i + 1].parallax,
      f
    );

    if (parallaxEnabled) {
      s.pointer.set(frameState.pointerX, frameState.pointerY);
      s.pos.x += s.pointer.x * parallax * 1.6;
      s.pos.y += s.pointer.y * parallax * 0.9;
    }

    // First frame snaps; afterwards it damps, so the opening isn't a swoop in
    // from wherever the default camera happened to be.
    if (!s.initialised) {
      s.smoothed.copy(s.pos);
      s.smoothedLook.copy(s.target);
      s.initialised = true;
    } else {
      s.smoothed.set(
        damp(s.smoothed.x, s.pos.x, 4.5, dt),
        damp(s.smoothed.y, s.pos.y, 4.5, dt),
        damp(s.smoothed.z, s.pos.z, 4.5, dt)
      );
      s.smoothedLook.set(
        damp(s.smoothedLook.x, s.target.x, 3.2, dt),
        damp(s.smoothedLook.y, s.target.y, 3.2, dt),
        damp(s.smoothedLook.z, s.target.z, 3.2, dt)
      );
    }

    camera.position.copy(s.smoothed);
    camera.lookAt(s.smoothedLook);

    const nextFov = damp(camera.fov, fov, 4, dt);
    if (Math.abs(nextFov - camera.fov) > 0.001) {
      camera.fov = nextFov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

/** Scroll progress at which a given section's waypoint is exactly centred. */
export function waypointProgress(index: number) {
  return mapRange(index, 0, WAYPOINTS.length - 1, 0, 1);
}
