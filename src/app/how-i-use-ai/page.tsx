import type { Metadata } from 'next';

import { MarkdownContent } from '@/components/sections/markdown-content';
import { SpecLinks } from '@/components/sections/spec-links';
import { loadContent } from '@/lib/content';
import { buildMetadata, pageTitle } from '@/lib/seo';

export function generateMetadata(): Metadata {
  const { aiWorkflow } = loadContent();

  return buildMetadata({
    title: pageTitle(aiWorkflow.title),
    description: aiWorkflow.description,
    path: '/how-i-use-ai',
    type: 'website',
  });
}

export default function HowIUseAiPage() {
  const { aiWorkflow } = loadContent();

  return (
    <article className="py-6">
      <h1 className="text-3xl font-semibold tracking-tight">{aiWorkflow.title}</h1>
      <MarkdownContent>{aiWorkflow.body}</MarkdownContent>
      <section className="mt-10">
        <h2 className="text-2xl font-semibold">Specification and artifacts</h2>
        <p className="mt-2 text-muted-foreground">
          Everything below is versioned in the public repository.
        </p>
        <div className="mt-3">
          <SpecLinks links={aiWorkflow.spec_links} />
        </div>
      </section>
    </article>
  );
}
