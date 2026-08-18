# Harshit Modi — Portfolio

A personal 3D portfolio. Next.js 16, React 19, TypeScript, Tailwind v4, and a
React Three Fiber scene driven by scroll.

## The idea

The avatar is the origin; the world is the work. The landing puts the avatar
close and centred as a human anchor. As you scroll, the camera pulls back into
the surrounding space, and that space is populated with objects derived from
real projects rather than decorative particles:

| Object | Represents |
| --- | --- |
| `HandCloud` | Real-Time ASL Recognition — MediaPipe's actual 21-landmark topology, cycling three ASL poses inside a point cloud standing for the ~87K-image corpus |
| `FeatureSurface` | NSE Earnings Prediction — a feature-importance landscape whose tallest peak is cash-flow quality, the paper's real finding |
| `RetrievalGraph` | FitMentor AI — a document lattice with the query node at centre and edges built by actual kNN search |

The avatar stays visible in the distance as the thing everything orbits.

## Architecture

```
DOM layer (scroll, pointer) → frameState → WebGL layer (useFrame)
```

`src/lib/frameState.ts` is a module-level mutable object, deliberately not React
state. Scroll and pointer update at display refresh rate; routing that through
React would re-render the tree 60–120 times a second. The scene reads it inside
`useFrame`, already outside React's render cycle. The DOM layer writes, the
WebGL layer reads, and neither reads it during render.

`src/components/scene/world.ts` is the single source of truth for layout: object
anchors and the seven camera waypoints. Both the objects and the camera rig
import from it, so they cannot drift apart.

`CameraRig` drives a Catmull-Rom spline through the waypoints. A plain lerp
between waypoint pairs puts a hard direction change at every stop — exactly when
the reader arrives at a section. The spline carries momentum through while still
passing through each waypoint at `t = i/(n-1)`, so section boundaries stay
aligned with the even scroll division.

## Accessibility and performance

- `prefers-reduced-motion` skips Lenis entirely and reads native scroll instead;
  postprocessing never mounts and camera parallax and head-tracking disable. The
  scene keeps working, tracking the real scrollbar 1:1.
- `useDeviceTier()` drops particle counts, DPR cap and antialiasing on coarse
  pointers, ≤4 cores, or narrow viewports.
- The canvas is `aria-hidden` — everything it illustrates exists as real text.
- Frosted panels sit behind body copy so the 3D never shows through text at
  low-contrast angles.
- Real anchor-link nav: works without JS, keyboard-navigable, shareable
  fragments.
- JSON-LD `Person` schema on the home page.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # type-check + production build
npm start        # serve the production build
```

Node 20.9+ required.

## Content

All copy lives in `src/data/profile.ts`. Nothing else hardcodes text — sections,
metadata, JSON-LD and the case-study pages all read from it.

Search that file for `TODO` for the values still needed: public email, LinkedIn
URL, project repo links, and paper DOIs. `metadataBase` in `src/app/layout.tsx`
is a placeholder domain, and `public/Harshit_Modi_Resume.pdf` is not yet in the
repo.

## Avatar

`AvatarAnchor.tsx` currently renders a wireframe stand-in with working
cursor-tracking and idle breathing. Its file header documents the four-step swap
for a real rigged `.glb` (Ready Player Me + Mixamo idle → `gltf-transform
optimize` → `useGLTF`/`useAnimations` → retarget head-tracking onto the Head
bone). Nothing else in the scene reads from that file except its position.
