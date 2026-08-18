"use client";

import { useEffect, useState } from "react";
import { SECTION_IDS } from "./scene/world";

/**
 * Fixed section rail.
 *
 * Real anchor links, not scroll-jacking buttons: they work without JS, they're
 * keyboard-navigable for free, and each one gives a shareable URL fragment.
 * The active state is observed rather than computed from scroll position.
 */
export function Nav() {
  const [active, setActive] = useState(SECTION_IDS[0]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { threshold: 0.5 }
      );
      io.observe(el);
      observers.push(io);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <nav
      aria-label="Section navigation"
      className="fixed right-5 top-1/2 z-20 hidden -translate-y-1/2 md:block"
    >
      <ul className="flex flex-col gap-4">
        {SECTION_IDS.map((id) => {
          const isActive = active === id;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                aria-current={isActive ? "true" : undefined}
                className="group flex items-center justify-end gap-3"
              >
                <span
                  className={`font-mono text-[10px] uppercase tracking-[0.18em] transition-opacity ${
                    isActive
                      ? "text-[var(--color-primary)] opacity-100"
                      : "text-[var(--color-muted)] opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                  }`}
                >
                  {id}
                </span>
                <span
                  className={`block h-px transition-all ${
                    isActive
                      ? "w-8 bg-[var(--color-primary)]"
                      : "w-4 bg-[var(--color-muted)] group-hover:w-6"
                  }`}
                />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
