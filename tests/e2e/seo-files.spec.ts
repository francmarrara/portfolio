import fs from 'node:fs';
import path from 'node:path';

import { SITE_URL } from '../../src/lib/site';
import { expect, test } from './fixtures';
import { sitemapPaths } from './helpers';

const projectsDir = path.resolve(process.cwd(), 'content/projects');
const projectCount = fs.readdirSync(projectsDir).filter((file) => file.endsWith('.md')).length;

test.describe('rss', () => {
  test('/rss.xml answers 200 as RSS with one item per case study', async ({ request }) => {
    const response = await request.get('/rss.xml');

    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('<rss version="2.0"');
    expect(body.match(/<item>/g)).toHaveLength(projectCount);
  });

  test('every page advertises the feed', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('link[rel="alternate"][type="application/rss+xml"]')).toHaveAttribute(
      'href',
      /\/rss\.xml$/,
    );
  });
});

const slugs = fs
  .readdirSync(projectsDir)
  .filter((file) => file.endsWith('.md'))
  .map((file) => file.replace(/\.md$/, ''));

test.describe('sitemap, robots and health', () => {
  test('the sitemap lists every route', async ({ request }) => {
    const paths = await sitemapPaths(request);

    expect(paths).toEqual(
      expect.arrayContaining([
        '/',
        '/projects',
        '/about',
        '/how-i-use-ai',
        ...slugs.map((slug) => `/projects/${slug}`),
      ]),
    );
    expect(paths).toHaveLength(4 + slugs.length);
  });

  test('robots.txt allows crawling and names the sitemap', async ({ request }) => {
    const body = await (await request.get('/robots.txt')).text();

    expect(body).toMatch(/User-Agent: \*/i);
    expect(body).toMatch(/Allow: \//i);
    expect(body).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  });

  test('/api/health answers {"status":"ok"}', async ({ request }) => {
    const response = await request.get('/api/health');

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok' });
  });
});

async function jsonLd(page: import('@playwright/test').Page) {
  const raw = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((nodes) => nodes.map((node) => node.textContent ?? ''));
  return raw.map((text) => JSON.parse(text) as { '@type': string });
}

test.describe('structured data and canonical URLs', () => {
  for (const route of ['/', '/about']) {
    test(`${route} has a Person JSON-LD`, async ({ page }) => {
      await page.goto(route);

      expect((await jsonLd(page)).map((entry) => entry['@type'])).toContain('Person');
    });
  }

  for (const slug of slugs) {
    test(`/projects/${slug} has a TechArticle JSON-LD`, async ({ page }) => {
      await page.goto(`/projects/${slug}`);

      expect((await jsonLd(page)).map((entry) => entry['@type'])).toContain('TechArticle');
    });
  }

  test('every sitemap page has the canonical URL SITE_URL + path', async ({ page, request }) => {
    for (const route of await sitemapPaths(request)) {
      await page.goto(route);

      const expected = route === '/' ? SITE_URL : `${SITE_URL}${route}`;
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', expected);
    }
  });
});
