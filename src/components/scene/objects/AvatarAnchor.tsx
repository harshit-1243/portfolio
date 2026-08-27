"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ANCHORS, COLORS } from "../world";
import { damp, frameState, smoothstep } from "@/lib/frameState";
import {
  AVATAR_FRAG,
  AVATAR_VERT,
  type AvatarUniforms,
  createAvatarUniforms,
} from "./avatarMaterial";

/**
 * The avatar: the human anchor the whole scene orbits.
 *
 * Built procedurally rather than loaded from a .glb — deliberately, and it is
 * the one object here that is a figure rather than a diagram.
 *
 * Proportions are roughly seven heads tall, which is the stylised-but-credible
 * range; realistic is 7.5 and heroic is 8, while anything under 6 reads as a
 * toy. Limbs hang in articulated groups so the idle animation rotates joints
 * instead of sliding whole parts around.
 *
 * Idle motion is several sine waves at deliberately unrelated frequencies
 * (breath 1.15Hz, weight shift 0.37Hz, arm sway 0.83Hz). Sharing one frequency
 * makes a figure pulse like a single mechanism; detuning them reads as alive.
 *
 * TO SWAP IN A RIGGED .glb LATER — contained to this file:
 *   1. Export a rigged avatar (Ready Player Me) plus a Mixamo idle clip.
 *   2. npx gltf-transform optimize in.glb public/models/avatar.glb
 *   3. Replace the <group ref={body}> block with useGLTF + useAnimations.
 *   4. Keep the head-tracking block, retargeted onto the Head bone.
 * Nothing else in the scene reads from this file except its position.
 */

/**
 * One body part.
 *
 * Geometry arrives as a child ELEMENT so each mesh instantiates its own — a
 * shared THREE.BufferGeometry gets disposed by R3F when any one mesh using it
 * unmounts, silently blanking the rest. The uniforms object is shared, which is
 * safe because it holds no GPU resource of its own.
 */
function Part({
  uniforms,
  position,
  rotation,
  scale,
  children,
}: {
  uniforms: AvatarUniforms;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  children: React.ReactNode;
}) {
  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      {children}
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={AVATAR_VERT}
        fragmentShader={AVATAR_FRAG}
      />
    </mesh>
  );
}

/** Sizes the figure in frame at the landing stop. */
const BASE_SCALE = 1.25;

export function AvatarAnchor({ trackPointer }: { trackPointer: boolean }) {
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const chest = useRef<THREE.Group>(null);
  const headPivot = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const forearmL = useRef<THREE.Group>(null);
  const forearmR = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const look = useRef({ x: 0, y: 0 });

  const uniforms = useMemo(() => createAvatarUniforms(), []);

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 1 / 30);
    const t = state.clock.elapsedTime;
    uniforms.uTime.value = t;

    // Recedes rather than vanishes: still the thing everything orbits.
    // BASE_SCALE sizes the figure in frame; the scroll term only shrinks it.
    if (group.current) {
      group.current.scale.setScalar(
        BASE_SCALE * (1 - smoothstep(0.1, 0.4, frameState.progress) * 0.45)
      );
    }

    // Breath lifts the chest; weight shifts on a slower, unrelated frequency.
    if (body.current) {
      body.current.position.y = Math.sin(t * 1.15) * 0.009;
      body.current.rotation.z = Math.sin(t * 0.37) * 0.02;
      body.current.rotation.y = Math.sin(t * 0.23) * 0.06;
    }
    if (chest.current) {
      chest.current.scale.set(1 + Math.sin(t * 1.15) * 0.012, 1, 1 + Math.sin(t * 1.15) * 0.02);
    }

    if (headPivot.current) {
      const targetX = trackPointer ? frameState.pointerY * 0.22 : 0;
      const targetY = trackPointer ? frameState.pointerX * 0.5 : 0;
      look.current.x = damp(look.current.x, targetX, 3.5, dt);
      look.current.y = damp(look.current.y, targetY, 3.5, dt);
      headPivot.current.rotation.x = look.current.x;
      headPivot.current.rotation.y = look.current.y;
      headPivot.current.rotation.z = -look.current.y * 0.14;
    }

    // Arms swing in opposition; forearms trail the upper arm slightly, which is
    // what stops the swing looking like a rigid pendulum.
    if (armL.current) armL.current.rotation.x = Math.sin(t * 0.83) * 0.08;
    if (armR.current) armR.current.rotation.x = Math.sin(t * 0.83 + Math.PI) * 0.08;
    if (forearmL.current) forearmL.current.rotation.x = 0.18 + Math.sin(t * 0.83 - 0.5) * 0.05;
    if (forearmR.current) forearmR.current.rotation.x = 0.18 + Math.sin(t * 0.83 + Math.PI - 0.5) * 0.05;

    if (ring.current) {
      ring.current.rotation.z = t * 0.16;
      (ring.current.material as THREE.MeshBasicMaterial).opacity =
        0.18 + Math.sin(t * 0.9) * 0.06;
    }
  });

  return (
    <group ref={group} position={ANCHORS.avatar}>
      <group ref={body}>
        {/* ---- legs ---------------------------------------------------- */}
        {[-1, 1].map((side) => (
          <group key={side} position={[0.085 * side, 0.8, 0]}>
            <Part uniforms={uniforms} position={[0, -0.17, 0]}>
              <capsuleGeometry args={[0.072, 0.3, 6, 14]} />
            </Part>
            <Part uniforms={uniforms} position={[0, -0.52, 0]}>
              <capsuleGeometry args={[0.056, 0.3, 6, 14]} />
            </Part>
            <Part uniforms={uniforms} position={[0, -0.76, 0.035]} scale={[1, 0.6, 1.7]}>
              <sphereGeometry args={[0.062, 12, 10]} />
            </Part>
          </group>
        ))}

        {/* ---- pelvis and torso ---------------------------------------- */}
        <Part uniforms={uniforms} position={[0, 0.88, 0]} scale={[1.05, 1, 0.85]}>
          <capsuleGeometry args={[0.115, 0.06, 6, 16]} />
        </Part>

        <group ref={chest}>
          <Part uniforms={uniforms} position={[0, 1.16, 0]} scale={[1.14, 1, 0.78]}>
            <capsuleGeometry args={[0.113, 0.27, 8, 20]} />
          </Part>
        </group>

        {/* ---- shoulders and arms -------------------------------------- */}
        {[
          { side: -1, arm: armL, fore: forearmL },
          { side: 1, arm: armR, fore: forearmR },
        ].map(({ side, arm, fore }) => (
          <group key={side} position={[0.165 * side, 1.33, 0]}>
            <Part uniforms={uniforms}>
              <sphereGeometry args={[0.058, 14, 12]} />
            </Part>
            <group ref={arm}>
              <Part uniforms={uniforms} position={[0.012 * side, -0.14, 0]}>
                <capsuleGeometry args={[0.043, 0.2, 6, 14]} />
              </Part>
              <group ref={fore} position={[0.02 * side, -0.27, 0]}>
                <Part uniforms={uniforms} position={[0, -0.12, 0]}>
                  <capsuleGeometry args={[0.036, 0.19, 6, 14]} />
                </Part>
                <Part uniforms={uniforms} position={[0, -0.25, 0]} scale={[1, 1.3, 0.6]}>
                  <sphereGeometry args={[0.038, 12, 10]} />
                </Part>
              </group>
            </group>
          </group>
        ))}

        {/* ---- neck and head ------------------------------------------- */}
        <Part uniforms={uniforms} position={[0, 1.43, 0]}>
          <capsuleGeometry args={[0.042, 0.05, 5, 12]} />
        </Part>

        <group ref={headPivot} position={[0, 1.5, 0]}>
          <Part uniforms={uniforms} position={[0, 0.085, 0]} scale={[0.92, 1, 0.95]}>
            <sphereGeometry args={[0.133, 24, 20]} />
          </Part>
          {/* Visor: a facing direction without modelling a face. Sits proud of
              the head's surface so it never clips as the head turns. */}
          <mesh position={[0, 0.09, 0.113]} scale={[1, 1, 1]}>
            <sphereGeometry args={[0.125, 24, 20, Math.PI * 0.32, Math.PI * 0.36, Math.PI * 0.42, Math.PI * 0.16]} />
            <meshBasicMaterial color={COLORS.primary} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>

      {/* ---- ground ring ---------------------------------------------- */}
      <mesh ref={ring} position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.43, 64]} />
        <meshBasicMaterial
          color={COLORS.primary}
          transparent
          opacity={0.18}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
