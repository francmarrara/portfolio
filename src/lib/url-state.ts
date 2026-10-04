// Normative contract: specs/001-personal-portfolio/contracts/ui-contracts.md §3

export interface ProjectsQuery {
  tech: string[];
  q: string;
}

const Q_MAX_LENGTH = 100;
export const Q_MIN_LENGTH = 2;

export function normalizeQuery(raw: string): string {
  const text = raw.replace(/\s+/g, ' ').trim().slice(0, Q_MAX_LENGTH).trim();
  return text.length < Q_MIN_LENGTH ? '' : text;
}

export function parseProjectsQuery(
  input: URLSearchParams | string,
  knownSlugs: Iterable<string>,
): ProjectsQuery {
  const params = typeof input === 'string' ? new URLSearchParams(input) : input;
  const known = new Set(knownSlugs);
  const tech = (params.get('tech') ?? '').split(',').filter((slug) => known.has(slug));

  return {
    tech: [...new Set(tech)].sort(),
    q: normalizeQuery(params.get('q') ?? ''),
  };
}

export function serializeProjectsQuery({ tech, q }: ProjectsQuery): string {
  const parts: string[] = [];
  if (tech.length > 0) parts.push(`tech=${[...new Set(tech)].sort().join(',')}`);

  const query = normalizeQuery(q);
  if (query) parts.push(`q=${encodeURIComponent(query)}`);

  return parts.length > 0 ? `/projects?${parts.join('&')}` : '/projects';
}
