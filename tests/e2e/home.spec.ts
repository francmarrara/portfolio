import { expect, test } from './fixtures';

test.describe('home', () => {
  test.use({ viewport: { width: 360, height: 740 } });

  test('shows name, role, experience and main stack without scrolling at 360x740', async ({
    page,
  }) => {
    await page.goto('/');

    const viewport = page.viewportSize();
    expect(viewport).toEqual({ width: 360, height: 740 });

    const stack = page.getByRole('list', { name: 'Main stack' });
    const targets = [
      page.getByRole('heading', { level: 1 }),
      page.getByText('Senior Software Engineer', { exact: true }).first(),
      page.getByText(/^\d+\+ years of experience$/),
      stack,
    ];

    for (const target of targets) {
      await expect(target).toBeVisible();
      const box = await target.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.y).toBeGreaterThanOrEqual(0);
      expect(box!.y + box!.height).toBeLessThanOrEqual(740);
      expect(box!.x + box!.width).toBeLessThanOrEqual(360);
    }
  });

  test('has the featured projects and earlier work sections and a single h1', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 2, name: 'Featured projects' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Earlier work' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'See all' })).toHaveAttribute(
      'href',
      '/projects#earlier-work',
    );
  });
});
