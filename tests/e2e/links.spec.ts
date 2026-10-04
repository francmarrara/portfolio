import { expect, test } from './fixtures';
import { sitemapPaths } from './helpers';

test('every internal link answers 200 and every fragment has a target', async ({
  page,
  request,
}) => {
  const paths = await sitemapPaths(request);
  const checked = new Map<string, string>();

  const htmlOf = async (path: string) => {
    if (!checked.has(path)) checked.set(path, await (await request.get(path)).text());
    return checked.get(path)!;
  };

  for (const route of paths) {
    await page.goto(route);
    const hrefs = await page
      .locator('a[href^="/"], a[href^="#"]')
      .evaluateAll((nodes) => [...new Set(nodes.map((node) => node.getAttribute('href') ?? ''))]);

    for (const href of hrefs) {
      const url = new URL(href, `http://site${route}`);
      const target = url.pathname;

      const response = await request.get(target);
      expect(response.status(), `${href} (linked from ${route})`).toBe(200);

      if (url.hash.length > 1) {
        const id = url.hash.slice(1);
        const html = await htmlOf(target);
        expect(html, `#${id} on ${target} (linked from ${route})`).toMatch(
          new RegExp(`\\sid="${id}"`),
        );
      }
    }
  }
});
