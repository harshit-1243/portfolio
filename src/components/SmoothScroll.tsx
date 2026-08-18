"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { clamp, damp, frameState } from "@/lib/frameState";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Owns the single rAF loop and feeds frameState.
 *
 * Under prefers-reduced-motion, Lenis is skipped entirely — smooth-scroll
 * hijacking is precisely what that setting asks us not to do. The scene keeps
 * working either way, because progress still gets populated from native scroll;
 * it just tracks the real scrollbar 1:1 instead of an eased proxy.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    let lenis: Lenis | null = null;
    let detachNative: (() => void) | null = null;
    let raf = 0;
    let last = performance.now();

    const readNativeProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      return max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
    };

    if (!reduced) {
      lenis = new Lenis({
        duration: 1.1,
        easing: (t) => 1 - Math.pow(1 - t, 3),
        smoothWheel: true,
      });
      lenis.on("scroll", ({ progress }: { progress: number }) => {
        frameState.progress = clamp(progress, 0, 1);
        if (progress > 0.001) frameState.hasScrolled = true;
      });
    } else {
      const onScroll = () => {
        frameState.progress = readNativeProgress();
        if (frameState.progress > 0.001) frameState.hasScrolled = true;
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      detachNative = () => window.removeEventListener("scroll", onScroll);
    }

    // Pointer feeds the same store, damped so a fast flick doesn't snap.
    let targetX = 0;
    let targetY = 0;
    const onPointerMove = (e: PointerEvent) => {
      targetX = (e.clientX / window.innerWidth) * 2 - 1;
      targetY = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const loop = (time: number) => {
      const dt = Math.min((time - last) / 1000, 1 / 30);
      last = time;
      lenis?.raf(time);
      frameState.pointerX = damp(frameState.pointerX, targetX, 4, dt);
      frameState.pointerY = damp(frameState.pointerY, targetY, 4, dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      lenis?.destroy();
      detachNative?.();
    };
  }, [reduced]);

  return <>{children}</>;
}
