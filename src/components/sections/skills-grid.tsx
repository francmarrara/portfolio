import Link from 'next/link';

import { SKILL_CATEGORIES } from '@/lib/constants';
import { techSlugsForSkill } from '@/lib/derive';
import type { Skill, SkillCategory, SkillsFile, Technology } from '@/lib/schemas';
import { serializeProjectsQuery } from '@/lib/url-state';

const CATEGORY_LABELS: Record<SkillCategory, string> = {
  languages: 'Languages',
  frameworks: 'Frameworks',
  cloud: 'Cloud',
  databases: 'Databases',
  devops: 'DevOps',
  messaging: 'Messaging',
  ai: 'AI',
  testing: 'Testing',
};

const LEVEL_LABELS: Record<Skill['level'], string> = {
  expert: 'Expert',
  advanced: 'Advanced',
  intermediate: 'Intermediate',
  basic: 'Basic',
};

function details(skill: Skill): string[] {
  return [
    skill.versions,
    skill.services?.join(', '),
    skill.notes,
    skill.since ? `since ${skill.since}` : undefined,
  ].filter((value): value is string => Boolean(value));
}

interface SkillsGridProps {
  skills: SkillsFile;
  technologies: Technology[];
  usedSlugs: string[];
}

export function SkillsGrid({ skills, technologies, usedSlugs }: SkillsGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {SKILL_CATEGORIES.map((category) => (
        <div
          key={category}
          role="group"
          aria-labelledby={`skills-${category}`}
          className="rounded-lg border bg-card p-4 text-card-foreground"
        >
          <h3 id={`skills-${category}`} className="text-lg font-semibold">
            {CATEGORY_LABELS[category]}
          </h3>
          <ul className="mt-3 space-y-3">
            {skills[category].map((skill) => {
              const slugs = techSlugsForSkill(skill.name, technologies, usedSlugs);
              const extra = details(skill);
              return (
                <li key={skill.name}>
                  <div className="flex items-baseline justify-between gap-3">
                    {slugs.length > 0 ? (
                      <Link
                        href={serializeProjectsQuery({ tech: slugs, q: '' })}
                        className="font-medium text-primary underline underline-offset-4 hover:no-underline"
                      >
                        {skill.name}
                      </Link>
                    ) : (
                      <span className="font-medium">{skill.name}</span>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {LEVEL_LABELS[skill.level]}
                    </span>
                  </div>
                  {extra.length > 0 ? (
                    <p className="text-sm text-muted-foreground">{extra.join(' · ')}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
