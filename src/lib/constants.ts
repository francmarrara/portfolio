// Kept free of Zod: client components reach these through derive.ts, and Zod must stay out of
// the browser bundle (its JIT probe also trips the page CSP).

// "2022-07" becomes "2022-07-01" so that dates compare as plain strings.
export function toIsoDay(value: string): string {
  return value.length === 7 ? `${value}-01` : value;
}

// Key order is the display order.
export const SKILL_CATEGORIES = [
  'languages',
  'frameworks',
  'cloud',
  'databases',
  'devops',
  'messaging',
  'ai',
  'testing',
] as const;
