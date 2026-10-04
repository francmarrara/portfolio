import { CV_FILENAME, CV_PATH } from '@/lib/site';

export interface NavItem {
  label: string;
  href: string;
  download?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Projects', href: '/projects' },
  { label: 'About', href: '/about' },
  { label: 'Skills', href: '/about#skills' },
  { label: 'How I use AI', href: '/how-i-use-ai' },
  { label: 'Download CV', href: CV_PATH, download: CV_FILENAME },
];

// Links with a fragment point inside another entry's page, so they are never "current".
export function isCurrent(href: string, pathname: string): boolean {
  if (href.includes('#')) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}
