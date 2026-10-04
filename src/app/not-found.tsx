import type { Metadata } from 'next';
import Link from 'next/link';

import { pageTitle } from '@/lib/seo';

export const metadata: Metadata = { title: pageTitle('Page not found') };

export default function NotFound() {
  return (
    <section className="py-12">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="mt-4 text-muted-foreground">
        The page you are looking for does not exist or has moved.
      </p>
      <ul className="mt-6 space-y-2">
        <li>
          <Link href="/" className="text-primary underline underline-offset-4 hover:no-underline">
            Go to the home page
          </Link>
        </li>
        <li>
          <Link
            href="/projects"
            className="text-primary underline underline-offset-4 hover:no-underline"
          >
            Browse the projects
          </Link>
        </li>
      </ul>
    </section>
  );
}
