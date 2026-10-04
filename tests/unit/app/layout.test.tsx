import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import RootLayout, { metadata } from '@/app/layout';
import { SITE_URL } from '@/lib/site';

describe('RootLayout', () => {
  const html = renderToStaticMarkup(
    <RootLayout>
      <p>page content</p>
    </RootLayout>,
  );

  it('sets the document language', () => {
    expect(html).toMatch(/<html[^>]*lang="en"/);
  });

  it('starts with the skip link', () => {
    const body = html.slice(html.indexOf('<body'));

    expect(body).toMatch(/<a[^>]*href="#content"[^>]*>Skip to content<\/a>/);
    expect(body.indexOf('Skip to content')).toBeLessThan(body.indexOf('<header'));
  });

  it('renders header, main with id content, and footer', () => {
    expect(html).toContain('<header');
    expect(html).toMatch(/<main[^>]*id="content"[^>]*>.*page content.*<\/main>/);
    expect(html).toContain('<footer');
    expect(html).toContain('Test Person');
  });

  it('advertises the RSS feed', () => {
    expect(metadata.alternates?.types).toMatchObject({ 'application/rss+xml': '/rss.xml' });
  });

  it('exposes the metadata base URL', () => {
    expect(String(metadata.metadataBase)).toBe(new URL(SITE_URL).href);
  });
});
