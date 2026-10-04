import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';
import { extractText, getDocumentProxy } from 'unpdf';

import { generateCv, renderCv } from '../../../scripts/generate-cv';
import { loadContent } from '@/lib/content';

const repoRoot = path.resolve(import.meta.dirname, '../../..');
const contentDir = path.join(repoRoot, 'tests/fixtures/content');

let pdf: Uint8Array;
let text: string;

async function textOf(bytes: Uint8Array): Promise<string> {
  const document = await getDocumentProxy(new Uint8Array(bytes));
  const { text: extracted } = await extractText(document, { mergePages: true });
  return extracted.replace(/\s+/g, ' ');
}

beforeAll(async () => {
  pdf = await renderCv(loadContent({ contentDir, repoRoot }));
  text = await textOf(pdf);
}, 60_000);

describe('renderCv', () => {
  it('produces a PDF', () => {
    expect(Buffer.from(pdf.subarray(0, 5)).toString('latin1')).toBe('%PDF-');
  });

  it('contains the header and the profile', () => {
    expect(text).toContain('Test Person');
    expect(text).toContain('Senior Software Engineer');
    expect(text).toContain('Rome, Italy');
    expect(text).toContain('test.person@example.com');
    expect(text).toContain('Backend engineer working with Java and Python on AWS.');
  });

  it('contains the experience: roles, phases, progression, AI work and notes', () => {
    expect(text).toContain('Acme Corp');
    expect(text).toContain('Phase one — Java');
    expect(text).toContain('Junior Software Engineer');
    expect(text).toContain('Leads the move to agentic programming');
    expect(text).toContain('ClickHouse used for analytics');
    expect(text).toContain('Technical mentoring');
    expect(text).toContain('Cut the release time in half');
  });

  it('contains the earlier work, the skills and the spoken languages', () => {
    expect(text).toContain('B2B Data Platform');
    expect(text).toContain('Spring Boot');
    expect(text).toContain('Italian');
  });

  it('renders the arrow used in the periods', () => {
    expect(text).toContain('→');
  });

  it('lists the roles newest first', () => {
    expect(text.indexOf('Acme Corp')).toBeLessThan(text.indexOf('Legacy Ltd'));
  });
});

describe('generateCv', () => {
  it('writes the PDF and returns 0', async () => {
    const outFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'cv-')), 'cv.pdf');

    const code = await generateCv({ outFile, loadOptions: { contentDir, repoRoot } });

    expect(code).toBe(0);
    expect(fs.readFileSync(outFile).subarray(0, 5).toString('latin1')).toBe('%PDF-');
  }, 60_000);

  it('returns 1 and writes nothing when the content is invalid', async () => {
    const outFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'cv-')), 'cv.pdf');

    const code = await generateCv({
      outFile,
      loadOptions: { contentDir: path.join(repoRoot, 'tests/fixtures/does-not-exist'), repoRoot },
    });

    expect(code).toBe(1);
    expect(fs.existsSync(outFile)).toBe(false);
  });
});
