import fs from 'node:fs';
import path from 'node:path';

import matter from 'gray-matter';
import { parse as parseYaml } from 'yaml';
import type { ZodType } from 'zod';

import { checkRequiredFiles, crossCheck } from '@/lib/cross-checks';
import { findRawHtml, parseCaseStudy } from '@/lib/markdown';
import {
  AboutFrontmatter,
  AiWorkflowFrontmatter,
  CareerFile,
  EarlierWorkFile,
  ProjectFrontmatter,
  SkillsFile,
  Slug,
  TechnologiesFile,
  type Content,
} from '@/lib/schemas';

export class ContentValidationError extends Error {
  readonly errors: string[];

  constructor(errors: string[]) {
    const noun = errors.length === 1 ? 'error' : 'errors';
    super(
      [
        `Content validation failed (${errors.length} ${noun}):`,
        ...errors.map((e) => `  ${e}`),
      ].join('\n'),
    );
    this.name = 'ContentValidationError';
    this.errors = errors;
  }
}

export interface LoadOptions {
  contentDir?: string;
  repoRoot?: string;
  buildYear?: number;
}

// YAML 1.2 core schema: dates such as 2019-05-06 stay strings.
export function parseYamlText(text: string): unknown {
  return parseYaml(text);
}

export function parseFrontmatter(raw: string): { data: Record<string, unknown>; body: string } {
  const file = matter(raw, {
    engines: {
      yaml: {
        parse: (input: string) => (parseYaml(input) ?? {}) as object,
        stringify: () => {
          throw new Error('Serialising frontmatter is not supported');
        },
      },
    },
  });
  return { data: file.data, body: file.content.trim() };
}

function formatPath(segments: PropertyKey[]): string {
  return segments.reduce<string>((acc, segment) => {
    if (typeof segment === 'number') return `${acc}[${segment}]`;
    return acc ? `${acc}.${String(segment)}` : String(segment);
  }, '');
}

const firstLine = (error: unknown) =>
  (error instanceof Error ? error.message : String(error)).split('\n')[0];

const cache = new Map<string, Content>();

export function clearContentCache(): void {
  cache.clear();
}

function labelFor(repoRoot: string, contentDir: string): string {
  const relative = path.relative(repoRoot, contentDir);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) return 'content';
  return relative.split(path.sep).join('/');
}

export function loadContent(options: LoadOptions = {}): Content {
  const repoRoot = options.repoRoot ?? process.cwd();
  const contentDir = options.contentDir ?? path.join(repoRoot, 'content');
  const key = `${repoRoot}\0${contentDir}`;
  // In `next dev` the content must be re-read on every request.
  const cacheable = process.env.NODE_ENV !== 'development';

  const cached = cache.get(key);
  if (cacheable && cached) return cached;

  const label = labelFor(repoRoot, contentDir);
  const errors: string[] = checkRequiredFiles(contentDir, label);
  const parts: Partial<Content> = {};

  const reportIssues = (file: string, issues: { path: PropertyKey[]; message: string }[]) => {
    for (const issue of issues) {
      const where = formatPath(issue.path);
      errors.push(
        where
          ? `${label}/${file} › ${where}: ${issue.message}`
          : `${label}/${file}: ${issue.message}`,
      );
    }
  };

  const readFile = (file: string): string | undefined => {
    const full = path.join(contentDir, file);
    return fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : undefined;
  };

  const validate = <T>(file: string, schema: ZodType<T>, value: unknown): T | undefined => {
    const result = schema.safeParse(value);
    if (result.success) return result.data;
    reportIssues(file, result.error.issues);
    return undefined;
  };

  const loadYaml = <T>(file: string, schema: ZodType<T>): T | undefined => {
    const text = readFile(file);
    if (text === undefined) return undefined;
    let value: unknown;
    try {
      value = parseYamlText(text);
    } catch (error) {
      errors.push(`${label}/${file}: invalid YAML: ${firstLine(error)}`);
      return undefined;
    }
    return validate(file, schema, value);
  };

  const loadMarkdown = <T>(
    file: string,
    schema: ZodType<T>,
  ): { data: T | undefined; body: string } | undefined => {
    const text = readFile(file);
    if (text === undefined) return undefined;
    let parsed: ReturnType<typeof parseFrontmatter>;
    try {
      parsed = parseFrontmatter(text);
    } catch (error) {
      errors.push(`${label}/${file}: invalid YAML in frontmatter: ${firstLine(error)}`);
      return undefined;
    }
    return { data: validate(file, schema, parsed.data), body: parsed.body };
  };

  const checkFreeBody = (file: string, body: string) => {
    if (body === '') errors.push(`${label}/${file} › body: must not be empty`);
    else if (findRawHtml(body)) errors.push(`${label}/${file} › body: raw HTML is not allowed`);
  };

  const about = loadMarkdown('about.md', AboutFrontmatter);
  if (about) {
    checkFreeBody('about.md', about.body);
    if (about.data) parts.profile = { ...about.data, body: about.body };
  }

  parts.career = loadYaml('career.yaml', CareerFile);
  parts.earlierWork = loadYaml('earlier-work.yaml', EarlierWorkFile);
  parts.skills = loadYaml('skills.yaml', SkillsFile);
  parts.technologies = loadYaml('technologies.yaml', TechnologiesFile);

  const ai = loadMarkdown('how-i-use-ai.md', AiWorkflowFrontmatter);
  if (ai) {
    checkFreeBody('how-i-use-ai.md', ai.body);
    if (ai.data) parts.aiWorkflow = { ...ai.data, body: ai.body };
  }

  const projectsDir = path.join(contentDir, 'projects');
  const projectFiles = fs.existsSync(projectsDir)
    ? fs
        .readdirSync(projectsDir)
        .filter((file) => file.endsWith('.md'))
        .sort()
    : [];
  const projects: NonNullable<Content['projects']> = [];

  for (const file of projectFiles) {
    const slug = file.slice(0, -'.md'.length);
    const relative = `projects/${file}`;
    if (!Slug.safeParse(slug).success) {
      errors.push(`${label}/${relative}: file name must be kebab-case (a-z, 0-9, -)`);
      continue;
    }
    const project = loadMarkdown(relative, ProjectFrontmatter);
    if (!project) continue;

    const caseStudy = parseCaseStudy(project.body);
    if ('errors' in caseStudy) {
      for (const message of caseStudy.errors) errors.push(`${label}/${relative} › ${message}`);
    } else if (project.data) {
      projects.push({ ...project.data, slug, sections: caseStudy.sections });
    }
  }
  parts.projects = projects;

  errors.push(
    ...crossCheck(parts, {
      contentDir,
      contentLabel: label,
      repoRoot,
      buildYear: options.buildYear ?? new Date().getFullYear(),
    }),
  );

  if (errors.length > 0) throw new ContentValidationError(errors);

  const content = parts as Content;
  cache.set(key, content);
  return content;
}
