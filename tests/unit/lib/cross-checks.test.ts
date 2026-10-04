/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { checkRequiredFiles, crossCheck } from '@/lib/cross-checks';
import { loadContent } from '@/lib/content';
import type { Content } from '@/lib/schemas';

const repoRoot = path.resolve(import.meta.dirname, '../../..');
const contentDir = path.join(repoRoot, 'tests/fixtures/content');

let tmpAssets: string;

beforeAll(() => {
  tmpAssets = fs.mkdtempSync(path.join(os.tmpdir(), 'cross-checks-'));
  fs.mkdirSync(path.join(tmpAssets, 'assets'));
  fs.writeFileSync(path.join(tmpAssets, 'assets', 'small.png'), Buffer.alloc(1024));
  fs.writeFileSync(path.join(tmpAssets, 'assets', 'big.png'), Buffer.alloc(301 * 1024));
});

afterAll(() => {
  fs.rmSync(tmpAssets, { recursive: true, force: true });
});

const base = (): Content => structuredClone(loadContent({ contentDir, repoRoot }));
const ctx = (overrides: Partial<Parameters<typeof crossCheck>[1]> = {}) => ({
  contentDir,
  contentLabel: 'content',
  repoRoot,
  buildYear: 2026,
  ...overrides,
});

describe('crossCheck', () => {
  it('passes on the fixture dataset', () => {
    expect(crossCheck(base(), ctx())).toEqual([]);
  });

  it('X1: unknown technology in a project stack', () => {
    const content = base();
    content.projects[0]!.stack.push('kotlin');
    expect(crossCheck(content, ctx())).toContain(
      `content/projects/${content.projects[0]!.slug}.md › stack[3]: unknown technology "kotlin"`,
    );
  });

  it('X1: unknown technology in earlier work, career tech and career phases', () => {
    const content = base();
    content.earlierWork[0]!.stack.push('nope');
    content.career[1]!.tech!.push('nope');
    content.career[0]!.phases![0]!.tech.push('nope');
    const errors = crossCheck(content, ctx());

    expect(errors).toContain('content/earlier-work.yaml › [0].stack[3]: unknown technology "nope"');
    expect(errors).toContain('content/career.yaml › [1].tech[2]: unknown technology "nope"');
    expect(errors).toContain(
      'content/career.yaml › [0].phases[0].tech[3]: unknown technology "nope"',
    );
  });

  it('X2: related_skill must name a skill', () => {
    const content = base();
    content.technologies[0]!.related_skill = 'Node';
    expect(crossCheck(content, ctx())).toContain(
      'content/technologies.yaml › [0].related_skill: no skill named "Node"',
    );
  });

  it('X3: duplicate technology slug', () => {
    const content = base();
    content.technologies[1]!.slug = content.technologies[0]!.slug;
    expect(crossCheck(content, ctx())).toContain(
      'content/technologies.yaml › [1].slug: duplicate "java"',
    );
  });

  it('X4: duplicate skill name across categories', () => {
    const content = base();
    content.skills.devops[0]!.name = 'Java';
    expect(crossCheck(content, ctx())).toContain(
      'content/skills.yaml › devops[0].name: duplicate "Java"',
    );
  });

  it('X5: duplicate earlier work anchor', () => {
    const content = base();
    content.earlierWork[3]!.title = content.earlierWork[1]!.title;
    expect(crossCheck(content, ctx())).toContain(
      'content/earlier-work.yaml › [3].title: anchor "earlier-registry-services" already used by [1]',
    );
  });

  it('X6: project year in the future', () => {
    const content = base();
    content.projects[0]!.year = 2031;
    expect(crossCheck(content, ctx())).toContain(
      `content/projects/${content.projects[0]!.slug}.md › year: 2031 is in the future`,
    );
  });

  it('X7: asset not found, too big, and fine', () => {
    const content = base();
    content.profile.avatar = 'missing.png';
    content.projects[0]!.cover = 'big.png';
    content.projects[0]!.cover_alt = 'Big';
    content.projects[1]!.cover = 'small.png';
    content.projects[1]!.cover_alt = 'Small';
    const errors = crossCheck(content, ctx({ contentDir: tmpAssets }));

    expect(errors).toContain('content/about.md › avatar: file not found');
    expect(errors).toContain(
      `content/projects/${content.projects[0]!.slug}.md › cover: file is 301 KB, the limit is 300 KB`,
    );
    expect(errors.filter((e) => e.includes('small.png'))).toEqual([]);
    expect(errors.filter((e) => e.includes(content.projects[1]!.slug))).toEqual([]);
  });

  it('X8: spec link must exist and stay inside the repository', () => {
    const content = base();
    content.aiWorkflow.spec_links = [
      { label: 'Gone', path: 'specs/does-not-exist.md' },
      { label: 'Escape', path: 'specs/../package.json' },
    ];
    const errors = crossCheck(content, ctx());

    expect(errors).toContain('content/how-i-use-ai.md › spec_links[0].path: not found');
    expect(errors).toContain(
      'content/how-i-use-ai.md › spec_links[1].path: must not contain ".." segments',
    );
  });

  it('X10: highlight count must be between 1 and 8', () => {
    const none = base();
    for (const category of Object.values(none.skills)) {
      for (const skill of category as any[]) delete skill.highlight;
    }
    expect(crossCheck(none, ctx())).toContain(
      'content/skills.yaml › highlight: 0 skills highlighted, expected 1–8',
    );

    const many = base();
    let count = 0;
    for (const category of Object.values(many.skills)) {
      for (const skill of category as any[]) {
        skill.highlight = true;
        count++;
      }
    }
    expect(count).toBeGreaterThan(8);
    expect(crossCheck(many, ctx())).toContain(
      `content/skills.yaml › highlight: ${count} skills highlighted, expected 1–8`,
    );
  });

  it('skips the rules whose inputs are missing', () => {
    expect(crossCheck({}, ctx())).toEqual([]);
  });
});

describe('X9: checkRequiredFiles', () => {
  it('reports every missing required file', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'required-'));
    try {
      fs.writeFileSync(path.join(dir, 'about.md'), '');
      const errors = checkRequiredFiles(dir, 'content');

      expect(errors).toContain('content/how-i-use-ai.md: missing required file');
      expect(errors).toContain('content/career.yaml: missing required file');
      expect(errors).not.toContain('content/about.md: missing required file');
      expect(errors).toHaveLength(5);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('is empty when all files exist', () => {
    expect(checkRequiredFiles(contentDir, 'content')).toEqual([]);
  });
});
