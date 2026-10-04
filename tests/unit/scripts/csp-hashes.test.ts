import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildCsp, injectCsp, main, processOutDir, sha256 } from '../../../scripts/csp-hashes';

const sha = (text: string) => `sha256-${crypto.createHash('sha256').update(text).digest('base64')}`;

const page = (head = '', body = '') =>
  `<!DOCTYPE html><html lang="en"><head><meta charSet="utf-8"/>${head}</head><body>${body}</body></html>`;

const metaOf = (html: string) =>
  /<meta http-equiv="Content-Security-Policy" content="([^"]*)"\/?>/.exec(html)?.[1];

const tmpDirs: string[] = [];
const tmp = () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'csp-'));
  tmpDirs.push(dir);
  return dir;
};

afterEach(() => {
  vi.restoreAllMocks();
  while (tmpDirs.length > 0) fs.rmSync(tmpDirs.pop()!, { recursive: true, force: true });
});

describe('sha256', () => {
  it('returns the CSP source expression for a text', () => {
    expect(sha256('alert(1)')).toBe(`'${sha('alert(1)')}'`);
  });
});

describe('buildCsp', () => {
  it('keeps style-src to self when there are no inline styles', () => {
    const csp = buildCsp(["'sha256-a'"], []);

    expect(csp).toContain("script-src 'self' 'sha256-a';");
    expect(csp).toContain("style-src 'self';");
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("img-src 'self' data:");
    expect(csp).toContain("worker-src 'none'");
    expect(csp).not.toMatch(/unsafe-inline|unsafe-eval/);
  });

  it('adds style hashes to style-src', () => {
    expect(buildCsp([], ["'sha256-s'"])).toContain("style-src 'self' 'sha256-s';");
  });
});

describe('injectCsp', () => {
  it('hashes every inline executable script exactly as written', () => {
    const first = 'self.__next_f.push([1,"a"])';
    const second = '\n  console.log("with whitespace")\n';
    const { html } = injectCsp(
      page(
        '',
        `<script src="/app.js" async></script><script>${first}</script><script type="module">${second}</script>`,
      ),
    );

    const csp = metaOf(html)!;
    expect(csp).toContain(`'${sha(first)}'`);
    expect(csp).toContain(`'${sha(second)}'`);
    expect(csp.match(/'sha256-/g)).toHaveLength(2);
  });

  it('ignores JSON-LD and other data blocks', () => {
    const { html } = injectCsp(
      page('', '<script type="application/ld+json">{"@type":"Person"}</script>'),
    );

    expect(metaOf(html)).not.toContain('sha256');
  });

  it('deduplicates identical scripts', () => {
    const { html } = injectCsp(page('', '<script>same()</script><script>same()</script>'));

    expect(metaOf(html)!.match(/'sha256-/g)).toHaveLength(1);
  });

  it('puts the hashes of inline <style> blocks in style-src', () => {
    const css = 'body{margin:0}';
    const { html } = injectCsp(page(`<style>${css}</style>`));

    expect(metaOf(html)).toContain(`style-src 'self' '${sha(css)}';`);
  });

  it('inserts the meta tag as the first child of <head>', () => {
    const { html } = injectCsp(
      '<html><head data-x="1"><title>t</title></head><body></body></html>',
    );

    expect(html).toMatch(/<head data-x="1"><meta http-equiv="Content-Security-Policy"/);
  });

  it('is idempotent', () => {
    const once = injectCsp(page('', '<script>a()</script>')).html;
    const twice = injectCsp(once).html;

    expect(twice).toBe(once);
    expect(twice.match(/Content-Security-Policy/g)).toHaveLength(1);
  });

  it('counts style attributes in markup but not inside scripts or comments', () => {
    const inScript = '<script>self.__next_f.push([1,"<div style=\\"color:red\\">"])</script>';

    expect(injectCsp(page('', inScript)).styleAttributes).toBe(0);
    expect(injectCsp(page('', '<!-- <p style="x"> -->')).styleAttributes).toBe(0);
    expect(
      injectCsp(page('', '<p style="color:red">x</p><i STYLE=\'a\'></i>')).styleAttributes,
    ).toBe(2);
  });

  it('rejects a document without <head>', () => {
    expect(() => injectCsp('<html><body></body></html>')).toThrow(/<head>/);
  });
});

describe('processOutDir', () => {
  it('processes every HTML file, including nested ones', () => {
    const dir = tmp();
    fs.mkdirSync(path.join(dir, 'projects'));
    fs.writeFileSync(path.join(dir, 'index.html'), page());
    fs.writeFileSync(path.join(dir, 'projects/a.html'), page('', '<script>a()</script>'));
    fs.writeFileSync(path.join(dir, 'robots.txt'), 'User-agent: *');

    const result = processOutDir(dir);

    expect(result).toEqual({ processed: 2, failures: [] });
    expect(fs.readFileSync(path.join(dir, 'projects/a.html'), 'utf8')).toContain(sha('a()'));
    expect(fs.readFileSync(path.join(dir, 'robots.txt'), 'utf8')).toBe('User-agent: *');
  });

  it('lists the files that contain style attributes', () => {
    const dir = tmp();
    fs.writeFileSync(path.join(dir, 'ok.html'), page());
    fs.writeFileSync(path.join(dir, 'bad.html'), page('', '<p style="color:red">x</p>'));

    const { failures } = processOutDir(dir);

    expect(failures).toEqual([`${path.join(dir, 'bad.html')}: 1 style attribute(s)`]);
  });
});

describe('main', () => {
  it('returns 0 when every page passes', () => {
    const dir = tmp();
    fs.writeFileSync(path.join(dir, 'index.html'), page());
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    expect(main(dir)).toBe(0);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('1 page'));
  });

  it('returns 1 and lists files with style attributes', () => {
    const dir = tmp();
    fs.writeFileSync(path.join(dir, 'bad.html'), page('', '<b style="x">y</b>'));
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(main(dir)).toBe(1);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('bad.html'));
  });

  it('returns 1 when the output directory does not exist', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(main(path.join(os.tmpdir(), 'does-not-exist-csp'))).toBe(1);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('not found'));
  });
});
