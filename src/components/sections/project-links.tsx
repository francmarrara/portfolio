import { Code, ExternalLink } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';

interface ProjectLinksProps {
  repo: string | null;
  demo: string | null;
}

export function ProjectLinks({ repo, demo }: ProjectLinksProps) {
  if (!repo && !demo) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {repo ? (
        <a
          href={repo}
          rel="noopener noreferrer"
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          <Code aria-hidden="true" />
          View repository
        </a>
      ) : null}
      {demo ? (
        <a
          href={demo}
          rel="noopener noreferrer"
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          <ExternalLink aria-hidden="true" />
          View demo
        </a>
      ) : null}
    </div>
  );
}
