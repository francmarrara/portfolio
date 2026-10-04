'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

import type { ProjectCardData } from '@/components/sections/project-card';
import { ProjectsView } from '@/components/sections/projects-view';
import { earlierAnchorId } from '@/lib/derive';
import type { EarlierWork, Technology } from '@/lib/schemas';
import { createSearchIndex, searchItems, type FilterGroup, type SearchItem } from '@/lib/search';
import {
  normalizeQuery,
  parseProjectsQuery,
  serializeProjectsQuery,
  type ProjectsQuery,
} from '@/lib/url-state';

interface ProjectExplorerProps {
  items: SearchItem[];
  groups: FilterGroup[];
  projects: ProjectCardData[];
  earlierWork: EarlierWork[];
  technologies: Technology[];
}

export function ProjectExplorer({
  items,
  groups,
  projects,
  earlierWork,
  technologies,
}: ProjectExplorerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [clearCount, setClearCount] = useState(0);

  const index = useMemo(() => createSearchIndex(items), [items]);
  const knownSlugs = useMemo(() => new Set(items.flatMap((item) => item.stack)), [items]);

  const search = searchParams.toString();
  const urlQuery = useMemo(() => parseProjectsQuery(search, knownSlugs), [search, knownSlugs]);

  // The UI follows the user's input at once; the URL catches up after the router transition.
  // A change of the URL that did not come from here (back/forward, a shared link) wins.
  const [query, setQuery] = useState(urlQuery);
  const [seenSearch, setSeenSearch] = useState(search);
  if (search !== seenSearch) {
    setSeenSearch(search);
    setQuery(urlQuery);
  }

  const results = useMemo(
    () => searchItems(items, query.q, query.tech, index),
    [items, query, index],
  );

  const projectsById = useMemo(() => new Map(projects.map((p) => [p.slug, p])), [projects]);
  const earlierById = useMemo(
    () => new Map(earlierWork.map((entry) => [earlierAnchorId(entry.title), entry])),
    [earlierWork],
  );

  const shownProjects = results
    .filter((item) => item.kind === 'case-study')
    .flatMap((item) => projectsById.get(item.id) ?? []);
  const shownEarlier = results
    .filter((item) => item.kind === 'earlier-work')
    .flatMap((item) => earlierById.get(item.id) ?? []);

  const update = (next: ProjectsQuery) => {
    setQuery({ tech: next.tech, q: normalizeQuery(next.q) });
    router.replace(serializeProjectsQuery(next), { scroll: false });
  };

  return (
    <ProjectsView
      key={clearCount}
      groups={groups}
      selected={query.tech}
      query={query.q}
      shown={results.length}
      total={items.length}
      projects={shownProjects}
      earlierWork={shownEarlier}
      technologies={technologies}
      keepOrder
      onTechChange={(tech) => update({ ...query, tech })}
      onQueryChange={(q) => update({ ...query, q })}
      onClear={() => {
        setClearCount((count) => count + 1);
        update({ tech: [], q: '' });
      }}
    />
  );
}
