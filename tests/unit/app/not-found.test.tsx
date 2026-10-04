import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import NotFound from '@/app/not-found';

describe('NotFound', () => {
  const html = renderToStaticMarkup(<NotFound />);

  it('explains that the page does not exist', () => {
    expect(html).toMatch(/<h1[^>]*>Page not found<\/h1>/);
  });

  it('links to the home page and to the projects', () => {
    expect(html).toMatch(/<a[^>]*href="\/"[^>]*>Go to the home page<\/a>/);
    expect(html).toMatch(/<a[^>]*href="\/projects"[^>]*>Browse the projects<\/a>/);
  });
});
