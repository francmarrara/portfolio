import { ChevronDown, ExternalLink } from 'lucide-react';
import type { ReactNode } from 'react';

import { TechBadgeList } from '@/components/sections/tech-badge-list';
import { formatRolePeriod, isCurrentRole, techAll } from '@/lib/derive';
import type { CareerRole as Role, Technology } from '@/lib/schemas';

function Block({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-4">
      <p className="text-sm font-semibold">{label}</p>
      {children}
    </div>
  );
}

function BulletList({ label, items }: { label: string; items?: string[] }) {
  if (!items) return null;
  return (
    <Block label={label}>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Block>
  );
}

interface CareerRoleProps {
  role: Role;
  technologies: Technology[];
}

export function CareerRole({ role, technologies }: CareerRoleProps) {
  const tech = techAll(role);

  return (
    <details
      open={isCurrentRole(role)}
      className="group rounded-lg border bg-card text-card-foreground"
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 rounded-lg p-4 outline-none marker:hidden focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
        <span className="flex flex-col gap-0.5">
          <span className="font-semibold">{role.company}</span>
          <span className="text-sm">{role.role}</span>
          <span className="text-sm text-muted-foreground">{formatRolePeriod(role)}</span>
        </span>
        <ChevronDown
          className="mt-1 size-5 shrink-0 transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="border-t px-4 pt-3 pb-4">
        <p className="text-sm text-muted-foreground">
          {role.location} · {role.type}
        </p>
        <p className="mt-2">{role.summary}</p>
        {role.company_url ? (
          <a
            href={role.company_url}
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-sm text-primary underline underline-offset-4 hover:no-underline"
          >
            {role.company} website
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        ) : null}
        <BulletList label="Responsibilities" items={role.responsibilities} />
        <BulletList label="Achievements" items={role.achievements} />
        {role.progression ? (
          <Block label="Progression">
            <ul aria-label="Progression" className="mt-1 space-y-1 text-sm">
              {role.progression.map((step) => (
                <li key={step.title}>
                  <span className="font-medium">{step.title}</span>
                  <span className="text-muted-foreground"> — {step.focus}</span>
                </li>
              ))}
            </ul>
          </Block>
        ) : null}
        {role.phases ? (
          <Block label="Phases">
            <ul aria-label="Phases" className="mt-1 space-y-3">
              {role.phases.map((phase) => (
                <li key={phase.label} className="rounded-md bg-muted/50 p-3">
                  <p className="text-sm font-medium">{phase.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {phase.period} · {phase.client_sector}
                  </p>
                  <TechBadgeList slugs={phase.tech} technologies={technologies} className="mt-2" />
                </li>
              ))}
            </ul>
          </Block>
        ) : null}
        <BulletList label="AI work" items={role.ai_work} />
        <BulletList label="Notes" items={role.notes} />
        <Block label="Technologies">
          <TechBadgeList
            slugs={tech}
            technologies={technologies}
            label="Technologies"
            className="mt-1"
          />
        </Block>
      </div>
    </details>
  );
}
