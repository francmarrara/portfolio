import path from 'node:path';

import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { ProjectExplorer } from '@/components/sections/project-explorer';
import { loadContent } from '@/lib/content';
import type { Content } from '@/lib/schemas';
import { buildFilterOptions, buildSearchItems } from '@/lib/search';

const nav = vi.hoisted(() => ({ replace: vi.fn(), search: '' }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: nav.replace }),
  useSearchParams: () => new URLSearchParams(nav.search),
}));

const repoRoot = path.resolve(import.meta.dirname, '../../..');
let content: Content;

beforeAll(() => {
  content = loadContent({ contentDir: path.join(repoRoot, 'tests/fixtures/content'), repoRoot });
});

beforeEach(() => {
  nav.replace.mockClear();
  nav.search = '';
});

afterEach(() => {
  vi.useRealTimers();
});

function renderExplorer() {
  const items = buildSearchItems(content);
  return render(
    <ProjectExplorer
      items={items}
      groups={buildFilterOptions(items, content.technologies)}
      projects={content.projects}
      earlierWork={content.earlierWork}
      technologies={content.technologies}
    />,
  );
}

const cardTitles = () =>
  screen
    .queryAllByRole('heading', { level: 3 })
    .map((heading) => heading.textContent)
    .sort();

describe('ProjectExplorer', () => {
  it('shows everything without filters', () => {
    renderExplorer();

    expect(cardTitles()).toHaveLength(7);
    expect(screen.getByText('Showing 7 of 7 items')).toBeInTheDocument();
    expect(document.getElementById('earlier-work')).not.toBeNull();
  });

  it('announces the count in a polite live region', () => {
    renderExplorer();

    expect(screen.getByText('Showing 7 of 7 items')).toHaveAttribute('aria-live', 'polite');
  });

  it('filters by the technologies in the URL', () => {
    nav.search = 'tech=claude';
    renderExplorer();

    expect(cardTitles()).toEqual(['Beta Transition']);
    expect(screen.getByText('Showing 1 of 7 items')).toBeInTheDocument();
    expect(document.getElementById('earlier-work')).toBeNull();
    expect(screen.getByRole('checkbox', { name: 'Claude (1)' })).toBeChecked();
  });

  it('searches with the q in the URL', () => {
    nav.search = 'q=OpenShift';
    renderExplorer();

    expect(cardTitles()).toContain('OpenShift Delivery');
    expect(screen.getByRole('searchbox')).toHaveValue('OpenShift');
  });

  it('ignores unknown technologies in the URL', () => {
    nav.search = 'tech=unknown';
    renderExplorer();

    expect(screen.getByText('Showing 7 of 7 items')).toBeInTheDocument();
  });

  it('replaces the URL with the normalised state when a technology is selected', () => {
    nav.search = 'tech=java';
    renderExplorer();

    fireEvent.click(screen.getByRole('checkbox', { name: 'Python (2)' }));

    expect(nav.replace).toHaveBeenCalledWith('/projects?tech=java,python', { scroll: false });
  });

  it('shows the new selection at once, before the URL has caught up', () => {
    renderExplorer();

    fireEvent.click(screen.getByRole('checkbox', { name: 'Claude (1)' }));

    expect(screen.getByRole('checkbox', { name: 'Claude (1)' })).toBeChecked();
    expect(cardTitles()).toEqual(['Beta Transition']);
    expect(screen.getByText('Showing 1 of 7 items')).toBeInTheDocument();
  });

  it('follows the URL when it changes from outside', () => {
    const { rerender } = renderExplorer();
    expect(screen.getByText('Showing 7 of 7 items')).toBeInTheDocument();

    nav.search = 'tech=claude';
    rerender(
      <ProjectExplorer
        items={buildSearchItems(content)}
        groups={buildFilterOptions(buildSearchItems(content), content.technologies)}
        projects={content.projects}
        earlierWork={content.earlierWork}
        technologies={content.technologies}
      />,
    );

    expect(screen.getByText('Showing 1 of 7 items')).toBeInTheDocument();
  });

  it('goes back to the clean URL when the last technology is deselected', () => {
    nav.search = 'tech=java';
    renderExplorer();

    fireEvent.click(screen.getByRole('checkbox', { name: /^Java/ }));

    expect(nav.replace).toHaveBeenCalledWith('/projects', { scroll: false });
  });

  it('keeps the search when the filter changes, and the other way round', () => {
    nav.search = 'q=platform';
    renderExplorer();

    fireEvent.click(screen.getByRole('checkbox', { name: 'Python (2)' }));

    expect(nav.replace).toHaveBeenCalledWith('/projects?tech=python&q=platform', {
      scroll: false,
    });
  });

  it('debounces the search by 200 ms before replacing the URL', () => {
    vi.useFakeTimers();
    renderExplorer();

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'cloud native' } });
    act(() => vi.advanceTimersByTime(199));
    expect(nav.replace).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(nav.replace).toHaveBeenCalledWith('/projects?q=cloud%20native', { scroll: false });
  });

  it('empties the search with Escape', () => {
    nav.search = 'q=platform';
    renderExplorer();

    fireEvent.keyDown(screen.getByRole('searchbox'), { key: 'Escape' });

    expect(nav.replace).toHaveBeenCalledWith('/projects', { scroll: false });
  });

  it('shows the empty state, and "Clear filters" resets the URL', () => {
    nav.search = 'tech=claude&q=qqqqzzzz';
    renderExplorer();

    expect(screen.getByText('No projects match your filters.')).toBeInTheDocument();
    expect(screen.getByText('Showing 0 of 7 items')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));

    expect(nav.replace).toHaveBeenCalledWith('/projects', { scroll: false });
  });

  it('does not show the empty state when there are results', () => {
    renderExplorer();

    expect(screen.queryByText('No projects match your filters.')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Clear filters' })).toBeNull();
  });
});
