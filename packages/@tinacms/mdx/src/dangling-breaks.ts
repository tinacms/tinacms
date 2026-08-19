import type * as Md from 'mdast';

/**
 * A trailing backslash is a hard break in CommonMark only when another line
 * follows it in the same block. With nothing after it, `one\` reads back as a
 * literal backslash, so the break is lost and a character the author never
 * typed enters the content as data (#5426). Reshapes in place.
 */
export const dropDanglingBreaks = <T extends Md.Root>(tree: T): T => {
  walk(tree);
  return tree;
};

/** Blockquotes and list items hold paragraphs, which the walk reaches anyway. */
const BLOCKS = new Set(['paragraph', 'heading', 'tableCell']);

type Parent = { type?: string; children: unknown[] };

const isParent = (node: unknown): node is Parent =>
  Array.isArray((node as Parent | undefined)?.children);

const walk = (node: Parent) => {
  if (BLOCKS.has(node.type ?? '')) {
    trimTrailingBreaks(node);
  }
  for (const child of node.children) {
    if (isParent(child)) {
      walk(child);
    }
  }
};

/** Slate keeps one of these after a trailing inline void, and it writes nothing. */
const writesNothing = (node: unknown) =>
  (node as Md.Text | undefined)?.type === 'text' &&
  (node as Md.Text).value === '';

/** Descends through the last child: `**one\**` is dangling, `**one\** two` is not. */
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
