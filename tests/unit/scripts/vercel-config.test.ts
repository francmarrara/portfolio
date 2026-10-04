import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

interface HeaderRule {
  source: string;
  headers: { key: string; value: string }[];
}

const config = JSON.parse(
  fs.readFileSync(path.resolve(import.meta.dirname, '../../../vercel.json'), 'utf8'),
) as { cleanUrls: boolean; headers: HeaderRule[] };

const headersFor = (source: string) =>
  Object.fromEntries(
    (config.headers.find((rule) => rule.source === source)?.headers ?? []).map(({ key, value }) => [
      key,
      value,
    ]),
  );

describe('vercel.json', () => {
  it('serves /about as about.html', () => {
    expect(config.cleanUrls).toBe(true);
  });

  it('sets the security headers on every route', () => {
    const headers = headersFor('/(.*)');

    expect(Object.keys(headers)).toEqual(
      expect.arrayContaining([
        'Strict-Transport-Security',
        'X-Frame-Options',
        'X-Content-Type-Options',
        'Referrer-Policy',
        'Permissions-Policy',
        'Content-Security-Policy',
      ]),
    );
  });

  it('serves the CV as a download', () => {
    expect(headersFor('/cv.pdf')).toEqual({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="Francesco-Marrara-CV.pdf"',
    });
  });

  it('serves the feed as RSS', () => {
    expect(headersFor('/rss.xml')).toEqual({
      'Content-Type': 'application/rss+xml; charset=utf-8',
    });
  });

  it('serves the health check as uncached JSON', () => {
    expect(headersFor('/api/health')).toEqual({
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    });
  });
});
