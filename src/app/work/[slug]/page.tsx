import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { profile } from "@/data/profile";

/**
 * Case-study pages, statically generated at build time.
 *
 * Note the Next 16 signature: `params` is a Promise and must be awaited, in
 * both the page and generateMetadata. Typed explicitly rather than via the
 * generated PageProps global, so `tsc --noEmit` works on a clean checkout
 * before .next/types has been populated by a build.
 */

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return profile.projects.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = profile.projects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    openGraph: { title: project.title, description: project.summary },
  };
}

export default async function CaseStudy({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = profile.projects.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <main className="content-layer mx-auto min-h-screen w-full max-w-3xl px-6 py-24 md:px-10">
      <Link
        href="/#projects"
        className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-primary)]"
      >
        ← Back
      </Link>

      <header className="mt-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-secondary)]">
          {project.period}
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">
          {project.title}
        </h1>
        <p className="mt-5 text-lg text-[var(--color-muted)]">{project.tagline}</p>
      </header>

      <dl className="mt-12 grid grid-cols-1 gap-5 border-y border-[var(--color-line)] py-7 sm:grid-cols-3">
        {project.metrics.map((m) => (
          <div key={m.label}>
            <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-muted)]">
              {m.label}
            </dt>
            <dd className="mt-2 text-xl font-semibold text-[var(--color-primary)]">
              {m.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-12 space-y-6">
        {project.detail.map((para, i) => (
          <p key={i} className="text-base leading-relaxed">
            {para}
          </p>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
          Stack
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {project.stack.map((s) => (
            <li
              key={s}
              className="rounded-full border border-[var(--color-line)] px-3 py-1.5 text-sm"
            >
              {s}
            </li>
          ))}
        </ul>
      </div>

      {project.links.length > 0 && (
        <div className="mt-12">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Links
          </h2>
          <ul className="mt-4 space-y-2">
            {project.links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="text-[var(--color-primary)] underline underline-offset-4"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
