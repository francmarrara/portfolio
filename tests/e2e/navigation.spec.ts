import { expect, test } from './fixtures';
import { openMenuIfCollapsed, sitemapPaths } from './helpers';

const ENTRIES = [
  { name: 'Projects', url: /\/projects$/ },
  { name: 'About', url: /\/about$/ },
  { name: 'Skills', url: /\/about#skills$/ },
  { name: 'How I use AI', url: /\/how-i-use-ai$/ },
];

test.describe('menu', () => {
  for (const entry of ENTRIES) {
    test(`"${entry.name}" navigates`, async ({ page }) => {
      await page.goto('/');
      await openMenuIfCollapsed(page);

      await page.locator('header').getByRole('link', { name: entry.name, exact: true }).click();

      await expect(page).toHaveURL(entry.url);
    });
  }

  test('the name leads home', async ({ page }) => {
    await page.goto('/about');

    await page
      .locator('header')
      .getByRole('link', { name: /\w+ \w+/ })
      .first()
      .click();

    await expect(page).toHaveURL(/\/$/);
  });

  test('marks the current page with aria-current', async ({ page }) => {
    await page.goto('/about');
    await openMenuIfCollapsed(page);

    await expect(
      page.locator('header').getByRole('link', { name: 'About', exact: true }),
    ).toHaveAttribute('aria-current', 'page');
    await expect(
      page.locator('header').getByRole('link', { name: 'Projects', exact: true }),
    ).not.toHaveAttribute('aria-current', 'page');
  });
});

test.describe('mobile menu without JavaScript', () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 390, height: 800 } });

  test('opens with a click and navigates', async ({ page }) => {
    await page.goto('/');

    await page.locator('header summary', { hasText: 'Menu' }).click();
    await page.locator('header').getByRole('link', { name: 'About', exact: true }).click();

    await expect(page).toHaveURL(/\/about$/);
  });
});

test('the skip link is the first focusable element and leads to #content', async ({ page }) => {
  await page.goto('/');

  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();

  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#content$/);
});

test.describe('no horizontal scroll at 360px', () => {
  test.use({ viewport: { width: 360, height: 740 } });

  test('on every page of the sitemap', async ({ page, request }) => {
    for (const route of await sitemapPaths(request)) {
      await page.goto(route);

      const width = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(width, `scrollWidth of ${route}`).toBeLessThanOrEqual(360);
    }
  });
});
