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

const isBreak = (node: unknown) =>
  (node as { type?: string } | undefined)?.type === 'break';

/**
 * Walks back over breaks and the empty text nodes between them, in any order:
 * two shift+Enters leave `[break, text(''), break, text('')]`, so a single pass
 * of each would strip one break and leave the other dangling.
 *
 * Descends through the last child that writes something — the spacer after it
 * is not it — so `**one\**` and `[one\](/x)` are both dangling, while
 * `**one\** two` is not.
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
