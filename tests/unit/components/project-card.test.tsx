import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProjectCard } from '@/components/sections/project-card';
import type { Project, Technology } from '@/lib/schemas';

const technologies: Technology[] = [
  { slug: 'python', name: 'Python', category: 'language', related_skill: 'Python' },
  { slug: 'aws', name: 'AWS', category: 'cloud', related_skill: 'AWS' },
];

const project: Project = {
  slug: 'alpha',
  title: 'Alpha Platform',
  subtitle: 'A cloud-native backend for an energy company',
  year: 2024,
  role: 'Senior Software Engineer',
  sector: 'Energy',
  stack: ['python', 'aws'],
  featured: true,
  repo: null,
  demo: null,
  sections: [],
};

describe('ProjectCard', () => {
  it('shows title, subtitle, year and stack', () => {
    render(<ProjectCard project={project} technologies={technologies} />);

    expect(screen.getByRole('heading', { name: /Alpha Platform/ })).toBeInTheDocument();
    expect(screen.getByText('A cloud-native backend for an energy company')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('AWS')).toBeInTheDocument();
  });

  it('links the title to the case study', () => {
    render(<ProjectCard project={project} technologies={technologies} />);

    expect(screen.getByRole('link', { name: 'Alpha Platform' })).toHaveAttribute(
      'href',
      '/projects/alpha',
    );
  });

  it('has no image without a cover', () => {
    const { container } = render(<ProjectCard project={project} technologies={technologies} />);

    expect(container.querySelector('img')).toBeNull();
  });

  it('renders the cover with its alt text in an aspect-video container', () => {
    const { container } = render(
      <ProjectCard
        project={{ ...project, cover: 'alpha/cover.webp', cover_alt: 'Diagram of the platform' }}
        technologies={technologies}
      />,
    );

    const image = screen.getByRole('img', { name: 'Diagram of the platform' });
    expect(image).toHaveAttribute('src', '/assets/alpha/cover.webp');
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image.parentElement).toHaveClass('aspect-video');
    expect(container.querySelectorAll('img')).toHaveLength(1);
  });
});
