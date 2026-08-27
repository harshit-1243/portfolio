"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ANCHORS, COLORS } from "../world";
import { damp, frameState, smoothstep } from "@/lib/frameState";

/**
 * The avatar: the human anchor the whole scene orbits.
 *
 * Procedural, not a loaded model. Each body part is a solid dark mesh with a
 * lime wireframe shell layered over it, which reads as a hologram rather than
 * as untextured geometry — a bare shaded mesh with no proper light rig and no
 * texture looks like a mistake, while this looks deliberate and matches the
 * data-viz language the rest of the scene speaks.
 *
 * Idle motion is three independent sine waves at deliberately unrelated
 * frequencies (breath, weight shift, arm sway). Sharing one frequency makes a
 * figure pulse like a single mechanism; detuning them reads as alive.
 *
 * SWAPPING IN A REAL RIGGED MODEL — four steps, fully contained:
 *   1. Export a rigged half-body avatar from Ready Player Me, plus a Mixamo
 *      idle clip.
 *   2. npx gltf-transform optimize in.glb public/models/avatar.glb
 *      (draco-compressed, lands around 1.5-2.5 MB)
 *   3. Replace the <group> body block below with useGLTF + useAnimations.
 *   4. Keep the head-tracking block, retargeted onto the model's Head bone.
 *
 * Nothing else in the scene reads from this file except its position, so the
 * swap cannot cascade.
 */

/**
 * Solid core plus wireframe shell, so every limb reads with depth.
 *
 * `children` must be a geometry ELEMENT (e.g. <capsuleGeometry args={...} />),
 * not a <primitive object={...} />. Rendering the same element in both meshes
 * instantiates two independent geometries, which is what we want: sharing one
 * THREE.BufferGeometry across meshes lets R3F's automatic disposal free it when
 * either mesh unmounts, silently blanking the other.
 */
function Part({
  position,
  rotation,
  children,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  children: React.ReactNode;
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        {children}
        <meshBasicMaterial color="#0a0f14" transparent opacity={0.92} />
      </mesh>
      <mesh>
        {children}
        <meshBasicMaterial color={COLORS.secondary} wireframe transparent opacity={0.42} />
      </mesh>
    </group>
  );
}

export function AvatarAnchor({ trackPointer }: { trackPointer: boolean }) {
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const look = useRef({ x: 0, y: 0 });

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 1 / 30);
    const t = state.clock.elapsedTime;

    // Recedes rather than vanishes: still the thing everything orbits.
    if (group.current) {
      const fade = 1 - smoothstep(0.1, 0.4, frameState.progress) * 0.45;
      group.current.scale.setScalar(fade);
    }

    // Breath, and a slow weight shift on a detuned frequency.
    if (body.current) {
      body.current.scale.set(1, 1 + Math.sin(t * 1.15) * 0.014, 1);
      body.current.position.y = Math.sin(t * 1.15) * 0.008;
      body.current.rotation.z = Math.sin(t * 0.37) * 0.022;
    }

    if (head.current) {
      const targetX = trackPointer ? frameState.pointerY * 0.2 : 0;
      const targetY = trackPointer ? frameState.pointerX * 0.45 : 0;
      look.current.x = damp(look.current.x, targetX, 3.5, dt);
      look.current.y = damp(look.current.y, targetY, 3.5, dt);
      head.current.rotation.x = look.current.x;
      head.current.rotation.y = look.current.y;
      // Slight counter-tilt: the head leads, the neck follows.
      head.current.rotation.z = -look.current.y * 0.12;
    }

    // Arms swing in opposition, offset so they never mirror exactly.
    if (armL.current) armL.current.rotation.x = Math.sin(t * 0.83) * 0.07;
    if (armR.current) armR.current.rotation.x = Math.sin(t * 0.83 + 1.9) * 0.07;

    if (ring.current) {
      ring.current.rotation.z = t * 0.18;
      (ring.current.material as THREE.MeshBasicMaterial).opacity =
        0.2 + Math.sin(t * 0.9) * 0.07;
    }
  });

  return (
    <group ref={group} position={ANCHORS.avatar}>
      <group ref={body}>
        <group ref={head} position={[0, 1.5, 0]}>
          <Part>
            <icosahedronGeometry args={[0.23, 1]} />
          </Part>
          {/* Visor: gives the head a facing direction without modelling a face.
              Sits just proud of the icosahedron's surface (radius 0.23) - any
              closer and the head's own faces clip through it as it turns. */}
          <mesh position={[0, 0.02, 0.235]}>
            <planeGeometry args={[0.26, 0.07]} />
            <meshBasicMaterial color={COLORS.primary} transparent opacity={0.85} />
          </mesh>
        </group>

        <Part position={[0, 1.02, 0]}>
          <capsuleGeometry args={[0.2, 0.42, 5, 12]} />
        </Part>
        <Part position={[0, 0.68, 0]}>
          <capsuleGeometry args={[0.17, 0.1, 4, 10]} />
        </Part>

        <group ref={armL} position={[-0.28, 1.16, 0]}>
          <Part position={[0, -0.2, 0]} rotation={[0, 0, 0.1]}>
            <capsuleGeometry args={[0.062, 0.34, 4, 8]} />
          </Part>
        </group>
        <group ref={armR} position={[0.28, 1.16, 0]}>
          <Part position={[0, -0.2, 0]} rotation={[0, 0, -0.1]}>
            <capsuleGeometry args={[0.062, 0.34, 4, 8]} />
          </Part>
        </group>

        <Part position={[-0.11, 0.34, 0]}>
          <capsuleGeometry args={[0.082, 0.44, 4, 10]} />
        </Part>
        <Part position={[0.11, 0.34, 0]}>
          <capsuleGeometry args={[0.082, 0.44, 4, 10]} />
        </Part>
      </group>

      <mesh ref={ring} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.62, 0.66, 64]} />
        <meshBasicMaterial
          color={COLORS.primary}
          transparent
          opacity={0.22}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
