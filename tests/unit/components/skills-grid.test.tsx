import path from 'node:path';

import { render, screen, within } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { SkillsGrid } from '@/components/sections/skills-grid';
import { loadContent } from '@/lib/content';
import type { Content } from '@/lib/schemas';

const repoRoot = path.resolve(import.meta.dirname, '../../..');
let content: Content;

beforeAll(() => {
  content = loadContent({ contentDir: path.join(repoRoot, 'tests/fixtures/content'), repoRoot });
});

const renderGrid = (used: string[]) =>
  render(
    <SkillsGrid skills={content.skills} technologies={content.technologies} usedSlugs={used} />,
  );

describe('SkillsGrid', () => {
  it('shows the 8 categories in the order of the file', () => {
    renderGrid([]);

    const headings = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(headings).toEqual([
      'Languages',
      'Frameworks',
      'Cloud',
      'Databases',
      'DevOps',
      'Messaging',
      'AI',
      'Testing',
    ]);
  });

  it('shows the level of each skill as text', () => {
    renderGrid([]);

    const languages = screen.getByRole('group', { name: 'Languages' });
    expect(within(languages).getByText('Java').closest('li')).toHaveTextContent('Expert');
    expect(within(languages).getByText('Python').closest('li')).toHaveTextContent('Intermediate');
    expect(screen.getByText('RabbitMQ').closest('li')).toHaveTextContent('Basic');
    expect(screen.getByText('Docker').closest('li')).toHaveTextContent('Advanced');
  });

  it('shows versions and services when present', () => {
    renderGrid([]);

    expect(screen.getByText('Java').closest('li')).toHaveTextContent('7 → latest LTS');
    expect(screen.getByText('AWS').closest('li')).toHaveTextContent('ECS, Lambda');
  });

  it('links a skill to the filtered projects only when its technology is used', () => {
    renderGrid(['java']);

    expect(screen.getByRole('link', { name: 'Java' })).toHaveAttribute(
      'href',
      '/projects?tech=java',
    );
    expect(screen.queryByRole('link', { name: 'Python' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'RabbitMQ' })).toBeNull();
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });
});
