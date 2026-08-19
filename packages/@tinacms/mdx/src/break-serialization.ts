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
 * typed enters the content as data (#5426).
 *
 * Walks back over breaks and the empty text nodes between them, in any order:
 * two shift+Enters leave `[break, text(''), break, text('')]`. Descends through
 * the last child that writes something — the spacer after it is not it — so
 * `**one\**` and `[one\](/x)` are both dangling, `**one\** two` is not.
 */
const trimTrailingBreaks = ({ children }: Parent) => {
  let index = children.length;
  const trailing: number[] = [];
  while (index > 0) {
    const child = children[index - 1];
    if (isBreak(child)) {
      trailing.push(index - 1);
    } else if (!writesNothing(child)) {
      break;
    }
    index--;
  }
  // Descending indices, so each splice leaves the rest addressable. Only the
  // breaks go; a lone empty text node is a deliberate spacer.
  for (const at of trailing) {
    children.splice(at, 1);
  }

  const last = children[index - 1];
  if (isParent(last)) {
    trimTrailingBreaks(last);
  }
};

const isBreak = (node: unknown) =>
  (node as { type?: string } | undefined)?.type === 'break';

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
const splitOnBreaks = (heading: Md.Heading): Md.Heading[] =>
  // A segment of nothing but empty text would write a bare `###`.
  splitInlines(heading.children)
    .filter((children) => children.some((child) => !writesNothing(child)))
    .map((children) => ({ ...heading, children }));

/**
 * A break in a heading is not always a direct child — the editor puts one
 * inside the link when the cursor is in link text — so splitting only the top
 * level left it nested, where it degrades to a space and the line break is lost
 * with no error. Splitting the ancestor too turns `### [one⏎two](/x)` into two
 * headings, each carrying its own copy of the link.
 */
const splitInlines = <T>(nodes: T[]): T[][] => {
  const segments: T[][] = [[]];
  const push = (node: T) => segments[segments.length - 1]?.push(node);

  for (const node of nodes) {
    if (isBreak(node)) {
      segments.push([]);
      continue;
    }
    if (!isParent(node)) {
      push(node);
      continue;
    }
    const inner = splitInlines(node.children);
    inner.forEach((children, index) => {
      if (index > 0) {
        segments.push([]);
      }
      push({ ...node, children } as T);
    });
  }
  return segments;
};
