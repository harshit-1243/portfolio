"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ANCHORS, COLORS } from "../world";
import { frameState, smoothstep } from "@/lib/frameState";
import type { DeviceTier } from "@/lib/useReducedMotion";

/**
 * FitMentor AI, as geometry.
 *
 * A document lattice with the query node pinned at the centre. Node positions
 * come from Fibonacci-sphere sampling (even angular coverage, no clumping at
 * the poles the way naive spherical random sampling gives you).
 *
 * Edges are built by real k-nearest-neighbour search over those positions, not
 * drawn by hand — it's an actual similarity graph. That's O(n^2), but n <= 130
 * and it runs exactly once at mount, so a spatial index would be complexity for
 * nothing.
 *
 * Radius is biased with a power curve so outer nodes thin out. That's the long
 * tail, which is precisely where the RAG pipeline beat the rule-based baseline.
 */

const K = 3;
const PULSES = 14;

export function RetrievalGraph({ tier }: { tier: DeviceTier }) {
  const group = useRef<THREE.Group>(null);
  const nodesRef = useRef<THREE.InstancedMesh>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);
  const pulsesRef = useRef<THREE.InstancedMesh>(null);

  const nodeCount = tier === "high" ? 130 : 60;

  const { positions, edges, edgeGeom } = useMemo(() => {
    const positions: THREE.Vector3[] = [new THREE.Vector3(0, 0, 0)]; // query node
    const golden = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < nodeCount; i++) {
      const y = 1 - (i / (nodeCount - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      // Power curve biases samples inward; outer shell stays sparse.
      const radius = 2.2 + Math.pow(i / nodeCount, 0.7) * 5.4;
      positions.push(
        new THREE.Vector3(Math.cos(theta) * r * radius, y * radius * 0.72, Math.sin(theta) * r * radius)
      );
    }

    // kNN over the sampled positions.
    const edges: [number, number][] = [];
    const seen = new Set<string>();
    for (let i = 1; i < positions.length; i++) {
      const dists: { j: number; d: number }[] = [];
      for (let j = 1; j < positions.length; j++) {
        if (i === j) continue;
        dists.push({ j, d: positions[i].distanceToSquared(positions[j]) });
      }
      dists.sort((a, b) => a.d - b.d);
      for (let k = 0; k < Math.min(K, dists.length); k++) {
        const j = dists[k].j;
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (seen.has(key)) continue;
        seen.add(key);
        edges.push([i, j]);
      }
      // Inner ring also links back to the query node.
      if (positions[i].length() < 3.6) edges.push([0, i]);
    }

    const geom = new THREE.BufferGeometry();
    const arr = new Float32Array(edges.length * 6);
    edges.forEach(([a, b], i) => {
      arr.set([positions[a].x, positions[a].y, positions[a].z], i * 6);
      arr.set([positions[b].x, positions[b].y, positions[b].z], i * 6 + 3);
    });
    geom.setAttribute("position", new THREE.BufferAttribute(arr, 3));

    return { positions, edges, edgeGeom: geom };
  }, [nodeCount]);

  // Each pulse rides one edge inward, on its own offset.
  const pulseTracks = useMemo(
    () =>
      Array.from({ length: PULSES }, (_, i) => ({
        edge: edges[(i * 7919) % edges.length],
        offset: Math.random(),
        speed: 0.25 + Math.random() * 0.3,
      })),
    [edges]
  );

  const scratch = useMemo(() => ({ m: new THREE.Matrix4(), v: new THREE.Vector3() }), []);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;

    const vis = smoothstep(0.55, 0.76, frameState.progress);
    g.visible = vis > 0.001;
    if (!g.visible) return;

    const t = state.clock.elapsedTime;

    const nodes = nodesRef.current;
    if (nodes) {
      for (let i = 0; i < positions.length; i++) {
        const p = positions[i];
        const s = i === 0 ? 0.22 + Math.sin(t * 2) * 0.03 : 0.055;
        scratch.m.makeScale(s, s, s);
        scratch.m.setPosition(p.x, p.y, p.z);
        nodes.setMatrixAt(i, scratch.m);
      }
      nodes.instanceMatrix.needsUpdate = true;
    }

    const pulses = pulsesRef.current;
    if (pulses) {
      pulseTracks.forEach((track, i) => {
        if (!track.edge) return;
        const [a, b] = track.edge;
        // Travel from the outer end toward the inner one: retrieval resolving.
        const outer = positions[a].length() > positions[b].length() ? a : b;
        const inner = outer === a ? b : a;
        const f = (t * track.speed + track.offset) % 1;
        scratch.v.lerpVectors(positions[outer], positions[inner], f);
        const s = 0.09 * (1 - f * 0.5);
        scratch.m.makeScale(s, s, s);
        scratch.m.setPosition(scratch.v.x, scratch.v.y, scratch.v.z);
        pulses.setMatrixAt(i, scratch.m);
      });
      pulses.instanceMatrix.needsUpdate = true;
    }

    (edgesRef.current?.material as THREE.LineBasicMaterial).opacity = vis * 0.2;
    g.rotation.y = t * 0.05;
  });

  return (
    <group ref={group} position={ANCHORS.graph} visible={false}>
      <lineSegments ref={edgesRef} geometry={edgeGeom}>
        <lineBasicMaterial color={COLORS.dim} transparent opacity={0} />
      </lineSegments>

      <instancedMesh ref={nodesRef} args={[undefined, undefined, positions.length]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color={COLORS.secondary} />
      </instancedMesh>

      <instancedMesh ref={pulsesRef} args={[undefined, undefined, PULSES]}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial color={COLORS.primary} />
      </instancedMesh>
    </group>
  );
}
