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
 * An empty text node writes nothing, so a break in front of one is still the
 * last thing in the block. The editor always produces that pair — Slate keeps a
 * text node after a trailing inline void — so skipping them is what makes this
 * fire on real editor output rather than only on hand-built trees.
 */
const writesNothing = (node: unknown) =>
  (node as Md.Text | undefined)?.type === 'text' &&
  (node as Md.Text).value === '';

/**
 * Only the last child can be in trailing position, so descend through it —
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
  // Leave the empty text nodes alone; a lone one is a deliberate spacer.
  children.splice(start, end - start);

  const last = children.at(-1);
  if (isParent(last)) {
    trimTrailingBreaks(last);
  }
};
