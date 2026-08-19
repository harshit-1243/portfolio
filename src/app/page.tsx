import { SmoothScroll } from "@/components/SmoothScroll";
import { SceneMount } from "@/components/scene/SceneMount";
import { Nav } from "@/components/Nav";
import {
  About,
  Contact,
  Experience,
  Landing,
  Projects,
  Research,
  Skills,
} from "@/components/sections/Sections";
import { profile } from "@/data/profile";

export default function Home() {
  // Person schema so search engines can build a knowledge panel from the page
  // rather than guessing at it.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.role,
    description: profile.tagline,
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: profile.education.institution,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: profile.location,
    },
    knowsAbout: profile.skills.flatMap((g) => [...g.items]),
    sameAs: [profile.links.github, profile.links.linkedin],
    email: `mailto:${profile.links.email}`,
    worksFor: {
      "@type": "Organization",
      name: profile.experience[0]?.org,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SceneMount />
      <Nav />
      <SmoothScroll>
        <main id="main" className="content-layer">
          <Landing />
          <About />
          <Research />
          <Projects />
          <Experience />
          <Skills />
          <Contact />
        </main>
      </SmoothScroll>
    </>
  );
}
