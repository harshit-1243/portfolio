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
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
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
  }, []);

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

export function SectionLabel({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-[var(--color-primary)] uppercase">
      <span>{String(index).padStart(2, "0")}</span>
      <span className="h-px w-10 bg-[var(--color-primary)] opacity-50" />
      <span>{children}</span>
    </div>
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
