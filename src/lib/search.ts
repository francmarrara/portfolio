import Fuse, { type IFuseOptions } from 'fuse.js';

import {
  earlierAnchorId,
  parsePeriod,
  sortEarlierWork,
  sortProjects,
  techName,
} from '@/lib/derive';
import type { Content, Technology } from '@/lib/schemas';
import { truncate } from '@/lib/seo';
import { Q_MIN_LENGTH } from '@/lib/url-state';

const SUMMARY_MAX = 280;
// A plain number: the explorer receives these items as props, and JSON has no Infinity.
const PRESENT_YEAR = 9999;

export interface SearchItem {
  kind: 'case-study' | 'earlier-work';
  id: string;
  href: string;
  title: string;
  subtitle: string;
  sector: string;
  role: string;
  summary: string;
  stack: string[];
  stackNames: string[];
  body: string;
  sortKey: number;
  secondaryKey: number;
}

export const FUSE_OPTIONS: IFuseOptions<SearchItem> = {
  keys: [
    { name: 'title', weight: 3 },
    { name: 'subtitle', weight: 2 },
    { name: 'stackNames', weight: 2 },
    { name: 'sector', weight: 1 },
    { name: 'role', weight: 1 },
    { name: 'summary', weight: 1 },
    { name: 'body', weight: 0.5 },
  ],
  threshold: 0.35,
  // Without it Fuse only looks near the start of each field and would miss most of a case study.
  ignoreLocation: true,
  minMatchCharLength: 2,
};

export function buildSearchItems(
  content: Pick<Content, 'projects' | 'earlierWork' | 'technologies'>,
): SearchItem[] {
  const { technologies } = content;
  const names = (stack: string[]) => stack.map((slug) => techName(technologies, slug));

  const caseStudies = sortProjects(content.projects).map((project): SearchItem => ({
    kind: 'case-study',
    id: project.slug,
    href: `/projects/${project.slug}`,
    title: project.title,
    subtitle: project.subtitle,
    sector: project.sector,
    role: project.role,
    summary: truncate(project.sections[0]?.plainText ?? '', SUMMARY_MAX),
    stack: project.stack,
    stackNames: names(project.stack),
    body: project.sections.map((section) => section.plainText).join(' '),
    sortKey: project.year,
    secondaryKey: 0,
  }));

  const earlierWork = sortEarlierWork(content.earlierWork).map((entry): SearchItem => {
    const id = earlierAnchorId(entry.title);
    const { start, end } = parsePeriod(entry.period);
    return {
      kind: 'earlier-work',
      id,
      href: `/projects#${id}`,
      title: entry.title,
      subtitle: entry.company,
      sector: entry.sector,
      role: entry.role,
      summary: entry.summary,
      stack: entry.stack,
      stackNames: names(entry.stack),
      body: '',
      sortKey: Number.isFinite(end) ? end : PRESENT_YEAR,
      secondaryKey: start,
    };
  });

  return [...caseStudies, ...earlierWork];
}

export interface FilterOption {
  slug: string;
  name: string;
  count: number;
}

export interface FilterGroup {
  category: Technology['category'];
  label: string;
  options: FilterOption[];
}

const CATEGORY_LABELS: Record<Technology['category'], string> = {
  language: 'Languages',
  framework: 'Frameworks',
  database: 'Databases',
  cloud: 'Cloud',
  devops: 'DevOps',
  messaging: 'Messaging',
  ai: 'AI',
  testing: 'Testing',
};

export function buildFilterOptions(items: SearchItem[], technologies: Technology[]): FilterGroup[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    for (const slug of new Set(item.stack)) counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }

  return (Object.keys(CATEGORY_LABELS) as Technology['category'][])
    .map((category) => ({
      category,
      label: CATEGORY_LABELS[category],
      options: technologies
        .filter((technology) => technology.category === category && counts.has(technology.slug))
        .map((technology) => ({
          slug: technology.slug,
          name: technology.name,
          count: counts.get(technology.slug) ?? 0,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .filter((group) => group.options.length > 0);
}

export function applyTechFilter(items: SearchItem[], selected: string[]): SearchItem[] {
  if (selected.length === 0) return items;
  return items.filter((item) => item.stack.some((slug) => selected.includes(slug)));
}

export function searchItems(
  items: SearchItem[],
  query: string,
  selected: string[],
  index: Fuse<SearchItem> = new Fuse(items, FUSE_OPTIONS),
): SearchItem[] {
  const filtered = applyTechFilter(items, selected);
  if (query.length < Q_MIN_LENGTH) return filtered;

  const allowed = new Set(filtered.map((item) => item.id));
  const ranked = index
    .search(query)
    .map((result) => result.item)
    .filter((item) => allowed.has(item.id));

  // Case studies first, each group by Fuse score (the sort is stable).
  return [
    ...ranked.filter((item) => item.kind === 'case-study'),
    ...ranked.filter((item) => item.kind === 'earlier-work'),
  ];
}

export function createSearchIndex(items: SearchItem[]): Fuse<SearchItem> {
  return new Fuse(items, FUSE_OPTIONS);
}
