import type { MetadataRoute } from 'next';

import { loadContent } from '@/lib/content';
import { sortProjects } from '@/lib/derive';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const projects = sortProjects(loadContent().projects);
  const paths = [
    '',
    '/projects',
    '/about',
    '/how-i-use-ai',
    ...projects.map((project) => `/projects/${project.slug}`),
  ];

  return paths.map((path) => ({ url: `${SITE_URL}${path}` }));
}
