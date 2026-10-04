import { describe, expect, it } from 'vitest';

import { findRawHtml, parseCaseStudy, toPlainText } from '@/lib/markdown';
import { CASE_STUDY_SECTIONS } from '@/lib/schemas';

const build = (titles: readonly string[] = CASE_STUDY_SECTIONS, text = 'Some text.') =>
  titles.map((title) => `## ${title}\n\n${text}\n`).join('\n');

const errorsOf = (body: string): string[] => {
  const result = parseCaseStudy(body);
  if (!('errors' in result)) throw new Error('expected errors');
  return result.errors;
};

describe('parseCaseStudy', () => {
  it('splits a valid body into the eight sections with slug ids', () => {
    const result = parseCaseStudy(build());
    if (!('sections' in result)) throw new Error('expected sections');

    expect(result.sections.map((s) => s.title)).toEqual([...CASE_STUDY_SECTIONS]);
    expect(result.sections.map((s) => s.id)).toEqual([
      'context',
      'problem',
      'solution',
      'my-role',
      'technical-decisions',
      'trade-offs',
      'impact',
      'what-id-do-differently',
    ]);
    expect(result.sections[0]).toMatchObject({ markdown: 'Some text.', plainText: 'Some text.' });
  });

  it('keeps H3 headings and code blocks inside a section', () => {
    const titles = [...CASE_STUDY_SECTIONS];
    const body = build(titles).replace(
      'Some text.',
      '### Detail\n\n```\n## not a heading\n```\n\nMore **text**.',
    );
    const result = parseCaseStudy(body);
    if (!('sections' in result)) throw new Error('expected sections');

    expect(result.sections).toHaveLength(8);
    expect(result.sections[0]!.markdown).toContain('### Detail');
    expect(result.sections[0]!.markdown).toContain('## not a heading');
  });

  it('reports a missing section', () => {
    const titles = CASE_STUDY_SECTIONS.filter((t) => t !== 'Trade-offs');
    expect(errorsOf(build(titles))).toContain('section "Trade-offs": missing');
  });

  it('reports an empty section', () => {
    const body = build().replace('## Impact\n\nSome text.\n', '## Impact\n\n');
    expect(errorsOf(body)).toContain('section "Impact": empty');
  });

  it('reports sections out of order', () => {
    const titles = [...CASE_STUDY_SECTIONS];
    [titles[0], titles[1]] = [titles[1]!, titles[0]!];
    expect(errorsOf(build(titles))[0]).toMatch(/out of order/);
  });

  it('reports a duplicated section', () => {
    const body = `${build()}\n## Context\n\nAgain.\n`;
    expect(errorsOf(body)).toContain('section "Context": duplicated');
  });

  it('reports an extra H2', () => {
    const body = `${build()}\n## Appendix\n\nExtra.\n`;
    expect(errorsOf(body)).toContain('unexpected H2 "Appendix"');
  });

  it('reports an H1', () => {
    expect(errorsOf(`# Title\n\n${build()}`)).toContain(
      'H1 is not allowed (the page title comes from the frontmatter)',
    );
  });

  it('reports text before the first H2', () => {
    expect(errorsOf(`Intro text.\n\n${build()}`)).toContain(
      'content before the first H2 is not allowed',
    );
  });

  it('reports raw HTML', () => {
    expect(errorsOf(build().replace('Some text.', '<div>boom</div>'))).toContain(
      'raw HTML is not allowed',
    );
    expect(errorsOf(build().replace('Some text.', 'Hello <b>there</b>.'))).toContain(
      'raw HTML is not allowed',
    );
  });

  it('accepts the typographic apostrophe in the last title', () => {
    const titles = [...CASE_STUDY_SECTIONS.slice(0, 7), 'What I’d do differently'];
    const result = parseCaseStudy(build(titles));
    if (!('sections' in result)) throw new Error('expected sections');

    expect(result.sections[7]!.title).toBe("What I'd do differently");
  });
});

describe('findRawHtml', () => {
  it('detects block and inline HTML and ignores code', () => {
    expect(findRawHtml('<div>x</div>')).toBe(true);
    expect(findRawHtml('a <span>b</span>')).toBe(true);
    expect(findRawHtml('Use `<div>` in code.')).toBe(false);
    expect(findRawHtml('Plain *markdown*.')).toBe(false);
  });
});

describe('toPlainText', () => {
  it('strips markdown syntax and keeps words apart', () => {
    const text = toPlainText(
      '## Title\n\nA **bold** [link](https://example.com) and `code`.\n\n- one\n- two\n\n> quote',
    );

    expect(text).toBe('Title A bold link and code. one two quote');
    expect(text).not.toMatch(/[*`#>\]\[]/);
  });
});
