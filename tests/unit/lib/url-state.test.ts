import { describe, expect, it } from 'vitest';

import { parseProjectsQuery, serializeProjectsQuery } from '@/lib/url-state';

const known = ['aws', 'claude', 'java', 'python'];
const parse = (search: string) => parseProjectsQuery(new URLSearchParams(search), known);

describe('parseProjectsQuery', () => {
  it('returns an empty state for an empty query string', () => {
    expect(parse('')).toEqual({ tech: [], q: '' });
  });

  it('splits tech on commas, removes duplicates and sorts alphabetically', () => {
    expect(parse('tech=python,java,python,aws').tech).toEqual(['aws', 'java', 'python']);
  });

  it('drops unknown slugs', () => {
    expect(parse('tech=java,unknown').tech).toEqual(['java']);
    expect(parse('tech=unknown').tech).toEqual([]);
  });

  it('ignores empty items in tech', () => {
    expect(parse('tech=,java,,').tech).toEqual(['java']);
  });

  it('trims q and collapses multiple spaces', () => {
    expect(parse('q=%20%20cloud%20%20%20native%20').q).toBe('cloud native');
  });

  it('limits q to 100 characters', () => {
    expect(parse(`q=${'a'.repeat(150)}`).q).toHaveLength(100);
  });

  it('disables the search when q is shorter than 2 characters', () => {
    expect(parse('q=a').q).toBe('');
    expect(parse('q=%20a%20').q).toBe('');
    expect(parse('q=ab').q).toBe('ab');
  });

  it('ignores other parameters', () => {
    expect(parse('utm_source=x&tech=java')).toEqual({ tech: ['java'], q: '' });
  });

  it('accepts a plain query string as well', () => {
    expect(parseProjectsQuery('?tech=java&q=cloud', known)).toEqual({ tech: ['java'], q: 'cloud' });
  });
});

describe('serializeProjectsQuery', () => {
  it('returns the clean URL for the empty state', () => {
    expect(serializeProjectsQuery({ tech: [], q: '' })).toBe('/projects');
  });

  it('writes tech comma-separated and q URL-encoded', () => {
    expect(serializeProjectsQuery({ tech: ['claude', 'java'], q: 'cloud native' })).toBe(
      '/projects?tech=claude,java&q=cloud%20native',
    );
  });

  it('writes only the parameter that has a value', () => {
    expect(serializeProjectsQuery({ tech: ['java'], q: '' })).toBe('/projects?tech=java');
    expect(serializeProjectsQuery({ tech: [], q: 'cloud' })).toBe('/projects?q=cloud');
  });

  it('is canonical: parse and serialize round-trip to the same string', () => {
    const urls = [
      '/projects',
      '/projects?tech=aws,java',
      '/projects?q=cloud%20native',
      '/projects?tech=claude,java&q=ai%20%26%20cloud',
    ];
    for (const url of urls) {
      const search = url.slice('/projects'.length);
      expect(serializeProjectsQuery(parseProjectsQuery(search, known))).toBe(url);
    }
  });

  it('normalises different spellings of the same state to one URL', () => {
    const a = serializeProjectsQuery(parse('tech=python,java&q=%20cloud%20'));
    const b = serializeProjectsQuery(parse('q=cloud&tech=java,python,java&x=1'));
    expect(a).toBe(b);
  });
});
