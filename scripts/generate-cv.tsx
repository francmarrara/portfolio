import fs from 'node:fs';
import path from 'node:path';

import { renderToBuffer } from '@react-pdf/renderer';

import { CvDocument } from './cv/cv-document';
import { ContentValidationError, loadContent, type LoadOptions } from '@/lib/content';
import type { Content } from '@/lib/schemas';

export async function renderCv(content: Content): Promise<Uint8Array> {
  return renderToBuffer(<CvDocument content={content} />);
}

interface GenerateOptions {
  outFile?: string;
  loadOptions?: LoadOptions;
}

export async function generateCv({
  outFile = path.join(process.cwd(), 'public/cv.pdf'),
  loadOptions = {},
}: GenerateOptions = {}): Promise<number> {
  try {
    const pdf = await renderCv(loadContent(loadOptions));
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, pdf);
    console.log(`CV written to ${path.relative(process.cwd(), outFile) || outFile}`);
    return 0;
  } catch (error) {
    console.error(error instanceof ContentValidationError ? error.message : error);
    return 1;
  }
}

if (process.argv[1]?.endsWith('generate-cv.tsx')) {
  void generateCv().then((code) => process.exit(code));
}
