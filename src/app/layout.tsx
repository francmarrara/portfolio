import './globals.css';

import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { SkipLink } from '@/components/layout/skip-link';
import { loadContent } from '@/lib/content';
import { SITE_NAME, SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  applicationName: SITE_NAME,
  alternates: { types: { 'application/rss+xml': '/rss.xml' } },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const { profile } = loadContent();

  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col antialiased">
        <SkipLink />
        <SiteHeader name={profile.name} />
        <main id="content" tabIndex={-1} className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
          {children}
        </main>
        <SiteFooter
          name={profile.name}
          email={profile.email}
          linkedin={profile.links.linkedin}
          github={profile.links.github}
          year={new Date().getFullYear()}
        />
        <Analytics />
      </body>
    </html>
  );
}
