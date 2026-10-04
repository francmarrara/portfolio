import path from 'node:path';

import { vi } from 'vitest';

const repoRoot = path.resolve(import.meta.dirname, '../..');
const fixtures = path.join(repoRoot, 'tests/fixtures/content');

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), prefetch: vi.fn() }),
}));

vi.mock('@vercel/analytics/next', () => ({ Analytics: () => null }));

vi.mock('@/lib/content', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/content')>();
  return {
    ...actual,
    loadContent: () => actual.loadContent({ contentDir: fixtures, repoRoot }),
  };
});
