import type { Metadata } from 'next';
import { Suspense } from 'react';

import { ProjectExplorer } from '@/components/sections/project-explorer';
import { ProjectsFallback } from '@/components/sections/projects-fallback';
import { loadContent } from '@/lib/content';
import { buildFilterOptions, buildSearchItems } from '@/lib/search';
import { buildMetadata, pageTitle } from '@/lib/seo';

export function generateMetadata(): Metadata {
  const { profile } = loadContent();

  return buildMetadata({
    title: pageTitle('Projects'),
    description: profile.summary,
    path: '/projects',
    type: 'website',
  });
}

export default function ProjectsPage() {
  const content = loadContent();
  const items = buildSearchItems(content);
  const groups = buildFilterOptions(items, content.technologies);

  const projects = content.projects.map(
    ({ slug, title, subtitle, year, stack, cover, cover_alt }) => ({
      slug,
      title,
      subtitle,
      year,
      stack,
      ...(cover ? { cover } : {}),
      ...(cover_alt ? { cover_alt } : {}),
    }),
  );
  const shared = {
    groups,
    projects,
    earlierWork: content.earlierWork,
    technologies: content.technologies,
  };

  return (
    <>
      <section className="py-6">
        <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
        <p className="mt-2 max-w-prose text-muted-foreground">
          In-depth case studies and a compact record of earlier work. Filter by technology or search
          by keyword.
        </p>
      </section>
      <Suspense fallback={<ProjectsFallback {...shared} total={items.length} />}>
        <ProjectExplorer {...shared} items={items} />
      </Suspense>
    </>
  );
}
