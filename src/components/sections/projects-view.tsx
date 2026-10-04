import { ProjectList } from '@/components/sections/project-list';
import type { ProjectCardData } from '@/components/sections/project-card';
import { SearchBox } from '@/components/sections/search-box';
import { TechFilter } from '@/components/sections/tech-filter';
import { Button } from '@/components/ui/button';
import type { EarlierWork, Technology } from '@/lib/schemas';
import type { FilterGroup } from '@/lib/search';

export interface ProjectsViewProps {
  groups: FilterGroup[];
  selected: string[];
  query: string;
  shown: number;
  total: number;
  projects: ProjectCardData[];
  earlierWork: EarlierWork[];
  technologies: Technology[];
  disabled?: boolean;
  keepOrder?: boolean;
  onTechChange?: (next: string[]) => void;
  onQueryChange?: (next: string) => void;
  onClear?: () => void;
}

// One layout for both the static fallback and the hydrated explorer, so that hydration moves nothing.
export function ProjectsView({
  groups,
  selected,
  query,
  shown,
  total,
  projects,
  earlierWork,
  technologies,
  disabled,
  keepOrder,
  onTechChange,
  onQueryChange,
  onClear,
}: ProjectsViewProps) {
  return (
    <div>
      <div className="space-y-4">
        <SearchBox value={query} onChange={onQueryChange} disabled={disabled} />
        <TechFilter
          groups={groups}
          selected={selected}
          onChange={onTechChange}
          disabled={disabled}
        />
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {`Showing ${shown} of ${total} items`}
        </p>
      </div>
      {shown === 0 ? (
        <div className="py-10 text-center">
          <p>No projects match your filters.</p>
          <Button type="button" variant="outline" className="mt-4" onClick={onClear}>
            Clear filters
          </Button>
        </div>
      ) : (
        <ProjectList
          projects={projects}
          earlierWork={earlierWork}
          technologies={technologies}
          keepOrder={keepOrder}
        />
      )}
    </div>
  );
}
