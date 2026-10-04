import path from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';

import { loadContent } from '@/lib/content';
import type { Content } from '@/lib/schemas';
import {
  buildMetadata,
  pageTitle,
  personJsonLd,
  serializeJsonLd,
  techArticleJsonLd,
  truncate,
} from '@/lib/seo';
import { SITE_URL } from '@/lib/site';

const repoRoot = path.resolve(import.meta.dirname, '../../..');
let content: Content;

beforeAll(() => {
  content = loadContent({ contentDir: path.join(repoRoot, 'tests/fixtures/content'), repoRoot });
});

describe('truncate', () => {
  it('keeps short text untouched', () => {
    expect(truncate('Short text', 160)).toBe('Short text');
  });

  it('cuts long text at a word boundary within the limit', () => {
    const result = truncate('word '.repeat(60), 160);

    expect(result.length).toBeLessThanOrEqual(160);
    expect(result.endsWith('word…')).toBe(true);
  });

  it('cuts a single long word hard', () => {
    const result = truncate('x'.repeat(200), 50);

    expect(result).toHaveLength(50);
    expect(result.endsWith('…')).toBe(true);
  });
});

describe('pageTitle', () => {
  it('appends the site name', () => {
    expect(pageTitle('About')).toBe('About — Francesco Marrara');
  });
});

describe('buildMetadata', () => {
  it('builds title, description, canonical and Open Graph tags', () => {
    const metadata = buildMetadata({
      title: pageTitle('Projects'),
      description: 'All the projects.',
      path: '/projects',
      type: 'website',
    });

    expect(metadata.title).toBe('Projects — Francesco Marrara');
    expect(metadata.description).toBe('All the projects.');
    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/projects`);
    expect(metadata.alternates?.types).toEqual({ 'application/rss+xml': '/rss.xml' });
    expect(metadata.openGraph).toMatchObject({
      title: 'Projects — Francesco Marrara',
      description: 'All the projects.',
      url: `${SITE_URL}/projects`,
      type: 'website',
    });
  });

  it('truncates the description to 160 characters', () => {
    const metadata = buildMetadata({
      title: 'T',
      description: 'long '.repeat(100),
      path: '/',
      type: 'profile',
    });

    expect((metadata.description ?? '').length).toBeLessThanOrEqual(160);
  });
});

describe('personJsonLd', () => {
  it('describes the person with their main stack', () => {
    const data = personJsonLd(content.profile, [{ name: 'Java' }, { name: 'AWS' }]);

    expect(data).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Test Person',
      jobTitle: 'Senior Software Engineer',
      email: 'test.person@example.com',
      url: SITE_URL,
      sameAs: [content.profile.links.linkedin, content.profile.links.github],
      knowsAbout: ['Java', 'AWS'],
    });
  });
});

describe('techArticleJsonLd', () => {
  it('describes a case study', () => {
    const project = content.projects.find((p) => p.slug === 'alpha')!;
    const data = techArticleJsonLd(project, content.profile, ['Python', 'AWS']);

    expect(data).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: 'Alpha Platform',
      description: project.subtitle,
      datePublished: '2024',
      keywords: 'Python, AWS',
      url: `${SITE_URL}/projects/alpha`,
      author: { '@type': 'Person', name: 'Test Person' },
    });
  });
});

describe('serializeJsonLd', () => {
  it('escapes < so the script tag cannot be closed early', () => {
    const json = serializeJsonLd({ text: '</script><script>alert(1)</script>' });

    expect(json).not.toContain('<');
    expect(JSON.parse(json)).toEqual({ text: '</script><script>alert(1)</script>' });
  });
});
