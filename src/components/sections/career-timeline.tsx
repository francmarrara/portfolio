import { CareerRole } from '@/components/sections/career-role';
import { sortRoles } from '@/lib/derive';
import type { CareerRole as Role, Technology } from '@/lib/schemas';

interface CareerTimelineProps {
  career: Role[];
  technologies: Technology[];
}

export function CareerTimeline({ career, technologies }: CareerTimelineProps) {
  return (
    <ol className="space-y-4">
      {sortRoles(career).map((role) => (
        <li key={`${role.company}-${role.start}`}>
          <CareerRole role={role} technologies={technologies} />
        </li>
      ))}
    </ol>
  );
}
