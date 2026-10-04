import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EarlierWorkList } from '@/components/sections/earlier-work-list';
import type { EarlierWork, Technology } from '@/lib/schemas';

const technologies: Technology[] = [
  { slug: 'java', name: 'Java', category: 'language', related_skill: 'Java' },
];

const make = (title: string, period: string): EarlierWork => ({
  title,
  company: 'Acme',
  period,
  sector: 'Energy',
  role: 'Engineer',
  summary: `Summary of ${title}`,
  stack: ['java'],
});

const items = [
  make('Oldest', '2015 → 2016'),
  make('Second', '2017 → 2018'),
  make('Third', '2019 → 2020'),
  make('Fourth', '2020 → 2022'),
  make('Newest', '~2023 → present'),
];

const titles = () =>
  screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent);

describe('EarlierWorkList', () => {
  it('compact: shows at most `limit` items in the derive order', () => {
    render(
      <EarlierWorkList items={items} technologies={technologies} limit={4} variant="compact" />,
    );

    expect(titles()).toEqual(['Newest', 'Fourth', 'Third', 'Second']);
  });

  it('compact: links "See all" to the earlier work section of /projects', () => {
    render(
      <EarlierWorkList items={items} technologies={technologies} limit={4} variant="compact" />,
    );

    expect(screen.getByRole('link', { name: /See all/ })).toHaveAttribute(
      'href',
      '/projects#earlier-work',
    );
  });

  it('compact: links each item to its anchor in /projects', () => {
    render(
      <EarlierWorkList items={items} technologies={technologies} limit={4} variant="compact" />,
    );

    expect(screen.getByRole('link', { name: 'Newest' })).toHaveAttribute(
      'href',
      '/projects#earlier-newest',
    );
  });

  it('compact: with fewer items than the limit shows them all and keeps "See all"', () => {
    render(
      <EarlierWorkList
        items={items.slice(0, 2)}
        technologies={technologies}
        limit={4}
        variant="compact"
      />,
    );

    expect(titles()).toEqual(['Second', 'Oldest']);
    expect(screen.getByRole('link', { name: /See all/ })).toBeInTheDocument();
  });

  it('full: shows every item with an anchor id and no "See all" link', () => {
    const { container } = render(
      <EarlierWorkList items={items} technologies={technologies} variant="full" />,
    );

    expect(titles()).toHaveLength(5);
    expect(container.querySelector('#earlier-newest')).not.toBeNull();
    expect(container.querySelector('#earlier-oldest')).not.toBeNull();
    expect(screen.queryByRole('link', { name: /See all/ })).toBeNull();
  });

  it('shows company, period, role, sector, summary and stack', () => {
    render(
      <EarlierWorkList
        items={[make('Newest', '~2023 → present')]}
        technologies={technologies}
        variant="full"
      />,
    );

    expect(screen.getByText(/Acme/)).toBeInTheDocument();
    expect(screen.getByText(/~2023 → present/)).toBeInTheDocument();
    expect(screen.getByText(/Engineer/)).toBeInTheDocument();
    expect(screen.getByText(/Energy/)).toBeInTheDocument();
    expect(screen.getByText('Summary of Newest')).toBeInTheDocument();
    expect(screen.getByText('Java')).toBeInTheDocument();
  });

  it('renders nothing without items', () => {
    const { container } = render(
      <EarlierWorkList items={[]} technologies={technologies} variant="compact" limit={4} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
