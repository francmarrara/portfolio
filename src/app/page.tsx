import type { Metadata } from 'next';

import { EarlierWorkList } from '@/components/sections/earlier-work-list';
import { FeaturedProjects } from '@/components/sections/featured-projects';
import { Hero } from '@/components/sections/hero';
import { JsonLd } from '@/components/sections/json-ld';
import { loadContent } from '@/lib/content';
import { primaryStack } from '@/lib/derive';
import { buildMetadata, personJsonLd } from '@/lib/seo';

const EARLIER_WORK_LIMIT = 4;

export function generateMetadata(): Metadata {
  const { profile } = loadContent();

  return buildMetadata({
    title: `${profile.name} — ${profile.title}`,
    description: profile.summary,
    path: '/',
    type: 'profile',
  });
}

export default function Home() {
  const { profile, career, skills, projects, earlierWork, technologies } = loadContent();

  return (
    <>
      <Hero profile={profile} career={career} skills={skills} />
      <FeaturedProjects projects={projects} technologies={technologies} />
      <EarlierWorkList
        items={earlierWork}
        technologies={technologies}
        limit={EARLIER_WORK_LIMIT}
        variant="compact"
      />
      <JsonLd data={personJsonLd(profile, primaryStack(skills))} />
    </>
  );
}
