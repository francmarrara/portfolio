import type { Metadata } from 'next';

import { ContactLink } from '@/components/sections/contact-link';
import { CareerTimeline } from '@/components/sections/career-timeline';
import { CvDownloadLink } from '@/components/sections/cv-download-link';
import { JsonLd } from '@/components/sections/json-ld';
import { MarkdownContent } from '@/components/sections/markdown-content';
import { SkillsGrid } from '@/components/sections/skills-grid';
import { SpokenLanguages } from '@/components/sections/spoken-languages';
import { loadContent } from '@/lib/content';
import { primaryStack } from '@/lib/derive';
import { buildMetadata, pageTitle, personJsonLd } from '@/lib/seo';

export function generateMetadata(): Metadata {
  const { profile } = loadContent();

  return buildMetadata({
    title: pageTitle('About'),
    description: profile.summary,
    path: '/about',
    type: 'profile',
  });
}

export default function AboutPage() {
  const { profile, career, skills, technologies, projects, earlierWork } = loadContent();
  const usedSlugs = [...new Set([...projects, ...earlierWork].flatMap((entry) => entry.stack))];

  return (
    <>
      <section className="py-6">
        <h1 className="text-3xl font-semibold tracking-tight">About</h1>
        <p className="mt-1 text-muted-foreground">{profile.location}</p>
        <MarkdownContent>{profile.body}</MarkdownContent>
        {profile.availability ? (
          <p className="mt-2">
            <span className="font-semibold">Availability:</span> {profile.availability}
          </p>
        ) : null}
      </section>
      <section className="py-6">
        <h2 className="text-2xl font-semibold">Languages</h2>
        <div className="mt-3">
          <SpokenLanguages languages={profile.spoken_languages} />
        </div>
      </section>
      <section id="career" className="scroll-mt-20 py-6">
        <h2 className="text-2xl font-semibold">Career</h2>
        <div className="mt-4">
          <CareerTimeline career={career} technologies={technologies} />
        </div>
      </section>
      <section id="skills" className="scroll-mt-20 py-6">
        <h2 className="text-2xl font-semibold">Skills</h2>
        <div className="mt-4">
          <SkillsGrid skills={skills} technologies={technologies} usedSlugs={usedSlugs} />
        </div>
      </section>
      <section id="contact" className="scroll-mt-20 py-6">
        <h2 className="text-2xl font-semibold">Contact</h2>
        <p className="mt-3">
          The best way to reach me is by email: <ContactLink email={profile.email} />
        </p>
        <div className="mt-4">
          <CvDownloadLink variant="outline" />
        </div>
      </section>
      <JsonLd data={personJsonLd(profile, primaryStack(skills))} />
    </>
  );
}
