import Link from 'next/link';

import { MobileNav } from '@/components/layout/mobile-nav';
import { NavLinks } from '@/components/layout/nav-links';

export function SiteHeader({ name }: { name: string }) {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          className="inline-flex min-h-10 items-center rounded-md text-base font-semibold"
        >
          {name}
        </Link>
        <nav aria-label="Main" className="hidden md:block">
          <NavLinks className="flex items-center gap-1" />
        </nav>
        <MobileNav />
      </div>
    </header>
  );
}
