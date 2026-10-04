import path from 'node:path';

import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, describe, expect, it } from 'vitest';

import { ProjectsFallback } from '@/components/sections/projects-fallback';
import { loadContent } from '@/lib/content';
import type { Content } from '@/lib/schemas';
import { buildFilterOptions, buildSearchItems } from '@/lib/search';

const repoRoot = path.resolve(import.meta.dirname, '../../..');
let html: string;

beforeAll(() => {
  const content: Content = loadContent({
    contentDir: path.join(repoRoot, 'tests/fixtures/content'),
    repoRoot,
  });
  const items = buildSearchItems(content);
  html = renderToStaticMarkup(
    <ProjectsFallback
      groups={buildFilterOptions(items, content.technologies)}
      total={items.length}
      projects={content.projects}
      earlierWork={content.earlierWork}
      technologies={content.technologies}
    />,
  );
});

describe('ProjectsFallback (the HTML served before hydration, and without JavaScript)', () => {
  it('contains the complete list', () => {
    expect(html).toContain('Alpha Platform');
    expect(html).toContain('Beta Transition');
    expect(html).toContain('B2B Data Platform');
    expect(html).toContain('Showing 7 of 7 items');
  });

  it('keeps the anchors of the earlier work entries', () => {
    expect(html).toContain('id="earlier-work"');
    expect(html).toContain('id="earlier-b2b-data-platform"');
  });

  it('renders every control disabled', () => {
    const inputs = html.match(/<input\b[^>]*>/g) ?? [];

    expect(inputs.length).toBeGreaterThan(1);
    for (const input of inputs) expect(input).toMatch(/\bdisabled\b/);
  });

  it('has no inline style attributes', () => {
    expect(html).not.toMatch(/\sstyle=/);
  });
});
