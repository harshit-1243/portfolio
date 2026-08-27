"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Section shell. Each one is a full-viewport stop that lines up with a camera
 * waypoint of the same id and index.
 */
export function Section({
  id,
  children,
  className = "",
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`relative flex min-h-screen w-full items-center px-6 py-24 md:px-12 ${className}`}
    >
      <div className="mx-auto w-full max-w-5xl">{children}</div>
    </section>
  );
}

/**
 * Fades content in on first intersection.
 *
 * IntersectionObserver rather than a scroll handler: it fires off the main
 * thread. It unobserves after the first reveal so scrolling back up doesn't
 * replay the animation, which reads as a glitch rather than an effect.
 *
 * `immediate` opts out entirely and renders the content plainly. Use it for
 * anything above the fold: .reveal starts at opacity 0, and that state is in
 * the server-rendered HTML, so hidden above-the-fold content is invisible until
 * JavaScript hydrates and the observer fires. That is not a cosmetic detail -
 * it delays First Contentful Paint (Lighthouse reported NO_FCP on this page)
 * and shows a blank screen to anyone on a slow connection.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  immediate = false,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  immediate?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (immediate) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          io.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [immediate]);

  if (immediate) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      data-revealed={revealed}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * The section's heading, styled as a small label.
 *
 * It is a real <h2>, not a styled div: the page goes <h1> (name) then card
 * titles at <h3>, and without an <h2> between them the outline skips a level.
 * Screen-reader users navigate by heading, so a broken outline is a navigation
 * bug, not a validation nitpick.
 */
export function SectionLabel({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <h2 className="mb-5 flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-[var(--color-primary)] uppercase">
      <span>{String(index).padStart(2, "0")}</span>
      <span className="h-px w-10 bg-[var(--color-primary)] opacity-50" />
      <span>{children}</span>
    </h2>
  );
}

export function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`panel p-6 md:p-8 ${className}`}>{children}</div>;
}
