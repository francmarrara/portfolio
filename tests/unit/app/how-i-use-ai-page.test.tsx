import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import HowIUseAiPage, { generateMetadata } from '@/app/how-i-use-ai/page';
import { REPO_URL, SITE_URL } from '@/lib/site';

describe('How I use AI page', () => {
  const html = renderToStaticMarkup(<HowIUseAiPage />);

  it('has the title as the only h1 and renders the body', () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toMatch(/<h1[^>]*>How I use AI<\/h1>/);
    expect(html).toContain('The AI is in how the site was built, not in what it does.');
  });

  it('links the versioned artifacts', () => {
    expect(html).toContain(`href="${REPO_URL}/blob/main/specs/001-personal-portfolio/spec.md"`);
  });

  it('uses the description of the frontmatter', () => {
    const metadata = generateMetadata();

    expect(metadata.title).toBe('How I use AI — Francesco Marrara');
    expect(metadata.description).toBe(
      'How this site was built with spec-driven development and AI agents.',
    );
    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/how-i-use-ai`);
  });
});
