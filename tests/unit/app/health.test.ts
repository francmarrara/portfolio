import { describe, expect, it } from 'vitest';

import { GET, dynamic } from '@/app/api/health/route';

describe('GET /api/health', () => {
  it('answers 200 with a static status body', async () => {
    const response = GET();

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('{"status":"ok"}');
  });

  it('is exported as a static route', () => {
    expect(dynamic).toBe('force-static');
  });
});
