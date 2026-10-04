/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { parseFrontmatter, parseYamlText } from '@/lib/content';
import {
  AboutFrontmatter,
  AiWorkflowFrontmatter,
  CASE_STUDY_SECTIONS,
  CareerFile,
  EarlierWorkFile,
  ProjectFrontmatter,
  SkillsFile,
  TechnologiesFile,
  toIsoDay,
} from '@/lib/schemas';

const root = path.resolve(import.meta.dirname, '../../..');
const dirs = {
  fixtures: path.join(root, 'tests/fixtures/content'),
  content: path.join(root, 'content'),
};

const read = (dir: string, file: string) => fs.readFileSync(path.join(dir, file), 'utf8');
const yamlOf = (dir: string, file: string) => parseYamlText(read(dir, file));
const frontmatterOf = (dir: string, file: string) => parseFrontmatter(read(dir, file)).data;

describe.each(Object.entries(dirs))('schemas accept the %s dataset', (_name, dir) => {
  it('about.md', () => {
    expect(AboutFrontmatter.safeParse(frontmatterOf(dir, 'about.md')).success).toBe(true);
  });

  it('career.yaml', () => {
    expect(CareerFile.safeParse(yamlOf(dir, 'career.yaml')).success).toBe(true);
  });

  it('earlier-work.yaml', () => {
    expect(EarlierWorkFile.safeParse(yamlOf(dir, 'earlier-work.yaml')).success).toBe(true);
  });

  it('skills.yaml', () => {
    expect(SkillsFile.safeParse(yamlOf(dir, 'skills.yaml')).success).toBe(true);
  });

  it('technologies.yaml', () => {
    expect(TechnologiesFile.safeParse(yamlOf(dir, 'technologies.yaml')).success).toBe(true);
  });

  it('how-i-use-ai.md', () => {
    expect(AiWorkflowFrontmatter.safeParse(frontmatterOf(dir, 'how-i-use-ai.md')).success).toBe(
      true,
    );
  });

  it('every project', () => {
    const files = fs.readdirSync(path.join(dir, 'projects')).filter((f) => f.endsWith('.md'));
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const result = ProjectFrontmatter.safeParse(frontmatterOf(dir, `projects/${file}`));
      expect(result.success, file).toBe(true);
    }
  });
});

const about = () =>
  structuredClone(frontmatterOf(dirs.fixtures, 'about.md')) as Record<string, any>;
const career = () => structuredClone(yamlOf(dirs.fixtures, 'career.yaml')) as Record<string, any>[];
const project = () =>
  structuredClone(frontmatterOf(dirs.fixtures, 'projects/alpha.md')) as Record<string, any>;

describe('schemas reject invalid content', () => {
  it('rejects an unknown key', () => {
    expect(AboutFrontmatter.safeParse({ ...about(), featurd: true }).success).toBe(false);
    expect(ProjectFrontmatter.safeParse({ ...project(), featurd: true }).success).toBe(false);
  });

  it('rejects http URLs', () => {
    const data = about();
    data.links.github = 'http://github.com/someone';
    expect(AboutFrontmatter.safeParse(data).success).toBe(false);
  });

  it('rejects a malformed start date', () => {
    const data = career();
    data[0]!.start = '2019-13';
    expect(CareerFile.safeParse(data).success).toBe(false);
  });

  it('rejects an end date before the start date', () => {
    const data = career();
    data[1]!.end = '2018-01';
    expect(CareerFile.safeParse(data).success).toBe(false);
  });

  it('requires tech or phases on a role', () => {
    const data = career();
    delete data[1]!.tech;
    expect(CareerFile.safeParse(data).success).toBe(false);
  });

  it('rejects a period without the arrow', () => {
    const data = yamlOf(dirs.fixtures, 'earlier-work.yaml') as Record<string, unknown>[];
    data[0]!.period = '2019-2020';
    expect(EarlierWorkFile.safeParse(data).success).toBe(false);
  });

  it('rejects a spoken language level outside the enum', () => {
    const data = about();
    data.spoken_languages[0].level = 'fluent';
    expect(AboutFrontmatter.safeParse(data).success).toBe(false);
  });

  it('rejects a summary over 300 characters', () => {
    const data = about();
    data.summary = 'x'.repeat(301);
    expect(AboutFrontmatter.safeParse(data).success).toBe(false);
    data.summary = 'x'.repeat(300);
    expect(AboutFrontmatter.safeParse(data).success).toBe(true);
  });

  it('rejects an empty spoken_languages list', () => {
    const data = about();
    data.spoken_languages = [];
    expect(AboutFrontmatter.safeParse(data).success).toBe(false);
  });

  it('rejects a cover without cover_alt', () => {
    const data = project();
    data.cover = 'alpha.webp';
    expect(ProjectFrontmatter.safeParse(data).success).toBe(false);
    data.cover_alt = 'Diagram of the platform';
    expect(ProjectFrontmatter.safeParse(data).success).toBe(true);
  });

  it('rejects a description over 160 characters', () => {
    const data = structuredClone(frontmatterOf(dirs.fixtures, 'how-i-use-ai.md')) as Record<
      string,
      unknown
    >;
    data.description = 'x'.repeat(161);
    expect(AiWorkflowFrontmatter.safeParse(data).success).toBe(false);
  });

  it('rejects spec_links outside specs/ and .specify/', () => {
    const data = structuredClone(frontmatterOf(dirs.fixtures, 'how-i-use-ai.md')) as Record<
      string,
      any
    >;
    data.spec_links[0].path = 'src/lib/schemas.ts';
    expect(AiWorkflowFrontmatter.safeParse(data).success).toBe(false);
  });

  it('rejects a year given as a string', () => {
    const data = project();
    data.year = '2024';
    expect(ProjectFrontmatter.safeParse(data).success).toBe(false);
  });

  it('rejects a skills file with a missing category', () => {
    const data = yamlOf(dirs.fixtures, 'skills.yaml') as Record<string, unknown>;
    delete data.testing;
    expect(SkillsFile.safeParse(data).success).toBe(false);
  });

  it('rejects an empty category', () => {
    const data = yamlOf(dirs.fixtures, 'skills.yaml') as Record<string, unknown>;
    data.testing = [];
    expect(SkillsFile.safeParse(data).success).toBe(false);
  });
});

describe('helpers and constants', () => {
  it('toIsoDay pads a year-month to the first day', () => {
    expect(toIsoDay('2022-07')).toBe('2022-07-01');
    expect(toIsoDay('2019-05-06')).toBe('2019-05-06');
  });

  it('lists the eight case study sections in order', () => {
    expect(CASE_STUDY_SECTIONS).toHaveLength(8);
    expect(CASE_STUDY_SECTIONS[0]).toBe('Context');
    expect(CASE_STUDY_SECTIONS[7]).toBe("What I'd do differently");
  });
});
