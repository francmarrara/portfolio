import path from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';

import { loadContent } from '@/lib/content';
import { buildRss } from '@/lib/rss';
import type { Content } from '@/lib/schemas';

const repoRoot = path.resolve(import.meta.dirname, '../../..');
const SITE = 'https://example.vercel.app';
let content: Content;

beforeAll(() => {
  content = loadContent({ contentDir: path.join(repoRoot, 'tests/fixtures/content'), repoRoot });
});

describe('buildRss', () => {
  it('is an RSS 2.0 document with a complete channel', () => {
    const xml = buildRss(content, SITE);

    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">');
    expect(xml).toContain(`<link>${SITE}/projects</link>`);
    expect(xml).toMatch(/<channel>\s*<title>[^<]+<\/title>/);
    expect(xml).toContain('<language>en</language>');
    expect(xml).toMatch(/<description>[^<]+<\/description>/);
    expect(xml).toContain(
      `<atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml"/>`,
    );
  });

  it('has one item per project, newest year first', () => {
    const xml = buildRss(content, SITE);

    expect(xml.match(/<item>/g)).toHaveLength(2);
    expect(xml.indexOf('Beta Transition')).toBeLessThan(xml.indexOf('Alpha Platform'));
  });

  it('describes an item with link, guid, subtitle, date and stack categories', () => {
    const xml = buildRss(content, SITE);
    const item = xml.split('<item>')[2]!;

    expect(item).toContain('<title>Alpha Platform</title>');
    expect(item).toContain(`<link>${SITE}/projects/alpha</link>`);
    expect(item).toContain(`<guid isPermaLink="true">${SITE}/projects/alpha</guid>`);
    expect(item).toContain(
      '<description>A cloud-native backend for an energy company</description>',
    );
    expect(item).toContain('<pubDate>Mon, 01 Jan 2024 00:00:00 GMT</pubDate>');
    expect(item).toContain('<category>Python</category>');
    expect(item).toContain('<category>AWS</category>');
  });

  it('escapes the XML special characters', () => {
    const tricky = structuredClone(content);
    tricky.projects[0]!.title = `Fish & "Chips" <b>'s`;

    const xml = buildRss(tricky, SITE);

    expect(xml).toContain('Fish &amp; &quot;Chips&quot; &lt;b&gt;&apos;s');
    expect(xml).not.toContain('<b>');
  });
});
