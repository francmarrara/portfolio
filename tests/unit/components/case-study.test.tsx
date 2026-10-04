import path from 'node:path';

import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { CaseStudy } from '@/components/sections/case-study';
import { loadContent } from '@/lib/content';
import { CASE_STUDY_SECTIONS, type Content } from '@/lib/schemas';
import { slugify } from '@/lib/slug';

const repoRoot = path.resolve(import.meta.dirname, '../../..');
let content: Content;

beforeAll(() => {
  content = loadContent({ contentDir: path.join(repoRoot, 'tests/fixtures/content'), repoRoot });
});

const alpha = () => content.projects.find((project) => project.slug === 'alpha')!;

describe('CaseStudy', () => {
  it('shows the title as the only h1 with subtitle, year, role and sector', () => {
    render(<CaseStudy project={alpha()} technologies={content.technologies} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Alpha Platform' })).toBeInTheDocument();
    expect(screen.getByText('A cloud-native backend for an energy company')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Energy')).toBeInTheDocument();
  });

  it('renders the 8 sections as h2, in order, with the slug of the title as id', () => {
    render(<CaseStudy project={alpha()} technologies={content.technologies} />);

    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings.map((heading) => heading.textContent)).toEqual([...CASE_STUDY_SECTIONS]);
    expect(headings.map((heading) => heading.id)).toEqual(
      CASE_STUDY_SECTIONS.map((title) => slugify(title)),
    );
  });

  it('renders the section markdown', () => {
    render(<CaseStudy project={alpha()} technologies={content.technologies} />);

    expect(
      screen.getByText('The company needed to modernise a legacy backend that was hard to evolve.'),
    ).toBeInTheDocument();
  });

  it('includes the table of contents', () => {
    render(<CaseStudy project={alpha()} technologies={content.technologies} />);

    expect(screen.getByRole('navigation', { name: 'Case study sections' })).toBeInTheDocument();
  });

  it('links each stack badge to the filtered projects list', () => {
    render(<CaseStudy project={alpha()} technologies={content.technologies} />);

    expect(screen.getByRole('link', { name: 'Python' })).toHaveAttribute(
      'href',
      '/projects?tech=python',
    );
  });

  it('shows no repository or demo link when both are null', () => {
    render(<CaseStudy project={alpha()} technologies={content.technologies} />);

    expect(screen.queryByRole('link', { name: 'View repository' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'View demo' })).toBeNull();
  });

  it('shows the repository and demo links when they have a value', () => {
    render(
      <CaseStudy
        project={{
          ...alpha(),
          repo: 'https://github.com/test-person/alpha',
          demo: 'https://alpha.example.com',
        }}
        technologies={content.technologies}
      />,
    );

    expect(screen.getByRole('link', { name: 'View repository' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View demo' })).toBeInTheDocument();
  });

  it('renders the cover only when present, with its alt text', () => {
    const { container, rerender } = render(
      <CaseStudy project={alpha()} technologies={content.technologies} />,
    );
    expect(container.querySelector('img')).toBeNull();

    rerender(
      <CaseStudy
        project={{ ...alpha(), cover: 'alpha/cover.webp', cover_alt: 'Platform diagram' }}
        technologies={content.technologies}
      />,
    );
    const image = screen.getByRole('img', { name: 'Platform diagram' });
    expect(image).toHaveAttribute('src', '/assets/alpha/cover.webp');
    expect(image.parentElement).toHaveClass('aspect-video');
  });
});
