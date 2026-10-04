'use client';

import { Menu } from 'lucide-react';
import { useRef } from 'react';

import { NavLinks } from '@/components/layout/nav-links';

// Plain <details>: it opens and closes without JavaScript. The handler only closes it
// again after a choice, because the layout (and this menu) persists across navigations.
export function MobileNav() {
  const details = useRef<HTMLDetailsElement>(null);

  return (
    <details ref={details} className="relative md:hidden">
      <summary className="inline-flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-md border px-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
        <Menu className="size-4" aria-hidden="true" />
        Menu
      </summary>
      <nav
        aria-label="Mobile"
        className="absolute right-0 z-10 mt-2 w-56 rounded-md border bg-background p-2 shadow-md"
      >
        <NavLinks
          className="flex flex-col"
          linkClassName="w-full"
          onNavigate={() => details.current?.removeAttribute('open')}
        />
      </nav>
    </details>
  );
}
