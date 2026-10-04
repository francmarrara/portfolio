import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { syncAssets } from '../../../scripts/sync-assets';

let root: string;

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'sync-assets-'));
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

const write = (file: string, content = 'x') => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};

describe('syncAssets', () => {
  it('copies files and subfolders, and skips .gitkeep', () => {
    const from = path.join(root, 'content/assets');
    const to = path.join(root, 'public/assets');
    write(path.join(from, 'avatar.webp'), 'a');
    write(path.join(from, 'covers/alpha.png'), 'b');
    write(path.join(from, '.gitkeep'), '');

    expect(syncAssets({ from, to })).toBe(2);
    expect(fs.readFileSync(path.join(to, 'avatar.webp'), 'utf8')).toBe('a');
    expect(fs.readFileSync(path.join(to, 'covers/alpha.png'), 'utf8')).toBe('b');
    expect(fs.existsSync(path.join(to, '.gitkeep'))).toBe(false);
  });

  it('removes files that no longer exist in the source', () => {
    const from = path.join(root, 'content/assets');
    const to = path.join(root, 'public/assets');
    write(path.join(from, 'new.png'));
    write(path.join(to, 'stale.png'));

    syncAssets({ from, to });

    expect(fs.readdirSync(to)).toEqual(['new.png']);
  });

  it('creates an empty destination when the source folder does not exist', () => {
    const to = path.join(root, 'public/assets');

    expect(syncAssets({ from: path.join(root, 'missing'), to })).toBe(0);
    expect(fs.readdirSync(to)).toEqual([]);
  });
});
