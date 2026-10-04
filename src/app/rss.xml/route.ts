import { loadContent } from '@/lib/content';
import { buildRss } from '@/lib/rss';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

export function GET() {
  return new Response(buildRss(loadContent(), SITE_URL), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
