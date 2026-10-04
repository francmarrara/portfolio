import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ContactLink } from '@/components/sections/contact-link';

describe('ContactLink', () => {
  it('links to mailto: and shows the address as the visible text', () => {
    render(<ContactLink email="test.person@example.com" />);

    const link = screen.getByRole('link', { name: /test\.person@example\.com/ });
    expect(link).toHaveAttribute('href', 'mailto:test.person@example.com');
    expect(link).toHaveTextContent('test.person@example.com');
  });

  it('accepts a class name', () => {
    render(<ContactLink email="a@b.co" className="custom" />);

    expect(screen.getByRole('link')).toHaveClass('custom');
  });
});
