import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CaseStudy } from '@/components/sections/case-study';
import { JsonLd } from '@/components/sections/json-ld';
import { loadContent } from '@/lib/content';
import { techName } from '@/lib/derive';
import { buildMetadata, pageTitle, techArticleJsonLd } from '@/lib/seo';

export const dynamicParams = false;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return loadContent().projects.map((project) => ({ slug: project.slug }));
}

async function findProject(params: PageProps['params']) {
  const { slug } = await params;
  const content = loadContent();
  const project = content.projects.find((candidate) => candidate.slug === slug);
  if (!project) notFound();
  return { content, project };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { project } = await findProject(params);

  return buildMetadata({
    title: pageTitle(project.title),
    description: project.subtitle,
    path: `/projects/${project.slug}`,
    type: 'article',
  });
}

export default async function ProjectPage({ params }: PageProps) {
  const { content, project } = await findProject(params);
  const stackNames = project.stack.map((slug) => techName(content.technologies, slug));

  return (
    <>
      <CaseStudy project={project} technologies={content.technologies} />
      <JsonLd data={techArticleJsonLd(project, content.profile, stackNames)} />
    </>
  );
}
