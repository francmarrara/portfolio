import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

// Next.js static export has no per-request nonce, so each page gets its own CSP as a <meta> tag
// with the SHA-256 of its inline scripts. See docs/security.md.

const SCRIPT = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
const STYLE = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
const COMMENT = /<!--[\s\S]*?-->/g;
const STYLE_ATTRIBUTE = /<[a-z][^>]*?\sstyle\s*=/gi;
const EXISTING_META = /<meta\s+http-equiv="Content-Security-Policy"[^>]*>/gi;
const HEAD_OPEN = /<head(\s[^>]*)?>/i;

export function sha256(text: string): string {
  return `'sha256-${crypto.createHash('sha256').update(text, 'utf8').digest('base64')}'`;
}

export function buildCsp(scriptHashes: string[], styleHashes: string[]): string {
  return [
    "default-src 'self'",
    ['script-src', "'self'", ...scriptHashes].join(' '),
    ['style-src', "'self'", ...styleHashes].join(' '),
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "manifest-src 'self'",
    "worker-src 'none'",
  ].join('; ');
}

function isExecutable(attributes: string): boolean {
  if (/\ssrc\s*=/i.test(` ${attributes}`)) return false;
  const type = /\stype\s*=\s*["']?([^"'\s>]+)/i.exec(` ${attributes}`)?.[1]?.toLowerCase();
  return type === undefined || type === 'module' || type === 'text/javascript';
}

function collect(html: string, pattern: RegExp, pick: (match: RegExpExecArray) => string | null) {
  const hashes = new Set<string>();
  for (const match of html.matchAll(pattern)) {
    const content = pick(match as RegExpExecArray);
    if (content) hashes.add(sha256(content));
  }
  return [...hashes];
}

export function injectCsp(source: string): { html: string; styleAttributes: number } {
  const html = source.replace(EXISTING_META, '');

  if (!HEAD_OPEN.test(html)) throw new Error('document has no <head>');

  const scriptHashes = collect(html, SCRIPT, (m) =>
    isExecutable(m[1] ?? '') ? (m[2] ?? '') : null,
  );
  const styleHashes = collect(html, STYLE, (m) => m[1] ?? null);

  // Scripts carry the RSC payload, which can contain markup with "style=" as plain text.
  const markup = html.replace(SCRIPT, '').replace(STYLE, '').replace(COMMENT, '');
  const styleAttributes = markup.match(STYLE_ATTRIBUTE)?.length ?? 0;

  const meta = `<meta http-equiv="Content-Security-Policy" content="${buildCsp(scriptHashes, styleHashes)}"/>`;
  return { html: html.replace(HEAD_OPEN, (head) => `${head}${meta}`), styleAttributes };
}

function htmlFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(full);
    return entry.name.endsWith('.html') ? [full] : [];
  });
}

export function processOutDir(outDir: string): { processed: number; failures: string[] } {
  const failures: string[] = [];
  const files = htmlFiles(outDir);

  for (const file of files) {
    const { html, styleAttributes } = injectCsp(fs.readFileSync(file, 'utf8'));
    fs.writeFileSync(file, html);
    if (styleAttributes > 0) failures.push(`${file}: ${styleAttributes} style attribute(s)`);
  }

  return { processed: files.length, failures };
}

export function main(outDir: string = path.join(process.cwd(), 'out')): number {
  if (!fs.existsSync(outDir)) {
    console.error(`CSP: output directory not found: ${outDir}. Run "next build" first.`);
    return 1;
  }

  const { processed, failures } = processOutDir(outDir);
  if (failures.length > 0) {
    console.error(
      [
        'CSP: inline style attributes are blocked by the policy (style-src has no unsafe-inline).',
        ...failures.map((failure) => `  ${failure}`),
        'Remove them, or document an exception in docs/security.md.',
      ].join('\n'),
    );
    return 1;
  }

  console.log(`CSP: added a policy to ${processed} page${processed === 1 ? '' : 's'}.`);
  return 0;
}

if (process.argv[1]?.endsWith('csp-hashes.ts')) {
  process.exit(main());
}
