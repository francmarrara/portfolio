import Link from 'next/link';
import type { ComponentProps } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { cn } from '@/lib/utils';

const components: Components = {
  a({ href, children }) {
    const className = 'text-primary underline underline-offset-4 hover:no-underline';
    if (href?.startsWith('/') || href?.startsWith('#')) {
      return (
        <Link href={href} className={className}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  },
  h2: ({ children }) => <h2 className="mt-10 mb-3 text-2xl font-semibold">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-6 mb-2 text-lg font-semibold">{children}</h3>,
  h4: ({ children }) => <h4 className="mt-4 mb-2 font-semibold">{children}</h4>,
  p: ({ children }) => <p className="my-4 leading-7">{children}</p>,
  ul: ({ children }) => <ul className="my-4 list-disc space-y-2 pl-6">{children}</ul>,
  ol: ({ children }) => <ol className="my-4 list-decimal space-y-2 pl-6">{children}</ol>,
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-4 pl-4 text-muted-foreground">{children}</blockquote>
  ),
  pre: ({ children }) => (
    <pre className="my-4 overflow-x-auto rounded-md bg-muted p-4 text-sm">{children}</pre>
  ),
  code: ({ children, className }) => (
    <code className={cn('rounded bg-muted px-1 py-0.5 font-mono text-[0.9em]', className)}>
      {children}
    </code>
  ),
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border-b px-3 py-2 font-semibold">{children}</th>,
  td: ({ children }) => <td className="border-b px-3 py-2">{children}</td>,
};

// Raw HTML is never rendered: no rehype-raw, and the content build rejects it.
export function MarkdownContent({
  children,
  className,
}: { children: string } & Pick<ComponentProps<'div'>, 'className'>) {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
