import { CaseStudyToc } from '@/components/sections/case-study-toc';
import { MarkdownContent } from '@/components/sections/markdown-content';
import { ProjectLinks } from '@/components/sections/project-links';
import { TechBadgeList } from '@/components/sections/tech-badge-list';
import type { Project, Technology } from '@/lib/schemas';

interface CaseStudyProps {
  project: Project;
  technologies: Technology[];
}

export function CaseStudy({ project, technologies }: CaseStudyProps) {
  return (
    <article>
      <header className="space-y-4 py-6">
        {project.cover ? (
          <div className="aspect-video overflow-hidden rounded-lg bg-muted">
            {/* Plain <img>: next/image adds an inline style attribute, which the page CSP forbids. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/assets/${project.cover}`}
              alt={project.cover_alt ?? ''}
              width={1280}
              height={720}
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{project.title}</h1>
        <p className="text-lg text-muted-foreground">{project.subtitle}</p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm sm:flex sm:gap-x-8">
          <div className="contents sm:block">
            <dt className="text-muted-foreground">Year</dt>
            <dd className="font-medium">{project.year}</dd>
          </div>
          <div className="contents sm:block">
            <dt className="text-muted-foreground">Role</dt>
            <dd className="font-medium">{project.role}</dd>
          </div>
          <div className="contents sm:block">
            <dt className="text-muted-foreground">Sector</dt>
            <dd className="font-medium">{project.sector}</dd>
          </div>
        </dl>
        <TechBadgeList
          slugs={project.stack}
          technologies={technologies}
          label="Stack"
          linkToFilter
        />
        <ProjectLinks repo={project.repo} demo={project.demo} />
      </header>
      <CaseStudyToc sections={project.sections} />
      {project.sections.map((section) => (
        <section key={section.id} className="py-2">
          <h2 id={section.id} className="mt-10 mb-3 scroll-mt-20 text-2xl font-semibold">
            {section.title}
          </h2>
          <MarkdownContent>{section.markdown}</MarkdownContent>
        </section>
      ))}
    </article>
  );
}
