import * as THREE from "three";
import { COLORS } from "../world";

/**
 * Hologram shader for the avatar.
 *
 * Fresnel rim plus travelling scan lines. Opaque on purpose: a translucent body
 * made of a dozen overlapping limbs needs per-fragment sort order that WebGL
 * will not give you, and the result is limbs showing through each other at
 * every angle. Rim lighting alone reads as "hologram" without the artefacts.
 *
 * The rim colour shifts violet→lime with height, so the figure reads as lit
 * from the same palette the rest of the scene uses rather than flatly tinted.
 */
export const AVATAR_VERT = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying vec3 vWorldPos;
  varying float vLocalY;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vLocalY = position.y;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const AVATAR_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3 uCore;
  uniform vec3 uRimLow;
  uniform vec3 uRimHigh;

  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying vec3 vWorldPos;
  varying float vLocalY;

  void main() {
    // Fresnel: facing surfaces stay near-black, grazing angles light up.
    float facing = clamp(dot(vViewDir, normalize(vNormalW)), 0.0, 1.0);
    float rim = pow(1.0 - facing, 2.4);

    // Rim hue tracks height through the scene's two accents.
    float h = clamp((vWorldPos.y - 0.1) / 1.7, 0.0, 1.0);
    vec3 rimColor = mix(uRimLow, uRimHigh, h);

    // Scan lines travelling upward, in world space so they stay put as limbs
    // move rather than sliding around with each part's local frame.
    float scan = 0.5 + 0.5 * sin(vWorldPos.y * 18.0 - uTime * 1.4);
    scan = smoothstep(0.65, 1.0, scan);

    // A slow vertical sweep, brighter than the standing lines.
    float sweep = smoothstep(0.0, 0.06, abs(fract(vWorldPos.y * 0.42 - uTime * 0.10) - 0.5) * -1.0 + 0.06);

    vec3 col = mix(uCore, rimColor, rim);
    // A little ambient so the body core reads as a lit surface rather than a
    // silhouette - pure fresnel leaves everything facing the camera black.
    col += rimColor * 0.07;
    col += rimColor * scan * 0.09;
    col += rimColor * sweep * 0.32;

    gl_FragColor = vec4(col, 1.0);
  }
`;

/**
 * Uniforms are shared by every body part so one write per frame drives them
 * all. Sharing a uniforms OBJECT is safe — unlike sharing a geometry or a
 * material, which R3F may dispose when any one mesh unmounts.
 */
export function createAvatarUniforms() {
  return {
    uTime: { value: 0 },
    uCore: { value: new THREE.Color("#070b10") },
    uRimLow: { value: new THREE.Color(COLORS.secondary) },
    uRimHigh: { value: new THREE.Color(COLORS.primary) },
  };
}

export type AvatarUniforms = ReturnType<typeof createAvatarUniforms>;
