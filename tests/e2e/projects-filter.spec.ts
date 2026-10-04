import { expect, test } from './fixtures';

const MOBILITY = 'Mobility Services Backend';
const AGENTIC = 'From Standard to Agentic Programming';

const card = (page: import('@playwright/test').Page, title: string) =>
  page.getByRole('heading', { level: 3, name: title });

test.describe('projects: technology filter', () => {
  test('java + claude shows the entries that use at least one of them and updates the URL', async ({
    page,
  }) => {
    await page.goto('/projects');
    await expect(page.getByRole('checkbox', { name: /^Java/ })).toBeEnabled();

    await page.getByRole('checkbox', { name: /^Java/ }).check();
    await page.getByRole('checkbox', { name: /^Claude/ }).check();

    await expect(page).toHaveURL(/\/projects\?tech=claude,java$/);
    await expect(card(page, AGENTIC)).toBeVisible();
    await expect(card(page, MOBILITY)).toHaveCount(0);
    await expect(page.getByText(/^Showing \d+ of \d+ items$/)).not.toHaveText(
      /^Showing (\d+) of \1 items$/,
    );
  });

  test('a shared URL reopens the same state', async ({ page }) => {
    await page.goto('/projects?tech=claude,java');

    await expect(page.getByRole('checkbox', { name: /^Java/ })).toBeChecked();
    await expect(page.getByRole('checkbox', { name: /^Claude/ })).toBeChecked();
    await expect(card(page, AGENTIC)).toBeVisible();
    await expect(card(page, MOBILITY)).toHaveCount(0);
  });

  test('an unknown technology is ignored', async ({ page }) => {
    await page.goto('/projects?tech=unknown');

    await expect(page.getByRole('checkbox', { name: /^Java/ })).toBeEnabled();
    await expect(page.getByRole('checkbox', { checked: true })).toHaveCount(0);
    await expect(page.getByText(/^Showing (\d+) of \1 items$/)).toBeVisible();
    await expect(card(page, MOBILITY)).toBeVisible();
  });

  test('removing the last filter restores the clean URL', async ({ page }) => {
    await page.goto('/projects?tech=java');
    await page.getByRole('checkbox', { name: /^Java/ }).uncheck();

    await expect(page).toHaveURL(/\/projects$/);
  });

  test('filter and search respond in under 200 ms with a 4x slower CPU (INP)', async ({
    page,
    browserName,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile' || browserName !== 'chromium', 'mobile only');

    await page.goto('/projects');
    await expect(page.getByRole('searchbox')).toBeEnabled();

    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

    await page.evaluate(() => {
      const durations: number[] = [];
      (window as unknown as { __inp: number[] }).__inp = durations;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) durations.push(entry.duration);
      }).observe({
        type: 'event',
        durationThreshold: 16,
        buffered: true,
      } as PerformanceObserverInit);
    });

    await page.getByRole('checkbox', { name: /^Java/ }).check();
    await expect(page).toHaveURL(/tech=java/);
    await page.getByRole('searchbox').fill('cloud');
    await expect(page).toHaveURL(/q=cloud/);
    await page.getByRole('checkbox', { name: /^Java/ }).uncheck();
    await expect(page).toHaveURL(/q=cloud$/);

    await page.waitForTimeout(300);
    const durations = await page.evaluate(() => (window as unknown as { __inp: number[] }).__inp);
    expect(Math.max(0, ...durations)).toBeLessThan(200);
  });
});
