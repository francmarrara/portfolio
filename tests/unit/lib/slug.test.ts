import { describe, expect, it } from 'vitest';

import { slugify } from '@/lib/slug';

describe('slugify', () => {
  it('lowercases and joins words with a dash', () => {
    expect(slugify('B2B Data Platform')).toBe('b2b-data-platform');
  });

  it('removes diacritics', () => {
    expect(slugify('Città è Perché')).toBe('citta-e-perche');
  });

  it('drops apostrophes without leaving a separator', () => {
    expect(slugify("What I'd do differently")).toBe('what-id-do-differently');
    expect(slugify('What I’d do differently')).toBe('what-id-do-differently');
  });

  it('turns punctuation and separators into a single dash', () => {
    expect(slugify('Energy Sector Backend — Java & Spring Boot')).toBe(
      'energy-sector-backend-java-spring-boot',
    );
    expect(slugify('C# / .NET')).toBe('c-net');
  });

  it('never starts or ends with a dash', () => {
    expect(slugify('  --Hello, world!--  ')).toBe('hello-world');
  });

  it('returns an empty string when nothing is left', () => {
    expect(slugify('— — —')).toBe('');
  });
});
