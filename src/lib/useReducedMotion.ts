"use client";

import { useEffect, useState } from "react";

/**
 * Tracks prefers-reduced-motion, including changes after mount.
 *
 * Starts false so server and first client render agree; the effect corrects it
 * before paint matters. Returning true from the start would cause a hydration
 * mismatch on machines where the media query is set.
 */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

export type DeviceTier = "high" | "low";

/**
 * Coarse capability guess, used to pick particle counts, DPR cap, antialiasing
 * and whether postprocessing mounts at all.
 *
 * A coarse pointer, four or fewer cores, or a narrow viewport all point at a
 * phone or a low-end laptop. This is intentionally pessimistic — dropping
 * detail on a capable machine is invisible; keeping it on a weak one is not.
 */
export function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>("high");

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const fewCores = (navigator.hardwareConcurrency ?? 8) <= 4;
    const narrow = window.innerWidth < 768;
    setTier(coarse || fewCores || narrow ? "low" : "high");
  }, []);

  return tier;
}
