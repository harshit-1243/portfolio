"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ANCHORS, COLORS } from "../world";
import { damp, frameState, smoothstep } from "@/lib/frameState";

/**
 * The avatar: the human anchor the whole scene orbits.
 *
 * STAND-IN. This currently renders a wireframe figure (icosahedron head,
 * capsule torso and legs, ground ring) with working cursor-tracking and idle
 * breathing. Swapping in a real rigged model is a contained, four-step change:
 *
 *   1. Export a rigged half-body avatar from Ready Player Me, plus a Mixamo
 *      idle clip.
 *   2. npx gltf-transform optimize in.glb public/models/avatar.glb
 *      (draco-compressed, lands around 1.5-2.5 MB)
 *   3. Replace the <group> body block below with useGLTF + useAnimations.
 *   4. Keep the head-tracking block, retargeted onto the model's Head bone.
 *
 * Nothing else in the scene reads from this file except its position, so the
 * swap can't cascade.
 */
export function AvatarAnchor({ trackPointer }: { trackPointer: boolean }) {
  const group = useRef<THREE.Group>(null);
  const head = useRef<THREE.Mesh>(null);
  const torso = useRef<THREE.Mesh>(null);
  const look = useRef({ x: 0, y: 0 });

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 1 / 30);
    const t = state.clock.elapsedTime;

    // Recedes rather than disappears: still visible in the distance as the
    // thing everything orbits.
    const g = group.current;
    if (g) {
      const fade = 1 - smoothstep(0.1, 0.4, frameState.progress) * 0.45;
      g.scale.setScalar(fade);
    }

    if (head.current) {
      const targetX = trackPointer ? frameState.pointerY * 0.22 : 0;
      const targetY = trackPointer ? frameState.pointerX * 0.5 : 0;
      look.current.x = damp(look.current.x, targetX, 3.5, dt);
      look.current.y = damp(look.current.y, targetY, 3.5, dt);
      head.current.rotation.x = look.current.x;
      head.current.rotation.y = look.current.y;
      head.current.position.y = 1.42 + Math.sin(t * 1.1) * 0.012;
    }

    // Idle breathing.
    if (torso.current) {
      torso.current.scale.set(1, 1 + Math.sin(t * 1.1) * 0.012, 1);
    }
  });

  return (
    <group ref={group} position={ANCHORS.avatar}>
      <mesh ref={head} position={[0, 1.42, 0]}>
        <icosahedronGeometry args={[0.26, 1]} />
        <meshBasicMaterial color={COLORS.primary} wireframe transparent opacity={0.85} />
      </mesh>

      <mesh ref={torso} position={[0, 0.82, 0]}>
        <capsuleGeometry args={[0.24, 0.5, 4, 10]} />
        <meshBasicMaterial color={COLORS.secondary} wireframe transparent opacity={0.6} />
      </mesh>

      <mesh position={[-0.12, 0.2, 0]}>
        <capsuleGeometry args={[0.09, 0.42, 4, 8]} />
        <meshBasicMaterial color={COLORS.secondary} wireframe transparent opacity={0.45} />
      </mesh>
      <mesh position={[0.12, 0.2, 0]}>
        <capsuleGeometry args={[0.09, 0.42, 4, 8]} />
        <meshBasicMaterial color={COLORS.secondary} wireframe transparent opacity={0.45} />
      </mesh>

      <mesh position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 0.74, 48]} />
        <meshBasicMaterial color={COLORS.primary} transparent opacity={0.28} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
