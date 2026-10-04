import { expect, test as base } from '@playwright/test';

declare global {
  interface Window {
    __cspViolations?: string[];
  }
}

export const test = base.extend({
  page: async ({ page }, run) => {
    // Vercel Analytics is only served on Vercel: outside it the script would 404.
    await page.route('**/_vercel/**', (route) => route.fulfill({ status: 204, body: '' }));

    await page.addInitScript(() => {
      window.__cspViolations = [];
      document.addEventListener('securitypolicyviolation', (event) => {
        window.__cspViolations?.push(`${event.violatedDirective}: ${event.blockedURI}`);
      });
    });

    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() !== 'error') return;
      // Chromium logs a 404 document itself as a console error; the 404 spec asserts the status.
      if (message.location().url === page.url()) return;
      consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => consoleErrors.push(error.message));

    await run(page);

    const violations = await page
      .evaluate(() => window.__cspViolations ?? [])
      .catch((): string[] => []);
    expect(violations, 'CSP violations').toEqual([]);
    expect(consoleErrors, 'console errors').toEqual([]);
  },
});

export { expect };
