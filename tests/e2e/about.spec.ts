import { expect, test } from './fixtures';

test.describe('about: career', () => {
  test('shows the long bio and the spoken languages', async ({ page }) => {
    await page.goto('/about');

    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 2, name: 'Languages' })).toBeVisible();
    await expect(page.getByText('Italian', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('Native').first()).toBeVisible();
  });

  test('lists the roles from the newest to the oldest', async ({ page }) => {
    await page.goto('/about#career');

    const starts = await page
      .locator('#career summary')
      .evaluateAll((nodes) => nodes.map((node) => node.textContent ?? ''));
    expect(starts.length).toBeGreaterThan(1);
    expect(starts[0]).toContain('present');
  });

  test('the current role is open and the others can be toggled with Enter and Space', async ({
    page,
  }) => {
    await page.goto('/about#career');

    const details = page.locator('#career details');
    await expect(details.first()).toHaveAttribute('open', '');

    const second = details.nth(1);
    const summary = second.locator('summary');
    await expect(second).not.toHaveAttribute('open', '');

    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(second).toHaveAttribute('open', '');
    await page.keyboard.press('Enter');
    await expect(second).not.toHaveAttribute('open', '');

    await page.keyboard.press('Space');
    await expect(second).toHaveAttribute('open', '');
    await page.keyboard.press('Space');
    await expect(second).not.toHaveAttribute('open', '');
  });

  test('summaries are reachable with Tab and show a visible focus ring', async ({ page }) => {
    await page.goto('/about#career');

    const first = page.locator('#career summary').first();
    for (let i = 0; i < 30; i += 1) {
      await page.keyboard.press('Tab');
      if (await first.evaluate((node) => node === document.activeElement)) break;
    }
    await expect(first).toBeFocused();
    const shadow = await first.evaluate((node) => getComputedStyle(node).boxShadow);
    expect(shadow).not.toBe('none');
  });
});

test.describe('about: career without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('roles open with click and keyboard', async ({ page }) => {
    await page.goto('/about#career');

    const second = page.locator('#career details').nth(1);
    const summary = second.locator('summary');
    await expect(second).not.toHaveAttribute('open', '');

    await summary.click();
    await expect(second).toHaveAttribute('open', '');
    await summary.click();
    await expect(second).not.toHaveAttribute('open', '');

    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(second).toHaveAttribute('open', '');
  });
});

test.describe('about: skills', () => {
  test('the Skills menu entry leads to #skills, which shows every category', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('summary', { hasText: 'Menu' });
    if (await toggle.isVisible()) await toggle.click();

    await page.getByRole('link', { name: 'Skills', exact: true }).first().click();

    await expect(page).toHaveURL(/\/about#skills$/);
    await expect(page.locator('#skills')).toBeInViewport();
    for (const category of [
      'Languages',
      'Frameworks',
      'Cloud',
      'Databases',
      'DevOps',
      'Messaging',
      'AI',
      'Testing',
    ]) {
      await expect(
        page.locator('#skills').getByRole('heading', { level: 3, name: category }),
      ).toBeVisible();
    }
  });

  test('a skill linked to a used technology opens the filtered list', async ({ page }) => {
    await page.goto('/about#skills');

    await page.locator('#skills').getByRole('link', { name: 'Java', exact: true }).click();

    await expect(page).toHaveURL(/\/projects\?tech=java$/);
  });
});
