import fs from 'node:fs';
import path from 'node:path';

// Constitution, principle VIII: every dependency has a review date in a versioned file.
// Versions are deliberately not compared, so Dependabot pull requests do not break the CI.

const MAX_AGE_MONTHS = 12;
const REGISTRY_FILE = 'docs/dependencies.md';

interface Entry {
  review: string;
}

function parseRegistry(markdown: string): Map<string, Entry> {
  const entries = new Map<string, Entry>();
  for (const line of markdown.split('\n')) {
    if (!line.startsWith('|')) continue;
    const cells = line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim());
    const name = cells[0]?.replace(/^`|`$/g, '');
    if (!name || name === 'Pacchetto' || /^-+$/.test(name)) continue;
    entries.set(name, { review: cells[3] ?? '' });
  }
  return entries;
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

export function checkRegistry(
  packageJson: string,
  registry: string,
  now: Date = new Date(),
): { errors: string[]; warnings: string[]; count: number } {
  const pkg = JSON.parse(packageJson) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const names = [...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})];
  const entries = parseRegistry(registry);
  const errors: string[] = [];
  const warnings: string[] = [];

  const limit = new Date(now);
  limit.setUTCMonth(limit.getUTCMonth() - MAX_AGE_MONTHS);
  const limitDay = limit.toISOString().slice(0, 10);

  for (const name of names) {
    const entry = entries.get(name);
    if (!entry) {
      errors.push(`${name}: missing from ${REGISTRY_FILE}`);
    } else if (!isIsoDate(entry.review)) {
      errors.push(`${name}: review date "${entry.review}" is not a valid ISO date (YYYY-MM-DD)`);
    } else if (entry.review < limitDay) {
      warnings.push(
        `${name}: last reviewed on ${entry.review}, more than ${MAX_AGE_MONTHS} months ago`,
      );
    }
  }

  for (const name of entries.keys()) {
    if (!names.includes(name)) {
      warnings.push(`${name}: listed in ${REGISTRY_FILE} but not in package.json`);
    }
  }

  return { errors, warnings, count: names.length };
}

export function main(root: string = process.cwd(), now: Date = new Date()): number {
  const { errors, warnings, count } = checkRegistry(
    fs.readFileSync(path.join(root, 'package.json'), 'utf8'),
    fs.readFileSync(path.join(root, REGISTRY_FILE), 'utf8'),
    now,
  );

  for (const warning of warnings) console.warn(`warning: ${warning}`);
  if (errors.length > 0) {
    console.error(['Dependency registry check failed:', ...errors.map((e) => `  ${e}`)].join('\n'));
    return 1;
  }

  console.log(`Dependency registry OK (${count} dependencies).`);
  return 0;
}

if (process.argv[1]?.endsWith('check-dependency-registry.ts')) {
  process.exit(main());
}
