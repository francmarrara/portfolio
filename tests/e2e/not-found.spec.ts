import { expect, test } from './fixtures';

for (const url of ['/nope', '/projects/does-not-exist']) {
  test(`${url} answers 404 with the custom page`, async ({ page }) => {
    const response = await page.goto(url);

    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Go to the home page' })).toHaveAttribute(
      'href',
      '/',
    );
    await expect(page.getByRole('link', { name: 'Browse the projects' })).toHaveAttribute(
      'href',
      '/projects',
    );
  });
}
