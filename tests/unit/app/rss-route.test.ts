import { describe, expect, it } from 'vitest';

import { GET, dynamic } from '@/app/rss.xml/route';

describe('GET /rss.xml', () => {
  it('is statically generated', () => {
    expect(dynamic).toBe('force-static');
  });

  it('returns an RSS document with one item per case study', async () => {
    const response = GET();
    const xml = await response.text();

    expect(response.headers.get('Content-Type')).toContain('application/rss+xml');
    expect(xml.match(/<item>/g)).toHaveLength(2);
  });
});
