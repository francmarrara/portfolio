import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  ContentValidationError,
  clearContentCache,
  loadContent,
  parseFrontmatter,
} from '@/lib/content';

const repoRoot = path.resolve(import.meta.dirname, '../../..');
const fixtures = path.join(repoRoot, 'tests/fixtures/content');
const tmpDirs: string[] = [];

function copyFixtures(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'content-'));
  tmpDirs.push(dir);
  fs.cpSync(fixtures, dir, { recursive: true });
  return dir;
}

function failureOf(dir: string): ContentValidationError {
  try {
    loadContent({ contentDir: dir, repoRoot });
  } catch (error) {
    expect(error).toBeInstanceOf(ContentValidationError);
    return error as ContentValidationError;
  }
  throw new Error('expected loadContent to throw');
}

afterEach(() => {
  clearContentCache();
  while (tmpDirs.length > 0) fs.rmSync(tmpDirs.pop()!, { recursive: true, force: true });
});

describe('loadContent', () => {
  it('loads the whole fixture dataset', () => {
    const content = loadContent({ contentDir: fixtures, repoRoot });

    expect(content.profile.name).toBe('Test Person');
    expect(content.profile.body).toContain('Long bio');
    expect(content.career).toHaveLength(2);
    expect(content.earlierWork).toHaveLength(5);
    expect(Object.keys(content.skills)).toHaveLength(8);
    expect(content.technologies.length).toBeGreaterThan(5);
    expect(content.projects.map((p) => p.slug).sort()).toEqual(['alpha', 'beta']);
    expect(content.projects[0]!.sections).toHaveLength(8);
    expect(content.aiWorkflow.spec_links[0]!.path).toBe('specs/001-personal-portfolio/spec.md');
    expect(content.aiWorkflow.body).toContain('The AI is in how the site was built');
  });

  it('keeps dates as strings', () => {
    const content = loadContent({ contentDir: fixtures, repoRoot });

    expect(content.career[1]!.start).toBe('2019-05-06');
    expect(content.career[0]!.start).toBe('2022-07');
    expect(content.career[0]!.end).toBeNull();
  });

  it('loads the real content/ directory', () => {
    const content = loadContent({ contentDir: path.join(repoRoot, 'content'), repoRoot });

    expect(content.profile.name).toBe('Francesco Marrara');
    expect(content.projects.length).toBeGreaterThanOrEqual(2);
  });

  it('memoizes the result per directory', () => {
    const first = loadContent({ contentDir: fixtures, repoRoot });

    expect(loadContent({ contentDir: fixtures, repoRoot })).toBe(first);
  });

  it('aggregates errors from different files in one ContentValidationError', () => {
    const dir = copyFixtures();
    const career = path.join(dir, 'career.yaml');
    fs.writeFileSync(career, fs.readFileSync(career, 'utf8').replace('2019-05-06', '2019-13'));
    const alpha = path.join(dir, 'projects/alpha.md');
    fs.writeFileSync(alpha, fs.readFileSync(alpha, 'utf8').replace(/## Trade-offs\n\n.*\n\n/, ''));
    const beta = path.join(dir, 'projects/beta.md');
    fs.writeFileSync(
      beta,
      fs.readFileSync(beta, 'utf8').replace('stack: [claude, java]', 'stack: [claude, prompt-eng]'),
    );

    const error = failureOf(dir);

    expect(error.errors).toHaveLength(3);
    expect(error.message.split('\n')[0]).toBe('Content validation failed (3 errors):');
    expect(error.message).toContain('  content/career.yaml › [1].start: expected YYYY-MM or');
    expect(error.message).toContain('  content/projects/alpha.md › section "Trade-offs": missing');
    expect(error.message).toContain(
      '  content/projects/beta.md › stack[1]: unknown technology "prompt-eng"',
    );
  });

  it('reports a missing required file', () => {
    const dir = copyFixtures();
    fs.rmSync(path.join(dir, 'how-i-use-ai.md'));

    expect(failureOf(dir).errors).toContain('content/how-i-use-ai.md: missing required file');
  });

  it('reports invalid YAML', () => {
    const dir = copyFixtures();
    fs.writeFileSync(path.join(dir, 'skills.yaml'), 'languages: [unclosed');

    expect(failureOf(dir).errors.join('\n')).toMatch(/content\/skills\.yaml: invalid YAML/);
  });

  it('reports an empty markdown body and raw HTML in a body', () => {
    const dir = copyFixtures();
    const about = path.join(dir, 'about.md');
    const text = fs.readFileSync(about, 'utf8');
    fs.writeFileSync(about, text.slice(0, text.indexOf('---', 3) + 3) + '\n');
    const ai = path.join(dir, 'how-i-use-ai.md');
    fs.appendFileSync(ai, '\n<script>alert(1)</script>\n');

    const errors = failureOf(dir).errors;
    expect(errors).toContain('content/about.md › body: must not be empty');
    expect(errors).toContain('content/how-i-use-ai.md › body: raw HTML is not allowed');
  });

  it('rejects a project file name that is not a slug', () => {
    const dir = copyFixtures();
    fs.renameSync(path.join(dir, 'projects/alpha.md'), path.join(dir, 'projects/Alpha Beta.md'));

    expect(failureOf(dir).errors).toContain(
      'content/projects/Alpha Beta.md: file name must be kebab-case (a-z, 0-9, -)',
    );
  });

  it('reports unknown keys with the path of the parent object', () => {
    const dir = copyFixtures();
    const alpha = path.join(dir, 'projects/alpha.md');
    fs.writeFileSync(
      alpha,
      fs.readFileSync(alpha, 'utf8').replace('featured: true', 'featurd: true'),
    );

    expect(failureOf(dir).errors.join('\n')).toContain('content/projects/alpha.md ›');
  });
});

describe('parseFrontmatter', () => {
  it('returns an empty object for a file without frontmatter', () => {
    expect(parseFrontmatter('Just a body.').data).toEqual({});
  });

  it('parses unquoted dates as strings', () => {
    const { data } = parseFrontmatter('---\nstart: 2019-05-06\n---\nBody');

    expect(data.start).toBe('2019-05-06');
  });
});
