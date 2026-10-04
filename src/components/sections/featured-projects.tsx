import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { ProjectCard } from '@/components/sections/project-card';
import { featuredProjects } from '@/lib/derive';
import type { Project, Technology } from '@/lib/schemas';

interface FeaturedProjectsProps {
  projects: Project[];
  technologies: Technology[];
}

export function FeaturedProjects({ projects, technologies }: FeaturedProjectsProps) {
  const featured = featuredProjects(projects);
  if (featured.length === 0) return null;

  return (
    <section className="py-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-2xl font-semibold">Featured projects</h2>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary underline underline-offset-4 hover:no-underline"
        >
          All projects
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {featured.map((project) => (
          <ProjectCard key={project.slug} project={project} technologies={technologies} />
        ))}
      </div>
    </section>
  );
}
