import fs from 'node:fs';
import path from 'node:path';

import { expect, test } from './fixtures';

const SECTIONS = [
  'Context',
  'Problem',
  'Solution',
  'My role',
  'Technical decisions',
  'Trade-offs',
  'Impact',
  "What I'd do differently",
];

const projectsDir = path.resolve(process.cwd(), 'content/projects');
const slugs = fs
  .readdirSync(projectsDir)
  .filter((file) => file.endsWith('.md'))
  .map((file) => file.replace(/\.md$/, ''));

for (const slug of slugs) {
  test.describe(`case study ${slug}`, () => {
    test('has the 8 sections in order', async ({ page }) => {
      await page.goto(`/projects/${slug}`);

      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      const titles = await page.getByRole('heading', { level: 2 }).allTextContents();
      expect(titles).toEqual(SECTIONS);
    });

    test('table of contents links reach their section', async ({ page }) => {
      await page.goto(`/projects/${slug}`);

      const toc = page.getByRole('navigation', { name: 'Case study sections' });
      for (const title of SECTIONS) {
        await toc.getByRole('link', { name: title, exact: true }).click();
        await expect(
          page.getByRole('heading', { level: 2, name: title, exact: true }),
        ).toBeInViewport();
      }
    });

    test('shows no repository or demo link when they are null', async ({ page }) => {
      const source = fs.readFileSync(path.join(projectsDir, `${slug}.md`), 'utf8');
      await page.goto(`/projects/${slug}`);

      if (/^repo:\s*null\s*$/m.test(source)) {
        await expect(page.getByRole('link', { name: 'View repository' })).toHaveCount(0);
      }
      if (/^demo:\s*null\s*$/m.test(source)) {
        await expect(page.getByRole('link', { name: 'View demo' })).toHaveCount(0);
      }
    });

    test('a stack badge leads to the filtered projects list', async ({ page }) => {
      await page.goto(`/projects/${slug}`);

      const badge = page.locator('main a[href^="/projects?tech="]').first();
      const href = await badge.getAttribute('href');
      await badge.click();
      await expect(page).toHaveURL(new RegExp(`${href?.replace('?', '\\?')}$`));
    });
  });
}
