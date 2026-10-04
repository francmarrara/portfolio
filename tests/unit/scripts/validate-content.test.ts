import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { clearContentCache } from '@/lib/content';
import { validateContent } from '../../../scripts/validate-content';

const repoRoot = path.resolve(import.meta.dirname, '../../..');
const fixtures = path.join(repoRoot, 'tests/fixtures/content');
const tmpDirs: string[] = [];

afterEach(() => {
  vi.restoreAllMocks();
  clearContentCache();
  while (tmpDirs.length > 0) fs.rmSync(tmpDirs.pop()!, { recursive: true, force: true });
});

describe('validateContent', () => {
  it('returns 0 for a valid dataset', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(validateContent({ contentDir: fixtures, repoRoot })).toBe(0);
    expect(error).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith(expect.stringContaining('2 projects'));
  });

  it('returns 1 and prints the reason when a section is missing', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'validate-'));
    tmpDirs.push(dir);
    fs.cpSync(fixtures, dir, { recursive: true });
    const alpha = path.join(dir, 'projects/alpha.md');
    fs.writeFileSync(alpha, fs.readFileSync(alpha, 'utf8').replace(/## Impact\n\n.*\n\n/, ''));
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(validateContent({ contentDir: dir, repoRoot })).toBe(1);
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining('content/projects/alpha.md › section "Impact": missing'),
    );
  });

  it('rethrows errors that are not validation errors', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'validate-'));
    tmpDirs.push(dir);
    fs.cpSync(fixtures, dir, { recursive: true });
    fs.rmSync(path.join(dir, 'about.md'));
    fs.mkdirSync(path.join(dir, 'about.md'));

    expect(() => validateContent({ contentDir: dir, repoRoot })).toThrow(/EISDIR/);
  });
});
