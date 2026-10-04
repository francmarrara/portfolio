import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SiteFooter } from '@/components/layout/site-footer';

const props = {
  name: 'Test Person',
  email: 'test.person@example.com',
  linkedin: 'https://www.linkedin.com/in/test-person',
  github: 'https://github.com/test-person',
  year: 2026,
};

describe('SiteFooter', () => {
  it('shows the email in clear text with a mailto: link', () => {
    render(<SiteFooter {...props} />);

    const link = screen.getByRole('link', { name: /test\.person@example\.com/ });
    expect(link).toHaveAttribute('href', 'mailto:test.person@example.com');
  });

  it('links LinkedIn and GitHub safely', () => {
    render(<SiteFooter {...props} />);

    for (const [name, href] of [
      ['LinkedIn', props.linkedin],
      ['GitHub', props.github],
    ] as const) {
      const link = screen.getByRole('link', { name });
      expect(link).toHaveAttribute('href', href);
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('links the RSS feed', () => {
    render(<SiteFooter {...props} />);

    expect(screen.getByRole('link', { name: 'RSS' })).toHaveAttribute('href', '/rss.xml');
  });

  it('shows the build year and the name', () => {
    render(<SiteFooter {...props} />);

    expect(screen.getByText(/2026/)).toHaveTextContent('Test Person');
  });
});
