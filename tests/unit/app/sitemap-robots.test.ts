import { describe, expect, it } from 'vitest';

import robots, { dynamic as robotsDynamic } from '@/app/robots';
import sitemap, { dynamic as sitemapDynamic } from '@/app/sitemap';
import { SITE_URL } from '@/lib/site';

describe('sitemap', () => {
  it('is statically generated', () => {
    expect(sitemapDynamic).toBe('force-static');
  });

  it('lists every public route with absolute URLs, including each case study', () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toEqual([
      SITE_URL,
      `${SITE_URL}/projects`,
      `${SITE_URL}/about`,
      `${SITE_URL}/how-i-use-ai`,
      `${SITE_URL}/projects/beta`,
      `${SITE_URL}/projects/alpha`,
    ]);
  });

  it('does not list the 404 page or the API', () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls.some((url) => url.includes('404') || url.includes('/api'))).toBe(false);
  });
});

describe('robots', () => {
  it('is statically generated', () => {
    expect(robotsDynamic).toBe('force-static');
  });

  it('allows everything and points to the sitemap', () => {
    expect(robots()).toEqual({
      rules: { userAgent: '*', allow: '/' },
      sitemap: `${SITE_URL}/sitemap.xml`,
    });
  });
});
