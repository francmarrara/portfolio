import fs from 'node:fs';
import path from 'node:path';

import { expect, test } from './fixtures';

const about = fs.readFileSync(path.resolve(process.cwd(), 'content/about.md'), 'utf8');
const email = /^email:\s*(\S+)\s*$/m.exec(about)?.[1] ?? '';

test('the email address is known', () => {
  expect(email).toMatch(/@/);
});

for (const [name, url, scope] of [
  ['the home page', '/', 'main'],
  ['the about page', '/about', 'main'],
  ['the footer', '/', 'footer'],
] as const) {
  test(`${name} has a mailto link with the visible address`, async ({ page }) => {
    await page.goto(url);

    const link = page.locator(scope).locator(`a[href="mailto:${email}"]`);
    await expect(link.first()).toBeVisible();
    await expect(link.first()).toContainText(email);
  });
}
