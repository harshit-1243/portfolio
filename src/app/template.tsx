"use client";

import { useEffect, useState } from "react";

/**
 * Route transition.
 *
 * template.tsx remounts on every navigation (unlike layout.tsx, which
 * persists), so animating on mount gives a page transition without any
 * experimental API — React's <ViewTransition> is not exported from stable
 * React 19, only Next's bundled canary.
 *
 * The catch: the fade starts at opacity 0, so applying it to the FIRST load
 * hides all content until the animation runs. That delays First Contentful
 * Paint — measurably. Lighthouse reported NO_FCP outright, and the same 300ms
 * of blank screen is what a real visitor sees on every cold load.
 *
 * So the animation is skipped on first mount and applied only to subsequent
 * client-side navigations, which is the only place it was ever meaningful.
 * The flag lives at module scope: it resets on a full page load and persists
 * across in-app navigations, which is exactly the distinction we need.
 */
let hasNavigated = false;

export default function Template({ children }: { children: React.ReactNode }) {
  const [animate] = useState(() => hasNavigated);

  useEffect(() => {
    hasNavigated = true;
  }, []);

  return <div className={animate ? "route-transition" : undefined}>{children}</div>;
}
