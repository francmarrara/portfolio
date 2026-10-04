import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SiteHeader } from '@/components/layout/site-header';
import { SkipLink } from '@/components/layout/skip-link';

const navigation = vi.hoisted(() => ({ pathname: '/' }));

vi.mock('next/navigation', () => ({ usePathname: () => navigation.pathname }));

beforeEach(() => {
  navigation.pathname = '/';
});

describe('SkipLink', () => {
  it('points to the main content', () => {
    render(<SkipLink />);

    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute(
      'href',
      '#content',
    );
  });
});

describe('SiteHeader', () => {
  it('links the name to the home page', () => {
    render(<SiteHeader name="Test Person" />);

    expect(screen.getByRole('link', { name: 'Test Person' })).toHaveAttribute('href', '/');
  });

  it('lists the main navigation entries in the desktop and mobile menus', () => {
    const { container } = render(<SiteHeader name="Test Person" />);

    for (const nav of container.querySelectorAll('nav')) {
      const links = within(nav as HTMLElement)
        .getAllByRole('link', { hidden: true })
        .map((link) => [link.textContent, link.getAttribute('href')]);

      expect(links).toEqual([
        ['Projects', '/projects'],
        ['About', '/about'],
        ['Skills', '/about#skills'],
        ['How I use AI', '/how-i-use-ai'],
        ['Download CV', '/cv.pdf'],
      ]);
    }
  });

  it('offers the CV as a download', () => {
    render(<SiteHeader name="Test Person" />);

    for (const link of screen.getAllByRole('link', { name: 'Download CV', hidden: true })) {
      expect(link).toHaveAttribute('download', 'Francesco-Marrara-CV.pdf');
    }
  });

  it('marks the current page with aria-current', () => {
    navigation.pathname = '/about';
    const { container } = render(<SiteHeader name="Test Person" />);
    const current = container.querySelectorAll('[aria-current="page"]');

    expect([...current].map((el) => el.textContent)).toEqual(['About', 'About']);
  });

  it('keeps Projects current on a case study page', () => {
    navigation.pathname = '/projects/alpha';
    const { container } = render(<SiteHeader name="Test Person" />);

    expect(container.querySelector('[aria-current="page"]')).toHaveTextContent('Projects');
  });

  it('does not mark anything as current on the home page', () => {
    const { container } = render(<SiteHeader name="Test Person" />);

    expect(container.querySelector('[aria-current]')).toBeNull();
  });

  it('builds the mobile menu on <details> so it works without JavaScript', () => {
    const { container } = render(<SiteHeader name="Test Person" />);
    const details = container.querySelector('details');

    expect(details).not.toBeNull();
    expect(details!.querySelector('summary')).toHaveTextContent('Menu');
    expect(details).not.toHaveAttribute('open');
  });

  it('closes the mobile menu after choosing an entry', async () => {
    const user = userEvent.setup();
    const { container } = render(<SiteHeader name="Test Person" />);
    const details = container.querySelector('details')!;

    details.open = true;
    await user.click(within(details).getByRole('link', { name: 'Skills', hidden: true }));

    expect(details.open).toBe(false);
  });
});
