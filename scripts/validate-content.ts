import { ContentValidationError, loadContent, type LoadOptions } from '@/lib/content';

export function validateContent(options: LoadOptions = {}): number {
  try {
    const content = loadContent(options);
    console.log(
      `Content OK: ${content.projects.length} projects, ${content.career.length} roles, ` +
        `${content.earlierWork.length} earlier work entries.`,
    );
    return 0;
  } catch (error) {
    if (error instanceof ContentValidationError) {
      console.error(error.message);
      return 1;
    }
    throw error;
  }
}

if (process.argv[1]?.endsWith('validate-content.ts')) {
  process.exit(validateContent());
}
