import Link from 'next/link';

import { TechBadgeList } from '@/components/sections/tech-badge-list';
import type { Project, Technology } from '@/lib/schemas';

export type ProjectCardData = Pick<
  Project,
  'slug' | 'title' | 'subtitle' | 'year' | 'stack' | 'cover' | 'cover_alt'
>;

interface ProjectCardProps {
  project: ProjectCardData;
  technologies: Technology[];
}

export function ProjectCard({ project, technologies }: ProjectCardProps) {
  return (
    <article className="relative flex flex-col gap-3 rounded-lg border bg-card p-4 text-card-foreground transition-colors focus-within:border-ring hover:border-ring">
      {project.cover ? (
        <div className="aspect-video overflow-hidden rounded-md bg-muted">
          {/* Plain <img>: next/image adds an inline style attribute, which the page CSP forbids. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/assets/${project.cover}`}
            alt={project.cover_alt ?? ''}
            width={1280}
            height={720}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-lg font-semibold">
          <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0">
            {project.title}
          </Link>
        </h3>
        <span className="text-sm text-muted-foreground">{project.year}</span>
      </div>
      <p className="text-sm text-muted-foreground">{project.subtitle}</p>
      <TechBadgeList slugs={project.stack} technologies={technologies} className="mt-auto" />
    </article>
  );
}
