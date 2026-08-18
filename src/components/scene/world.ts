import * as THREE from "three";

/**
 * Spatial layout for the whole scene, in one place.
 *
 * Both the objects and the camera rig import from here. That's the point: if a
 * anchor moves, the camera stop that frames it moves with it, and the two can
 * never drift apart. Editing positions inline in each object component is how
 * you end up with a camera pointing at empty space.
 */

/** Where each object lives in world space. */
export const ANCHORS = {
  avatar: new THREE.Vector3(0, 0, 0),
  hand: new THREE.Vector3(-14, 3, -22),
  surface: new THREE.Vector3(15, -2, -40),
  graph: new THREE.Vector3(-10, 4, -58),
} as const;

export type Waypoint = {
  /** Section this stop belongs to; index must match the section order. */
  id: string;
  pos: THREE.Vector3;
  target: THREE.Vector3;
  fov: number;
  /** How strongly pointer movement pushes the camera at this stop. */
  parallax: number;
};

/**
 * The 7 camera stops, one per page section, in document order.
 *
 * Tuning notes, learned the hard way:
 *   - Keep consecutive positions within ~15 units. Longer jumps read as a cut
 *     rather than a fly, and the spline can't disguise it.
 *   - Never let `target` cross through `pos`. lookAt flips when it does and the
 *     whole world appears to spin on its axis for one frame.
 *   - Parallax should fall off as the camera retreats. Close to the avatar it
 *     reads as the scene responding to you; far out it just looks like drift.
 */
export const WAYPOINTS: Waypoint[] = [
  {
    id: "landing",
    pos: new THREE.Vector3(0, 0.6, 7),
    // Offset in x: the camera looks left of the avatar, which pushes the avatar
    // to the right of frame and clears the headline on the left.
    target: new THREE.Vector3(-2, 0.5, 0),
    fov: 42,
    parallax: 1,
  },
  {
    id: "about",
    pos: new THREE.Vector3(3.5, 2, 1),
    target: new THREE.Vector3(0, 0.4, -6),
    fov: 46,
    parallax: 0.8,
  },
  {
    id: "research",
    pos: new THREE.Vector3(-6, 3.5, -10),
    target: ANCHORS.hand.clone(),
    fov: 50,
    parallax: 0.6,
  },
  {
    id: "projects",
    pos: new THREE.Vector3(4, 1.5, -28),
    target: ANCHORS.surface.clone(),
    fov: 54,
    parallax: 0.45,
  },
  {
    id: "experience",
    pos: new THREE.Vector3(-2, 6, -42),
    target: ANCHORS.graph.clone(),
    fov: 56,
    parallax: 0.35,
  },
  {
    id: "skills",
    pos: new THREE.Vector3(-20, 7, -44),
    target: ANCHORS.graph.clone(),
    fov: 58,
    parallax: 0.25,
  },
  {
    id: "contact",
    // Pulls back and turns to look at the avatar from a distance: the thing
    // everything has been orbiting is still there, small, at the origin.
    pos: new THREE.Vector3(-6, 4, -16),
    // Same trick as the landing stop, but mirrored: this camera sits behind the
    // avatar looking back along +z, which flips screen left/right. A positive
    // x offset is what pushes the avatar clear of the closing headline here.
    target: new THREE.Vector3(3, 0.8, 0),
    fov: 60,
    parallax: 0.2,
  },
];

/** Section ids in order; the nav rail and the waypoints share this list. */
export const SECTION_IDS = WAYPOINTS.map((w) => w.id);

export const COLORS = {
  bg: "#05060a",
  primary: "#c6ff3d",
  secondary: "#7c5cff",
  dim: "#5a6472",
} as const;

export const FOG = {
  color: COLORS.bg,
  near: 12,
  far: 95,
} as const;
