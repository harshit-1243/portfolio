"use client";

import { useEffect, useRef } from "react";
import { damp } from "@/lib/frameState";

/**
 * Custom cursor: a hard dot that tracks exactly, and a ring that lags behind it.
 *
 * The lag is the whole effect — a ring pinned to the pointer reads as a bigger
 * cursor, while one that trails reads as weight. It runs on its own rAF loop
 * writing transforms directly to the DOM; putting pointer position into React
 * state would re-render on every mouse move.
 *
 * Never mounts for coarse pointers (a phone has no cursor to replace) or under
 * prefers-reduced-motion.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    document.body.classList.add("has-custom-cursor");

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let ringX = targetX;
    let ringY = targetY;
    let last = performance.now();
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (dot.current) {
        dot.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
      }
    };

    // Grow the ring over anything clickable, so the cursor reports affordance.
    const onOver = (e: PointerEvent) => {
      const el = (e.target as HTMLElement)?.closest("a, button, [role='button']");
      ring.current?.classList.toggle("cursor-ring--active", !!el);
    };

    const loop = (time: number) => {
      const dt = Math.min((time - last) / 1000, 1 / 30);
      last = time;
      ringX = damp(ringX, targetX, 12, dt);
      ringY = damp(ringY, targetY, 12, dt);
      if (ring.current) {
        ring.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.body.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <div aria-hidden>
      <div ref={dot} className="cursor-dot" />
      <div ref={ring} className="cursor-ring" />
    </div>
  );
}
