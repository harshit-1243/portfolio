"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ANCHORS, COLORS } from "../world";
import { frameState, smoothstep } from "@/lib/frameState";
import type { DeviceTier } from "@/lib/useReducedMotion";

/**
 * Real-Time ASL Recognition, as geometry.
 *
 * This is MediaPipe's actual 21-landmark hand topology with its real connection
 * list — not a decorative stand-in that merely suggests a hand. Anyone who has
 * worked with MediaPipe recognises it on sight, and that recognition does more
 * for credibility than abstract particle art would.
 *
 * The surrounding point cloud stands for the ~87K-image training corpus.
 */

/** MediaPipe hand connections, as (from, to) landmark index pairs. */
const CONNECTIONS: [number, number][] = [
  // thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // middle
  [5, 9], [9, 10], [10, 11], [11, 12],
  // ring
  [9, 13], [13, 14], [14, 15], [15, 16],
  // pinky
  [13, 17], [17, 18], [18, 19], [19, 20],
  // palm base
  [0, 17],
];

/**
 * Three hand-authored ASL letter poses in normalised landmark space.
 * Wrist sits at the origin; +Y is toward the fingertips.
 */
const POSES: number[][][] = [
  // A — fist, thumb alongside
  [
    [0, 0, 0], [0.28, 0.16, 0], [0.44, 0.36, 0], [0.5, 0.56, 0], [0.52, 0.74, 0],
    [0.2, 0.62, 0], [0.22, 0.44, 0.04], [0.18, 0.3, 0.06], [0.12, 0.22, 0.04],
    [0.02, 0.66, 0], [0.04, 0.46, 0.04], [0, 0.32, 0.06], [-0.04, 0.24, 0.04],
    [-0.16, 0.64, 0], [-0.16, 0.44, 0.04], [-0.2, 0.32, 0.06], [-0.24, 0.24, 0.04],
    [-0.32, 0.58, 0], [-0.34, 0.42, 0.04], [-0.38, 0.32, 0.05], [-0.42, 0.24, 0.04],
  ],
  // B — flat hand, fingers extended, thumb folded across the palm
  [
    [0, 0, 0], [0.26, 0.14, 0.02], [0.34, 0.32, 0.06], [0.26, 0.44, 0.1], [0.16, 0.5, 0.12],
    [0.2, 0.64, 0], [0.22, 0.9, 0], [0.23, 1.08, 0], [0.24, 1.22, 0],
    [0.03, 0.68, 0], [0.03, 0.96, 0], [0.03, 1.16, 0], [0.03, 1.32, 0],
    [-0.14, 0.66, 0], [-0.15, 0.92, 0], [-0.16, 1.12, 0], [-0.17, 1.27, 0],
    [-0.31, 0.6, 0], [-0.34, 0.82, 0], [-0.36, 0.98, 0], [-0.38, 1.11, 0],
  ],
  // V — index and middle extended in a splay, the rest closed
  [
    [0, 0, 0], [0.28, 0.16, 0], [0.44, 0.34, 0], [0.46, 0.52, 0], [0.42, 0.66, 0],
    [0.2, 0.64, 0], [0.3, 0.9, 0], [0.37, 1.08, 0], [0.43, 1.24, 0],
    [0.03, 0.68, 0], [0.0, 0.96, 0], [-0.02, 1.16, 0], [-0.04, 1.32, 0],
    [-0.14, 0.66, 0], [-0.12, 0.48, 0.05], [-0.16, 0.36, 0.07], [-0.2, 0.28, 0.05],
    [-0.31, 0.6, 0], [-0.3, 0.44, 0.05], [-0.34, 0.34, 0.06], [-0.38, 0.26, 0.05],
  ],
];

const HOLD = 2.6;
const BLEND = 0.9;
const CYCLE = HOLD + BLEND;

export function HandCloud({ tier }: { tier: DeviceTier }) {
  const group = useRef<THREE.Group>(null);
  const jointsRef = useRef<THREE.InstancedMesh>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const cloudRef = useRef<THREE.Points>(null);

  const count = tier === "high" ? 4200 : 1200;

  // Corpus cloud. Summed uniforms approximate a Gaussian, so the density falls
  // off from the hand instead of filling a hard-edged box.
  const cloudGeom = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const gauss = () =>
      ((Math.random() + Math.random() + Math.random() + Math.random()) / 4 - 0.5) * 2;
    for (let i = 0; i < count; i++) {
      pos[i * 3] = gauss() * 3.4;
      pos[i * 3 + 1] = gauss() * 2.4 + 0.6;
      pos[i * 3 + 2] = gauss() * 3.4;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count]);

  const lineGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(CONNECTIONS.length * 6), 3)
    );
    return g;
  }, []);

  const scratch = useMemo(
    () => ({ m: new THREE.Matrix4(), v: new THREE.Vector3(), blended: [] as number[][] }),
    []
  );

  useFrame((state) => {
    const g = group.current;
    if (!g) return;

    // Fade in over the research section's scroll range.
    const vis = smoothstep(0.16, 0.34, frameState.progress);
    g.visible = vis > 0.001;
    if (!g.visible) return;
    g.scale.setScalar(2.6 * (0.85 + vis * 0.15));

    const t = state.clock.elapsedTime;
    const phase = (t % (CYCLE * POSES.length)) / CYCLE;
    const idx = Math.floor(phase);
    const local = phase - idx;
    // Hold, then a smoothstep crossfade into the next pose.
    const blend = smoothstep(HOLD / CYCLE, 1, local);
    const from = POSES[idx % POSES.length];
    const to = POSES[(idx + 1) % POSES.length];

    const joints = jointsRef.current;
    const linePos = lineGeom.getAttribute("position") as THREE.BufferAttribute;
    const pts: number[][] = [];

    for (let i = 0; i < 21; i++) {
      const x = from[i][0] + (to[i][0] - from[i][0]) * blend;
      const y = from[i][1] + (to[i][1] - from[i][1]) * blend;
      const z = from[i][2] + (to[i][2] - from[i][2]) * blend;
      pts.push([x, y, z]);
      if (joints) {
        scratch.m.makeTranslation(x, y, z);
        joints.setMatrixAt(i, scratch.m);
      }
    }
    if (joints) joints.instanceMatrix.needsUpdate = true;

    for (let c = 0; c < CONNECTIONS.length; c++) {
      const [a, b] = CONNECTIONS[c];
      linePos.setXYZ(c * 2, pts[a][0], pts[a][1], pts[a][2]);
      linePos.setXYZ(c * 2 + 1, pts[b][0], pts[b][1], pts[b][2]);
    }
    linePos.needsUpdate = true;

    (linesRef.current?.material as THREE.LineBasicMaterial).opacity = vis * 0.9;
    (cloudRef.current?.material as THREE.PointsMaterial).opacity = vis * 0.32;
    g.rotation.y = Math.sin(t * 0.12) * 0.35 - 0.2;
  });

  return (
    <group ref={group} position={ANCHORS.hand} visible={false}>
      <points ref={cloudRef} geometry={cloudGeom}>
        <pointsMaterial
          size={0.035}
          color={COLORS.secondary}
          transparent
          opacity={0}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <instancedMesh ref={jointsRef} args={[undefined, undefined, 21]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshBasicMaterial color={COLORS.primary} />
      </instancedMesh>

      <lineSegments ref={linesRef} geometry={lineGeom}>
        <lineBasicMaterial color={COLORS.primary} transparent opacity={0} />
      </lineSegments>
    </group>
  );
}
