import type * as Md from 'mdast';

/**
 * A trailing backslash is a hard break in CommonMark only when another line
 * follows it in the same block. With nothing after it, `one\` reads back as a
 * literal backslash — the break is lost and a character the author never typed
 * enters the content as data (#5426).
 *
 * Whether a break is representable is positional, not type-based, so no list of
 * container types can express it. Drop the ones with nothing after them.
 */
export const dropDanglingBreaks = <T extends Md.Root>(tree: T): T => {
  walk(tree);
  return tree;
};

/**
 * Blocks that hold phrasing content directly. Blockquotes and list items hold
 * paragraphs, which the walk reaches on its own.
 */
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

/**
 * Only the last child can be in trailing position, so descend through it —
 * `**one\**` is dangling, `**one\** two` is not.
 */
const trimTrailingBreaks = ({ children }: Parent) => {
  while ((children.at(-1) as Parent | undefined)?.type === 'break') {
    children.pop();
  }
  const last = children.at(-1);
  if (isParent(last)) {
    trimTrailingBreaks(last);
  }
};
