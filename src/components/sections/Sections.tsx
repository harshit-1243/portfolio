import Link from "next/link";
import { RESUME_READY, profile } from "@/data/profile";
import { Panel, Reveal, Section, SectionLabel } from "./Section";

/**
 * All seven sections, in the order the camera waypoints expect.
 * Order is load-bearing: section N lines up with WAYPOINTS[N].
 */

export function Landing() {
  return (
    <Section id="landing">
      <Reveal immediate>
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--color-primary)]">
          {profile.role}
        </p>
        <h1 className="mt-5 text-5xl font-semibold leading-[0.95] tracking-tight md:text-8xl">
          {profile.name}
        </h1>
        <p className="mt-6 max-w-xl text-lg text-[var(--color-muted)] md:text-xl">
          {profile.tagline}
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <a
            href="#projects"
            className="rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-[#05060a] transition-transform hover:scale-[1.03]"
          >
            See the work
          </a>
          <a
            href="#contact"
            className="rounded-full border border-[var(--color-line)] px-6 py-3 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:border-[var(--color-primary)]"
          >
            Get in touch
          </a>
          {RESUME_READY && (
            <a
              href={profile.links.resume}
              download
              className="rounded-full border border-[var(--color-line)] px-6 py-3 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:border-[var(--color-primary)]"
            >
              Résumé
            </a>
          )}
        </div>
      </Reveal>
    </Section>
  );
}

export function About() {
  const { education } = profile;
  return (
    <Section id="about">
      <Reveal>
        <SectionLabel index={1}>About</SectionLabel>
      </Reveal>
      <Reveal delay={80}>
        <Panel className="max-w-3xl">
          {profile.about.map((p, i) => (
            <p key={i} className={`text-base leading-relaxed text-[var(--color-ink)] ${i > 0 ? "mt-4" : ""}`}>
              {p}
            </p>
          ))}
          <dl className="mt-7 grid grid-cols-2 gap-5 border-t border-[var(--color-line)] pt-6 text-sm md:grid-cols-4">
            <div>
              <dt className="text-[var(--color-muted)]">Degree</dt>
              <dd className="mt-1 font-medium">{education.degree}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted)]">Institution</dt>
              <dd className="mt-1 font-medium">{education.institution}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted)]">Graduating</dt>
              <dd className="mt-1 font-medium">{education.graduation}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted)]">CGPA</dt>
              <dd className="mt-1 font-medium">{education.cgpa}</dd>
            </div>
          </dl>
        </Panel>
      </Reveal>
    </Section>
  );
}

export function Research() {
  return (
    <Section id="research">
      <Reveal>
        <SectionLabel index={2}>Research</SectionLabel>
      </Reveal>
      <div className="grid gap-5 md:grid-cols-2">
        {profile.papers.map((paper, i) => (
          <Reveal key={paper.title} delay={i * 90}>
            <Panel className="h-full">
              <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-secondary)]">
                <span>{paper.status}</span>
                <span aria-hidden>·</span>
                <span>{paper.year}</span>
              </div>
              <h3 className="mt-3 text-xl font-semibold leading-snug">{paper.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
                {paper.abstract}
              </p>
              {paper.doi ? (
                <a
                  href={`https://doi.org/${paper.doi}`}
                  className="mt-4 inline-block font-mono text-xs text-[var(--color-primary)] underline underline-offset-4"
                >
                  doi:{paper.doi}
                </a>
              ) : null}
            </Panel>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export function Projects() {
  return (
    <Section id="projects">
      <Reveal>
        <SectionLabel index={3}>Projects</SectionLabel>
      </Reveal>
      <div className="grid gap-5 md:grid-cols-3">
        {profile.projects.map((project, i) => (
          <Reveal key={project.slug} delay={i * 90}>
            <Panel className="flex h-full flex-col">
              <h3 className="text-lg font-semibold">{project.title}</h3>
              <p className="mt-2 text-sm text-[var(--color-muted)]">{project.tagline}</p>
              <p className="mt-4 text-sm leading-relaxed">{project.summary}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {project.stack.map((s) => (
                  <li
                    key={s}
                    className="rounded-full border border-[var(--color-line)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-[var(--color-muted)]"
                  >
                    {s}
                  </li>
                ))}
              </ul>
              <Link
                href={`/work/${project.slug}`}
                className="mt-6 inline-block text-sm font-semibold text-[var(--color-primary)] underline underline-offset-4"
              >
                Read the case study →
              </Link>
            </Panel>
          </Reveal>
        ))}
      </div>

      {profile.otherRepos.length > 0 && (
        <Reveal delay={260}>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Also on GitHub
            </span>
            {profile.otherRepos.map((repo) => (
              <a
                key={repo.href}
                href={repo.href}
                className="text-[var(--color-ink)] underline decoration-[var(--color-line)] underline-offset-4 transition-colors hover:decoration-[var(--color-primary)]"
              >
                {repo.name}
              </a>
            ))}
          </div>
        </Reveal>
      )}
    </Section>
  );
}

export function Experience() {
  return (
    <Section id="experience">
      <Reveal>
        <SectionLabel index={4}>Experience</SectionLabel>
      </Reveal>
      <Reveal delay={80}>
        <Panel className="max-w-3xl">
          <ul className="space-y-6">
            {profile.experience.map((item) => (
              <li
                key={`${item.org}-${item.period}`}
                className="border-l-2 border-[var(--color-line)] pl-5"
              >
                <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-secondary)]">
                  {item.period}
                </div>
                <h3 className="mt-1 text-lg font-semibold">{item.role}</h3>
                <div className="text-sm text-[var(--color-muted)]">{item.org}</div>
                <p className="mt-2 text-sm leading-relaxed">{item.detail}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </Reveal>
    </Section>
  );
}

export function Skills() {
  return (
    <Section id="skills">
      <Reveal>
        <SectionLabel index={5}>Skills</SectionLabel>
      </Reveal>
      <div className="grid gap-5 md:grid-cols-2">
        {profile.skills.map((group, i) => (
          <Reveal key={group.group} delay={i * 70}>
            <Panel className="h-full">
              <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-primary)]">
                {group.group}
              </h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-md border border-[var(--color-line)] px-3 py-1.5 text-sm text-[var(--color-ink)]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </Panel>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export function Contact() {
  const { links } = profile;
  return (
    <Section id="contact">
      <Reveal>
        <SectionLabel index={6}>Contact</SectionLabel>
      </Reveal>
      <Reveal delay={80}>
        <p className="max-w-2xl text-3xl font-semibold leading-tight md:text-5xl">
          Open to internships and research collaboration.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={`mailto:${links.email}`}
            className="rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-[#05060a]"
          >
            {links.email}
          </a>
          <a
            href={links.github}
            className="rounded-full border border-[var(--color-line)] px-6 py-3 text-sm font-semibold transition-colors hover:border-[var(--color-primary)]"
          >
            GitHub
          </a>
          <a
            href={links.linkedin}
            className="rounded-full border border-[var(--color-line)] px-6 py-3 text-sm font-semibold transition-colors hover:border-[var(--color-primary)]"
          >
            LinkedIn
          </a>
          {RESUME_READY && (
            <a
              href={links.resume}
              download
              className="rounded-full border border-[var(--color-line)] px-6 py-3 text-sm font-semibold transition-colors hover:border-[var(--color-primary)]"
            >
              Résumé
            </a>
          )}
        </div>
        <p className="mt-16 font-mono text-xs text-[var(--color-muted)]">
          © {new Date().getFullYear()} {profile.name} · {profile.location}
        </p>
      </Reveal>
    </Section>
  );
}
