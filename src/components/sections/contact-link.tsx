import { Mail } from 'lucide-react';

import { cn } from '@/lib/utils';

export function ContactLink({ email, className }: { email: string; className?: string }) {
  return (
    <a
      href={`mailto:${email}`}
      className={cn(
        'inline-flex items-center gap-2 font-medium text-primary underline underline-offset-4 hover:no-underline',
        className,
      )}
    >
      <Mail className="size-4" aria-hidden="true" />
      {email}
    </a>
  );
}
