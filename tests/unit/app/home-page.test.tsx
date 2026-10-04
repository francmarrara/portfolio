import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { SITE_URL } from '@/lib/site';
import Home, { generateMetadata } from '@/app/page';

describe('Home page', () => {
  const html = renderToStaticMarkup(<Home />);

  it('has exactly one h1 with the person name', () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toMatch(/<h1[^>]*>Test Person<\/h1>/);
  });

  it('contains the hero, the featured projects and the earlier work', () => {
    expect(html).toContain('years of experience');
    expect(html).toContain('Featured projects');
    expect(html).toContain('Earlier work');
    expect(html).toContain('href="/projects#earlier-work"');
  });

  it('embeds the Person JSON-LD', () => {
    expect(html).toContain('type="application/ld+json"');
    expect(html).toContain('"@type":"Person"');
  });

  it('has the home title and a description of at most 160 characters', () => {
    const metadata = generateMetadata();

    expect(metadata.title).toBe('Test Person — Senior Software Engineer');
    expect((metadata.description ?? '').length).toBeLessThanOrEqual(160);
    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/`);
    expect(metadata.openGraph).toMatchObject({ type: 'profile' });
  });
});
