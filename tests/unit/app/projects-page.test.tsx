import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ProjectsPage, { generateMetadata } from '@/app/projects/page';
import { SITE_URL } from '@/lib/site';

describe('Projects page', () => {
  const html = renderToStaticMarkup(<ProjectsPage />);

  it('has exactly one h1', () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
  });

  it('renders the full list', () => {
    expect(html).toContain('Alpha Platform');
    expect(html).toContain('Beta Transition');
    expect(html).toContain('B2B Data Platform');
    expect(html).toContain('Showing 7 of 7 items');
  });

  it('has the earlier work section with the item anchors', () => {
    expect(html).toMatch(/id="earlier-work"/);
    expect(html).toMatch(/id="earlier-b2b-data-platform"/);
  });

  it('has its title and canonical URL', () => {
    const metadata = generateMetadata();

    expect(metadata.title).toBe('Projects — Francesco Marrara');
    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/projects`);
  });
});
