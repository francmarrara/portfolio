import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProjectLinks } from '@/components/sections/project-links';

describe('ProjectLinks', () => {
  it('renders nothing when repo and demo are null', () => {
    const { container } = render(<ProjectLinks repo={null} demo={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders only the link that has a value', () => {
    render(<ProjectLinks repo="https://github.com/test-person/alpha" demo={null} />);

    expect(screen.getByRole('link', { name: 'View repository' })).toHaveAttribute(
      'href',
      'https://github.com/test-person/alpha',
    );
    expect(screen.queryByRole('link', { name: 'View demo' })).toBeNull();
  });

  it('renders both links with safe rel attributes', () => {
    render(
      <ProjectLinks repo="https://github.com/test-person/alpha" demo="https://alpha.example.com" />,
    );

    for (const name of ['View repository', 'View demo']) {
      expect(screen.getByRole('link', { name })).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });
});
