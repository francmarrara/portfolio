import type { APIRequestContext, Page } from '@playwright/test';

export async function sitemapPaths(request: APIRequestContext): Promise<string[]> {
  const response = await request.get('/sitemap.xml');
  const xml = await response.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => {
    const { pathname } = new URL(match[1]!);
    return pathname;
  });
}

// On small screens the navigation lives in a <details> menu.
export async function openMenuIfCollapsed(page: Page): Promise<void> {
  const toggle = page.locator('header summary', { hasText: 'Menu' });
  if (await toggle.isVisible()) await toggle.click();
}
