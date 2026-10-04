import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CaseStudyToc } from '@/components/sections/case-study-toc';
import { CASE_STUDY_SECTIONS } from '@/lib/schemas';
import { slugify } from '@/lib/slug';

const sections = CASE_STUDY_SECTIONS.map((title) => ({
  id: slugify(title),
  title,
  markdown: '',
  plainText: '',
}));

describe('CaseStudyToc', () => {
  it('is a labelled navigation with one anchor link per section', () => {
    render(<CaseStudyToc sections={sections} />);

    const nav = screen.getByRole('navigation', { name: 'Case study sections' });
    const links = within(nav).getAllByRole('link');
    expect(links).toHaveLength(8);
    expect(links.map((link) => link.textContent)).toEqual([...CASE_STUDY_SECTIONS]);
    expect(links.map((link) => link.getAttribute('href'))).toEqual(
      sections.map((section) => `#${section.id}`),
    );
  });
});
