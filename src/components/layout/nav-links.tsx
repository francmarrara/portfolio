'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { isCurrent, NAV_ITEMS } from '@/components/layout/nav-items';
import { cn } from '@/lib/utils';

interface NavLinksProps {
  className?: string;
  linkClassName?: string;
  onNavigate?: () => void;
}

export function NavLinks({ className, linkClassName, onNavigate }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <ul className={className}>
      {NAV_ITEMS.map((item) => {
        const classes = cn(
          'inline-flex min-h-10 items-center rounded-md px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground aria-[current=page]:bg-accent aria-[current=page]:text-accent-foreground',
          linkClassName,
        );
        return (
          <li key={item.href}>
            {item.download ? (
              <a href={item.href} download={item.download} className={classes} onClick={onNavigate}>
                {item.label}
              </a>
            ) : (
              <Link
                href={item.href}
                className={classes}
                aria-current={isCurrent(item.href, pathname) ? 'page' : undefined}
                onClick={onNavigate}
              >
                {item.label}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
