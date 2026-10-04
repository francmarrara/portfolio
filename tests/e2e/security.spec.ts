import { expect, test } from './fixtures';
import { sitemapPaths } from './helpers';

test('every page has a strict CSP meta as the first child of <head>', async ({ page, request }) => {
  const paths = [...(await sitemapPaths(request)), '/does-not-exist'];

  for (const route of paths) {
    await page.goto(route);

    const policy = await page.evaluate(() => {
      const first = document.head.firstElementChild;
      return first?.getAttribute('http-equiv') === 'Content-Security-Policy'
        ? first.getAttribute('content')
        : null;
    });

    expect(policy, `CSP meta first in <head> of ${route}`).not.toBeNull();
    const scriptSrc = /script-src ([^;]*)/.exec(policy ?? '')?.[1] ?? '';
    expect(scriptSrc, route).not.toContain("'unsafe-inline'");
    expect(scriptSrc, route).not.toContain("'unsafe-eval'");
  }
});
