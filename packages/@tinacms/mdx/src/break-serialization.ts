import type * as Md from 'mdast';

/** Reshape the tree so every hard break left in it is one markdown can express. Acts in place. */
export const serializeBreaks = <T extends Md.Root>(tree: T): T => {
  walk(tree);
  return tree;
};

type Parent = { type?: string; children: unknown[] };

const isParent = (node: unknown): node is Parent =>
  Array.isArray((node as Parent | undefined)?.children);

/** Blockquotes and list items hold paragraphs, which the walk reaches anyway. */
const PHRASING_BLOCKS = new Set(['paragraph', 'heading', 'tableCell']);

const walk = (node: Parent) => {
  if (PHRASING_BLOCKS.has(node.type ?? '')) {
    trimTrailingBreaks(node);
  }
  node.children = node.children.flatMap((child) =>
    isHeading(child) && child.depth > DEEPEST_SETEXT
      ? splitOnBreaks(child)
      : [child]
  );
  for (const child of node.children) {
    if (isParent(child)) {
      walk(child);
    }
  }
};

/**
 * A trailing backslash is a hard break in CommonMark only when another line
 * follows it in the same block. With nothing after it, `one\` reads back as a
 * literal backslash, so the break is lost and a character the author never
 * typed enters the content as data (#5426). Descends through the last child:
 * `**one\**` is dangling, `**one\** two` is not.
 */
const trimTrailingBreaks = ({ children }: Parent) => {
  let end = children.length;
  while (end > 0 && writesNothing(children[end - 1])) {
    end--;
  }
  let start = end;
  while (
    start > 0 &&
    (children[start - 1] as Parent | undefined)?.type === 'break'
  ) {
    start--;
  }
  // Splice only the breaks; a lone empty text node is a deliberate spacer.
  children.splice(start, end - start);

  const last = children.at(-1);
  if (isParent(last)) {
    trimTrailingBreaks(last);
  }
};

/** Slate keeps one of these after a trailing inline void, and it writes nothing. */
const writesNothing = (node: unknown) =>
  (node as Md.Text | undefined)?.type === 'text' &&
  (node as Md.Text).value === '';

const isHeading = (node: unknown): node is Md.Heading =>
  isParent(node) && node.type === 'heading';

/** `#`/`##` have a setext form, so a break already survives there as a real break. */
const DEEPEST_SETEXT = 2;

/**
 * `###` and deeper have no setext form, so the break degrades to a space and the
 * author's line break vanishes with no error. Split instead: same level, content
 * and break both survive, and the next save is a fixed point.
 */
const splitOnBreaks = (heading: Md.Heading): Md.Heading[] => {
  const segments: Md.Heading['children'][] = [[]];
  for (const child of heading.children) {
    if (child.type === 'break') {
      segments.push([]);
    } else {
      segments[segments.length - 1]?.push(child);
    }
  }
  // A segment of nothing but empty text would write a bare `###`.
  return segments
    .filter((children) => children.some((child) => !writesNothing(child)))
    .map((children) => ({ ...heading, children }));
};
