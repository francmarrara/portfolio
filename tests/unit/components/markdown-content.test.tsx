import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MarkdownContent } from '@/components/sections/markdown-content';

describe('MarkdownContent', () => {
  it('renders markdown, including GFM tables and lists', () => {
    const { container } = render(
      <MarkdownContent>
        {'Some **bold** text.\n\n- one\n- two\n\n| a | b |\n| - | - |\n| 1 | 2 |'}
      </MarkdownContent>,
    );

    expect(container.querySelector('strong')).toHaveTextContent('bold');
    expect(container.querySelectorAll('li')).toHaveLength(2);
    expect(container.querySelector('table')).not.toBeNull();
  });

  it('adds rel to external links and keeps internal links without it', () => {
    render(
      <MarkdownContent>
        {'[Spec Kit](https://github.com/github/spec-kit) and [case study](/projects/alpha)'}
      </MarkdownContent>,
    );

    expect(screen.getByRole('link', { name: 'Spec Kit' })).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    );
    expect(screen.getByRole('link', { name: 'case study' })).not.toHaveAttribute('rel');
    expect(screen.getByRole('link', { name: 'case study' })).toHaveAttribute(
      'href',
      '/projects/alpha',
    );
  });

  it('does not render raw HTML', () => {
    const { container } = render(
      <MarkdownContent>{'<script>alert(1)</script>\n\n<div id="evil">x</div>'}</MarkdownContent>,
    );

    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('#evil')).toBeNull();
  });

  it('neutralises javascript: links', () => {
    render(<MarkdownContent>{'[click](javascript:alert(1))'}</MarkdownContent>);

    const link = screen.queryByRole('link', { name: 'click' });
    expect(link?.getAttribute('href') ?? '').not.toMatch(/^javascript:/i);
  });

  it('uses h3 and below as they come', () => {
    render(<MarkdownContent>{'### Detail\n\nText'}</MarkdownContent>);

    expect(screen.getByRole('heading', { level: 3, name: 'Detail' })).toBeInTheDocument();
  });
});
