import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FeaturedProjects } from '@/components/sections/featured-projects';
import type { Project, Technology } from '@/lib/schemas';

const technologies: Technology[] = [
  { slug: 'python', name: 'Python', category: 'language', related_skill: 'Python' },
];

const make = (slug: string, year: number, featured: boolean): Project => ({
  slug,
  title: `Project ${slug}`,
  subtitle: `Subtitle ${slug}`,
  year,
  role: 'Engineer',
  sector: 'Energy',
  stack: ['python'],
  featured,
  repo: null,
  demo: null,
  sections: [],
});

const titles = () =>
  screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent);

describe('FeaturedProjects', () => {
  it('lists the featured projects, newest first', () => {
    render(
      <FeaturedProjects
        projects={[make('a', 2020, true), make('b', 2024, true), make('c', 2025, false)]}
        technologies={technologies}
      />,
    );

    expect(titles()).toEqual(['Project b', 'Project a']);
  });

  it('falls back to the 3 most recent projects when none is featured', () => {
    render(
      <FeaturedProjects
        projects={[
          make('a', 2020, false),
          make('b', 2024, false),
          make('c', 2022, false),
          make('d', 2023, false),
        ]}
        technologies={technologies}
      />,
    );

    expect(titles()).toEqual(['Project b', 'Project d', 'Project c']);
  });

  it('has a section heading and a link to all the projects', () => {
    render(<FeaturedProjects projects={[make('a', 2024, true)]} technologies={technologies} />);

    expect(screen.getByRole('heading', { level: 2, name: 'Featured projects' })).toBeVisible();
    expect(screen.getByRole('link', { name: /All projects/ })).toHaveAttribute('href', '/projects');
  });

  it('renders nothing without projects', () => {
    const { container } = render(<FeaturedProjects projects={[]} technologies={technologies} />);

    expect(container).toBeEmptyDOMElement();
  });
});
