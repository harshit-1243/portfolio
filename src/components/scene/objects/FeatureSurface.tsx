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
 * A 34x34 wireframe feature-importance landscape approximating the model's
 * 35-feature space. The five Gaussian peaks aren't arbitrary: the dominant one
 * is cash-flow quality — the paper's actual headline finding — deliberately
 * scaled so it's unmistakably tallest. The secondary ridges are the correlated
 * ratio families (margin, leverage, growth, valuation) that conventional
 * screens overweight.
 *
 * Wireframe rather than a shaded surface: it stays legible on a dark background
 * without a dedicated light rig, and the visible grid itself communicates
 * "discretised feature space" in a way a smooth surface doesn't.
 */

type Peak = { x: number; y: number; h: number; s: number };

const PEAKS: Peak[] = [
  { x: -0.15, y: 0.1, h: 1.0, s: 0.24 },  // cash-flow quality — dominant
  { x: 0.45, y: -0.3, h: 0.42, s: 0.2 },  // margin family
  { x: -0.55, y: -0.45, h: 0.34, s: 0.22 }, // leverage
  { x: 0.3, y: 0.55, h: 0.3, s: 0.18 },   // growth
  { x: 0.62, y: 0.28, h: 0.22, s: 0.16 }, // valuation
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
      pos.setZ(i, heightAt(u, v) * 3.4);
    }
    plane.computeVertexNormals();
    const wire = new THREE.WireframeGeometry(plane);
    plane.dispose();
    return wire;
  }, [segments]);

  // World-space position of the dominant peak, for the marker.
  const markerPos = useMemo(() => {
    const p = PEAKS[0];
    return new THREE.Vector3(
      (p.x / 2) * size,
      heightAt(p.x, p.y) * 3.4 + 0.55,
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
