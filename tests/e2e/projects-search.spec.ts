import { expect, test } from './fixtures';

test.describe('projects: search', () => {
  test('a search combined with a filter narrows the list (AND)', async ({ page }) => {
    await page.goto('/projects');
    await expect(page.getByRole('searchbox')).toBeEnabled();

    await page.getByRole('searchbox').fill('cloud');
    await expect(page).toHaveURL(/\/projects\?q=cloud$/);
    await expect(
      page.getByRole('heading', { level: 3, name: 'Mobility Services Backend' }),
    ).toBeVisible();

    await page.getByRole('checkbox', { name: /^Python/ }).check();
    await expect(page).toHaveURL(/\/projects\?tech=python&q=cloud$/);
    await expect(
      page.getByRole('heading', { level: 3, name: 'Mobility Services Backend' }),
    ).toBeVisible();

    await page.getByRole('checkbox', { name: /^Python/ }).uncheck();
    await page.getByRole('checkbox', { name: /^Claude/ }).check();
    await expect(
      page.getByRole('heading', { level: 3, name: 'Mobility Services Backend' }),
    ).toHaveCount(0);
  });

  test('no results shows a message and "Clear filters" restores the clean URL', async ({
    page,
  }) => {
    await page.goto('/projects');
    await expect(page.getByRole('searchbox')).toBeEnabled();

    await page.getByRole('searchbox').fill('qqqqzzzz');
    await expect(page.getByText('No projects match your filters.')).toBeVisible();
    await expect(page.getByText(/^Showing 0 of \d+ items$/)).toBeVisible();

    await page.getByRole('button', { name: 'Clear filters' }).click();

    await expect(page).toHaveURL(/\/projects$/);
    await expect(page.getByRole('searchbox')).toHaveValue('');
    await expect(page.getByText('No projects match your filters.')).toHaveCount(0);
  });

  test('Escape empties the search', async ({ page }) => {
    await page.goto('/projects?q=cloud');
    const input = page.getByRole('searchbox');
    await expect(input).toHaveValue('cloud');

    await input.press('Escape');

    await expect(input).toHaveValue('');
    await expect(page).toHaveURL(/\/projects$/);
  });
});
