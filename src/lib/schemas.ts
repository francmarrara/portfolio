import { z } from 'zod';

import { SKILL_CATEGORIES, toIsoDay } from '@/lib/constants';

export { SKILL_CATEGORIES, toIsoDay };

// Normative contract: specs/001-personal-portfolio/contracts/content-schemas.md

export const NonEmpty = z.string().trim().min(1);

export const Slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be kebab-case (a-z, 0-9, -)');

export const HttpsUrl = z.url({ protocol: /^https$/ });

// "2019-05" or "2019-05-06"
export const YearMonth = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?$/, 'expected YYYY-MM or YYYY-MM-DD');

// "2019 → 2020", "2022-07 → ~2023", "~2024 → present"
const POINT = String.raw`~?\d{4}(?:-(?:0[1-9]|1[0-2]))?`;
export const Period = z
  .string()
  .regex(new RegExp(`^${POINT} → (?:${POINT}|present)$`), 'expected "<start> → <end|present>"');

// Relative to content/assets/. Existence and size are checked in the cross-file pass.
export const AssetPath = z
  .string()
  .regex(/^[a-z0-9][a-z0-9/_-]*\.(webp|avif|png|jpe?g|svg)$/, 'unsupported asset path or format');

export const SkillLevel = z.enum(['expert', 'advanced', 'intermediate', 'basic']);

export const AboutFrontmatter = z.strictObject({
  name: NonEmpty,
  title: NonEmpty,
  location: NonEmpty,
  email: z.email(),
  links: z.strictObject({ linkedin: HttpsUrl, github: HttpsUrl }),
  summary: NonEmpty.max(300),
  availability: NonEmpty.optional(),
  avatar: AssetPath.optional(),
  spoken_languages: z
    .array(
      z.strictObject({
        name: NonEmpty,
        level: z.enum(['native', 'professional', 'intermediate', 'basic']),
      }),
    )
    .min(1),
});

const Phase = z.strictObject({
  label: NonEmpty,
  period: Period,
  client_sector: NonEmpty,
  tech: z.array(Slug).min(1),
});

const Progression = z.strictObject({ title: NonEmpty, focus: NonEmpty });

export const CareerRole = z
  .strictObject({
    role: NonEmpty,
    company: NonEmpty,
    company_url: HttpsUrl.optional(),
    start: YearMonth,
    end: YearMonth.nullable(),
    location: NonEmpty,
    type: z.enum(['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship']),
    summary: NonEmpty,
    responsibilities: z.array(NonEmpty).min(1).optional(),
    achievements: z.array(NonEmpty).min(1).optional(),
    phases: z.array(Phase).min(1).optional(),
    progression: z.array(Progression).min(1).optional(),
    tech: z.array(Slug).min(1).optional(),
    ai_work: z.array(NonEmpty).min(1).optional(),
    notes: z.array(NonEmpty).min(1).optional(),
  })
  .superRefine((role, ctx) => {
    if (role.end !== null && toIsoDay(role.end) < toIsoDay(role.start)) {
      ctx.addIssue({ code: 'custom', path: ['end'], message: 'end must not precede start' });
    }
    if (!role.tech && !role.phases) {
      ctx.addIssue({ code: 'custom', path: ['tech'], message: 'provide tech or phases[].tech' });
    }
  });

export const CareerFile = z.array(CareerRole).min(1);

export const EarlierWork = z.strictObject({
  title: NonEmpty,
  company: NonEmpty,
  period: Period,
  sector: NonEmpty,
  role: NonEmpty,
  summary: NonEmpty,
  stack: z.array(Slug).min(1),
});

export const EarlierWorkFile = z.array(EarlierWork);

const Skill = z.strictObject({
  name: NonEmpty,
  level: SkillLevel,
  since: z.union([z.int().min(1990).max(2100), z.string().regex(/^~?\d{4}$/)]).optional(),
  period: Period.optional(),
  versions: NonEmpty.optional(),
  notes: NonEmpty.optional(),
  services: z.array(NonEmpty).min(1).optional(),
  highlight: z.boolean().optional(),
});

const Category = z.array(Skill).min(1);

export const SkillsFile = z.strictObject({
  languages: Category,
  frameworks: Category,
  cloud: Category,
  databases: Category,
  devops: Category,
  messaging: Category,
  ai: Category,
  testing: Category,
});

export const Technology = z.strictObject({
  slug: Slug,
  name: NonEmpty,
  category: z.enum([
    'language',
    'framework',
    'database',
    'cloud',
    'devops',
    'messaging',
    'ai',
    'testing',
  ]),
  related_skill: NonEmpty.nullable(),
});

export const TechnologiesFile = z.array(Technology).min(1);

export const ProjectFrontmatter = z
  .strictObject({
    title: NonEmpty,
    subtitle: NonEmpty,
    year: z.int().min(2000),
    role: NonEmpty,
    sector: NonEmpty,
    stack: z.array(Slug).min(1),
    featured: z.boolean(),
    repo: HttpsUrl.nullable(),
    demo: HttpsUrl.nullable(),
    cover: AssetPath.optional(),
    cover_alt: NonEmpty.optional(),
  })
  .superRefine((project, ctx) => {
    if (project.cover && !project.cover_alt) {
      ctx.addIssue({ code: 'custom', path: ['cover_alt'], message: 'required when cover is set' });
    }
  });

export const CASE_STUDY_SECTIONS = [
  'Context',
  'Problem',
  'Solution',
  'My role',
  'Technical decisions',
  'Trade-offs',
  'Impact',
  "What I'd do differently",
] as const;

export const AiWorkflowFrontmatter = z.strictObject({
  title: NonEmpty,
  description: NonEmpty.max(160),
  spec_links: z
    .array(
      z.strictObject({
        label: NonEmpty,
        path: z
          .string()
          .regex(/^(specs|\.specify)\/[\w./-]+$/, 'must point inside specs/ or .specify/'),
      }),
    )
    .min(1),
});

export type About = z.infer<typeof AboutFrontmatter>;
export type CareerRole = z.infer<typeof CareerRole>;
export type EarlierWork = z.infer<typeof EarlierWork>;
export type SkillsFile = z.infer<typeof SkillsFile>;
export type Skill = z.infer<typeof Skill>;
export type SkillCategory = (typeof SKILL_CATEGORIES)[number];
export type Technology = z.infer<typeof Technology>;
export type ProjectFrontmatter = z.infer<typeof ProjectFrontmatter>;
export type AiWorkflowFrontmatter = z.infer<typeof AiWorkflowFrontmatter>;

export interface CaseStudySection {
  id: string;
  title: string;
  markdown: string;
  plainText: string;
}

export type Profile = About & { body: string };
export type Project = ProjectFrontmatter & { slug: string; sections: CaseStudySection[] };
export type AiWorkflow = AiWorkflowFrontmatter & { body: string };

export interface Content {
  profile: Profile;
  career: CareerRole[];
  earlierWork: EarlierWork[];
  skills: SkillsFile;
  technologies: Technology[];
  projects: Project[];
  aiWorkflow: AiWorkflow;
}
