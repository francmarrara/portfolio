import type { CaseStudySection } from '@/lib/schemas';

export function CaseStudyToc({ sections }: { sections: CaseStudySection[] }) {
  return (
    <nav aria-label="Case study sections" className="rounded-lg border bg-card p-4">
      <ol className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="inline-block py-1 text-primary underline underline-offset-4 hover:no-underline"
            >
              {section.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
