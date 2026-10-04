import AxeBuilder from '@axe-core/playwright';

import { expect, test } from './fixtures';
import { sitemapPaths } from './helpers';

test('no WCAG 2.1 AA violations on any page of the sitemap', async ({ page, request }) => {
  const paths = await sitemapPaths(request);
  expect(paths.length).toBeGreaterThan(0);

  for (const route of paths) {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(
      results.violations.map(
        (violation) => `${route}: ${violation.id} (${violation.nodes.length})`,
      ),
      `accessibility violations on ${route}`,
    ).toEqual([]);
  }
});
