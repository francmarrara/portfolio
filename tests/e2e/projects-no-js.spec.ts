import { expect, test } from './fixtures';

test.use({ javaScriptEnabled: false });

test.describe('projects without JavaScript', () => {
  test('shows the complete list with the controls disabled', async ({ page }) => {
    await page.goto('/projects');

    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(
      page.getByRole('heading', { level: 3, name: 'Mobility Services Backend' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: 'From Standard to Agentic Programming' }),
    ).toBeVisible();
    await expect(page.getByText(/^Showing (\d+) of \1 items$/)).toBeVisible();

    await expect(page.getByRole('searchbox')).toBeDisabled();
    const checkboxes = page.getByRole('checkbox');
    expect(await checkboxes.count()).toBeGreaterThan(0);
    for (const checkbox of await checkboxes.all()) await expect(checkbox).toBeDisabled();
  });

  test('an earlier work anchor reaches its entry', async ({ page }) => {
    await page.goto('/projects#earlier-b2b-data-platform');

    await expect(page.locator('#earlier-b2b-data-platform')).toBeInViewport();
    await expect(
      page
        .locator('#earlier-b2b-data-platform')
        .getByRole('heading', { name: 'B2B Data Platform' }),
    ).toBeVisible();
  });
});
