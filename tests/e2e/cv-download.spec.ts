import fs from 'node:fs';

import { expect, test } from './fixtures';

async function expectPdfDownload(
  page: import('@playwright/test').Page,
  trigger: () => Promise<void>,
) {
  const [download] = await Promise.all([page.waitForEvent('download'), trigger()]);

  expect(download.suggestedFilename()).toBe('Francesco-Marrara-CV.pdf');
  const file = await download.path();
  const bytes = fs.readFileSync(file);
  expect(bytes.length).toBeGreaterThan(0);
  expect(bytes.subarray(0, 5).toString('latin1')).toBe('%PDF-');
}

test('the home page offers the CV', async ({ page }) => {
  await page.goto('/');

  await expectPdfDownload(page, () =>
    page.locator('main').getByRole('link', { name: 'Download CV' }).click(),
  );
});

test('the about page offers the CV', async ({ page }) => {
  await page.goto('/about');

  await expectPdfDownload(page, () =>
    page.locator('main').getByRole('link', { name: 'Download CV' }).click(),
  );
});

test('the header offers the CV', async ({ page }) => {
  await page.goto('/');
  const toggle = page.locator('summary', { hasText: 'Menu' });
  if (await toggle.isVisible()) await toggle.click();

  await expectPdfDownload(page, () =>
    page.locator('header').getByRole('link', { name: 'Download CV' }).click(),
  );
});

test('the file is served as an attachment', async ({ request }) => {
  const response = await request.get('/cv.pdf');

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/pdf');
});
