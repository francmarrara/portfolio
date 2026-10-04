import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { JsonLd } from '@/components/sections/json-ld';

describe('JsonLd', () => {
  it('renders a JSON-LD script with the serialised data', () => {
    const { container } = render(<JsonLd data={{ '@type': 'Person', name: 'Test' }} />);
    const script = container.querySelector('script[type="application/ld+json"]');

    expect(script).not.toBeNull();
    expect(JSON.parse(script!.textContent ?? '')).toEqual({ '@type': 'Person', name: 'Test' });
  });

  it('escapes angle brackets', () => {
    const { container } = render(<JsonLd data={{ name: '</script>' }} />);

    expect(container.querySelector('script')!.textContent).not.toContain('<');
  });
});
