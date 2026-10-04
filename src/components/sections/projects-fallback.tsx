import { ProjectsView, type ProjectsViewProps } from '@/components/sections/projects-view';

type ProjectsFallbackProps = Pick<
  ProjectsViewProps,
  'groups' | 'total' | 'projects' | 'earlierWork' | 'technologies'
>;

// Rendered by the server inside <Suspense>: it is the page without JavaScript, with the controls disabled.
export function ProjectsFallback({ total, ...rest }: ProjectsFallbackProps) {
  return <ProjectsView {...rest} selected={[]} query="" shown={total} total={total} disabled />;
}
