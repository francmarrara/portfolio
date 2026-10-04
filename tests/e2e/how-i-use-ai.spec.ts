import fs from 'node:fs';
import path from 'node:path';

import matter from 'gray-matter';

import { expect, test } from './fixtures';

const root = process.cwd();
const { data } = matter(fs.readFileSync(path.join(root, 'content/how-i-use-ai.md'), 'utf8'));
const specLinks = data.spec_links as { label: string; path: string }[];

test('renders the title and the body', async ({ page }) => {
  await page.goto('/how-i-use-ai');

  await expect(page.getByRole('heading', { level: 1, name: data.title as string })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible();
});

test('every spec link points to an existing file with the expected URL format', async ({
  page,
}) => {
  await page.goto('/how-i-use-ai');

  for (const link of specLinks) {
    expect(fs.existsSync(path.join(root, link.path)), `${link.path} exists`).toBe(true);

    const anchor = page.getByRole('link', { name: link.label });
    await expect(anchor).toHaveAttribute(
      'href',
      new RegExp(`^https://github\\.com/[^/]+/[^/]+/blob/main/${link.path}$`),
    );
  }
});
