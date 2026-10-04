import { SKILL_CATEGORIES, toIsoDay } from '@/lib/constants';
import type {
  CareerRole,
  EarlierWork,
  Project,
  Skill,
  SkillsFile,
  Technology,
} from '@/lib/schemas';
import { slugify } from '@/lib/slug';

const compare = (a: number | string, b: number | string) => (a < b ? -1 : a > b ? 1 : 0);

export function yearsOfExperience(career: CareerRole[], now: Date = new Date()): number {
  const oldest = career.map((role) => toIsoDay(role.start)).sort()[0];
  if (!oldest) return 0;

  const [year, month, day] = oldest.split('-').map(Number) as [number, number, number];
  let months = (now.getUTCFullYear() - year) * 12 + (now.getUTCMonth() + 1 - month);
  if (now.getUTCDate() < day) months -= 1;
  return Math.max(0, Math.floor(months / 12));
}

export function primaryStack(skills: SkillsFile): Skill[] {
  return SKILL_CATEGORIES.flatMap((category) => skills[category]).filter(
    (skill) => skill.highlight,
  );
}

export function sortRoles(career: CareerRole[]): CareerRole[] {
  return [...career].sort((a, b) => compare(toIsoDay(b.start), toIsoDay(a.start)));
}

export function techAll(role: CareerRole): string[] {
  return [...new Set([...(role.tech ?? []), ...(role.phases ?? []).flatMap((p) => p.tech)])];
}

export function isCurrentRole(role: CareerRole): boolean {
  return role.end === null;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatMonth(value: string): string {
  const [year, month] = value.split('-');
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

export function formatRolePeriod(role: Pick<CareerRole, 'start' | 'end'>): string {
  return `${formatMonth(role.start)} – ${role.end === null ? 'present' : formatMonth(role.end)}`;
}

function parsePoint(point: string): number {
  if (point === 'present') return Infinity;
  const [year, month] = point.replace('~', '').split('-');
  return Number(year) + (month ? (Number(month) - 1) / 12 : 0);
}

export function parsePeriod(period: string): { start: number; end: number } {
  const [start = '', end = ''] = period.split(' → ');
  return { start: parsePoint(start), end: parsePoint(end) };
}

export function sortEarlierWork(items: EarlierWork[]): EarlierWork[] {
  return [...items].sort((a, b) => {
    const pa = parsePeriod(a.period);
    const pb = parsePeriod(b.period);
    return compare(pb.end, pa.end) || compare(pb.start, pa.start) || compare(a.title, b.title);
  });
}

export function earlierAnchorId(title: string): string {
  return `earlier-${slugify(title)}`;
}

export function sortProjects<T extends Pick<Project, 'year' | 'title'>>(projects: T[]): T[] {
  return [...projects].sort((a, b) => compare(b.year, a.year) || compare(a.title, b.title));
}

export function featuredProjects<T extends Pick<Project, 'year' | 'title' | 'featured'>>(
  projects: T[],
): T[] {
  const featured = sortProjects(projects.filter((project) => project.featured));
  return featured.length > 0 ? featured : sortProjects(projects).slice(0, 3);
}

export function techName(technologies: Technology[], slug: string): string {
  return technologies.find((technology) => technology.slug === slug)?.name ?? slug;
}

export function techSlugsForSkill(
  skillName: string,
  technologies: Technology[],
  usedSlugs: Iterable<string>,
): string[] {
  const used = new Set(usedSlugs);
  return technologies
    .filter((technology) => technology.related_skill === skillName && used.has(technology.slug))
    .map((technology) => technology.slug);
}
