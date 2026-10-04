import { fromMarkdown } from 'mdast-util-from-markdown';
import { toString as nodeToString } from 'mdast-util-to-string';

import { CASE_STUDY_SECTIONS, type CaseStudySection } from '@/lib/schemas';
import { slugify } from '@/lib/slug';

interface MdNode {
  type: string;
  depth?: number;
  children?: MdNode[];
  position?: { start: { offset?: number }; end: { offset?: number } };
}

const BLOCK_CONTAINERS = new Set(['root', 'list', 'listItem', 'blockquote', 'table', 'tableRow']);

const parse = (markdown: string): MdNode => fromMarkdown(markdown) as unknown as MdNode;
const textOf = (node: MdNode): string => nodeToString(node as Parameters<typeof nodeToString>[0]);

function containsHtml(node: MdNode): boolean {
  return node.type === 'html' || (node.children ?? []).some(containsHtml);
}

export function findRawHtml(markdown: string): boolean {
  return containsHtml(parse(markdown));
}

function plainText(node: MdNode): string {
  if (BLOCK_CONTAINERS.has(node.type) && node.children) {
    return node.children.map(plainText).join(' ');
  }
  return textOf(node);
}

export function toPlainText(markdown: string): string {
  return plainText(parse(markdown)).replace(/\s+/g, ' ').trim();
}

const normalizeTitle = (title: string) => title.replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();

interface Group {
  title: string;
  headingStart: number;
  headingEnd: number;
  nodes: MdNode[];
}

export function parseCaseStudy(
  body: string,
): { sections: CaseStudySection[] } | { errors: string[] } {
  const tree = parse(body);
  const errors: string[] = [];
  const expected: readonly string[] = CASE_STUDY_SECTIONS;

  if (containsHtml(tree)) errors.push('raw HTML is not allowed');

  const preamble: MdNode[] = [];
  const groups: Group[] = [];
  let hasH1 = false;

  for (const node of tree.children ?? []) {
    if (node.type === 'heading' && node.depth === 1) {
      hasH1 = true;
    } else if (node.type === 'heading' && node.depth === 2) {
      groups.push({
        title: normalizeTitle(textOf(node)),
        headingStart: node.position?.start.offset ?? 0,
        headingEnd: node.position?.end.offset ?? 0,
        nodes: [],
      });
    } else {
      (groups.at(-1)?.nodes ?? preamble).push(node);
    }
  }

  if (hasH1) errors.push('H1 is not allowed (the page title comes from the frontmatter)');
  if (preamble.length > 0) errors.push('content before the first H2 is not allowed');

  const titles = groups.map((group) => group.title);
  let sectionsOk = true;

  for (const title of expected) {
    const count = titles.filter((candidate) => candidate === title).length;
    if (count === 0) {
      errors.push(`section "${title}": missing`);
      sectionsOk = false;
    } else if (count > 1) {
      errors.push(`section "${title}": duplicated`);
      sectionsOk = false;
    } else if (
      groups
        .find((group) => group.title === title)!
        .nodes.map(textOf)
        .join('')
        .trim() === ''
    ) {
      errors.push(`section "${title}": empty`);
    }
  }

  for (const title of titles) {
    if (!expected.includes(title)) {
      errors.push(`unexpected H2 "${title}"`);
      sectionsOk = false;
    }
  }

  if (sectionsOk && titles.some((title, index) => title !== expected[index])) {
    errors.push(`sections out of order: expected ${expected.join(', ')}`);
  }

  if (errors.length > 0) return { errors };

  const sections = groups.map((group, index): CaseStudySection => {
    const end = groups[index + 1]?.headingStart ?? body.length;
    const markdown = body.slice(group.headingEnd, end).trim();
    return {
      id: slugify(group.title),
      title: group.title,
      markdown,
      plainText: toPlainText(markdown),
    };
  });

  return { sections };
}
