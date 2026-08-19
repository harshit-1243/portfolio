"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ANCHORS, COLORS } from "../world";
import { frameState, smoothstep } from "@/lib/frameState";
import type { DeviceTier } from "@/lib/useReducedMotion";

/**
 * NSE Earnings Prediction, as geometry.
 *
 * A wireframe feature landscape over the study's ratio space. The shape encodes
 * the paper's actual finding, which is a NULL result: financial ratios carry
 * limited predictive signal for annual earnings direction in NSE large-caps.
 *
 * So there is deliberately no dominant peak. The surface is a shallow, ridged
 * noise floor - several comparable low bumps, none winning. An earlier version
 * of this object showed one tall peak, which would have illustrated the
 * opposite of what the research concluded; a portfolio object that contradicts
 * its own paper is worse than no object at all.
 *
 * Wireframe rather than shaded: it stays legible on a dark background without a
 * light rig, and the grid communicates "discretised feature space" directly.
 */

type Peak = { x: number; y: number; h: number; s: number };

const PEAKS: Peak[] = [
  // Comparable magnitudes on purpose: no ratio family dominates. Heights sit in
  // a narrow band so the eye reads "flat and noisy", not "one clear winner".
  { x: -0.15, y: 0.1, h: 0.30, s: 0.22 },
  { x: 0.45, y: -0.3, h: 0.26, s: 0.2 },
  { x: -0.55, y: -0.45, h: 0.28, s: 0.22 },
  { x: 0.3, y: 0.55, h: 0.24, s: 0.18 },
  { x: 0.62, y: 0.28, h: 0.22, s: 0.16 },
  { x: -0.7, y: 0.5, h: 0.25, s: 0.19 },
  { x: 0.05, y: -0.65, h: 0.27, s: 0.2 },
];

function heightAt(u: number, v: number) {
  let h = 0;
  for (const p of PEAKS) {
    const dx = u - p.x;
    const dy = v - p.y;
    h += p.h * Math.exp(-(dx * dx + dy * dy) / (2 * p.s * p.s));
  }
  return h;
}

export function FeatureSurface({ tier }: { tier: DeviceTier }) {
  const group = useRef<THREE.Group>(null);
  const wireRef = useRef<THREE.LineSegments>(null);
  const markerRef = useRef<THREE.Mesh>(null);

  const segments = tier === "high" ? 34 : 20;
  const size = 9;

  const wireGeom = useMemo(() => {
    const plane = new THREE.PlaneGeometry(size, size, segments, segments);
    const pos = plane.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const u = (pos.getX(i) / size) * 2;
      const v = (pos.getY(i) / size) * 2;
      pos.setZ(i, heightAt(u, v) * 2.2);
    }
    plane.computeVertexNormals();
    const wire = new THREE.WireframeGeometry(plane);
    plane.dispose();
    return wire;
  }, [segments]);

  // Marker sits just above the mean height, tracing the baseline the null
  // result establishes rather than singling out any one feature.
  const markerPos = useMemo(() => {
    const p = PEAKS[0];
    return new THREE.Vector3(
      (p.x / 2) * size,
      heightAt(p.x, p.y) * 2.2 + 0.5,
      -(p.y / 2) * size
    );
  }, []);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;

    const vis = smoothstep(0.34, 0.52, frameState.progress);
    g.visible = vis > 0.001;
    if (!g.visible) return;

    const t = state.clock.elapsedTime;
    (wireRef.current?.material as THREE.LineBasicMaterial).opacity = vis * 0.55;

    const marker = markerRef.current;
    if (marker) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 2.2);
      marker.scale.setScalar(0.28 + pulse * 0.12);
      marker.rotation.y = t * 0.7;
      (marker.material as THREE.MeshBasicMaterial).opacity = vis * (0.55 + pulse * 0.45);
    }

    g.rotation.z = Math.sin(t * 0.1) * 0.06;
  });

  return (
    <group ref={group} position={ANCHORS.surface} rotation={[-Math.PI / 2.35, 0, 0.4]} visible={false}>
      <lineSegments ref={wireRef} geometry={wireGeom}>
        <lineBasicMaterial color={COLORS.primary} transparent opacity={0} />
      </lineSegments>

      <mesh ref={markerRef} position={markerPos} rotation={[Math.PI / 2, 0, 0]}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color={COLORS.secondary} transparent opacity={0} />
      </mesh>
    </group>
  );
}
