import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SpecLinks } from '@/components/sections/spec-links';
import { REPO_URL } from '@/lib/site';

const links = [
  { label: 'Feature specification', path: 'specs/001-personal-portfolio/spec.md' },
  { label: 'Constitution', path: '.specify/memory/constitution.md' },
];

describe('SpecLinks', () => {
  it('points each link to the versioned file in the repository', () => {
    render(<SpecLinks links={links} />);

    expect(screen.getByRole('link', { name: /Feature specification/ })).toHaveAttribute(
      'href',
      `${REPO_URL}/blob/main/specs/001-personal-portfolio/spec.md`,
    );
    expect(screen.getByRole('link', { name: /Constitution/ })).toHaveAttribute(
      'href',
      `${REPO_URL}/blob/main/.specify/memory/constitution.md`,
    );
  });

  it('uses the label from the content and safe rel attributes', () => {
    render(<SpecLinks links={links} />);

    expect(screen.getAllByRole('link')).toHaveLength(2);
    for (const link of screen.getAllByRole('link')) {
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });
});
