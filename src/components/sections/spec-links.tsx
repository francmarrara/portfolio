import { ExternalLink } from 'lucide-react';

import { REPO_URL } from '@/lib/site';

interface SpecLinksProps {
  links: { label: string; path: string }[];
}

export function SpecLinks({ links }: SpecLinksProps) {
  return (
    <ul className="space-y-2">
      {links.map((link) => (
        <li key={link.path}>
          <a
            href={`${REPO_URL}/blob/main/${link.path}`}
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 py-1 text-primary underline underline-offset-4 hover:no-underline"
          >
            {link.label}
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  );
}
