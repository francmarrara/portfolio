import path from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';

import { loadContent } from '@/lib/content';
import type { Content } from '@/lib/schemas';
import {
  FUSE_OPTIONS,
  applyTechFilter,
  buildFilterOptions,
  buildSearchItems,
  searchItems,
  type SearchItem,
} from '@/lib/search';

const repoRoot = path.resolve(import.meta.dirname, '../../..');
let content: Content;
let items: SearchItem[];

beforeAll(() => {
  content = loadContent({ contentDir: path.join(repoRoot, 'tests/fixtures/content'), repoRoot });
  items = buildSearchItems(content);
});

const ids = (list: SearchItem[]) => list.map((item) => item.id);

describe('buildSearchItems', () => {
  it('has one item per case study and per earlier work entry', () => {
    expect(items.filter((item) => item.kind === 'case-study')).toHaveLength(2);
    expect(items.filter((item) => item.kind === 'earlier-work')).toHaveLength(5);
  });

  it('maps a case study to the fields of the SearchItem table', () => {
    const alpha = items.find((item) => item.id === 'alpha')!;

    expect(alpha).toMatchObject({
      kind: 'case-study',
      href: '/projects/alpha',
      title: 'Alpha Platform',
      subtitle: 'A cloud-native backend for an energy company',
      sector: 'Energy',
      role: 'Senior Software Engineer',
      stack: ['python', 'aws', 'docker'],
      stackNames: ['Python', 'AWS', 'Docker'],
      sortKey: 2024,
    });
    expect(alpha.summary).toBe(
      'The company needed to modernise a legacy backend that was hard to evolve.',
    );
    expect(alpha.body).toContain('New requirements arrived faster');
    expect(alpha.body).not.toContain('##');
  });

  it('truncates the case study summary to 280 characters', () => {
    const long = structuredClone(content);
    const project = long.projects[0]!;
    project.sections[0]!.plainText = 'word '.repeat(100).trim();

    const item = buildSearchItems(long).find((candidate) => candidate.id === project.slug)!;

    expect(item.summary.length).toBeLessThanOrEqual(280);
    expect(item.summary.endsWith('…')).toBe(true);
  });

  it('maps an earlier work entry with company as subtitle and an anchor href', () => {
    const entry = items.find((item) => item.id === 'earlier-b2b-data-platform')!;

    expect(entry).toMatchObject({
      kind: 'earlier-work',
      href: '/projects#earlier-b2b-data-platform',
      title: 'B2B Data Platform',
      subtitle: 'Legacy Ltd',
      sector: 'Data aggregation',
      role: 'Junior Software Engineer',
      summary: 'Platform that aggregates companies by VAT number.',
      stack: ['java', 'spring-boot', 'mysql'],
      stackNames: ['Java', 'Spring Boot', 'MySQL'],
      body: '',
    });
  });

  it('is JSON-serialisable (it crosses the server/client boundary)', () => {
    expect(JSON.parse(JSON.stringify(items))).toEqual(items);
  });

  it('orders case studies by year and earlier work by period, newest first', () => {
    expect(ids(items.filter((item) => item.kind === 'case-study'))).toEqual(['beta', 'alpha']);
    expect(ids(items.filter((item) => item.kind === 'earlier-work'))[0]).toBe(
      'earlier-python-services',
    );
    expect(items.at(0)?.kind).toBe('case-study');
  });
});

describe('buildFilterOptions', () => {
  it('lists only the technologies used by at least one item, with counts', () => {
    const groups = buildFilterOptions(items, content.technologies);
    const flat = groups.flatMap((group) => group.options);

    expect(flat.find((option) => option.slug === 'java')).toMatchObject({ name: 'Java', count: 5 });
    expect(flat.find((option) => option.slug === 'python')).toMatchObject({ count: 2 });
    expect(flat.find((option) => option.slug === 'claude')).toMatchObject({ count: 1 });
    expect(flat.find((option) => option.slug === 'rabbitmq')).toBeUndefined();
    expect(flat.find((option) => option.slug === 'junit')).toBeUndefined();
  });

  it('groups by category in a fixed order and sorts options by name', () => {
    const groups = buildFilterOptions(items, content.technologies);

    expect(groups.map((group) => group.category)).toEqual([
      'language',
      'framework',
      'database',
      'cloud',
      'devops',
      'ai',
    ]);
    expect(groups[0]!.label).toBe('Languages');
    expect(groups[0]!.options.map((option) => option.slug)).toEqual(['java', 'python']);
  });
});

describe('applyTechFilter', () => {
  it('returns everything without a selection', () => {
    expect(applyTechFilter(items, [])).toHaveLength(items.length);
  });

  it('keeps items that use at least one selected technology (OR)', () => {
    expect(ids(applyTechFilter(items, ['claude'])).sort()).toEqual(['beta']);
    expect(ids(applyTechFilter(items, ['claude', 'docker'])).sort()).toEqual(['alpha', 'beta']);
  });
});

describe('searchItems', () => {
  it('returns the filtered items in the default order without a query', () => {
    expect(ids(searchItems(items, '', []))).toEqual(ids(items));
    expect(ids(searchItems(items, '', ['mysql'])).sort()).toEqual([
      'earlier-b2b-data-platform',
      'earlier-registry-services',
    ]);
  });

  it('ignores a query shorter than 2 characters', () => {
    expect(searchItems(items, 'a', [])).toHaveLength(items.length);
  });

  it('matches case-insensitively and partially', () => {
    expect(ids(searchItems(items, 'ALPHA', []))).toContain('alpha');
    expect(ids(searchItems(items, 'transit', []))).toContain('beta');
  });

  it('finds a word that appears only well beyond the first 100 characters', () => {
    const marker = 'zyxwvutsrq';
    const long = items.map((item) =>
      item.id === 'alpha' ? { ...item, body: `${'filler '.repeat(40)}${marker}` } : item,
    );

    expect(ids(searchItems(long, marker, []))).toEqual(['alpha']);
  });

  it('matches the display name of a technology', () => {
    expect(ids(searchItems(items, 'OpenShift', []))).toContain('earlier-openshift-delivery');
  });

  it('combines filter and search with AND', () => {
    const result = searchItems(items, 'platform', ['claude']);
    expect(result).toEqual([]);

    const both = searchItems(items, 'platform', ['python']);
    expect(ids(both)).toContain('alpha');
    expect(ids(both)).not.toContain('earlier-b2b-data-platform');
  });

  it('keeps case studies before earlier work when searching', () => {
    const kinds = searchItems(items, 'java', []).map((item) => item.kind);
    const firstEarlier = kinds.indexOf('earlier-work');
    if (firstEarlier !== -1) {
      expect(kinds.slice(firstEarlier).every((kind) => kind === 'earlier-work')).toBe(true);
    }
  });

  it('returns nothing when nothing matches', () => {
    expect(searchItems(items, 'qqqqzzzz', [])).toEqual([]);
  });
});

describe('FUSE_OPTIONS', () => {
  it('uses the weighted keys and settings of the research notes', () => {
    expect(FUSE_OPTIONS).toMatchObject({
      threshold: 0.35,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });
    expect(FUSE_OPTIONS.keys).toEqual([
      { name: 'title', weight: 3 },
      { name: 'subtitle', weight: 2 },
      { name: 'stackNames', weight: 2 },
      { name: 'sector', weight: 1 },
      { name: 'role', weight: 1 },
      { name: 'summary', weight: 1 },
      { name: 'body', weight: 0.5 },
    ]);
  });
});
