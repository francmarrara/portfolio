import path from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';

import { loadContent } from '@/lib/content';
import {
  earlierAnchorId,
  featuredProjects,
  formatMonth,
  formatRolePeriod,
  isCurrentRole,
  parsePeriod,
  primaryStack,
  sortEarlierWork,
  sortProjects,
  sortRoles,
  techAll,
  techName,
  techSlugsForSkill,
  yearsOfExperience,
} from '@/lib/derive';
import type { Content } from '@/lib/schemas';

const repoRoot = path.resolve(import.meta.dirname, '../../..');
let content: Content;

beforeAll(() => {
  content = loadContent({ contentDir: path.join(repoRoot, 'tests/fixtures/content'), repoRoot });
});

const at = (iso: string) => new Date(`${iso}T12:00:00Z`);

describe('yearsOfExperience', () => {
  it('floors the months since the oldest start date', () => {
    expect(yearsOfExperience(content.career, at('2026-10-03'))).toBe(7);
  });

  it('counts a complete year on the exact day', () => {
    const career = [{ ...content.career[1]!, start: '2019-10-03' }];

    expect(yearsOfExperience(career, at('2026-10-03'))).toBe(7);
    expect(yearsOfExperience(career, at('2026-10-02'))).toBe(6);
  });

  it('treats a start without day as the first of the month', () => {
    const career = [{ ...content.career[1]!, start: '2019-05' }];

    expect(yearsOfExperience(career, at('2026-05-01'))).toBe(7);
    expect(yearsOfExperience(career, at('2026-04-30'))).toBe(6);
  });

  it('never goes below zero', () => {
    expect(yearsOfExperience(content.career, at('2015-01-01'))).toBe(0);
  });
});

describe('primaryStack', () => {
  it('lists highlighted skills in category and file order', () => {
    expect(primaryStack(content.skills).map((s) => s.name)).toEqual(['Java', 'Spring Boot', 'AWS']);
  });
});

describe('career helpers', () => {
  it('sorts roles by start date, newest first', () => {
    const reversed = [...content.career].reverse();

    expect(sortRoles(reversed).map((r) => r.company)).toEqual(['Acme Corp', 'Legacy Ltd']);
  });

  it('does not mutate its input', () => {
    const input = [...content.career].reverse();
    sortRoles(input);

    expect(input[0]!.company).toBe('Legacy Ltd');
  });

  it('merges tech and phase tech without duplicates', () => {
    expect(techAll(content.career[0]!)).toEqual([
      'java',
      'spring-boot',
      'mysql',
      'python',
      'aws',
      'claude',
    ]);
    expect(techAll(content.career[1]!)).toEqual(['java', 'mysql']);
  });

  it('merges role tech before phase tech', () => {
    const role = { ...content.career[0]!, tech: ['docker', 'java'] };

    expect(techAll(role).slice(0, 3)).toEqual(['docker', 'java', 'spring-boot']);
  });

  it('knows which role is current', () => {
    expect(isCurrentRole(content.career[0]!)).toBe(true);
    expect(isCurrentRole(content.career[1]!)).toBe(false);
  });
});

describe('earlier work helpers', () => {
  it('parses periods, with present as infinity and ~ ignored', () => {
    expect(parsePeriod('2019 → 2020')).toEqual({ start: 2019, end: 2020 });
    expect(parsePeriod('~2023 → present')).toEqual({ start: 2023, end: Infinity });
    expect(parsePeriod('2022-07 → ~2023').start).toBeCloseTo(2022 + 6 / 12);
  });

  it('sorts by end date descending, then start date descending', () => {
    expect(sortEarlierWork(content.earlierWork).map((w) => w.title)).toEqual([
      'Python Services',
      'OpenShift Delivery',
      'Energy Backend',
      'Registry Services',
      'B2B Data Platform',
    ]);

    const tie = [
      { ...content.earlierWork[0]!, title: 'Short', period: '2020 → 2021' },
      { ...content.earlierWork[0]!, title: 'Long', period: '2018 → 2021' },
    ];
    expect(sortEarlierWork(tie).map((w) => w.title)).toEqual(['Short', 'Long']);
  });

  it('builds the anchor id from the title', () => {
    expect(earlierAnchorId('B2B Data Platform')).toBe('earlier-b2b-data-platform');
  });
});

describe('project helpers', () => {
  it('sorts by year descending, then title', () => {
    const [alpha, beta] = [
      content.projects.find((p) => p.slug === 'alpha')!,
      content.projects.find((p) => p.slug === 'beta')!,
    ];
    const sameYear = { ...alpha, title: 'Aardvark', year: beta.year };

    expect(sortProjects([alpha, beta]).map((p) => p.slug)).toEqual(['beta', 'alpha']);
    expect(sortProjects([beta, sameYear]).map((p) => p.title)).toEqual([
      'Aardvark',
      'Beta Transition',
    ]);
  });

  it('returns the featured projects', () => {
    expect(featuredProjects(content.projects).map((p) => p.slug)).toEqual(['alpha']);
  });

  it('falls back to the three most recent projects when none is featured', () => {
    const projects = ['a', 'b', 'c', 'd'].map((slug, index) => ({
      ...content.projects[0]!,
      slug,
      title: slug,
      year: 2020 + index,
      featured: false,
    }));

    expect(featuredProjects(projects).map((p) => p.slug)).toEqual(['d', 'c', 'b']);
  });
});

describe('techName', () => {
  it('returns the display name, or the slug when unknown', () => {
    expect(techName(content.technologies, 'spring-boot')).toBe('Spring Boot');
    expect(techName(content.technologies, 'mystery')).toBe('mystery');
  });
});

describe('formatMonth', () => {
  it('formats YYYY-MM and YYYY-MM-DD as "Mon YYYY"', () => {
    expect(formatMonth('2022-07')).toBe('Jul 2022');
    expect(formatMonth('2019-05-06')).toBe('May 2019');
    expect(formatMonth('2020-12')).toBe('Dec 2020');
  });
});

describe('formatRolePeriod', () => {
  it('shows "present" for the current role', () => {
    expect(formatRolePeriod({ start: '2022-07', end: null })).toBe('Jul 2022 – present');
  });

  it('shows both dates for a past role', () => {
    expect(formatRolePeriod({ start: '2019-05-06', end: '2022-07' })).toBe('May 2019 – Jul 2022');
  });
});

describe('techSlugsForSkill', () => {
  it('returns the slugs related to the skill that are used by at least one entry', () => {
    const used = new Set(['java', 'python']);

    expect(techSlugsForSkill('Java', content.technologies, used)).toEqual(['java']);
    expect(techSlugsForSkill('Python', content.technologies, used)).toEqual(['python']);
  });

  it('returns nothing for a skill whose technology is not used', () => {
    expect(techSlugsForSkill('RabbitMQ', content.technologies, new Set(['java']))).toEqual([]);
  });

  it('returns nothing for a skill with no related technology', () => {
    expect(techSlugsForSkill('Unknown', content.technologies, new Set(['java']))).toEqual([]);
  });
});
