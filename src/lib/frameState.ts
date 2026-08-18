/**
 * Shared mutable frame state.
 *
 * Deliberately NOT React state and NOT context. Scroll and pointer events fire
 * at display refresh rate; routing them through React would re-render the tree
 * 60-120 times a second for values only the WebGL layer consumes.
 *
 * Contract:
 *   - The DOM layer (scroll listener, pointer listener) WRITES.
 *   - The WebGL layer READS, inside useFrame — already outside React's render.
 *   - Never read these during render. They change between render and paint,
 *     so anything derived from them during render is wrong by the time it paints.
 */
export const frameState = {
  /** Whole-page scroll progress, 0 at top, 1 at bottom. */
  progress: 0,
  /** Pointer position in normalised device coords, -1..1 on both axes. */
  pointerX: 0,
  pointerY: 0,
  /** Set once the user has scrolled at all; gates the landing hint. */
  hasScrolled: false,
};

/**
 * Frame-rate-independent damping.
 *
 * The naive `current += (target - current) * 0.1` per frame moves faster on a
 * 120Hz display than a 60Hz one. Folding dt through an exponential makes the
 * approach rate depend on elapsed time instead of frame count.
 *
 * @param lambda higher converges faster; 3-6 feels responsive, 1-2 feels heavy.
 */
export function damp(current: number, target: number, lambda: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

export function clamp(v: number, min: number, max: number) {
  return v < min ? min : v > max ? max : v;
}

/** Remap v from [inMin,inMax] onto [outMin,outMax], clamped to the output range. */
export function mapRange(
  v: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
) {
  if (inMax - inMin === 0) return outMin;
  const t = clamp((v - inMin) / (inMax - inMin), 0, 1);
  return outMin + t * (outMax - outMin);
}

/** Hermite ease between two edges. Used for every fade-in in the scene. */
export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1), 0, 1);
  return t * t * (3 - 2 * t);
}
