import { EarlierWorkList } from '@/components/sections/earlier-work-list';
import { ProjectCard, type ProjectCardData } from '@/components/sections/project-card';
import type { EarlierWork, Technology } from '@/lib/schemas';

interface ProjectListProps {
  projects: ProjectCardData[];
  earlierWork: EarlierWork[];
  technologies: Technology[];
  keepOrder?: boolean;
}

export function ProjectList({ projects, earlierWork, technologies, keepOrder }: ProjectListProps) {
  return (
    <>
      {projects.length > 0 ? (
        <section className="py-6">
          <h2 className="text-2xl font-semibold">Case studies</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} technologies={technologies} />
            ))}
          </div>
        </section>
      ) : null}
      <EarlierWorkList
        items={earlierWork}
        technologies={technologies}
        variant="full"
        keepOrder={keepOrder}
      />
    </>
  );
}
