import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SpokenLanguages } from '@/components/sections/spoken-languages';

describe('SpokenLanguages', () => {
  it('shows each language with a readable level as text', () => {
    render(
      <SpokenLanguages
        languages={[
          { name: 'Italian', level: 'native' },
          { name: 'English', level: 'professional' },
          { name: 'French', level: 'intermediate' },
          { name: 'Spanish', level: 'basic' },
        ]}
      />,
    );

    const items = screen.getAllByRole('listitem').map((item) => item.textContent);
    expect(items).toEqual([
      'Italian: Native',
      'English: Professional',
      'French: Intermediate',
      'Spanish: Basic',
    ]);
  });
});
