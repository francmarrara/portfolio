import fs from 'node:fs';
import path from 'node:path';

import { SKILL_CATEGORIES, type Content } from '@/lib/schemas';
import { slugify } from '@/lib/slug';

export interface CrossCheckContext {
  contentDir: string;
  contentLabel: string;
  repoRoot: string;
  buildYear: number;
}

export const REQUIRED_FILES = [
  'about.md',
  'career.yaml',
  'earlier-work.yaml',
  'skills.yaml',
  'technologies.yaml',
  'how-i-use-ai.md',
] as const;

const MAX_ASSET_BYTES = 300 * 1024;
const MAX_HIGHLIGHTS = 8;

// X9
export function checkRequiredFiles(contentDir: string, label: string): string[] {
  return REQUIRED_FILES.filter((file) => !fs.existsSync(path.join(contentDir, file))).map(
    (file) => `${label}/${file}: missing required file`,
  );
}

function assetError(contentDir: string, asset: string): string | undefined {
  let stat: fs.Stats;
  try {
    stat = fs.statSync(path.join(contentDir, 'assets', asset));
  } catch {
    return 'file not found';
  }
  if (!stat.isFile()) return 'file not found';
  if (stat.size > MAX_ASSET_BYTES) {
    return `file is ${Math.ceil(stat.size / 1024)} KB, the limit is ${MAX_ASSET_BYTES / 1024} KB`;
  }
  return undefined;
}

// X1–X8 and X10. Each rule is skipped when the files it needs failed to load,
// so one broken file does not hide the errors of the others.
export function crossCheck(content: Partial<Content>, ctx: CrossCheckContext): string[] {
  const { contentDir, contentLabel: label, repoRoot, buildYear } = ctx;
  const errors: string[] = [];
  const { technologies, skills, projects, career, earlierWork, profile, aiWorkflow } = content;

  if (technologies) {
    const known = new Set(technologies.map((technology) => technology.slug));
    const checkSlugs = (file: string, base: string, slugs: string[]) => {
      slugs.forEach((slug, index) => {
        if (!known.has(slug)) {
          errors.push(`${label}/${file} › ${base}[${index}]: unknown technology "${slug}"`);
        }
      });
    };

    for (const project of projects ?? []) {
      checkSlugs(`projects/${project.slug}.md`, 'stack', project.stack);
    }
    earlierWork?.forEach((work, index) => {
      checkSlugs('earlier-work.yaml', `[${index}].stack`, work.stack);
    });
    career?.forEach((role, index) => {
      checkSlugs('career.yaml', `[${index}].tech`, role.tech ?? []);
      role.phases?.forEach((phase, phaseIndex) => {
        checkSlugs('career.yaml', `[${index}].phases[${phaseIndex}].tech`, phase.tech);
      });
    });

    // X3
    const seen = new Set<string>();
    technologies.forEach((technology, index) => {
      if (seen.has(technology.slug)) {
        errors.push(`${label}/technologies.yaml › [${index}].slug: duplicate "${technology.slug}"`);
      }
      seen.add(technology.slug);
    });
  }

  if (skills) {
    // X4
    const names = new Set<string>();
    let highlighted = 0;
    for (const category of SKILL_CATEGORIES) {
      skills[category].forEach((skill, index) => {
        if (names.has(skill.name)) {
          errors.push(
            `${label}/skills.yaml › ${category}[${index}].name: duplicate "${skill.name}"`,
          );
        }
        names.add(skill.name);
        if (skill.highlight) highlighted++;
      });
    }

    // X10
    if (highlighted < 1 || highlighted > MAX_HIGHLIGHTS) {
      errors.push(
        `${label}/skills.yaml › highlight: ${highlighted} skills highlighted, expected 1–${MAX_HIGHLIGHTS}`,
      );
    }

    // X2
    technologies?.forEach((technology, index) => {
      if (technology.related_skill !== null && !names.has(technology.related_skill)) {
        errors.push(
          `${label}/technologies.yaml › [${index}].related_skill: no skill named "${technology.related_skill}"`,
        );
      }
    });
  }

  // X5
  if (earlierWork) {
    const anchors = new Map<string, number>();
    earlierWork.forEach((work, index) => {
      const anchor = `earlier-${slugify(work.title)}`;
      const first = anchors.get(anchor);
      if (first !== undefined) {
        errors.push(
          `${label}/earlier-work.yaml › [${index}].title: anchor "${anchor}" already used by [${first}]`,
        );
      } else {
        anchors.set(anchor, index);
      }
    });
  }

  // X6
  for (const project of projects ?? []) {
    if (project.year > buildYear) {
      errors.push(`${label}/projects/${project.slug}.md › year: ${project.year} is in the future`);
    }
  }

  // X7
  if (profile?.avatar) {
    const problem = assetError(contentDir, profile.avatar);
    if (problem) errors.push(`${label}/about.md › avatar: ${problem}`);
  }
  for (const project of projects ?? []) {
    if (!project.cover) continue;
    const problem = assetError(contentDir, project.cover);
    if (problem) errors.push(`${label}/projects/${project.slug}.md › cover: ${problem}`);
  }

  // X8
  aiWorkflow?.spec_links.forEach((link, index) => {
    const where = `${label}/how-i-use-ai.md › spec_links[${index}].path`;
    if (link.path.split('/').includes('..')) {
      errors.push(`${where}: must not contain ".." segments`);
    } else if (!fs.existsSync(path.join(repoRoot, link.path))) {
      errors.push(`${where}: not found`);
    }
  });

  return errors;
}
