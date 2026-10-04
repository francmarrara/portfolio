import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { techName } from '@/lib/derive';
import type { Technology } from '@/lib/schemas';
import { cn } from '@/lib/utils';

interface TechBadgeListProps {
  slugs: string[];
  technologies: Technology[];
  linkToFilter?: boolean;
  label?: string;
  className?: string;
}

export function TechBadgeList({
  slugs,
  technologies,
  linkToFilter = false,
  label,
  className,
}: TechBadgeListProps) {
  if (slugs.length === 0) return null;

  return (
    <ul aria-label={label} className={cn('flex flex-wrap gap-2', className)}>
      {slugs.map((slug) => {
        const name = techName(technologies, slug);
        return (
          <li key={slug}>
            {linkToFilter ? (
              <Badge variant="secondary" className="min-h-6 hover:bg-secondary/70" asChild>
                <Link href={`/projects?tech=${slug}`}>{name}</Link>
              </Badge>
            ) : (
              <Badge variant="secondary">{name}</Badge>
            )}
          </li>
        );
      })}
    </ul>
  );
}
