import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import AboutPage, { generateMetadata } from '@/app/about/page';
import { SITE_URL } from '@/lib/site';

describe('About page', () => {
  const html = renderToStaticMarkup(<AboutPage />);

  it('has exactly one h1', () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
  });

  it('shows the long bio and the availability', () => {
    expect(html).toContain('Long bio used on the about page.');
    expect(html).toContain('Happy in the current role.');
  });

  it('lists the spoken languages with their level', () => {
    expect(html).toContain('Italian');
    expect(html).toContain('Native');
    expect(html).toContain('Spanish');
    expect(html).toContain('Basic');
  });

  it('has the career section with the roles', () => {
    expect(html).toMatch(/<section[^>]*id="career"/);
    expect(html).toContain('Acme Corp');
    expect(html).toContain('Legacy Ltd');
    expect(html.indexOf('Acme Corp')).toBeLessThan(html.indexOf('Legacy Ltd'));
  });

  it('has the skills section with the 8 categories', () => {
    expect(html).toMatch(/<section[^>]*id="skills"/);
    for (const category of [
      'Languages',
      'Frameworks',
      'Cloud',
      'Databases',
      'DevOps',
      'Messaging',
      'AI',
      'Testing',
    ]) {
      expect(html).toContain(`>${category}</h3>`);
    }
    expect(html).toContain('href="/projects?tech=java"');
  });

  it('has a contact section with a mailto link', () => {
    expect(html).toMatch(/<section[^>]*id="contact"/);
    expect(html).toContain('href="mailto:test.person@example.com"');
  });

  it('offers the CV download', () => {
    expect(html).toContain('href="/cv.pdf"');
    expect(html).toContain('download="Francesco-Marrara-CV.pdf"');
  });

  it('embeds the Person JSON-LD', () => {
    expect(html).toContain('"@type":"Person"');
  });

  it('has its title, canonical URL and a short description', () => {
    const metadata = generateMetadata();

    expect(metadata.title).toBe('About — Francesco Marrara');
    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/about`);
    expect((metadata.description ?? '').length).toBeLessThanOrEqual(160);
  });
});
