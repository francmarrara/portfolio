import type { Metadata } from 'next';

import type { Profile, Project } from '@/lib/schemas';
import { SITE_NAME, SITE_URL } from '@/lib/site';

const DESCRIPTION_MAX = 160;
const RSS_PATH = '/rss.xml';

export function truncate(text: string, max: number = DESCRIPTION_MAX): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  const base = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${base.trimEnd()}…`;
}

export function pageTitle(page: string): string {
  return `${page} — ${SITE_NAME}`;
}

interface MetadataInput {
  title: string;
  description: string;
  path: string;
  type: 'website' | 'profile' | 'article';
}

export function buildMetadata({ title, description, path, type }: MetadataInput): Metadata {
  const url = `${SITE_URL}${path}`;
  const shortDescription = truncate(description);

  return {
    title,
    description: shortDescription,
    alternates: { canonical: url, types: { 'application/rss+xml': RSS_PATH } },
    openGraph: {
      title,
      description: shortDescription,
      url,
      type,
      siteName: SITE_NAME,
    },
  };
}

export function personJsonLd(profile: Profile, stack: { name: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.title,
    email: profile.email,
    url: SITE_URL,
    sameAs: [profile.links.linkedin, profile.links.github],
    knowsAbout: stack.map((skill) => skill.name),
  };
}

export function techArticleJsonLd(
  project: Pick<Project, 'slug' | 'title' | 'subtitle' | 'year'>,
  profile: Pick<Profile, 'name'>,
  stackNames: string[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: project.title,
    description: project.subtitle,
    author: { '@type': 'Person', name: profile.name, url: SITE_URL },
    datePublished: String(project.year),
    keywords: stackNames.join(', '),
    url: `${SITE_URL}/projects/${project.slug}`,
  };
}

// "<" is escaped so that a "</script>" inside a value cannot close the tag early.
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
