import { fireEvent, render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { TechFilter } from '@/components/sections/tech-filter';
import type { FilterGroup } from '@/lib/search';

const groups: FilterGroup[] = [
  {
    category: 'language',
    label: 'Languages',
    options: [
      { slug: 'java', name: 'Java', count: 5 },
      { slug: 'python', name: 'Python', count: 2 },
    ],
  },
  { category: 'cloud', label: 'Cloud', options: [{ slug: 'aws', name: 'AWS', count: 2 }] },
];

describe('TechFilter', () => {
  it('has a fieldset with a legend for each category', () => {
    render(<TechFilter groups={groups} selected={[]} onChange={vi.fn()} />);

    expect(screen.getByRole('group', { name: 'Languages' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Cloud' })).toBeInTheDocument();
  });

  it('shows a native checkbox per technology with its count', () => {
    render(<TechFilter groups={groups} selected={['python']} onChange={vi.fn()} />);

    expect(screen.getByRole('checkbox', { name: 'Java (5)' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Python (2)' })).toBeChecked();
  });

  it('adds a technology to the selection, sorted alphabetically', () => {
    const onChange = vi.fn();
    render(<TechFilter groups={groups} selected={['python']} onChange={onChange} />);

    fireEvent.click(screen.getByRole('checkbox', { name: 'AWS (2)' }));

    expect(onChange).toHaveBeenCalledWith(['aws', 'python']);
  });

  it('removes a technology from the selection', () => {
    const onChange = vi.fn();
    render(<TechFilter groups={groups} selected={['java', 'python']} onChange={onChange} />);

    fireEvent.click(screen.getByRole('checkbox', { name: 'Java (5)' }));

    expect(onChange).toHaveBeenCalledWith(['python']);
  });

  it('disables every checkbox when disabled', () => {
    render(<TechFilter groups={groups} selected={[]} disabled />);

    for (const checkbox of screen.getAllByRole('checkbox')) expect(checkbox).toBeDisabled();
  });

  it('renders no inline style attribute (they would break the CSP)', () => {
    const html = renderToStaticMarkup(<TechFilter groups={groups} selected={['java']} />);

    expect(html).not.toMatch(/\sstyle=/);
  });
});
