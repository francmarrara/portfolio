import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { checkRegistry, main } from '../../../scripts/check-dependency-registry';

const NOW = new Date('2026-10-03T12:00:00Z');

const packageJson = (deps: string[] = ['next'], devDeps: string[] = ['vitest']) =>
  JSON.stringify({
    dependencies: Object.fromEntries(deps.map((name) => [name, '^1.0.0'])),
    devDependencies: Object.fromEntries(devDeps.map((name) => [name, '^1.0.0'])),
  });

const registry = (rows: [string, string, string, string][]) =>
  [
    '# Registro delle dipendenze',
    '',
    '| Pacchetto | Tipo | Versione revisionata | Data di review | Motivo | Note |',
    '| --- | --- | --- | --- | --- | --- |',
    ...rows.map(
      ([name, type, version, date]) =>
        `| \`${name}\` | ${type} | ${version} | ${date} | motivo | |`,
    ),
  ].join('\n');

const complete = registry([
  ['next', 'prod', '16.3.8', '2026-10-03'],
  ['vitest', 'dev', '5.0.3', '2026-10-03'],
]);

const tmpDirs: string[] = [];
afterEach(() => {
  vi.restoreAllMocks();
  while (tmpDirs.length > 0) fs.rmSync(tmpDirs.pop()!, { recursive: true, force: true });
});

describe('checkRegistry', () => {
  it('passes when every package has a valid, recent review', () => {
    expect(checkRegistry(packageJson(), complete, NOW)).toEqual({
      errors: [],
      warnings: [],
      count: 2,
    });
  });

  it('fails for a package that is missing from the registry', () => {
    const { errors } = checkRegistry(packageJson(['next', 'zod']), complete, NOW);

    expect(errors).toEqual(['zod: missing from docs/dependencies.md']);
  });

  it('fails for a review date that is not ISO or does not exist', () => {
    const rows = registry([
      ['next', 'prod', '16.3.8', '03/10/2026'],
      ['vitest', 'dev', '5.0.3', '2026-02-31'],
    ]);
    const { errors } = checkRegistry(packageJson(), rows, NOW);

    expect(errors).toEqual([
      'next: review date "03/10/2026" is not a valid ISO date (YYYY-MM-DD)',
      'vitest: review date "2026-02-31" is not a valid ISO date (YYYY-MM-DD)',
    ]);
  });

  it('warns, without failing, when a review is older than 12 months', () => {
    const rows = registry([
      ['next', 'prod', '16.3.8', '2025-10-02'],
      ['vitest', 'dev', '5.0.3', '2025-10-03'],
    ]);
    const { errors, warnings } = checkRegistry(packageJson(), rows, NOW);

    expect(errors).toEqual([]);
    expect(warnings).toEqual(['next: last reviewed on 2025-10-02, more than 12 months ago']);
  });

  it('warns about registry rows with no matching package', () => {
    const rows = `${complete}\n| \`left-pad\` | prod | 1.0.0 | 2026-10-03 | motivo | |`;
    const { errors, warnings } = checkRegistry(packageJson(), rows, NOW);

    expect(errors).toEqual([]);
    expect(warnings).toEqual(['left-pad: listed in docs/dependencies.md but not in package.json']);
  });

  it('does not compare versions', () => {
    const rows = registry([
      ['next', 'prod', '0.0.1', '2026-10-03'],
      ['vitest', 'dev', '0.0.1', '2026-10-03'],
    ]);

    expect(checkRegistry(packageJson(), rows, NOW).errors).toEqual([]);
  });

  it('handles scoped packages', () => {
    const rows = registry([
      ['@vercel/analytics', 'prod', '2.0.1', '2026-10-03'],
      ['vitest', 'dev', '5.0.3', '2026-10-03'],
    ]);

    expect(checkRegistry(packageJson(['@vercel/analytics']), rows, NOW).errors).toEqual([]);
  });
});

describe('main', () => {
  const setup = (registryText: string, deps = packageJson()) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'deps-'));
    tmpDirs.push(dir);
    fs.mkdirSync(path.join(dir, 'docs'));
    fs.writeFileSync(path.join(dir, 'package.json'), deps);
    fs.writeFileSync(path.join(dir, 'docs/dependencies.md'), registryText);
    return dir;
  };

  it('returns 0 and prints a summary', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    expect(main(setup(complete), NOW)).toBe(0);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('2 dependencies'));
  });

  it('returns 0 and prints warnings for old reviews', () => {
    const rows = registry([
      ['next', 'prod', '16.3.8', '2024-01-01'],
      ['vitest', 'dev', '5.0.3', '2026-10-03'],
    ]);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});

    expect(main(setup(rows), NOW)).toBe(0);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('next'));
  });

  it('returns 1 and prints the errors', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(main(setup(complete, packageJson(['next', 'zod'])), NOW)).toBe(1);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('zod'));
  });
});
