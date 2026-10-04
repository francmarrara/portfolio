import { techName, sortProjects } from '@/lib/derive';
import type { Content } from '@/lib/schemas';

const ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

function escapeXml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => ENTITIES[char] ?? char);
}

export function buildRss(
  content: Pick<Content, 'profile' | 'projects' | 'technologies'>,
  siteUrl: string,
): string {
  const { profile, technologies } = content;

  const items = sortProjects(content.projects).map((project) => {
    const url = `${siteUrl}/projects/${project.slug}`;
    const categories = project.stack
      .map((slug) => `      <category>${escapeXml(techName(technologies, slug))}</category>`)
      .join('\n');

    return [
      '    <item>',
      `      <title>${escapeXml(project.title)}</title>`,
      `      <link>${url}</link>`,
      `      <guid isPermaLink="true">${url}</guid>`,
      `      <description>${escapeXml(project.subtitle)}</description>`,
      `      <pubDate>${new Date(Date.UTC(project.year, 0, 1)).toUTCString()}</pubDate>`,
      categories,
      '    </item>',
    ].join('\n');
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${escapeXml(`${profile.name} — Case studies`)}</title>`,
    `    <link>${siteUrl}/projects</link>`,
    `    <description>${escapeXml(profile.summary)}</description>`,
    '    <language>en</language>',
    `    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>`,
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');
}
