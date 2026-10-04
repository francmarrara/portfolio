import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { TechBadgeList } from '@/components/sections/tech-badge-list';
import { earlierAnchorId, sortEarlierWork } from '@/lib/derive';
import type { EarlierWork, Technology } from '@/lib/schemas';

interface EarlierWorkListProps {
  items: EarlierWork[];
  technologies: Technology[];
  limit?: number;
  variant: 'compact' | 'full';
  // Keep the given order instead of sorting by period (used for ranked search results).
  keepOrder?: boolean;
}

export function EarlierWorkList({
  items,
  technologies,
  limit,
  variant,
  keepOrder = false,
}: EarlierWorkListProps) {
  const sorted = keepOrder ? items : sortEarlierWork(items);
  const visible = limit === undefined ? sorted : sorted.slice(0, limit);
  if (visible.length === 0) return null;

  const compact = variant === 'compact';

  return (
    <section id={compact ? undefined : 'earlier-work'} className="py-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-2xl font-semibold">Earlier work</h2>
        {compact ? (
          <Link
            href="/projects#earlier-work"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary underline underline-offset-4 hover:no-underline"
          >
            See all
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
      <ul className="mt-4 space-y-4">
        {visible.map((item) => {
          const id = earlierAnchorId(item.title);
          return (
            <li
              key={id}
              id={compact ? undefined : id}
              className="scroll-mt-20 rounded-lg border bg-card p-4 text-card-foreground"
            >
              <h3 className="text-base font-semibold">
                {compact ? (
                  <Link href={`/projects#${id}`} className="underline-offset-4 hover:underline">
                    {item.title}
                  </Link>
                ) : (
                  item.title
                )}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.company} · {item.period} · {item.role} · {item.sector}
              </p>
              <p className="mt-2 text-sm">{item.summary}</p>
              <TechBadgeList slugs={item.stack} technologies={technologies} className="mt-3" />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
